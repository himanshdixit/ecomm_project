# Backend API Structure

Base URL: `/api/v1`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me` (`protected`)

## Products
- `GET /products`
- `GET /products/:slug`
- `POST /products` (`admin`)
- `PUT /products/:id` (`admin`)
- `DELETE /products/:id` (`admin`)

## Categories
- `GET /categories`
- `POST /categories` (`admin`)
- `PUT /categories/:id` (`admin`)
- `DELETE /categories/:id` (`admin`)

## Cart
- `GET /cart` (`protected`)
- `POST /cart` (`protected`)
- `PATCH /cart/:itemId` (`protected`)
- `DELETE /cart/:itemId` (`protected`)

## Wishlist
- `GET /wishlist` (`protected`)
- `POST /wishlist/toggle` (`protected`)

## Orders
- `GET /orders/my-orders` (`protected`)
- `GET /orders` (`admin`)
- `POST /orders` (`protected`)
- `PATCH /orders/:id/status` (`admin`)

## Payments
- `POST /payments/create-intent` (`protected`)

## Users
- `GET /users` (`admin`)
- `GET /users/:id` (`admin`)
- `PATCH /users/:id/role` (`admin`)

## Admin
- `GET /admin/dashboard` (`admin`)
