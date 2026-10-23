
CREATE OR REPLACE FUNCTION public.checkout_sale(
    p_checkout_key uuid,
    p_items jsonb
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_transaction_id bigint;
    v_existing_items jsonb;
    v_requested_items jsonb;
BEGIN
    -- Only authorised business members can checkout.
    IF auth.uid() IS NULL
       OR NOT public.is_business_member() THEN
        RAISE EXCEPTION 'Not authorised';
    END IF;

    IF p_checkout_key IS NULL THEN
        RAISE EXCEPTION 'Checkout key is required';
    END IF;

    IF p_items IS NULL
       OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Checkout basket cannot be empty';
    END IF;

    -- Validate the structure and values of every item.
    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(p_items) AS e(item)
        WHERE jsonb_typeof(e.item) <> 'object'
           OR jsonb_typeof(e.item->'inventory_item_id') <> 'number'
           OR jsonb_typeof(e.item->'sale_price') <> 'number'
           OR (e.item->>'inventory_item_id') !~ '^[1-9][0-9]*$'
           OR (e.item->>'sale_price') !~ '^[0-9]+(\.[0-9]{1,2})?$'
           OR (e.item->>'sale_price')::numeric > 9999999999.99
    ) THEN
        RAISE EXCEPTION 'Invalid checkout item';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(p_items) AS e(item)
        GROUP BY e.item->>'inventory_item_id'
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate inventory item';
    END IF;

    -- Normalise basket contents for retry comparisons.
    SELECT jsonb_agg(
        jsonb_build_object(
            'inventory_item_id',
            (e.item->>'inventory_item_id')::bigint,
            'sale_price',
            (e.item->>'sale_price')::numeric
        )
        ORDER BY (e.item->>'inventory_item_id')::bigint
    )
    INTO v_requested_items
    FROM jsonb_array_elements(p_items) AS e(item);

    -- Serialise requests using the same checkout key.
    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(p_checkout_key::text, 0)
    );

    -- A retry must return the original completed sale.
    SELECT id
    INTO v_transaction_id
    FROM public.sale_transactions
    WHERE checkout_key = p_checkout_key
    FOR UPDATE;

    IF FOUND THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'inventory_item_id', inventory_item_id,
                'sale_price', sale_price
            )
            ORDER BY inventory_item_id
        )
        INTO v_existing_items
        FROM public.sale_items
        WHERE sale_transaction_id = v_transaction_id;

        IF v_existing_items IS DISTINCT FROM v_requested_items THEN
            RAISE EXCEPTION
                'Checkout key was used with a different basket';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM public.sale_transactions
            WHERE id = v_transaction_id
              AND status = 'completed'
        ) THEN
            RAISE EXCEPTION
                'Existing checkout is not completed';
        END IF;

        RETURN v_transaction_id;
    END IF;

    -- Create the transaction.
    INSERT INTO public.sale_transactions (
        checkout_key
    )
    VALUES (
        p_checkout_key
    )
    RETURNING id INTO v_transaction_id;

    -- Insert all basket items.
    INSERT INTO public.sale_items (
        sale_transaction_id,
        inventory_item_id,
        sale_price
    )
    SELECT
        v_transaction_id,
        (e.item->>'inventory_item_id')::bigint,
        (e.item->>'sale_price')::numeric
    FROM jsonb_array_elements(p_items) AS e(item);

    -- Reuse the existing stock validation,
    -- locking and cost snapshot logic.
    PERFORM public.complete_sale_transaction(
        v_transaction_id
    );

    RETURN v_transaction_id;
END;
$$;

REVOKE ALL ON FUNCTION
    public.checkout_sale(uuid, jsonb)
FROM PUBLIC;

REVOKE ALL ON FUNCTION
    public.checkout_sale(uuid, jsonb)
FROM anon;

GRANT EXECUTE ON FUNCTION
    public.checkout_sale(uuid, jsonb)
TO authenticated;
