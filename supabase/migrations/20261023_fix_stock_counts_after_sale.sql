CREATE OR REPLACE FUNCTION public.search_stock(
    search_term text DEFAULT ''::text,
    page_size integer DEFAULT 20,
    page_offset integer DEFAULT 0,
    filter_size text DEFAULT NULL::text,
    filter_condition text DEFAULT NULL::text,
    filter_location text DEFAULT NULL::text
)
RETURNS TABLE(
    id bigint,
    brand text,
    name text,
    colourway text,
    stock_count bigint,
    sizes jsonb
)
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$

    WITH matching_items AS (
        SELECT
            i.id,
            i.product_id,
            i.size
        FROM public.inventory_items i

        -- Exclude items sold through the original sales system
        WHERE NOT EXISTS (
            SELECT 1
            FROM public.sales s
            WHERE s.inventory_item_id = i.id
        )

        -- Exclude items sold through the new checkout system
        AND NOT EXISTS (
            SELECT 1
            FROM public.sale_items si
            WHERE si.inventory_item_id = i.id
        )

        -- Apply inventory filters
        AND (
            filter_size IS NULL
            OR i.size = filter_size
        )

        AND (
            filter_condition IS NULL
            OR i.condition = filter_condition
        )

        AND (
            filter_location IS NULL
            OR i.location = filter_location
        )
    )

    SELECT
        p.id,
        p.brand,
        p.name,
        p.colourway,

        COALESCE(
            SUM(mi.quantity),
            0
        )::bigint AS stock_count,

        COALESCE(
            jsonb_object_agg(
                mi.size,
                mi.quantity
            ) FILTER (
                WHERE mi.size IS NOT NULL
            ),
            '{}'::jsonb
        ) AS sizes

    FROM public.products p

    LEFT JOIN (
        SELECT
            product_id,
            size,
            COUNT(*) AS quantity,
            MIN(id) AS id
        FROM matching_items
        GROUP BY
            product_id,
            size
    ) mi
        ON mi.product_id = p.id

    WHERE (
        COALESCE(search_term, '') = ''
        OR p.name ILIKE '%' || search_term || '%'
        OR p.brand ILIKE '%' || search_term || '%'
        OR p.colourway ILIKE '%' || search_term || '%'
    )

    AND (
        (
            filter_size IS NULL
            AND filter_condition IS NULL
            AND filter_location IS NULL
        )
        OR mi.product_id IS NOT NULL
    )

    GROUP BY
        p.id,
        p.brand,
        p.name,
        p.colourway

    ORDER BY
        p.name ASC,
        p.id ASC

    LIMIT LEAST(
        GREATEST(page_size, 1),
        100
    )

    OFFSET GREATEST(
        page_offset,
        0
    );

$function$;