'use strict';

var _ = require('lodash');
var async = require('async');
var returnFields = [
    'id',
    'created',
    'text',
    'supplier_id'
];

module.exports = function (UserBase) {

    UserBase.getFeedById = function (id, feedId, next) {

        async.waterfall([
                function (cb) {
                    //validate the feed exist
                    UserBase.app.models.Feed.findOne(
                        {
                            where: {
                                and: [{"id":feedId},{"deleted_at":null}]
                            },
                            include: ["hashTags", "imagesFeed", "likes", "user"]
                        },
                        function (err, feed) {
                            if (!feed) {
                                cb(new Error(' The feed does not exist'));
                            } else {
                                cb(err, feed);
                            }
                        });
                },
                function (feed, cb) {
                    //format feed
                    var item = {};
                    async.parallel([
                            function (cb) {
                                _.each(returnFields, function (field) {
                                    item[field] = feed[field];
                                });
                                cb(null);
                            },
                            function (cb) {
                                item['hashTags'] = [];
                                var hs = feed.hashTags;

                                if (Object.prototype.toString.call(hs) === '[object Array]') {
                                    item['hashTags'] = _.map(hs, 'words');
                                } else if (Object.prototype.toString.call(hs) === '[object Function]') {
                                    feed.hashTags(function (err, items) {
                                        item['hashTags'] = _.map(items, 'words');
                                    });
                                }
                                cb();
                            },
                            function (cb) {
                                item['images'] = [];
                                if (Object.prototype.toString.call(feed.imagesFeed) === '[object Array]') {
                                    item['images'] = _.map(feed.imagesFeed, 'photoUrl');
                                } else if (Object.prototype.toString.call(feed.imagesFeed) === '[object Function]') {
                                    feed.imagesFeed(function (err, items) {
                                        item['images'] = _.map(items, 'photoUrl');
                                    });
                                }
                                cb();
                            },
                            function (cb) {
                                item['totalLikes'] = 0;
                                if (Object.prototype.toString.call(feed.likes) === '[object Array]') {
                                    item['totalLikes'] = feed.likes.length;
                                } else if (Object.prototype.toString.call(feed.likes) === '[object Function]') {
                                    feed.likes(function (err, items) {
                                        item['totalLikes'] = items.length;
                                    });
                                }
                                cb();
                            },
                            function (cb) {
                                //item['liked'] = false;
                                UserBase.app.models.Like.findOne({
                                    where: {
                                        and: [
                                            {"user_id": id},
                                            {"feed_id": feedId}
                                        ]
                                    }
                                }, function (err, like) {
                                    if (err) {
                                        console.error("FeedDetail, query liked:", err);
                                    }
                                    item['liked'] = !!like;
                                    cb();
                                });
                            },
                            function (cb) {
                                item['comments'] = [];
                                UserBase.app.models.Comment.find({
                                    where: {feed_id: feedId},
                                    include: ['fromUser'],
                                    limit: 5,
                                    order: 'created_at DESC'
                                }, function (err2, comments) {
                                    if (err2) {
                                        cb(err2);
                                    } else {
                                        async.each(comments, function (c, callback) {
                                            var cm = c.toJSON();
                                            var taggedUsers = {};
                                            if (c.tagged_users && c.tagged_users.length > 0) {
                                                UserBase.find({
                                                    where: {
                                                        id: {
                                                            inq: c.tagged_users
                                                        }
                                                    }
                                                }, function (err2, users) {
                                                    if (err2) {
                                                        callback(err2);
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
                                                            item['comments'].push({
                                                                'text': cm.comment, created_at: cm.created_at,
                                                                keys: taggedUsers,
                                                                'author': {
                                                                    name: cm.fromUser.name,
                                                                    user_id: cm.fromUser.id,
                                                                    thumbnailUrl: (cm.fromUser.photoUrl !== null && cm.fromUser.photoUrl !== undefined && cm.fromUser.photoUrl !== "") ? cm.fromUser.photoUrl + "?dimension=thumb" : ""
                                                                }
                                                            });
                                                            callback(err);
                                                        });
                                                    }
                                                });
                                            } else {
                                                item['comments'].push({
                                                    'text': cm.comment, created_at: cm.created_at,
                                                    keys: taggedUsers,
                                                    'author': {
                                                        name: cm.fromUser.name,
                                                        user_id: cm.fromUser.id,
                                                        thumbnailUrl: (cm.fromUser.photoUrl !== null && cm.fromUser.photoUrl !== undefined && cm.fromUser.photoUrl !== "") ? cm.fromUser.photoUrl + "?dimension=thumb" : ""
                                                    }
                                                });
                                                callback();
                                            }
                                        }, function (err) {
                                            cb(err);
                                        });
                                    }
                                });
                            },
                            function (cb) {
                                UserBase.app.models.Comment.count({feed_id: feedId}, function (err2, totalComments) {
                                    item['totalComments'] = (totalComments === null || totalComments === undefined) ? 0 : totalComments;
                                    cb();

                                });
                            },
                            function (cb) {
                                var service = {};
                                var f = feed.toJSON();
                                if(f.user !== undefined){
                                    service['category'] = f.user.categoryservice;
                                    service['name'] = f.user.name;
                                    service['location'] = f.user.location;
                                    service['id'] = f.user.id;
                                    service['city'] = f.user.city;
                                    service['country'] = f.user.country;
                                    service['photoUrl'] = (f.user.photoUrl!==null && f.user.photoUrl!==undefined && f.user.photoUrl!=="")?f.user.photoUrl+"?dimension=thumb":"";
                                }

                                item['author'] = service;
                                cb();
                            },
                            function (cb) {
                                item['taggedUsers'] = [];
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
                                            item['taggedUsers'].push({
                                                id: user.id,
                                                name: user.name,
                                                thumbnailPhoto: (user.photoUrl !== null && user.photoUrl !== undefined && user.photoUrl !== "") ? user.photoUrl + "?dimension=thumb" : ""
                                            });
                                        });
                                        cb();
                                    });
                                } else {
                                    cb();
                                }

                            }],
                        function (err) {
                            cb(err, item);
                        });
                }],
            function (err, feed) {
                next(err, feed);
            }
        )

    };

    //Endpoint definition
    UserBase.remoteMethod(
        'getFeedById',
        {
            description: 'get feed by id',
            http: {
                verb: 'get',
                path: '/:id/feeds/:feedId'
            },
            accepts: [
                {
                    arg: 'id',
                    type: 'number',
                    required: true,
                    http: {source: 'path'}
                },
                {
                    arg: 'feedId',
                    type: 'string',
                    http: {source: 'path'}
                }
            ],
            returns: {
                type: 'array',
                root: true
            }
        }
    );
};
