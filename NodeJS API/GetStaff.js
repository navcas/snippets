'use strict';
var UserUtils = require('../../utils/user-utils');
var UserService = require('../../models/user-services');

module.exports = function (UserBase) {

  UserBase.getStaff = function (id, cb) {
    isService(id)
      .then(function (isService) {
        if(isService){
          var service = {
            id: id
          };
          UserService.getStaff(null, service, null, UserBase.app.models.UserServices, UserBase,
            function (err, staff) {
              console.log(staff);
              cb(null,staff);
            });
        }else{
          cb(new Error('The id is not from a service'));
        }
    });

    };

  function isService(userId){
    return new Promise(function (resolve, reject) {
      UserUtils.hasRole(UserBase, userId, UserUtils.ROLE_SERVICE,
        function (err, exist) {
          if (err) {
            reject(err);
          } else {
            resolve(exist);
          }
        });
    });
  }

  UserBase.remoteMethod('getStaff',
    {
      description: 'Get staff',
      http: {
        verb: 'get',
        path: '/:id/getStaff'
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
