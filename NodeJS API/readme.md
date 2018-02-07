# NodeJS API
This API was generated with Loopback Framework

## Development

Databases:

1. MongoDB.
   
2. PostgreSQL.


Examples:

1. FeedDetails.js, Get the detail of a feed only using the ORM, use the `waterfall` function from [async][]:, find the feed, after that the `parallel` function is used to complete the response with the detail: the hashtags, images, total likes, if is liked by the current user, find the 5 last comments, total comments, tagged users, the author, parallel functions allows us get the detail  more quickly.    
2. FullTextSearchUsersAndServices.js, We use the [Full Text Search] engine and the [Unnacent] function for searchs, the searchs are ranked with the objective to get relevant results.
3. GetLinkedServices.js, A user can have many related services, this services are listed on a different endpoint. `forEach` function from [Async][] is used with a promise.
4. GetStaff.js, An user is able to have many other users, being this users his staff. The current user is validated and after that his staff is returned.  
5. NoticeBoard.js, An user is able to list the main feed, his feed can be listed using his location (nearest) and/or by his favorite services, his recommended services and friends shared feeds. Each feed is formated and can have, users that share the feed, tags, the service which own the feed, the tagged users, users comments (limit 5), total likes, if is liked by the current user. The distance is calculated using the `ST_Distance` function from [PostGis][]    
6. RecommendTrendingUsers.js, This endpoint is able to list the recommended services to the user that He is not following. 
7. SearchSuppliers.js, The search services are filtered using the Open Street API using the current location or by the nearest distance.

[async]: https://caolan.github.io/async/
[Full Text Search]:https://www.postgresql.org/docs/9.3/static/textsearch-intro.html
[Unnacent]: https://www.postgresql.org/docs/9.3/static/unaccent.html
[PostGis]: https://postgis.net/