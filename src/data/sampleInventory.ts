import { InventoryItem } from '../types/inventory';

export const inventoryItems: InventoryItem[] = [
    {
        id: 1,
        product_id: 1,
        size: 'UK10',
        condition: 'DS',
        location: "N02",
        cost: 120,
        asking_price: 160,
        date_added: '2026-10-01',
    },
    {
        id: 2,
        product_id: 1,
        size: 'UK8',
        condition: 'DS',
        location: "N02",
        cost: 130,
        asking_price: 175,
        date_added: '2026-10-01',
    },
    {
        id: 3,
        product_id: 3,
        size: 'UK6',
        condition: 'DS',
        location: "A01",
        cost: 75,
        asking_price: 100,
        date_added: '2026-10-01',
    },
];