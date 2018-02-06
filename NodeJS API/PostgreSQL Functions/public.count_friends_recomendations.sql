-- FUNCTION: public.count_friends_recommendations(integer, integer)

-- DROP FUNCTION public.count_friends_recommendations(integer, integer);

CREATE OR REPLACE FUNCTION public.count_friends_recommendations(
	supplier integer,
	customer integer)
RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    IMMUTABLE STRICT 
AS $BODY$

    DECLARE sum INTEGER;
    BEGIN
	
	SELECT count(*) INTO sum
	FROM service_recommended_from_friends as t
	WHERE "service_recommended_id" = $1
		AND t."customer_id" = $2;
	RETURN sum;
    END;
    
$BODY$;

ALTER FUNCTION public.count_friends_recommendations(integer, integer)
    OWNER TO postgres;

