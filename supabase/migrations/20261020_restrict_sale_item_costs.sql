
-- Remove broad INSERT and UPDATE permissions.
REVOKE INSERT, UPDATE
ON public.sale_items
FROM authenticated;

-- Allow the app to add items to draft/pending carts.
GRANT INSERT (
    sale_transaction_id,
    inventory_item_id,
    sourcing_request_id,
    sale_price
)
ON public.sale_items
TO authenticated;

-- Allow editing cart items before completion.
GRANT UPDATE (
    sale_transaction_id,
    inventory_item_id,
    sourcing_request_id,
    sale_price
)
ON public.sale_items
TO authenticated;

-- Prevent clients from setting cost snapshots.
REVOKE INSERT (cost_snapshot)
ON public.sale_items
FROM authenticated;

REVOKE UPDATE (cost_snapshot)
ON public.sale_items
FROM authenticated;
