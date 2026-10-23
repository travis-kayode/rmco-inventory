import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredBasketItem = {
  inventoryItemId: number;
  brand: string;
  name: string;
  size: string;
  salePrice: number;
  cost: number;
};

const BASKET_STORAGE_KEY = '@arrange/sale-basket';

export async function saveBasket(
  items: StoredBasketItem[]
): Promise<void> {
  await AsyncStorage.setItem(
    BASKET_STORAGE_KEY,
    JSON.stringify(items)
  );
}

export async function loadBasket(): Promise<StoredBasketItem[]> {
  const stored = await AsyncStorage.getItem(BASKET_STORAGE_KEY);

  if (stored === null) {
    return [];
  }

  const parsed: unknown = JSON.parse(stored);

  if (!Array.isArray(parsed)) {
    throw new Error('Stored basket data is invalid.');
  }

  const valid = parsed.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.inventoryItemId === 'number' &&
      Number.isSafeInteger(item.inventoryItemId) &&
      item.inventoryItemId > 0 &&
      typeof item.brand === 'string' &&
      typeof item.name === 'string' &&
      typeof item.size === 'string' &&
      typeof item.salePrice === 'number' &&
      Number.isFinite(item.salePrice) &&
      item.salePrice >= 0 &&
      typeof item.cost === 'number' &&
      Number.isFinite(item.cost)
  );

  if (!valid) {
    throw new Error('Stored basket contains invalid items.');
  }

  return parsed as StoredBasketItem[];
}

export async function clearStoredBasket(): Promise<void> {
  await AsyncStorage.removeItem(BASKET_STORAGE_KEY);
}