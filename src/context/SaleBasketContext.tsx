import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import { Alert } from 'react-native';

import {
    loadPendingCheckout,
    type PendingCheckout,
} from '../services/checkoutStorage';

import {
    loadBasket,
    saveBasket,
} from '../services/basketStorage';

import { supabase } from '../lib/supabase';

type BasketItem = {
    inventoryItemId: number;
    brand: string;
    name: string;
    size: string;
    salePrice: number;
    cost: number;
};

type SaleBasketContextType = {
    items: BasketItem[];
    addItem: (item: BasketItem) => void;
    removeItem: (inventoryItemId: number) => void;
    updatePrice: (inventoryItemId: number, price: number) => void;
    clearBasket: () => void;
    finishSuccessfulCheckout: () => Promise<void>;

    pendingCheckout: PendingCheckout | null;
    setPendingCheckout: (checkout: PendingCheckout | null) => void;
    checkoutRecoveryLoading: boolean;
    checkoutRecoveryError: string | null;
};

const SaleBasketContext =
    createContext<SaleBasketContextType | undefined>(undefined);



export function SaleBasketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [items, setItems] = useState<BasketItem[]>([]);
    const basketSaveQueue = useRef<Promise<void>>(Promise.resolve());

    const [basketLoading, setBasketLoading] = useState(true);
    const [basketStorageError, setBasketStorageError] =
        useState<string | null>(null);

    const [pendingCheckout, setPendingCheckoutState] =
        useState<PendingCheckout | null>(null);

    const [checkoutRecoveryLoading, setCheckoutRecoveryLoading] =
        useState(true);

    const [checkoutRecoveryError, setCheckoutRecoveryError] =
        useState<string | null>(null);

    const checkoutLocked =
        basketLoading ||
        basketStorageError !== null ||
        checkoutRecoveryLoading ||
        checkoutRecoveryError !== null ||
        pendingCheckout !== null;




    useEffect(() => {
        let active = true;

        const recoverCheckout = async () => {


            try {
                const savedCheckout = await loadPendingCheckout();



                if (active) {
                    setPendingCheckoutState(savedCheckout);
                }
            } catch (error) {
                if (active) {
                    setCheckoutRecoveryError(
                        error instanceof Error
                            ? error.message
                            : 'Unable to recover pending checkout.'
                    );
                }
            } finally {
                if (active) {
                    setCheckoutRecoveryLoading(false);
                }
            }
        };

        recoverCheckout();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const restoreBasket = async () => {
            try {
                const savedItems = await loadBasket();

                if (savedItems.length === 0) {
                    if (active) setItems([]);
                    return;
                }

                const itemIds = savedItems.map(
                    (item) => item.inventoryItemId
                );

                const { data, error } = await supabase
                    .from('inventory_items')
                    .select('id, sales(id), sale_items(id)')
                    .in('id', itemIds);

                if (error) {
                    throw new Error(
                        `Unable to verify saved basket: ${error.message}`
                    );
                }

                const availableIds = new Set(
                    (data ?? [])
                        .filter(
                            (item) =>
                                (!item.sales || item.sales.length === 0) &&
                                (!item.sale_items || item.sale_items.length === 0)
                        )
                        .map((item) => item.id)
                );

                const validItems = savedItems.filter(
                    (item) => availableIds.has(item.inventoryItemId)
                );

                if (active) {
                    setItems(validItems);

                    if (validItems.length < savedItems.length) {
                        Alert.alert(
                            'Basket updated',
                            'Some items were removed because they are no longer available.'
                        );
                    }
                }
            } catch (error) {
                if (active) {
                    setBasketStorageError(
                        error instanceof Error
                            ? error.message
                            : 'Unable to restore saved basket.'
                    );
                }
            } finally {
                if (active) {
                    setBasketLoading(false);
                }
            }
        };

        restoreBasket();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (basketLoading || basketStorageError !== null) {
            return;
        }

        basketSaveQueue.current = basketSaveQueue.current
            .catch(() => {
                // Allow subsequent writes after a failed operation.
            })
            .then(() => saveBasket(items));

        void basketSaveQueue.current.catch((error) => {
            setBasketStorageError(
                error instanceof Error
                    ? error.message
                    : 'Unable to save basket.'
            );
        });
    }, [items, basketLoading, basketStorageError]);

    const updatePendingCheckout = (checkout: PendingCheckout | null) => {
        setPendingCheckoutState(checkout);
    };
    const addItem = async (item: BasketItem) => {
        if (checkoutLocked) {
            console.log('ADD BLOCKED: Basket is locked');
            return;
        }

        // Check whether the item has already been sold.
        const { data, error } = await supabase
            .from('inventory_items')
            .select('id, sales(id), sale_items(id)')
            .eq('id', item.inventoryItemId)
            .maybeSingle();

        if (error || !data) {
            Alert.alert(
                'Unable to add item',
                'Could not verify whether this item is available.'
            );
            return;
        }

        const soldInLegacySales =
            data.sales !== null &&
            (!Array.isArray(data.sales) || data.sales.length > 0);

        const soldInNewSales =
            data.sale_items !== null &&
            (!Array.isArray(data.sale_items) || data.sale_items.length > 0);

        if (soldInLegacySales || soldInNewSales) {
            Alert.alert(
                'Item already sold',
                'This item has already been sold and cannot be added to the basket.'
            );
            return;
        }

        setItems((current) => {
            const alreadyAdded = current.some(
                (existing) =>
                    existing.inventoryItemId === item.inventoryItemId
            );

            if (alreadyAdded) return current;

            return [...current, item];
        });
    };

    const removeItem = (inventoryItemId: number) => {
        if (checkoutLocked) return;

        setItems((current) =>
            current.filter(
                (item) => item.inventoryItemId !== inventoryItemId
            )
        );
    };

    const updatePrice = (
        inventoryItemId: number,
        price: number
    ) => {
        if (checkoutLocked) return;
        if (!Number.isFinite(price) || price < 0) return;

        setItems((current) =>
            current.map((item) =>
                item.inventoryItemId === inventoryItemId
                    ? { ...item, salePrice: price }
                    : item
            )
        );
    };

    const clearBasket = () => {
        if (checkoutLocked) return;
        setItems([]);
    };

    // Only call after confirmed checkout and storage cleanup.
    const finishSuccessfulCheckout = async () => {
        // Wait for any earlier basket saves to finish.
        await basketSaveQueue.current;

        // Clear the stored basket before unlocking checkout.
        await saveBasket([]);

        setItems([]);
        setPendingCheckoutState(null);
    };

    return (
        <SaleBasketContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updatePrice,
                clearBasket,
                finishSuccessfulCheckout,
                pendingCheckout,
                setPendingCheckout: updatePendingCheckout,
                checkoutRecoveryLoading,
                checkoutRecoveryError,
            }}
        >
            {children}
        </SaleBasketContext.Provider>
    );
}

export function useSaleBasket() {
    const context = useContext(SaleBasketContext);

    if (!context) {
        throw new Error(
            'useSaleBasket must be used within SaleBasketProvider'
        );
    }

    return context;
}
