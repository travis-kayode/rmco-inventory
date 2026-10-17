--
-- PostgreSQL database dump
--

\restrict n4S5gNysxLZsPjHGe6UIYxgYoI1OotUnzUhxIyDEIRpT7CTAJXYWntofmnAdbel

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: get_stock_filter_options(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_stock_filter_options() RETURNS jsonb
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
    SELECT jsonb_build_object(
        'sizes',
        COALESCE(
            (
                SELECT jsonb_agg(size ORDER BY size)
                FROM (
                    SELECT DISTINCT i.size
                    FROM public.inventory_items i
                    WHERE i.size IS NOT NULL
                      AND NOT EXISTS (
                          SELECT 1
                          FROM public.sales s
                          WHERE s.inventory_item_id = i.id
                      )
                ) available_sizes
            ),
            '[]'::jsonb
        ),
        'locations',
        COALESCE(
            (
                SELECT jsonb_agg(location ORDER BY location)
                FROM (
                    SELECT DISTINCT i.location
                    FROM public.inventory_items i
                    WHERE i.location IS NOT NULL
                      AND NOT EXISTS (
                          SELECT 1
                          FROM public.sales s
                          WHERE s.inventory_item_id = i.id
                      )
                ) available_locations
            ),
            '[]'::jsonb
        )
    );
$$;


--
-- Name: is_business_member(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_business_member() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE user_id = (SELECT auth.uid())
  );
$$;


--
-- Name: search_stock(text, integer, integer, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_stock(search_term text DEFAULT ''::text, page_size integer DEFAULT 20, page_offset integer DEFAULT 0, filter_size text DEFAULT NULL::text, filter_condition text DEFAULT NULL::text, filter_location text DEFAULT NULL::text) RETURNS TABLE(id bigint, brand text, name text, colourway text, stock_count bigint, sizes jsonb)
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
    WITH matching_items AS (
        SELECT
            i.id,
            i.product_id,
            i.size
        FROM public.inventory_items i
        WHERE NOT EXISTS (
            SELECT 1
            FROM public.sales s
            WHERE s.inventory_item_id = i.id
        )
        AND (filter_size IS NULL OR i.size = filter_size)
        AND (filter_condition IS NULL OR i.condition = filter_condition)
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
        COALESCE(SUM(mi.quantity), 0)::bigint AS stock_count,
        COALESCE(
            jsonb_object_agg(mi.size, mi.quantity)
                FILTER (WHERE mi.size IS NOT NULL),
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
        GROUP BY product_id, size
    ) mi ON mi.product_id = p.id
    WHERE (
        COALESCE(search_term, '') = ''
        OR p.name ILIKE '%' || search_term || '%'
        OR p.brand ILIKE '%' || search_term || '%'
        OR p.colourway ILIKE '%' || search_term || '%'
    )
    AND (
        (filter_size IS NULL AND filter_condition IS NULL
         AND filter_location IS NULL)
        OR mi.product_id IS NOT NULL
    )
    GROUP BY p.id, p.brand, p.name, p.colourway
    ORDER BY p.name ASC, p.id ASC
    LIMIT LEAST(GREATEST(page_size, 1), 100)
    OFFSET GREATEST(page_offset, 0);
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: business_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_members (
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_items (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    product_id bigint NOT NULL,
    size text NOT NULL,
    condition text NOT NULL,
    location text NOT NULL,
    cost numeric NOT NULL,
    asking_price numeric,
    date_added date NOT NULL
);


--
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.inventory_items ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.inventory_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    brand text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    colourway text DEFAULT ''::text NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.products ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    inventory_item_id bigint NOT NULL,
    sale_price numeric NOT NULL,
    sold_date date NOT NULL
);


--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sales ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: business_members business_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_members
    ADD CONSTRAINT business_members_pkey PRIMARY KEY (user_id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sales sales_inventory_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_inventory_item_id_key UNIQUE (inventory_item_id);


--
-- Name: sales sales_inventory_item_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_inventory_item_id_unique UNIQUE (inventory_item_id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: business_members business_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_members
    ADD CONSTRAINT business_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sales sales_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id);


--
-- Name: products Members can create products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can create products" ON public.products FOR INSERT TO authenticated WITH CHECK (( SELECT public.is_business_member() AS is_business_member));


--
-- Name: inventory_items Members can manage inventory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can manage inventory" ON public.inventory_items TO authenticated USING (( SELECT public.is_business_member() AS is_business_member)) WITH CHECK (( SELECT public.is_business_member() AS is_business_member));


--
-- Name: sales Members can manage sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can manage sales" ON public.sales TO authenticated USING (( SELECT public.is_business_member() AS is_business_member)) WITH CHECK (( SELECT public.is_business_member() AS is_business_member));


--
-- Name: products Members can update products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can update products" ON public.products FOR UPDATE TO authenticated USING (( SELECT public.is_business_member() AS is_business_member)) WITH CHECK (( SELECT public.is_business_member() AS is_business_member));


--
-- Name: products Members can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view products" ON public.products FOR SELECT TO authenticated USING (( SELECT public.is_business_member() AS is_business_member));


--
-- Name: business_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: sales; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict n4S5gNysxLZsPjHGe6UIYxgYoI1OotUnzUhxIyDEIRpT7CTAJXYWntofmnAdbel

