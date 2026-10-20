
-- Remove dangerous table-level privileges
-- from client-accessible database roles.

REVOKE TRUNCATE, TRIGGER
ON TABLE
    public.sale_transactions,
    public.sale_items,
    public.sales,
    public.inventory_items,
    public.sourcing_requests
FROM authenticated, anon, PUBLIC;
