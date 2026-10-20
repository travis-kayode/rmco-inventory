
-- A sale item must stay in the transaction
-- where it was originally created.
CREATE OR REPLACE FUNCTION public.prevent_sale_item_transfer()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.sale_transaction_id
       IS DISTINCT FROM OLD.sale_transaction_id THEN
        RAISE EXCEPTION
            'Sale items cannot be transferred between transactions';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_sale_item_transfer_trigger
ON public.sale_items;

CREATE TRIGGER prevent_sale_item_transfer_trigger
BEFORE UPDATE OF sale_transaction_id
ON public.sale_items
FOR EACH ROW
EXECUTE FUNCTION public.prevent_sale_item_transfer();
