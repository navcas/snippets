'use strict';

var _ = require('lodash');
var async = require('async');
var FriendshipRequestStatuses = require('../utils/friendship-request-statuses');

module.exports = function (UserBase) {
    var SELECT ='';

    UserBase.getTrendingRndUserServices = function (id, latitude, longitude, radius, sample, limit, next) {
        var models = UserBase.app.models;

        if (!radius || radius<=0)
            radius = 50;

        if(!sample)
            sample = 40;

        if(!limit)
            limit = 12;

        radius = radius * 1000;


        SELECT = 'SELECT '
            + '"name", "description", "categoryservice" as category, count_recommendations(id) as recommendations, '
            + '"id", "photourl" as thumbnail_url,  '
            + 'count_followers(id) as followers, 1 + trunc(random() * 5100000)::integer AS rdn '
            + 'FROM "public"."user" '
            + 'WHERE ';
        async.waterfall([
            function (cb) {
                servicesRecommendedByFollowers(models, id, sample, limit,
                    function (err, results) {
                        if (err){
                            cb(err);
                        }
                        else {
                            cb(null,results);
                        }
                    });
            },
                function (recommended,cb) {
                    servicesMostRecommendedAroundMe(models, id, latitude, longitude, radius, sample, limit,
                        function (err, results) {
                            if (err){
                                cb(err);
                            }else{
                                cb(null,recommended,results);
                            }

                        });
                },
                function (recommended,closeToMe,cb) {
                    usersOrServicesFromFollowers(models, id, sample, limit,
                        function (err, results) {
                            if (err){
                                cb(err);
                            }else{

                                cb(null,{'Recommended': recommended,
                                    'CloseToMe': closeToMe,
                                    'Followings': results});
                            }
                        })
                }
        ],next);

    };


    function servicesRecommendedByFollowers(models, id, sample, limit, cb) {
        var query = SELECT
            + 'id IN ( SELECT supplier_id FROM "public"."recommendations_services" WHERE '
            + 'customer_id IN ( SELECT friend_id FROM "public"."friend" WHERE '
            + 'user_id = ' + id + ' ) '
            + ') and id not in ( SELECT friend_id FROM "public"."friend" WHERE '
            + 'user_id = ' + id + ') '
            + 'AND id <> ' + id + ' '
            + 'ORDER BY "recommendations" DESC, "name" ASC '
            + 'LIMIT ' + sample;

        UserBase.dataSource.connector.query(query, null, function (err, services) {
            iterateServicesUser(models, services, limit, id, function (err, results) {
                if(err)
                    cb(err);
                else
                    cb(null,results);
            });
        });
    }

    function servicesMostRecommendedAroundMe(models, id, latitude, longitude, radius, sample, limit, cb) {
        var query = SELECT
            + 'id in (SELECT CAST(principalid as int) FROM "public"."rolemapping" rm LEFT JOIN "public"."role" r '
            + 'on rm.roleid = r.id WHERE r.name = \'SERVICE\') '
            + 'AND id <> ' + id + ' '
            + 'AND ST_Distance(ST_SetSrid(location::geometry,4326)::geography, '
            + 'ST_GeographyFromText(\'SRID=4326;POINT(' + longitude + ' ' + latitude + ')\')'
            + ') <= ' + radius + ' '
            + 'AND id not in ( SELECT friend_id FROM "public"."friend" WHERE '
            + 'user_id = ' + id + ') '
            + 'AND id <> ' + id + ' '
            + 'ORDER BY "recommendations" DESC, "name" ASC '
            + 'LIMIT ' + sample;

        UserBase.dataSource.connector.query(query, null, function (err, services) {
            iterateServicesUser(models, services, limit, id, function (err, results) {
                if(err)
                    cb(err);
                else
                    cb(null,results);
            });
        });
    }

    function usersOrServicesFromFollowers(models, id, sample, limit, cb) {

        var query = SELECT
            + 'id IN ( SELECT friend_id FROM "public"."friend" WHERE '
            + 'user_id IN ( '
            + 'SELECT friend_id FROM "public"."friend" WHERE '
            + 'user_id = '+id+')) '
            + 'AND id NOT IN ( SELECT friend_id FROM "public"."friend" WHERE '
            + 'user_id = ' + id + ') '
            + 'AND id <> ' + id + ' '
            + 'ORDER BY "followers" DESC, "name" ASC '
            + ' LIMIT '+ sample;

        UserBase.dataSource.connector.query(query, null, function (err, services) {
            iterateServicesUser(models, services, limit, id, function (err, results) {
                if(err)
                    cb(err);
                else
                    cb(null,results);
            });
        });
    }

    function iterateServicesUser(models, services, limit, id, callback) {
        var results = _.sortByOrder(_.slice(services, 0, limit), ['rdn'], ['asc']);
        async.each(results, function (service, icb) {
            service['thumbnail_url'] = service['thumbnail_url'] ? service['thumbnail_url'] + "?dimension=thumb" : null;
            delete  service['rdn'];
            async.parallel([
                    function (cb) {
                        models.FriendshipRequest.findOne({
                            where: {
                                fromId: id,
                                toId: service.id
                            }
                        }, function (err3, friendshipRequest) {
                            if (err3)
                                cb(err3);
                            service['friendship_request'] = friendshipRequest ? friendshipRequest.status : FriendshipRequestStatuses.STATUS_NOT_FOLLOWING;
                            cb(null);
                        });
                    }
                ],icb);
        }, function (errf) {
            if(errf)
                callback(errf);
            else
                callback(null,results);
        });
    }



    UserBase.remoteMethod(
        'getTrendingRndUserServices',
        {
            description: "Get users or service's trending random from my followers that i don't follow.",
            http: {
                verb: 'get',
                path: '/:id/UsersOrServices/TrendingFromFollowings'
            },
            accepts: [
                {
                    arg: 'id',
                    type: 'number',
                    required: true,
                    http: {source: 'path'}
                },
                {
                    arg: 'latitude',
                    type: 'number',
                    required: true,
                    http: {source: 'query'}
                },
                {
                    arg: 'longitude',
                    type: 'number',
                    required: true,
                    http: {source: 'query'}
                },
                {
                    arg: 'radius',
                    type: 'number',
                    required: false,
                    http: {source: 'query'},
                    description: 'radius in KM, default 50 KM',
                    default: 50
                },
                {
                    arg: 'sample',
                    type: 'number',
                    required: false,
                    http: {source: 'query'},
                    default: 40
                },
                {
                    arg: 'limit',
                    type: 'number',
                    required: false,
                    http: {source: 'query'},
                    default: 12
                }
            ],
            returns: {
                type: 'array',
                root: true
            }
        }
    );
};
