
import React, {
  createContext,
  useContext,
  useState,
} from 'react';

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
};

const SaleBasketContext =
  createContext<SaleBasketContextType | undefined>(undefined);

export function SaleBasketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<BasketItem[]>([]);

  const addItem = (item: BasketItem) => {
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
    if (!Number.isFinite(price) || price < 0) return;

    setItems((current) =>
      current.map((item) =>
        item.inventoryItemId === inventoryItemId
          ? { ...item, salePrice: price }
          : item
      )
    );
  };

  const clearBasket = () => setItems([]);

  return (
    <SaleBasketContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updatePrice,
        clearBasket,
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
