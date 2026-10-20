
CREATE OR REPLACE FUNCTION public.protect_completed_sourcing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    -- Lock the sourcing request during updates/deletes
    -- (PostgreSQL already locks the row being modified).

    IF EXISTS (
        SELECT 1
        FROM public.sale_items si
        JOIN public.sale_transactions st
          ON st.id = si.sale_transaction_id
        WHERE si.sourcing_request_id = OLD.id
          AND st.status = 'completed'
    ) THEN
        RAISE EXCEPTION
            'Cannot modify a sourcing request used in a completed sale';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER protect_completed_sourcing_trigger
BEFORE UPDATE OR DELETE
ON public.sourcing_requests
FOR EACH ROW
EXECUTE FUNCTION public.protect_completed_sourcing();
