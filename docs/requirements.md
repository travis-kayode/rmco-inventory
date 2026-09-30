# Arrange — Requirements

## 1. Project Overview

Arrange is a mobile inventory and sales management application being developed for a real-world reselling business.

The business currently uses a Google Sheets inventory system to organise and track stock. Although the spreadsheet solves the immediate problem, managing inventory through a spreadsheet on a mobile phone is inconvenient, particularly when adding stock, searching for products, locating items, and recording sales.

Arrange aims to provide a mobile-first interface designed specifically around these workflows while managing the underlying inventory and sales data automatically.

---

## 2. Primary User

The initial user of Arrange is the owner of a clothing and footwear reselling business who manages a large amount of physical inventory.

The application will initially be designed around the workflow of this business while keeping the system flexible enough to be expanded in the future.

---

## 3. Functional Requirements

### FR01 — Add Inventory

The user must be able to add newly received inventory.

The user should be able to record information including:

* Brand
* Product name
* Colourway
* Size
* Condition
* Storage location
* Purchase cost
* Date added

### FR02 — Search Inventory

The user must be able to quickly search active inventory by product name or brand.

### FR03 — View Product Information

The user must be able to select a product and view relevant inventory information, including:

* Available sizes
* Quantity available
* Condition
* Storage location
* Purchase cost
* Selling price

### FR04 — Record a Sale

The user must be able to find an inventory item and mark it as sold.

When recording a sale, the user must be able to provide:

* Sale price
* Date sold

### FR05 — Calculate Profit

The system must automatically calculate the profit made on a sale using the item's purchase cost and sale price.

### FR06 — Maintain Sales History

When an item is sold, it should no longer appear as active inventory.

The item's information and associated sale must remain available in the system as part of the business's sales history.

### FR07 — Sale Confirmation

After successfully recording a sale, the application should provide clear confirmation that the transaction has been recorded.

### FR08 — Monthly Performance

The user must be able to view monthly business performance.

Initial metrics should include:

* Revenue
* Cost of goods sold
* Profit
* Number of items sold

### FR09 — Performance Comparison

The user should be able to compare business performance between different months.

### FR10 — Mobile-First Interface

The application must be designed primarily for use on an iPhone.

Common operations such as adding stock, searching inventory, locating an item, and recording a sale should require minimal navigation and data entry.

---

## 4. Future Requirements

The following features are outside the initial MVP but may be implemented in later versions.

### FR11 — Product Scanning

The user should eventually be able to use the phone's camera to scan a barcode or QR code to assist with adding, identifying, or locating inventory.

Additional future requirements will be added as the application is tested in the real business environment.

---

## 5. User Stories

### Inventory Management

As an inventory manager, I want to quickly add newly received stock so that the inventory remains accurate.

As an inventory manager, I want to search for a product so that I can quickly determine whether it is currently in stock.

As an inventory manager, I want to see the available sizes, quantities, conditions, and storage locations for a product so that I can find physical stock quickly.

### Sales

As an inventory manager, I want to record an item as sold so that active inventory remains accurate.

As an inventory manager, I want to record the price and date of a sale so that sales performance can be tracked.

As an inventory manager, I want to receive confirmation after recording a sale so that I know the transaction was successfully saved.

### Business Performance

As a business owner, I want to see revenue, costs, profit, and the number of items sold each month so that I can understand business performance.

As a business owner, I want to compare monthly performance so that I can see how the business is performing over time.

---

## 6. MVP Scope

The first usable version of Arrange will focus on four core workflows:

1. Adding inventory
2. Searching and viewing active inventory
3. Recording sales
4. Viewing monthly performance

Features such as barcode scanning, advanced analytics, and other workflow improvements will be considered after the core inventory and sales system is working reliably.

