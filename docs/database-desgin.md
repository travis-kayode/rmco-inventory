# Arrange — Database Design

## 1. Overview

Arrange uses a relational database to manage products, individual inventory items, and sales.

The database is designed around the physical inventory of the business. Each physical item is tracked individually rather than storing a single product with a quantity.

The initial database contains three main entities:

* Products
* Inventory Items
* Sales

---

## 2. Products

The `products` table stores information that describes a product generally.

### Fields

| Field       | Description                       |
| ----------- | --------------------------------- |
| `id`        | Unique identifier for the product |
| `brand`     | Product brand                     |
| `name`      | Product name/model                |
| `colourway` | Product colourway                 |

### Example

| id | brand | name       | colourway |
| -- | ----- | ---------- | --------- |
| 12 | Nike  | Air Max 95 | Neon      |

A product does not represent a physical item currently owned by the business. It represents the general product that inventory items can belong to.

---

## 3. Inventory Items

The `inventory_items` table represents individual physical items owned by the business.

Each physical item receives its own record even when multiple identical products are in stock.

### Fields

| Field          | Description                              |
| -------------- | ---------------------------------------- |
| `id`           | Unique identifier for the inventory item |
| `product_id`   | References the related product           |
| `size`         | Size of the physical item                |
| `condition`    | Condition of the item                    |
| `location`     | Physical storage location                |
| `cost`         | Amount paid for this specific item       |
| `asking_price` | Current intended selling price           |
| `date_added`   | Date the item entered inventory          |

### Example

Several physical items can reference the same product:

| id  | product_id | size | condition | location | cost | asking_price |
| --- | ---------- | ---- | --------- | -------- | ---- | ------------ |
| 001 | 12         | UK 8 | DS        | A01      | £110 | £180         |
| 002 | 12         | UK 8 | DS        | A04      | £95  | £170         |
| 003 | 12         | UK 9 | Used      | B02      | £80  | £150         |

Although these items belong to the same product, they are stored separately because individual items can have different purchase costs, conditions, storage locations and asking prices.

This also allows individual physical items to be identified or scanned in future versions of Arrange.

---

## 4. Sales

The `sales` table represents completed sales.

A sale is stored separately from the inventory item because a sale is an event involving an inventory item rather than a property of the product itself.

### Fields

| Field               | Description                                 |
| ------------------- | ------------------------------------------- |
| `id`                | Unique identifier for the sale              |
| `inventory_item_id` | References the inventory item that was sold |
| `sale_price`        | Actual price the item sold for              |
| `sold_date`         | Date the sale occurred                      |

### Example

| id  | inventory_item_id | sale_price | sold_date  |
| --- | ----------------- | ---------- | ---------- |
| 501 | 001               | £165       | 2026-09-30 |

The item's purchase cost remains stored against the inventory item while the actual selling price is stored against the sale.

This allows profit to be calculated from the two related records.

---

## 5. Relationships

The initial relationships are:

```text
PRODUCTS
    |
    | 1 : many
    v
INVENTORY_ITEMS
    |
    | 1 : 0..1
    v
SALES
```

One product can have many physical inventory items.

Each inventory item belongs to one product.

An inventory item can have zero or one sale.

Each sale belongs to one inventory item.

---

## 6. Inventory Availability

The initial design does not store `IN_STOCK` or `SOLD` as a separate status field.

Instead, availability is derived from whether a sale exists for an inventory item.

```text
No sale exists -> IN STOCK
Sale exists    -> SOLD
```

This avoids storing the same information in two places.

For example, storing both a `SOLD` status and a separate sale record could allow inconsistent states such as:

```text
status = SOLD, but no sale exists
```

or:

```text
status = IN_STOCK, but a sale exists
```

Using the sale record as the source of truth prevents this inconsistency.

Additional states such as reserved, damaged, lost or returned may require the inventory state model to be extended in the future.

---

## 7. Individual Items vs Quantity

Arrange stores each physical item individually rather than storing a quantity against a product.

For example, five identical pairs of shoes are represented by five inventory item records rather than:

```text
Air Max 95 | UK 8 | Quantity: 5
```

This decision was made because identical products may still have different:

* Purchase costs
* Storage locations
* Conditions
* Asking prices
* Sale prices

Individual records also provide a foundation for assigning unique stock identifiers and supporting barcode or QR scanning in future versions.

The application can still group these records when displaying inventory.

For example, multiple individual records could be presented to the user as:

```text
Nike Air Max 95 — Neon

UK 7    x2
UK 8    x5
UK 9    x3
```

This allows the user interface to remain simple while the database maintains accurate item-level information.

---

## 8. Asking Price vs Sale Price

`asking_price` belongs to an individual inventory item because two physical units of the same product may be listed at different prices.

The actual price received when the item is sold is stored separately as `sale_price` in the `sales` table.

For example:

```text
Purchase cost: £110
Asking price:  £180
Sale price:    £165
```

This preserves the distinction between the intended selling price and the final transaction price.

---

## 9. Future Considerations

The database design may evolve as Arrange is tested with the real business workflow.

Possible future additions include:

* Unique scannable stock codes
* Product images
* Barcode information
* Selling platform
* Platform fees
* Payment method
* Reservations
* Returns
* Multiple users
* Multiple storage locations

These features are intentionally excluded from the initial schema until they are required.

