
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKOUT_STORAGE_KEY = '@arrange/pending-checkout';

export type PendingCheckoutItem = {
  inventoryItemId: number;
  salePrice: number;
};

export type PendingCheckout = {
  key: string;
  items: PendingCheckoutItem[];
};

export async function savePendingCheckout(
  checkout: PendingCheckout
): Promise<void> {
  await AsyncStorage.setItem(
    CHECKOUT_STORAGE_KEY,
    JSON.stringify(checkout)
  );
}

export async function loadPendingCheckout(): Promise<PendingCheckout | null> {
  const stored = await AsyncStorage.getItem(CHECKOUT_STORAGE_KEY);

  if (stored === null) {
    return null;
  }

  const parsed: unknown = JSON.parse(stored);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('key' in parsed) ||
    typeof parsed.key !== 'string' ||
    !('items' in parsed) ||
    !Array.isArray(parsed.items) ||
    parsed.items.length === 0
  ) {
    throw new Error('Stored checkout data is invalid.');
  }

  const validItems = parsed.items.every(
    (item: unknown) =>
      typeof item === 'object' &&
      item !== null &&
      'inventoryItemId' in item &&
      typeof item.inventoryItemId === 'number' &&
      Number.isSafeInteger(item.inventoryItemId) &&
      item.inventoryItemId > 0 &&
      'salePrice' in item &&
      typeof item.salePrice === 'number' &&
      Number.isFinite(item.salePrice) &&
      item.salePrice >= 0
  );

  if (!validItems) {
    throw new Error('Stored checkout contains invalid items.');
  }

  return parsed as PendingCheckout;
}

export async function clearPendingCheckout(): Promise<void> {
    await AsyncStorage.removeItem(CHECKOUT_STORAGE_KEY);
}