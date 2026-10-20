
-- Prevent modifying or deleting completed transactions.
CREATE OR REPLACE FUNCTION public.protect_completed_transaction()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF OLD.status = 'completed' THEN
        RAISE EXCEPTION
            'Completed transactions cannot be modified or deleted';
    END IF;

    RETURN OLD;
END;
$$;

CREATE TRIGGER protect_completed_transaction_trigger
BEFORE UPDATE OR DELETE
ON public.sale_transactions
FOR EACH ROW
EXECUTE FUNCTION public.protect_completed_transaction();


-- Protect items belonging to completed transactions.
CREATE OR REPLACE FUNCTION public.protect_completed_sale_items()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    old_parent_status text;
    new_parent_status text;
BEGIN
    -- Check the original parent for UPDATE or DELETE.
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        SELECT status
        INTO old_parent_status
        FROM public.sale_transactions
        WHERE id = OLD.sale_transaction_id
        FOR UPDATE;

        IF old_parent_status = 'completed' THEN
            RAISE EXCEPTION
                'Cannot change items in a completed transaction';
        END IF;
    END IF;

    -- Check the destination parent for INSERT or UPDATE.
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        SELECT status
        INTO new_parent_status
        FROM public.sale_transactions
        WHERE id = NEW.sale_transaction_id
        FOR UPDATE;

        IF new_parent_status = 'completed' THEN
            RAISE EXCEPTION
                'Cannot add items to a completed transaction';
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER protect_completed_sale_items_trigger
BEFORE INSERT OR UPDATE OR DELETE
ON public.sale_items
FOR EACH ROW
EXECUTE FUNCTION public.protect_completed_sale_items();
