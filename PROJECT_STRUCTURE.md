# Project Structure

```text
codex-ecomm/
|-- backend/
|   |-- .env.example
|   |-- API_STRUCTURE.md
|   |-- package.json
|   `-- src/
|       |-- app.js
|       |-- server.js
|       |-- config/
|       |   |-- db.js
|       |   `-- env.js
|       |-- constants/
|       |   `-- index.js
|       |-- controllers/
|       |   |-- adminController.js
|       |   |-- authController.js
|       |   |-- cartController.js
|       |   |-- categoryController.js
|       |   |-- orderController.js
|       |   |-- paymentController.js
|       |   |-- productController.js
|       |   |-- userController.js
|       |   `-- wishlistController.js
|       |-- data/
|       |   `-- seed.js
|       |-- middleware/
|       |   |-- authMiddleware.js
|       |   |-- errorMiddleware.js
|       |   `-- notFoundMiddleware.js
|       |-- models/
|       |   |-- Category.js
|       |   |-- Order.js
|       |   |-- Product.js
|       |   `-- User.js
|       |-- routes/
|       |   |-- adminRoutes.js
|       |   |-- authRoutes.js
|       |   |-- cartRoutes.js
|       |   |-- categoryRoutes.js
|       |   |-- index.js
|       |   |-- orderRoutes.js
|       |   |-- paymentRoutes.js
|       |   |-- productRoutes.js
|       |   |-- userRoutes.js
|       |   `-- wishlistRoutes.js
|       |-- services/
|       |   `-- tokenService.js
|       |-- utils/
|       |   |-- apiResponse.js
|       |   `-- generateSlug.js
|       `-- validators/
|           |-- authValidator.js
|           `-- productValidator.js
|-- frontend/
|   |-- .env.local.example
|   |-- eslint.config.mjs
|   |-- jsconfig.json
|   |-- next.config.mjs
|   |-- package.json
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   `-- src/
|       |-- app/
|       |   |-- admin/
|       |   |   |-- categories/page.js
|       |   |   |-- orders/page.js
|       |   |   |-- products/page.js
|       |   |   |-- users/page.js
|       |   |   |-- layout.js
|       |   |   `-- page.js
|       |   |-- (store)/
|       |   |   |-- about/page.js
|       |   |   |-- account/layout.js
|       |   |   |-- account/orders/page.js
|       |   |   |-- cart/page.js
|       |   |   |-- categories/[slug]/page.js
|       |   |   |-- checkout/layout.js
|       |   |   |-- checkout/page.js
|       |   |   |-- contact/page.js
|       |   |   |-- login/page.js
|       |   |   |-- products/[slug]/page.js
|       |   |   |-- products/page.js
|       |   |   |-- register/page.js
|       |   |   |-- wishlist/layout.js
|       |   |   |-- wishlist/page.js
|       |   |   `-- layout.js
|       |   |-- globals.css
|       |   |-- layout.js
|       |   |-- loading.js
|       |   |-- not-found.js
|       |   `-- page.js
|       |-- components/
|       |   |-- admin/AdminSidebar.jsx
|       |   |-- forms/AuthForm.jsx
|       |   |-- home/
|       |   |-- layout/
|       |   |-- product/
|       |   `-- shared/
|       |-- context/
|       |   `-- AuthContext.jsx
|       |-- hooks/
|       |   |-- useAppDispatch.js
|       |   `-- useAppSelector.js
|       |-- lib/
|       |   |-- auth.js
|       |   |-- axios.js
|       |   |-- mock-data.js
|       |   `-- utils.js
|       |-- providers/
|       |   `-- AppProviders.jsx
|       |-- proxy.js
|       `-- store/
|           |-- api/baseApi.js
|           |-- index.js
|           `-- slices/
|               |-- authSlice.js
|               |-- cartSlice.js
|               `-- wishlistSlice.js
|-- .gitignore
|-- package.json
|-- PROJECT_STRUCTURE.md
`-- README.md
```
