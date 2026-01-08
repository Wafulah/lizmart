# API Runtime Optimization - Node.js Migration

## Overview
All API routes have been migrated from the default Edge runtime to the Node.js (Serverless) runtime to optimize costs and performance for database-heavy operations.

## What Changed

### Runtime Declaration Added
Added `export const runtime = 'nodejs';` to the following API routes:

**Revalidation:**
- `app/api/revalidate/route.ts`

**Authentication:**
- `app/api/auth/[...nextauth]/route.ts` (already had it)

**Products API:**
- `app/api/admin/products/route.ts`
- `app/api/admin/products/[productId]/route.ts`

**Collections API:**
- `app/api/admin/collections/route.ts`
- `app/api/admin/collections/[collectionId]/route.ts`
- `app/api/admin/collections/[collectionId]/products/route.ts`

**Orders API:**
- `app/api/admin/orders/route.ts`
- `app/api/admin/orders/[orderId]/route.ts`
- `app/api/admin/orders/[orderId]/payments/route.ts`
- `app/api/admin/orders/[orderId]/shipments/route.ts`
- `app/api/admin/orders-list/route.ts`

**Carts API:**
- `app/api/admin/carts/route.ts`
- `app/api/admin/carts/[cartId]/route.ts`
- `app/api/admin/carts/[cartId]/items/route.ts`
- `app/api/admin/carts/[cartId]/items/[itemId]/route.ts`

**Addresses API:**
- `app/api/admin/addresses/route.ts`
- `app/api/admin/addresses/[addressId]/route.ts`

**Pages API:**
- `app/api/admin/pages/route.ts`
- `app/api/admin/pages/[pageId]/route.ts`

**SEO API:**
- `app/api/admin/seo/route.ts`
- `app/api/admin/seo/[seoId]/route.ts`

**Health Topics API:**
- `app/api/admin/health-topics/route.ts`
- `app/api/admin/health-topics/[id]/route.ts`

**Menu API:**
- `app/api/admin/menu/route.ts`
- `app/api/admin/menu/[menuId]/route.ts`

**Checkout API:**
- `app/api/admin/checkout/cart/[cartId]/route.ts`

**Webhooks:**
- `app/api/admin/mpesa-webhook/route.ts`

**Metrics & Analytics:**
- `app/api/admin/metrics/cart-vs-orders/route.ts`

**Users API:**
- `app/api/admin/users/[id]/route.ts`

## Benefits

### 1. **Reduced Cost**
- Node.js functions generally cost less per compute for heavy database workloads
- Fewer unnecessary edge invocations and CPU billing

### 2. **Better Performance**
- Full support for Node.js APIs and database drivers (Prisma)
- No compatibility issues with native modules
- Longer execution time allowed for complex database queries
- Better handling of heavy business logic

### 3. **Eliminated Edge Runtime Limitations**
- Full filesystem access
- Support for all npm packages
- Proper database connection pooling
- No size constraints specific to edge functions

### 4. **Reduced Vercel Metrics Overages**
This change directly addresses the following Vercel usage overages:
- **Fast Origin Transfer**: 53.07 GB / 10 GB ✅ Will decrease with fewer edge invocations
- **Fluid Active CPU**: 11h 38m / 4h ✅ Node.js more efficient for DB operations
- **Function Invocations**: 1.3M / 1M ✅ Fewer edge dispatches
- **Edge Requests**: 902K / 1M ✅ Requests routed through regional Node.js instead

## Middleware Note

**Middleware** (`middleware.ts`) continues to use the Edge runtime as designed. This is appropriate for:
- Authentication checks
- Redirects
- Header manipulation
- Request routing

Middleware does NOT handle database operations, so it remains optimal at the edge.

## Next Steps

1. Deploy changes to production
2. Monitor Vercel metrics dashboard for:
   - Decreased Fast Origin Transfer
   - Reduced Fluid Active CPU usage
   - Lower overall costs
3. Verify API performance is stable or improved
4. Check error logs for any compatibility issues (unlikely, but good to verify)

## Technical Details

The Node.js runtime (also called Serverless runtime) runs in Vercel's regional data centers rather than globally at edge locations. For ecommerce operations involving:
- Database queries (Prisma)
- Complex calculations
- Payment processing (M-Pesa webhooks)
- Inventory management

The regional Node.js runtime is more appropriate and cost-effective than the Edge runtime, despite slightly higher latency versus pure edge execution (which is offset by database round-trip times being the bottleneck anyway).

## References

- [Next.js Runtime Documentation](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-node-runtimes)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Pricing & Metrics](https://vercel.com/pricing)
