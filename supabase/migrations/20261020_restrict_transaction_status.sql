
-- Remove broad UPDATE permission.
REVOKE UPDATE
ON public.sale_transactions
FROM authenticated;

-- Permit editing ordinary transaction details.
GRANT UPDATE (
    customer_id,
    notes
)
ON public.sale_transactions
TO authenticated;

-- Remove any direct column-level UPDATE grants
-- for protected fields.
REVOKE UPDATE (
    status,
    completed_at
)
ON public.sale_transactions
FROM authenticated;


-- Remove broad INSERT permission.
REVOKE INSERT
ON public.sale_transactions
FROM authenticated;

-- Allow authenticated users to create transactions
-- using only safe initial fields.
GRANT INSERT (
    customer_id,
    notes
)
ON public.sale_transactions
TO authenticated;

-- Explicitly remove column-level INSERT grants
-- for the protected fields.
REVOKE INSERT (
    status,
    completed_at
)
ON public.sale_transactions
FROM authenticated;

