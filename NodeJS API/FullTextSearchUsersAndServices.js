'use strict';

var _ = require('lodash');
var async = require('async');
var sw = require('stopword');

module.exports = function (UserBase) {

    UserBase.getFullTextSearchUserServices = function (id, phrase, limit, next) {
        var models = UserBase.app.models;

        if (!phrase || phrase.trim().length<4){
            next(new Error("You must type at least 4 characters"));
        }

        if(!limit)
            limit = 20;
        var ph = phrase;
        phrase = sw.removeStopwords(phrase.toLowerCase().split(" "),sw.es).join(" ");

        var term = _.words(phrase.toLowerCase()).join(' | ');
        var termR = '('+_.words(phrase.toLowerCase()).join('|')+')';
        async.waterfall([
                function (cb) {
                    searchServices(ph, id, term, termR, limit,
                        function (err, services) {
                            if (err){
                                cb(err);
                            }else{
                                cb(null,services);
                            }

                        });
                },
                function (services,cb) {
                    searchUsers(ph, id, term, termR, limit,
                        function (err, users) {
                            if (err){
                                cb(err);
                            }else{

                                cb(null,{'users': users,
                                    'services': services});
                            }
                        })
                }
        ],next);

    };

    //Raw query for Services
    //call functions: count_recommendations, count_friends_recommendations, count_followers, count_mutual_followers
    //priorize results using ts_rank and setweight
    function searchServices(models, id, term, termR, limit, cb) {
        var query = 'SELECT * FROM ( SELECT '
            + '	u."name", '
            + '	u."description", '
            + '	u."categoryservice" AS category, '
            + '	count_recommendations (u."id") AS recommendations, '
            + '	count_friends_recommendations (u."id",' + id + ') AS friends_recommendations, '
            + '	u."id", '
            + '	u."city", '
            + '	u."country", '
            + '	u."address", '
            + '	u."photourl" AS thumbnail_url, '
            + '	count_followers (u."id") AS followers, '
            + ' count_mutual_followers (u."id",'+ id +') AS mutual_followers, '
            + ' setweight(to_tsvector(unaccent(u."name")),\'A\') || setweight(to_tsvector(COALESCE(unaccent(u."description"))),\'C\') || setweight(to_tsvector(COALESCE(unaccent(u."categoryservice"))),\'B\') as document '
            + ' FROM '
            + '	    "public"."user"  u	'
            + ' WHERE '
            + ' "id" IN (SELECT CAST(principalid as int) '
            +           ' FROM '
            +           ' "public"."rolemapping" rm LEFT JOIN "public"."role" r ON rm."roleid" = r."id" '
            +           ' WHERE r."name" = \'SERVICE\') '
            + 'AND "id" <> ' + id + ' '
            + ') p_search '
            + 'WHERE "document" @@ to_tsquery(unaccent(\''+term+'\')) '
            + ' OR "name" ~* \''+termR+'\' '
            + ' OR "description" ~* \''+termR+'\' '
            + ' OR "category" ~* \''+termR+'\' '
            + ' OR "name" ~* \''+models+'\' '
            + ' OR "description" ~* \''+models+'\' '
            + ' OR "category" ~* \''+models+'\' '
            + 'ORDER BY ts_rank("document",to_tsquery(unaccent(\''+term+'\'))) DESC, '
            + '	"friends_recommendations" DESC, '
            + ' "mutual_followers" DESC, '
            + '	"recommendations" DESC, '
            + '	"followers" DESC '
            + 'LIMIT ' + limit;
        UserBase.dataSource.connector.query(query, null, function (err, services) {
            iterateServicesUser(services, function (err, results) {
                if(err)
                    cb(err);
                else
                    cb(null,results);
            });
        });
    }

    function searchUsers(models, id, term, termR, limit, cb) {
        var query = 'SELECT * FROM ( SELECT '
            + '	u."name", '
            + '	u."id", '
            + '	u."photourl" AS thumbnail_url, '
            + '	count_followers (u."id") AS followers, '
            + ' count_mutual_followers (u."id",'+ id +') AS mutual_followers, '
            + 'to_tsvector(unaccent(u."name")) as document '
            + 'FROM '
            + '	"public"."user"  u	'
            + 'WHERE '
            + '"id" IN (SELECT CAST (principalid AS INT) '
            +           'FROM '
            +           '"public"."rolemapping" rm LEFT JOIN "public"."role" r ON rm.roleid = r."id" '
            +           'WHERE '
            +           'r."name" = \'USER\' AND rm."principalid" NOT IN ( '
            +               'SELECT "principalid" '
            +               'FROM "public"."rolemapping" rm LEFT JOIN "public"."role" r ON rm.roleid = r."id" '
            +               'WHERE '
            +               'r."name" = \'SERVICE\')'
            +          ') '
            + 'AND "id" <> ' + id + ' '
            + ') p_search '
            + 'WHERE "document" @@ to_tsquery(unaccent(\''+term+'\')) '
            + ' OR "name" ~* \''+termR+'\' '
            + ' OR "name" ~* \''+models+'\' '
            + 'ORDER BY ts_rank("document",to_tsquery(unaccent(\''+term+'\'))) DESC, '
            + ' "mutual_followers" DESC, '
            + '	"followers" DESC '
            + 'LIMIT ' + limit;

        UserBase.dataSource.connector.query(query, null, function (err, users) {
            iterateServicesUser(users, function (err, results) {
                if(err)
                    cb(err);
                else
                    cb(null,results);
            });
        });
    }

    function iterateServicesUser(items,  callback) {
        async.each(items, function (entity, icb) {
            entity['thumbnail_url'] = entity['thumbnail_url'] ? entity['thumbnail_url'] + "?dimension=thumb" : null;
            entity['mutual_followers'] = entity['mutual_followers']? entity['mutual_followers']: 0;
            //delete entity['document'];
            icb(null);
        }, function (errf) {
            if(errf)
                callback(errf);
            else
                callback(null,items);
        });
    }



    UserBase.remoteMethod(
        'getSemanticSearchUserServices',
        {
            description: "Get search for users and/or service's. asd",
            http: {
                verb: 'get',
                path: '/:id/Search/UsersOrServices'
            },
            accepts: [
                {
                    arg: 'id',
                    type: 'number',
                    required: true,
                    http: {source: 'path'}
                },
                {
                    arg: 'phrase',
                    type: 'string',
                    required: true,
                    http: {source: 'query'}
                },
                {
                    arg: 'limit',
                    type: 'number',
                    required: false,
                    http: {source: 'query'},
                    default: 20
                }
            ],
            returns: {
                type: 'array',
                root: true
            }
        }
    );
};
