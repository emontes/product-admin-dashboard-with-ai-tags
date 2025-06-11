
import { Product, ProductFormValues } from '../types';

const PRODUCTS_STORAGE_KEY = 'adminDashboardProducts';

const getInitialProducts = (): Product[] => {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Eco-Friendly Water Bottle',
      description: 'Stay hydrated with this stylish and durable eco-friendly water bottle. Made from BPA-free materials.',
      tags: ['eco-friendly', 'reusable', 'water bottle', 'health'],
      price: 24.99,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    },
    {
      id: crypto.randomUUID(),
      name: 'Wireless Noise-Cancelling Headphones',
      description: 'Immerse yourself in sound with these premium wireless headphones featuring active noise cancellation.',
      tags: ['electronics', 'audio', 'headphones', 'wireless', 'travel'],
      price: 199.50,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),  // 1 day ago
    },
    {
      id: crypto.randomUUID(),
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable and sustainable t-shirt made from 100% organic cotton. Soft and breathable.',
      tags: ['apparel', 'organic', 'cotton', 't-shirt', 'sustainable fashion'],
      price: 35.00,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    }
  ];
};

const getAllStoredProducts = (): Product[] => {
  const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (storedProducts) {
    return JSON.parse(storedProducts);
  }
  const initialProducts = getInitialProducts();
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
  return initialProducts;
};

const saveAllProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};

// Simulate API delay
const simulateDelay = <T,>(data: T): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), 500));


export const getProducts = async (): Promise<Product[]> => {
  const products = getAllStoredProducts();
  return simulateDelay(products.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const products = getAllStoredProducts();
  const product = products.find(p => p.id === id);
  return simulateDelay(product);
};

export const addProduct = async (productData: ProductFormValues): Promise<Product> => {
  const products = getAllStoredProducts();
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...productData,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  const updatedProducts = [...products, newProduct];
  saveAllProducts(updatedProducts);
  return simulateDelay(newProduct);
};

export const updateProduct = async (id: string, productUpdateData: ProductFormValues): Promise<Product> => {
  let products = getAllStoredProducts();
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    throw new Error('Product not found');
  }
  const updatedProduct: Product = {
    ...products[productIndex],
    ...productUpdateData,
    price: Number(productUpdateData.price), // Ensure price is number
    updatedAt: new Date().toISOString(),
  };
  products[productIndex] = updatedProduct;
  saveAllProducts(products);
  return simulateDelay(updatedProduct);
};

export const deleteProduct = async (id: string): Promise<void> => {
  let products = getAllStoredProducts();
  const updatedProducts = products.filter(p => p.id !== id);
  if (products.length === updatedProducts.length) {
      // For simulation, if product not found, we don't throw error to mimic some backends
      // but in a real scenario, you might want to.
  }
  saveAllProducts(updatedProducts);
  return simulateDelay(undefined);
};
