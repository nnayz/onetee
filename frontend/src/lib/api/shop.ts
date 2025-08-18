import { api } from "./client";

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string;
  gender: "men" | "women";
  price_cents: number;
  currency?: string;
  image_urls: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
}

export const ShopAPI = {
  listProducts: (params?: { gender?: "men" | "women"; tag?: string; limit?: number; offset?: number }) =>
    api.get("/shop/products", { params }).then((r) => r.data),
  getProduct: (id: string) => api.get(`/shop/products/${id}`).then((r) => r.data),
  createTag: (name: string, description?: string) => api.post(`/shop/admin/tags`, { name, description }).then((r) => r.data),
  createProduct: (data: ProductCreate) => api.post("/shop/admin/products", data).then((r) => r.data),
  deleteProduct: (id: string) => api.delete(`/shop/admin/products/${id}`).then((r) => r.data),
  createOrder: (items: { product_id: string; variant_id?: string; quantity: number }[]) =>
    api.post("/shop/orders", { items }).then((r) => r.data),
  startCheckout: (orderId: string) => api.post(`/shop/orders/${orderId}/checkout`).then((r) => r.data as { checkout_url: string }),
  listTags: () => api.get(`/shop/tags`).then((r) => r.data),
};

