-- FUNCTION: public.count_followers(integer)

-- DROP FUNCTION public.count_followers(integer);

CREATE OR REPLACE FUNCTION public.count_followers(
	user_id integer)
RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    IMMUTABLE STRICT 
AS $BODY$

    DECLARE sum INTEGER;
    BEGIN
	SELECT count(*) INTO sum
	FROM "public"."friend" as t
	WHERE friend_id = $1;
	RETURN sum;
    END;
    
$BODY$;

ALTER FUNCTION public.count_followers(integer)
    OWNER TO postgres;

