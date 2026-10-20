
CREATE OR REPLACE FUNCTION public.complete_sale_transaction(
    p_transaction_id bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_status text;
    v_item record;
    v_cost numeric;
    v_inventory_id bigint;
    v_sourcing_id bigint;
BEGIN
    -- Verify the caller.
    IF auth.uid() IS NULL
       OR NOT public.is_business_member() THEN
        RAISE EXCEPTION 'Not authorised';
    END IF;

    -- Lock the transaction.
    SELECT status
    INTO v_status
    FROM public.sale_transactions
    WHERE id = p_transaction_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found';
    END IF;

    IF v_status NOT IN ('draft', 'pending') THEN
        RAISE EXCEPTION 'Transaction cannot be completed';
    END IF;

    -- Reject empty carts.
    IF NOT EXISTS (
        SELECT 1
        FROM public.sale_items
        WHERE sale_transaction_id = p_transaction_id
    ) THEN
        RAISE EXCEPTION 'Cannot complete an empty cart';
    END IF;

    -- Lock inventory items in ascending order.
    FOR v_inventory_id IN
        SELECT DISTINCT inventory_item_id
        FROM public.sale_items
        WHERE sale_transaction_id = p_transaction_id
          AND inventory_item_id IS NOT NULL
        ORDER BY inventory_item_id
    LOOP
        PERFORM 1
        FROM public.inventory_items
        WHERE id = v_inventory_id
        FOR NO KEY UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Inventory item % not found',
                v_inventory_id;
        END IF;
    END LOOP;

    -- Lock sourcing requests in ascending order.
    FOR v_sourcing_id IN
        SELECT DISTINCT sourcing_request_id
        FROM public.sale_items
        WHERE sale_transaction_id = p_transaction_id
          AND sourcing_request_id IS NOT NULL
        ORDER BY sourcing_request_id
    LOOP
        PERFORM 1
        FROM public.sourcing_requests
        WHERE id = v_sourcing_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Sourcing request % not found',
                v_sourcing_id;
        END IF;
    END LOOP;

    -- Validate each sale item and snapshot its cost.
    FOR v_item IN
        SELECT *
        FROM public.sale_items
        WHERE sale_transaction_id = p_transaction_id
        ORDER BY id
    LOOP
        IF v_item.inventory_item_id IS NOT NULL THEN

            -- Reject inventory already sold through legacy sales.
            IF EXISTS (
                SELECT 1
                FROM public.sales
                WHERE inventory_item_id =
                    v_item.inventory_item_id
            ) THEN
                RAISE EXCEPTION
                    'Inventory item % already sold',
                    v_item.inventory_item_id;
            END IF;

            -- Reject inventory already sold through new sales.
            IF EXISTS (
                SELECT 1
                FROM public.sale_items si
                JOIN public.sale_transactions st
                  ON st.id = si.sale_transaction_id
                WHERE si.inventory_item_id =
                    v_item.inventory_item_id
                  AND st.status = 'completed'
            ) THEN
                RAISE EXCEPTION
                    'Inventory item % already sold',
                    v_item.inventory_item_id;
            END IF;

            SELECT cost
            INTO v_cost
            FROM public.inventory_items
            WHERE id = v_item.inventory_item_id;

        ELSE

            -- Require a secured sourcing request with known cost.
            SELECT sourcing_cost
            INTO v_cost
            FROM public.sourcing_requests
            WHERE id = v_item.sourcing_request_id
              AND status = 'secured'
            FOR UPDATE;

            IF NOT FOUND OR v_cost IS NULL THEN
                RAISE EXCEPTION
                    'Sourcing request % is not ready',
                    v_item.sourcing_request_id;
            END IF;

            -- Reject sourcing requests already sold.
            IF EXISTS (
                SELECT 1
                FROM public.sale_items si
                JOIN public.sale_transactions st
                  ON st.id = si.sale_transaction_id
                WHERE si.sourcing_request_id =
                    v_item.sourcing_request_id
                  AND st.status = 'completed'
            ) THEN
                RAISE EXCEPTION
                    'Sourcing request % already sold',
                    v_item.sourcing_request_id;
            END IF;

        END IF;

        UPDATE public.sale_items
        SET cost_snapshot = v_cost
        WHERE id = v_item.id;
    END LOOP;
    
    -- Automatically complete sourced items.
    UPDATE public.sourcing_requests sr
    SET status = 'completed',
        completed_at = now(),
        updated_at = now()
    WHERE sr.id IN (
        SELECT si.sourcing_request_id
        FROM public.sale_items si
        WHERE si.sale_transaction_id = p_transaction_id
          AND si.sourcing_request_id IS NOT NULL
    )
    AND sr.status = 'secured';

    -- Verify that every sourced item was completed.
    IF EXISTS (
        SELECT 1
        FROM public.sale_items si
        JOIN public.sourcing_requests sr
          ON sr.id = si.sourcing_request_id
        WHERE si.sale_transaction_id = p_transaction_id
          AND si.sourcing_request_id IS NOT NULL
          AND sr.status <> 'completed'
    ) THEN
        RAISE EXCEPTION
            'Not all sourcing requests could be completed';
    END IF;


    -- Finalise the sale.
    UPDATE public.sale_transactions
    SET status = 'completed',
        completed_at = now(),
        updated_at = now()
    WHERE id = p_transaction_id;
END;
$$;

REVOKE ALL ON FUNCTION
    public.complete_sale_transaction(bigint)
FROM PUBLIC;

REVOKE ALL ON FUNCTION
    public.complete_sale_transaction(bigint)
FROM anon;

GRANT EXECUTE ON FUNCTION
    public.complete_sale_transaction(bigint)
TO authenticated;

