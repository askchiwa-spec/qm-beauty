# Database Indexing Strategy

This document outlines the indexing strategy implemented for the QM Beauty application to improve query performance.

## Indexes Added

### User Model
- `@@index([phone])` - For quick user lookups by phone number

### Product Model
- `@@index([featured, status])` - For homepage queries showing featured products
- `@@index([price])` - For price filtering operations

### Cart Model
- `@@index([createdAt])` - For cart cleanup jobs (finding expired carts)

### CartItem Model
- `@@index([cartId, productId])` - For efficient cart item lookups

### Order Model
- `@@index([userId])` - For retrieving user order history

### Payment Model
- `@@index([createdAt])` - For payment history queries

### Booking Model
- `@@index([customerEmail])` - For booking lookups by email

## Migration Command

Run the following command to apply these index changes:

```bash
npx prisma migrate dev --name add-performance-indexes
```

## Performance Benefits

These indexes will improve:
- Query speed for user lookups
- Product filtering and sorting
- Cart management operations
- Order history retrieval
- Payment and booking queries