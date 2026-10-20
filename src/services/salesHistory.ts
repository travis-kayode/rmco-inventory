
import { supabase } from '../lib/supabase';
import type {
    Sale,
    SalesHistoryItem,
    Condition,
} from '../types/inventory';

export async function fetchSalesHistory(): Promise<SalesHistoryItem[]> {
    // 1. Fetch legacy sales
    const { data: legacySales, error: legacyError } = await supabase
        .from('sales')
        .select(`
      id,
      sale_price,
      sold_date,
      inventory_items (
        id,
        size,
        condition,
        cost,
        products (
          brand,
          name,
          colourway
        )
      )
    `)
        .order('sold_date', { ascending: false })
        .returns<Sale[]>();

    if (legacyError) {
        throw new Error(`Failed to load legacy sales: ${legacyError.message}`);
    }

    // 2. Fetch completed sales from the new architecture
    const { data: transactionItems, error: transactionError } =
        await supabase
            .from('sale_items')
            .select(`
        id,
        sale_price,
        cost_snapshot,
        sale_transactions!inner (
          id,
          status,
          completed_at
        ),
        inventory_items (
          size,
          condition,
          products (
            brand,
            name,
            colourway
          )
        ),
        sourcing_requests (
          brand,
          item_name,
          colourway,
          size,
          condition
        )
      `)
            .eq('sale_transactions.status', 'completed');

   
    if (transactionError) {
        throw new Error(
            `Failed to load completed transactions: ${transactionError.message}`
        );
    }


    // 3. Convert legacy sales into a shared display format
    const legacyHistory: SalesHistoryItem[] = (legacySales ?? []).map(
        (sale) => ({
            id: `legacy-${sale.id}`,
            transactionId: null,

            brand: sale.inventory_items.products.brand,
            name: sale.inventory_items.products.name,
            colourway: sale.inventory_items.products.colourway,
            size: sale.inventory_items.size,
            condition: sale.inventory_items.condition,

            salePrice: Number(sale.sale_price),
            cost: Number(sale.inventory_items.cost),
            soldDate: sale.sold_date,

            source: 'legacy',
        })
    );


    type Related<T> = T | T[] | null;

    const firstRelated = <T>(value: Related<T>): T | null => {
        if (Array.isArray(value)) {
            return value[0] ?? null;
        }

        return value ?? null;
    };

    // 4. Convert new transaction sales into the same format
    const transactionHistory: SalesHistoryItem[] =
        (transactionItems ?? []).map((item) => {
            // Supabase currently infers these as arrays.
            const transaction = firstRelated(item.sale_transactions);
            const inventory = firstRelated(item.inventory_items);
            const product = firstRelated(inventory?.products ?? null);
            const sourcing = firstRelated(item.sourcing_requests);

            if (!transaction?.completed_at) {
                throw new Error(
                    `Sale item ${item.id} is missing its completion date.`
                );
            }

            if (item.cost_snapshot == null) {
                throw new Error(
                    `Sale item ${item.id} is missing its cost snapshot.`
                );
            }

            if (!inventory && !sourcing) {
                throw new Error(
                    `Sale item ${item.id} has no inventory or sourcing record.`
                );
            }

            return {
                id: `transaction-${item.id}`,
                transactionId: transaction.id,

                brand: product?.brand ?? sourcing?.brand ?? '',
                name: product?.name ?? sourcing?.item_name ?? '',
                colourway:
                    product?.colourway ?? sourcing?.colourway ?? '',

                size: inventory?.size ?? sourcing?.size ?? null,
                condition: (
                    inventory?.condition ?? sourcing?.condition ?? null
                ) as Condition | null,

                salePrice: Number(item.sale_price),
                cost: Number(item.cost_snapshot),
                soldDate: transaction.completed_at,

                source: 'transaction' as const,
            };
        });

    // 5. Combine both sources and sort by most recent sale
    const allSales = [...legacyHistory, ...transactionHistory];

    return allSales.sort(
        (a, b) =>
            new Date(b.soldDate).getTime() -
            new Date(a.soldDate).getTime()
    );
}
