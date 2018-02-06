-- FUNCTION: public.count_recommendations(integer)

-- DROP FUNCTION public.count_recommendations(integer);

CREATE OR REPLACE FUNCTION public.count_recommendations(
	supplier integer)
RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    IMMUTABLE STRICT 
AS $BODY$

    DECLARE sum INTEGER;
    BEGIN
	
	SELECT count(*) INTO sum
	FROM recommendations_services as t
	WHERE "supplier_id" = $1;
	RETURN sum;
    END;
    
$BODY$;

ALTER FUNCTION public.count_recommendations(integer)
    OWNER TO postgres;

