
-- Prevent ordinary updates from marking a transaction completed.
CREATE OR REPLACE FUNCTION public.guard_sale_transaction()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    -- Completed transactions cannot be changed.
    IF TG_OP = 'UPDATE'
       AND OLD.status = 'completed' THEN
        RAISE EXCEPTION
            'Completed transactions cannot be modified';
    END IF;

    -- Direct completion is not allowed.
    IF NEW.status = 'completed' THEN
        RAISE EXCEPTION
            'Use the sale completion function';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER guard_sale_transaction_trigger
BEFORE INSERT OR UPDATE
ON public.sale_transactions
FOR EACH ROW
EXECUTE FUNCTION public.guard_sale_transaction();


-- Prevent changing sale items after completion.
CREATE OR REPLACE FUNCTION public.guard_sale_item()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    parent_status text;
BEGIN
    SELECT status
    INTO parent_status
    FROM public.sale_transactions
    WHERE id = COALESCE(
        NEW.sale_transaction_id,
        OLD.sale_transaction_id
    );

    IF parent_status = 'completed' THEN
        RAISE EXCEPTION
            'Cannot modify items in a completed sale';
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER guard_sale_item_trigger
BEFORE INSERT OR UPDATE OR DELETE
ON public.sale_items
FOR EACH ROW
EXECUTE FUNCTION public.guard_sale_item();
