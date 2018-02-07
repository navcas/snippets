'use strict';
var tokenUtil = require('../../utils/token-util');
var UserService = require('../../models/user-services');
var async = require('async');
module.exports = function (UserBase) {

  UserBase.getLinkedService = function (id, cb) {
    var model = UserBase.app.models;
    var user = {
      id: id
    };
    UserService.getServices(null, user, cb, model.UserServices, UserBase, function (err, services) {

      user.services = services;
      var linkedService = [];
      async.forEach(services, function (item, callback) {
        getTokens(item.serviceId, item.name).then(function (result) {
          linkedService.push(result);
          callback();
        });

      },function (err) {
        cb(null, linkedService);
      });


    });

  };

  function getTokens(id, name) {
    return new Promise(function (resolve, reject) {
      UserBase.app.models.AccessToken.find({
        where: {
          "userId": id
        }
      }).then(function (result) {
        var service = {
          id: id,
          name: name
        };
        async.forEach(result, function (item, callback) {
          if (tokenUtil.verifyTime(item.created, id)) {
            service.token = item.id;
          }
          callback();
        }, function (err) {
          if (service === null) {

            tokenUtil.createToken(UserBase, service).then(
              function (result) {
                service.token = result;
                resolve(service);
              }
            );
          } else {
            resolve(service);
          }

        });

      }).catch(function (err) {
        reject(err);
      });
    });
  }

  UserBase.remoteMethod('getLinkedService',
    {
      description: 'Get linked service from users',
      http: {
        verb: 'get',
        path: '/:id/linkedServices'
      },
      accepts: [
        {
          arg: 'id',
          type: 'number',
          required: true,
          http: {source: 'path'}
        }
      ],
      returns: {
        type: {
          'id': {type: 'number'},
          'name': {type: 'string'},
          'access_token': {type: 'string'}
        },
        root: true
      }
    });
};
