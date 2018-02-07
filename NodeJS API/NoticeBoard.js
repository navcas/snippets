'use strict';

var _ = require('lodash');
var async = require('async');
var UserUtils = require('../utils/user-utils');

module.exports = function (UserBase) {
  var Feed;
  var SharedFeed;
  var ds;
  var voffset;
  var vlimit;
  UserBase.noticeBoard = function (id, useFeedServices, useLocation, categories, latitude, longitude, radius, offset, limit, cb) {

    Feed = UserBase.app.models.Feed;
    SharedFeed = UserBase.app.models.SharedFeed;
    ds = UserBase.dataSource;

    if (!useFeedServices && !useLocation) {
      var error = new Error();
      error.statusCode = 422;
      error.message = "Your configuration don't allow do a search.";
      cb(error);
    }

    if (!limit) {
      vlimit = 20;
    }
    else {
      vlimit = limit;
    }

    if (!offset) {
      voffset = 0;
    }
    else {
      voffset = offset;
    }

    validateData(cb, useLocation, id, categories, radius, latitude, longitude, useFeedServices)
  };

  function validateData(cb, useLocation, id, categories, radius, latitude, longitude, useFeedServices) {
    if (useLocation) {
      radius = radius || 10;
      radius = radius * 1000;
      var hasErrors = false;
      var messageErrors = {};
      if (Array.isArray(categories)) {
        if (categories.length === 0) {
          hasErrors = true;
          messageErrors.categories = "You must send at least one category";
        }
      } else {
        hasErrors = true;
        messageErrors.categories = "You must send a list of categories";
      }

      if (!latitude) {
        hasErrors = true;
        messageErrors.latitude = "The latitud is required";
      }

      if (!longitude) {
        hasErrors = true;
        messageErrors.longitude = "The longitude is required";
      }

      if (hasErrors) {
        var error = new Error();
        error.statusCode = 422;
        error.message = messageErrors;
        cb(error);
      } else {

        getNearServices(id, categories, radius, latitude, longitude, useFeedServices, cb);
      }
    } else {

      //getNearServices(id,categories,radius, latitude,longitude,cb);
      getFeeds(id, [], useFeedServices, useLocation, cb);
    }
  }

  function getFeeds(id, ids, useFeedServices, useLocation, cb) {
    var feeds = [];
    UserBase.findById(id, function (err, client) {
      if (err)
        cb(err);
      if (!client) {
        var error = new Error();
        error.statusCode = 422;
        error.message = "user doesn't exists";
      }
      var clientFvs;
      var clientRecommendations;
      var allServices;
      var allFeedShared = [];
      var FavouritesServices = UserBase.app.models.FavouritesServices;
      FavouritesServices.find({where: {customerId: id}}, function (err, favouritesServices) {
        if (err)
          cb(err);

        UserBase.app.models.RecomendationsServices.find({where: {customerId: id}}, function (err2, recomendationsOfServices) {
          if (err2)
            cb(err2);

          clientFvs = _.map(favouritesServices, _.property('supplierId'), 'id');
          clientRecommendations = _.map(recomendationsOfServices, _.property('supplierId'), 'id');
          allServices = _.union(clientFvs, clientRecommendations, ids);

          SharedFeed.find({where: {to_id: id}}, function (err5, sfeeds) {
            if (err5)
              cb(err5);

            allFeedShared = _.map(sfeeds, 'feed_id');

            var where = {};

            if (useFeedServices) {

              if (allFeedShared.length > 0 && allServices.length > 0)
                where = {
                  and: [{
                    or: [{id: {inq: allFeedShared}},
                      {user_id: {inq: allServices}}]
                  },
                    {deleted_at: null}
                  ]
                };
              else if (allServices.length > 0)
                where = {and: [{user_id: {inq: allServices}}, {deleted_at: null}]};
              else if (allFeedShared.length > 0)
                where = {
                  and: [
                    {user_id: {inq: allFeedShared}},
                    {deleted_at: null}
                  ]
                };
              else
                where = {
                  and: [{
                    or: [
                      {id: {inq: []}},
                      {user_id: {inq: []}}
                    ]
                  },
                    {deleted_at: null}]
                };
            }

            if (!useFeedServices && useLocation) {
              allServices = ids;
              where = {and: [{user_id: {inq: allServices}}, {deleted_at: null}]};
            }

            Feed.find({
              where: where,
              include: ["hashTags", "imagesFeed", "user", {shared: ["fromUser"]}],
              "order": "created DESC"
            }, function (err4, feedsInstance) {
              if (err4)
                cb(err4);

              var aux = 0;

              if (feedsInstance.length === 0) {
                cb(null, []);
                return;
              }
              _.each(feedsInstance, function (feed) {
                var rFeed = {};
                var f = feed.toJSON();

                rFeed['text'] = feed.text;
                rFeed['images'] = _.map(f.imagesFeed, 'photoUrl');
                rFeed['id'] = feed.id;
                rFeed['created'] = feed.created;
                rFeed['tags'] = _.map(f.hashTags, 'words');

                var shared = _.sortByOrder(f.shared, ['shared_date'], ['desc']);
                if (shared.length > 0) {
                  rFeed['created'] = shared[0].shared_date;
                }
                var auxF = [];
                var followings = [];
                _.each(shared, function (s) {
                  if (s.to_id === id) {

                    if (!_.some(auxF, {"id": s.fromUser.id})) {
                      var following = {};
                      following['photoUrl'] = (s.fromUser.photoUrl !== null && s.fromUser.photoUrl !== undefined && s.fromUser.photoUrl !== "") ? s.fromUser.photoUrl + "?dimension=thumb" : "";
                      following['id'] = s.fromUser.id;
                      following['name'] = s.fromUser.name;
                      followings.push(following);
                      auxF.push({"id": +s.fromUser.id.toString()});
                    }
                  }
                });

                rFeed['userShareds'] = followings;

                var service = {};
                if (f.user !== undefined) {
                  service['category'] = f.user.categoryservice;
                  service['name'] = f.user.name;
                  service['location'] = f.user.location;
                  service['id'] = f.user.id;
                  service['city'] = f.user.city;
                  service['country'] = f.user.country;
                  service['photoUrl'] = (f.user.photoUrl !== null && f.user.photoUrl !== undefined && f.user.photoUrl !== "") ? f.user.photoUrl + "?dimension=thumb" : "";
                }

                rFeed['service'] = service;
                rFeed['taggedUsers'] = [];
                async.parallel([function (cb3) {
                  Feed.app.models.Comment.count({feed_id: feed.id}, function (err2, totalComments) {
                    rFeed['totalComments'] = totalComments ? totalComments : 0;
                    cb3(err2);
                  });
                }, function (cb3) {
                  if (feed.tagged_users && feed.tagged_users.length > 0) {
                    UserBase.find({
                      where: {
                        id: {
                          inq: feed.tagged_users
                        }
                      }
                    }, function (err2, users) {
                      if (err2) {
                        cb(err2);
                      }

                      _.each(users, function (user) {
                        rFeed['taggedUsers'].push({
                          id: user.id,
                          name: user.name,
                          thumbnailPhoto: (user.photoUrl !== null && user.photoUrl !== undefined && user.photoUrl !== "") ? user.photoUrl + "?dimension=thumb" : ""
                        });
                      });

                      cb3();
                    });
                  } else {
                    cb3();
                  }
                }, function (cb3) {
                  async.waterfall([
                    function (cb4) {
                      Feed.app.models.Friend.find({
                        where: {
                          user_id: id
                        }
                      }, function (err, results) {
                        if (err) {
                          cb4(err);
                        }
                        //usrsids and find the comments of the friends
                        cb4(null, _.map(results, _.property('friend_id'), 'id'));

                      });
                    }, function (usrsids, cb4) {
                      Feed.app.models.Comment.find({
                        where: {feed_id: feed.id},
                        include: ['fromUser'],
                        order: ['created_at DESC'],
                        limit: 5
                      }, function (err2, comments) {
                        //where: {and: [{feed_id: feed.id}, {user_id: {inq: usrsids}}]},
                        if (err2) {
                          cb4(err2);
                        } else {
                          var feedComments = [];
                          async.each(comments, function (c, callback3) {
                            var cmt = {};
                            var cm = c.toJSON();
                            async.parallel([function (cb5) {
                              cmt['text'] = cm.comment;
                              cmt['created_at'] = cm.created_at;
                              cb5(null);
                            }, function (cb5) {
                              var usr = cm.fromUser;
                              cmt['author'] = {
                                name: usr.name,
                                user_id: usr.id,
                                thumbnailUrl: (usr.photoUrl !== null && usr.photoUrl !== undefined && usr.photoUrl !== "") ? usr.photoUrl + "?dimension=thumb" : ""
                              };
                              cb5();
                            }, function (cb5) {
                              var taggedUsers = {};
                              if (cm.tagged_users && cm.tagged_users.length > 0) {
                                UserBase.find({
                                  where: {
                                    id: {
                                      inq: cm.tagged_users
                                    }
                                  }
                                }, function (err2, users) {
                                  if (err2) {
                                    cb5(err2);
                                  } else {
                                    async.each(users, function (user, callback2) {
                                      var key = '[~' + user.id + ']';
                                      taggedUsers[key] = {
                                        id: user.id,
                                        name: user.name,
                                        thumbnailPhoto: (user.photoUrl !== null && user.photoUrl !== undefined && user.photoUrl !== "") ? user.photoUrl + "?dimension=thumb" : ""
                                      };
                                      callback2();
                                    }, function (err) {
                                      cmt['keys'] = taggedUsers;
                                      cb5(err);
                                    });
                                  }
                                });
                              } else {
                                cmt['keys'] = taggedUsers;
                                cb5();
                              }
                            }], function (err, results2) {
                              feedComments.push(cmt);
                              callback3(err, results2);
                            })
                          }, function (err) {
                            rFeed['comments'] = feedComments;
                            cb4(err);
                          });


                        }
                      });
                    }
                  ], function (err) {
                    cb3(err);
                  });

                }, function (cb3) {
                  Feed.app.models.Like.count({feed_id: feed.id}, function (err2, totalLikes) {
                    rFeed['totalLikes'] = totalLikes ? totalLikes : 0;
                    cb3(err2);
                  });
                }, function (cb4) {
                  Feed.app.models.Like.findOne({
                    where: {
                      and: [
                        {"user_id": id},
                        {"feed_id": feed.id}
                      ]
                    }
                  }, function (err2, liked) {
                    rFeed['liked'] = !!liked;
                    cb4(err2);
                  });
                }], function (err, results) {
                  if (err) {
                    console.error("After parallel noticeboard: ", err);
                  }
                  feeds.push(rFeed);
                  aux++;
                  if (aux === feedsInstance.length) {
                    var r = _.slice(_.sortByOrder(feeds, ['created'], ['desc']), voffset, (voffset + vlimit));
                    cb(null, r);
                  }
                });
              });
            });
          });
        });
      });


    });
  }

  function getNearServices(id, categories, radius, latitude, longitude, useFeedServices, cb) {
    var cat;
    if (categories.length === 1) {
      _.forEach(categories, function (item) {
        cat = "'" + item + "'";
      });
    } else {
      cat = "'";
      for (var i = 0; i < (categories.length - 1); i++) {
        cat = cat + categories[i] + "','";
      }
      cat = cat + categories[categories.length - 1] + "'";
      console.info("Categories: ", cat);
    }
    var query = 'SELECT '
      + '"id" '
      + 'FROM "public"."user" '
      + 'WHERE '
      + 'location IS NOT NULL '
      + ' AND id in (SELECT CAST(principalid as int) FROM "public"."rolemapping" rm LEFT JOIN "public"."role" r'
      + ' on rm.roleid = r.id WHERE r.name = \'' + UserUtils.ROLE_SERVICE + '\')'
      + ' AND id <> ' + id
      + ' AND'
      + ' categoryservice IN (' + cat + ')'
      + ' AND ST_Distance(ST_SetSrid(location::geometry,4326)::geography,'
      + ' ST_GeographyFromText(\'SRID=4326;POINT(' + longitude + ' ' + latitude + ')\')'
      + ' ) <= ' + radius + ' ';
    ds.connector.query(query, null, function (err, ids) {
      if (err) {
        cb(err);
      } else {
        getFeeds(id, _.map(ids, "id"), useFeedServices, true, cb);
      }
    });

  }

  UserBase.remoteMethod(
    'noticeBoard',
    {
      description: 'get feed of my services',
      http: {
        verb: 'get',
        path: '/:id/noticeBoard'
      },
      accepts: [
        {
          arg: 'id',
          type: 'number',
          required: true,
          http: {source: 'path'}
        },
        {
          arg: 'useFeedServices',
          type: 'boolean',
          required: true,
          http: {source: 'query'}
        },
        {
          arg: 'useLocation',
          type: 'boolean',
          required: true,
          http: {source: 'query'}
        },
        {
          arg: 'categories',
          type: 'array',
          required: false,
          http: {source: 'query'}
        },
        {
          arg: 'latitude',
          type: 'number',
          required: false,
          http: {source: 'query'}
        },
        {
          arg: 'longitude',
          type: 'number',
          required: false,
          http: {source: 'query'}
        },
        {
          arg: 'radius',
          type: 'number',
          required: false,
          http: {source: 'query'}
        },
        {
          arg: 'offset',
          type: 'number',
          http: {source: 'query'}
        },
        {
          arg: 'limit',
          type: 'number',
          http: {source: 'query'}
        }
      ],
      returns: {
        type: 'object',
        root: true
      }
    }
  );
};
