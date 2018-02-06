-- FUNCTION: public.count_mutual_followers(integer, integer)

-- DROP FUNCTION public.count_mutual_followers(integer, integer);

CREATE OR REPLACE FUNCTION public.count_mutual_followers(
	follower integer,
	user_id integer)
RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    IMMUTABLE STRICT 
AS $BODY$

DECLARE SUM INTEGER ;
BEGIN
	SELECT
	 "mutuals" INTO SUM
	FROM
		(
			SELECT
				"friend_id",
				COUNT ("friend_id") AS mutuals
			FROM
				"public"."friend" AS T
			WHERE
				t."user_id" IN (
					SELECT
						"friend_id"
					FROM
						"public"."friend" AS t2
					WHERE
						t2."user_id" = $2
				)
			GROUP BY
				"friend_id"
		) mf
	WHERE
		mf.friend_id = $1 ; 
	RETURN SUM ;
	END ; 
$BODY$;

ALTER FUNCTION public.count_mutual_followers(integer, integer)
    OWNER TO postgres;

