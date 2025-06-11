
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import ProductFormPage from './pages/ProductFormPage';
import Navbar from './components/Navbar';
import { Product, AuthState } from './types';
import { getProducts, addProduct as apiAddProduct, updateProduct as apiUpdateProduct, deleteProduct as apiDeleteProduct } from './services/productService';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, token: null });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuth({ isAuthenticated: true, token });
    } else {
      setAuth({ isAuthenticated: false, token: null });
      if (location.pathname !== '/login') {
         // No navigate inside useEffect that has no dependency on navigate
         // navigate('/login', { replace: true });
      }
    }
  }, [location.pathname]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError('Failed to fetch products.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchProducts();
    } else {
      setProducts([]); // Clear products if not authenticated
    }
  }, [auth.isAuthenticated, fetchProducts]);

  const handleLogin = (token: string) => {
    localStorage.setItem('authToken', token);
    setAuth({ isAuthenticated: true, token });
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuth({ isAuthenticated: false, token: null });
    navigate('/login', { replace: true });
  };

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = await apiAddProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      navigate('/', { replace: true });
    } catch (err) {
      setError('Failed to add product.');
      console.error(err);
      throw err; // Re-throw to inform the form
    }
  };

  const handleUpdateProduct = async (id: string, productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedProduct = await apiUpdateProduct(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      navigate('/', { replace: true });
    } catch (err) {
      setError('Failed to update product.');
      console.error(err);
      throw err; // Re-throw to inform the form
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await apiDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete product.');
      console.error(err);
    }
  };

  if (location.pathname !== '/login' && !auth.isAuthenticated && !localStorage.getItem('authToken')) {
    return <Navigate to="/login" replace />;
  }
  
  if (location.pathname === '/login' && auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {auth.isAuthenticated && <Navbar onLogout={handleLogout} />}
      <main className={`flex-grow ${auth.isAuthenticated ? 'p-4 md:p-8' : ''}`}>
        {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>}
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route 
            path="/" 
            element={
              auth.isAuthenticated ? (
                <ProductListPage 
                  products={products} 
                  isLoading={isLoading} 
                  onDelete={handleDeleteProduct}
                  onRefresh={fetchProducts}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/products/new" 
            element={
              auth.isAuthenticated ? (
                <ProductFormPage onSubmit={handleAddProduct} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/products/edit/:id" 
            element={
              auth.isAuthenticated ? (
                <ProductFormPage 
                  products={products} 
                  onSubmit={handleUpdateProduct} 
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
           <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
