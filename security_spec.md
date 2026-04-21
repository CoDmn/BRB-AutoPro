# Security Spec for BRB Auto Pro

## Data Invariants
1. A regular user (anonymous or signed-in customer) can only CREATE requests (`contactRequests`, `importRequests`, `estimationRequests`) but cannot read, update, or list them.
2. Only `admins` can read, update, list, and delete requests.
3. Only `admins` can create, update, and delete `inventory` items and `detailingGalleries`.
4. Anyone can read (`list`, `get`) `inventory` items and `detailingGalleries`.
5. Only `admins` can read/write the `admins` collection. Admin role is assigned via the database.
6. Timestamps (`createdAt`, `updatedAt`) must always correctly reflect `request.time`.

## The "Dirty Dozen" Payloads
1. **Request Spoofing:** A non-admin trying to read all `contactRequests`.
2. **Ghost Field Injection:** Adding an `isResolved: true` field when creating a `contactRequest`.
3. **Admin Privilege Escalation:** Attempting to create a document in `admins` to self-assign admin rights.
4. **Inventory Tampering:** A standard user attempting to update the `price` of an `inventory` item.
5. **Denial of Wallet:** Injecting a 2MB string into `inventory.name` during an admin update.
6. **Data Leakage:** Unauthenticated users trying to fetch a specific `contactRequest` ID.
7. **Temporal Bypass:** An admin attempting to set `createdAt` in an `inventory` to a past date.
8. **Schema Validation Bypass:** Creating an `importRequest` without the mandatory `brand` field.
9. **Role Modification Bypass:** Non-admin trying to delete an `admins` record.
10. **Type Poisoning:** An admin sending a boolean instead of a string for `inventory.price`.
11. **Gallery Tampering:** Modifying an existing `detailingGallery` without being an admin.
12. **Id Poisoning:** Trying to access a collection using extremely long (> 128 chars) random alphanumeric IDs instead of valid IDs.

## The Test Runner
A `firestore.rules.test.ts` will verify these payloads return `PERMISSION_DENIED`.
