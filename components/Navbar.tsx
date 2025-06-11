
import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  return (
    <nav className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold hover:text-primary-200 transition-colors">
              Product Admin
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Products
            </Link>
            <Link 
              to="/products/new" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Add Product
            </Link>
            <Button onClick={onLogout} variant="secondary" size="sm" className="bg-primary-500 hover:bg-primary-400 text-white">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
