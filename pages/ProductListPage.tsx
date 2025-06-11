
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

interface ProductListPageProps {
  products: Product[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const ProductListPage: React.FC<ProductListPageProps> = ({ products, isLoading, onDelete, onRefresh }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      setIsDeleting(true);
      await onDelete(productToDelete.id);
      setIsDeleting(false);
      closeDeleteModal();
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading && products.length === 0) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <div className="flex items-center space-x-2">
            <Button onClick={onRefresh} variant="secondary" size="md" className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </Button>
            <Link to="/products/new">
            <Button variant="primary" size="md" className="flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                 </svg>
                Add Product
            </Button>
            </Link>
        </div>
      </div>
      
      <div className="mb-4">
        <input 
          type="text"
          placeholder="Search by name or tag..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && products.length > 0 && <div className="text-center py-4"><LoadingSpinner /></div>}
      
      {!isLoading && filteredProducts.length === 0 ? (
         <div className="text-center py-10 bg-white rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
           <p className="text-gray-500 text-xl">
             {products.length === 0 ? "No products yet." : "No products match your search."}
           </p>
           {products.length === 0 && (
             <Link to="/products/new" className="mt-4 inline-block">
               <Button variant="primary">Add your first Product</Button>
             </Link>
           )}
         </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal max-w-xs">
                    <div className="text-sm text-gray-500 truncate_description">{product.description.length > 100 ? product.description.substring(0,100) + '...' : product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal max-w-sm">
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link to={`/products/edit/${product.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-800">Edit</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" onClick={() => openDeleteModal(product)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {productToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          title="Delete Product"
          onConfirm={handleDeleteConfirm}
          confirmText="Delete"
          confirmVariant="danger"
          isConfirmLoading={isDeleting}
        >
          <p>Are you sure you want to delete the product "<strong>{productToDelete.name}</strong>"? This action cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
};

export default ProductListPage;
