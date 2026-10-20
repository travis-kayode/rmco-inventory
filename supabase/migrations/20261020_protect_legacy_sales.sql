
-- Prevent legacy sales from selling inventory
-- already sold through a completed new transaction.

CREATE OR REPLACE FUNCTION public.protect_legacy_sale()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    -- Lock the physical inventory item.
    -- This coordinates with the future completion RPC.
    PERFORM 1
    FROM public.inventory_items
    WHERE id = NEW.inventory_item_id
    FOR NO KEY UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Inventory item does not exist';
    END IF;

    -- Reject inventory already sold through
    -- the new transaction system.
    IF EXISTS (
        SELECT 1
        FROM public.sale_items si
        JOIN public.sale_transactions st
          ON st.id = si.sale_transaction_id
        WHERE si.inventory_item_id = NEW.inventory_item_id
          AND st.status = 'completed'
    ) THEN
        RAISE EXCEPTION
            'Inventory item has already been sold';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER protect_legacy_sale_trigger
BEFORE INSERT OR UPDATE OF inventory_item_id
ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.protect_legacy_sale();
