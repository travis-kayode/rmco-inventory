
import { supabase } from '../lib/supabase';

export type SaleBasketItem = {
    inventoryItemId: number;
    salePrice: number;
};

// 1. Create a draft transaction
export async function createDraftSale() {
    const { data, error } = await supabase
        .from('sale_transactions')
        .insert({})
        .select('id')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data.id as number;
}

// 2. Add inventory items to the transaction
export async function addSaleItems(
    transactionId: number,
    items: SaleBasketItem[]
) {
    if (items.length === 0) {
        throw new Error('Cannot create a sale with no items.');
    }

    // Check for duplicate inventory items
    const ids = items.map((item) => item.inventoryItemId);

    if (new Set(ids).size !== ids.length) {
        throw new Error('The basket contains duplicate inventory items.');
    }

    // Validate inventory IDs and selling prices
    if (
        items.some(
            (item) =>
                !Number.isSafeInteger(item.inventoryItemId) ||
                item.inventoryItemId <= 0 ||
                !Number.isFinite(item.salePrice) ||
                item.salePrice < 0 ||
                !Number.isInteger(
                    Math.round(item.salePrice * 100)
                )
        )
    ) {
        throw new Error('The basket contains invalid items or prices.');
    }

    // Convert basket items into database rows
    const saleItems = items.map((item) => ({
        sale_transaction_id: transactionId,
        inventory_item_id: item.inventoryItemId,
        sale_price: item.salePrice,
    }));



    const { error } = await supabase
        .from('sale_items')
        .insert(saleItems);

    if (error) {
        throw new Error(error.message);
    }
}



export async function completeSale(
    items: SaleBasketItem[]
): Promise<number> {
    if (items.length === 0) {
        throw new Error('Cannot complete an empty sale.');
    }

    let transactionId: number | null = null;
    let completionAttempted = false;

    try {
        // Create the draft transaction.
        transactionId = await createDraftSale();

        // Add the inventory items.
        await addSaleItems(transactionId, items);

        // The completion request is about to be sent.
        completionAttempted = true;

        const { error } = await supabase.rpc(
            'complete_sale_transaction',
            {
                p_transaction_id: transactionId,
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        return transactionId;
    } catch (error) {
        if (transactionId !== null) {
            if (completionAttempted) {
                // The RPC may have succeeded even if its response failed.
                const { data, error: lookupError } = await supabase
                    .from('sale_transactions')
                    .select('status')
                    .eq('id', transactionId)
                    .single();

                if (!lookupError && data?.status === 'completed') {
                    return transactionId;
                }

                if (lookupError) {
                    throw new Error(
                        `Sale #${transactionId}: unable to confirm its status. ` +
                        'Check Sales History before attempting another sale.'
                    );
                }
            } else {
                // Completion was never attempted.
                // Best-effort cleanup of the unused draft.
                const { error: cleanupError } = await supabase
                    .from('sale_transactions')
                    .update({ status: 'cancelled' })
                    .eq('id', transactionId)
                    .eq('status', 'draft');

                if (cleanupError) {
                    console.error(
                        'Draft cleanup failed:',
                        cleanupError.message
                    );
                }
            }
        }

        throw error;
    }
}

export async function checkoutSale(
  checkoutKey: string,
  items: SaleBasketItem[]
): Promise<number> {
  const { data, error } = await supabase.rpc('checkout_sale', {
    p_checkout_key: checkoutKey,
    p_items: items.map((item) => ({
      inventory_item_id: item.inventoryItemId,
      sale_price: item.salePrice,
    })),
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data === null || data === undefined) {
    throw new Error('Checkout did not return a transaction ID.');
  }

  return Number(data);
}


