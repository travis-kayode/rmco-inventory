-- Identify each checkout attempt uniquely.
ALTER TABLE public.sale_transactions
ADD COLUMN checkout_key uuid;

-- Prevent two transactions from using the same checkout key.
CREATE UNIQUE INDEX sale_transactions_checkout_key_unique
ON public.sale_transactions (checkout_key)
WHERE checkout_key IS NOT NULL;