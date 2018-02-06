'use strict';


var _ = require('lodash');
var async = require('async');


module.exports = function (UserBase) {

    UserBase.searchSupliers = function(id, search, latitude, longitude, radius, sort, offset, limit, cb){

        if(!limit)
            limit = 20;

        if(!offset)
            offset = 0;

        if(search.length<3){
            cb(null,[]);
            return;
        }

        var error = new Error();
        error.statusCode = 404;
        var city= '';
        var country = '';

        if(!latitude){
            error.message = "latitude is required";
            cb(error);
        }

        if(!longitude){
            error.message = "longitud is required";
            cb(error);
        }

        if(!radius){
            radius = 10;

        }
        //convert km to m
        radius = radius * 1000;       

        var ds= UserBase.dataSource;
        var cond = '';
        var order = 'ORDER by ';

        if(sort=="location"){
            var OpenStreetMap = UserBase.app.models.OpenStreetMap;
            OpenStreetMap.reverseGeocoding(latitude,longitude,function(errgr,locations){
                if(errgr)
                    cb(errgr);

                if(locations.error !=null && locations.error != undefined){
                    error.message = "The provided location it's wrong.";
                    cb(error);
                }else {
                    city = locations.address.city;
                    country = locations.address.country;
                    cond = 'AND (' + '"city" like \'%' + city + '%\' and "country" like \'%' + country + '%\' ) ';
                    order = order + 'distance ASC, friendsRecommendations DESC, recommendations DESC';
                    searchHelper(searchQueryBuilder(search, cond, latitude, longitude, limit, offset, id, order), sort, ds, cb, id);
                }
            });
        }else{
            cond = 'AND ST_Distance(ST_SetSrid(location::geometry,4326)::geography, '
                + 'ST_GeographyFromText(\'SRID=4326;POINT('+longitude+' '+latitude+')\')'
                +') <= '+radius+' ';
            if(sort=="distance"){
                order = order + 'distance ASC, friendsRecommendations DESC, recommendations DESC';
            }else if(sort=="referals"){
                order = order + 'friendsRecommendations DESC, recommendations DESC, distance ASC';
            }else{
                order = order + 'recommendations DESC, friendsRecommendations DESC, distance ASC';
            }
            searchHelper(searchQueryBuilder(search,cond,latitude,longitude,limit,offset, id, order),sort,ds,cb,id);
        }
    };

    function searchQueryBuilder(search, cond, latitude, longitude, limit, offset, id, sort){
        return 'SELECT '
            + '"phone","name","address","location","description","categoryservice" as categoryname,"profiletype","city",'
            + '"country","additional_phones","additional_emails","additional_links","photourl" as photoUrl,"landscapeurl","about","realm",'
            + '"username","password","credentials","challenges","email","emailverified","verificationtoken","status","created",'
            + '"lastupdated","id" as supplier_id, count_friends_recommendations(id,'+id+') as friendsRecomendations, count_recommendations(id) as recommendations, '
            + '(ST_Distance('
            + 'ST_SetSrid(location::geometry,4326)::geography, '
            + 'ST_GeographyFromText(\'SRID=4326;POINT('+longitude+' '+latitude+')\')'
            + ''
            +')/1000) as distance '
            + 'FROM "public"."user" '
            + 'WHERE '
            + 'location IS NOT NULL '
            + cond
            + ' AND id in (SELECT CAST(principalid as int) FROM "public"."rolemapping" rm LEFT JOIN "public"."role" r'
            + ' on rm.roleid = r.id WHERE r.name = \'SERVICE\')'
            + ' AND id <> '+id
            + ' AND ( '
            + ' unaccent(description) ~* unaccent(\''+search+'\') '
            + ' OR unaccent(categoryservice) ~* unaccent(\''+search+'\') '
            + ' OR unaccent(name) ~* unaccent(\''+search+'\') '
            + ') '
            + sort+' '
            + 'OFFSET '+offset+' '
            + 'LIMIT '+limit;
    }

    function searchHelper(query, sort,ds,cb,id){
        var result = [];
        var returnFieldSearch =
            [
                'name',
                'description',
                'categoryname',
                'recomendations',
                'friendsrecomendations',
                'supplier_id',
                'photourl',
                'city',
                'country',
                'address',
                'location',
                'distance'
            ];

        ds.connector.query(query,null,function(err, results){
            if(err){
                cb(err);
            }

            var max = (!results)?0:results.length;
            var aux = 0;

            if(max == 0){
                cb(null,[]);
                return;
            }
            _.each(results,function(service){
                var newItem = {};
                _.each(returnFieldSearch,function(field){
                    if(field=="photourl"){
                        newItem["photoUrl"] = (service[field] != null && service[field] != undefined && service[field] != "")?service[field]+"?dimension=thumb":"";
                    }else{
                        newItem[field] = service[field];    
                    }
                    

                });

                result.push(newItem);
                aux++;
                if(aux >= max){
                    cb(null, result);
                }
            });
        });
    }

    UserBase.remoteMethod(
        'searchSupliers',
        {
            description: 'Search suppliers',
            http: {
                verb: 'get',
                path: '/:id/Service/Search'
            },
            accepts: [
                {
                    arg: 'id',
                    type: 'number',
                    required: true,
                    http: {source: 'path'}
                },
                {
                    arg: 'search',
                    type: 'string',
                    required: true,
                    http: {source: 'query'}
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
                    description: 'radius in KM, default 10 KM'
                },
                {
                    arg: 'sort',
                    type: 'string',
                    required: true,
                    http: {source: 'query'},
                    description: 'sort types: "distance", "location", "recommendations", "referals"'
                },
                {
                    arg: 'offset',
                    type: 'number',
                    required: false,
                    http: {source: 'query'}
                },
                {
                    arg: 'limit',
                    type: 'number',
                    required: false,
                    http: {source: 'query'}
                }
            ],
            returns: {
                type: 'array',
                root: true
            }
        }
    );
};
