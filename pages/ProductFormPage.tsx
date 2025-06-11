
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, ProductFormValues } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import TagInput from '../components/TagInput';
import { suggestTags } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface ProductFormPageProps {
  products?: Product[]; // For edit mode
  onSubmit: (idOrData: string | ProductFormValues, data?: ProductFormValues) => Promise<void>;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  tags?: string;
}

const ProductFormPage: React.FC<ProductFormPageProps> = ({ products, onSubmit }) => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!productId;

  const [formData, setFormData] = useState<ProductFormValues>({
    name: '',
    description: '',
    tags: [],
    price: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && products && productId) {
      const productToEdit = products.find(p => p.id === productId);
      if (productToEdit) {
        setFormData({
          name: productToEdit.name,
          description: productToEdit.description,
          tags: productToEdit.tags,
          price: productToEdit.price,
        });
      } else {
        // Product not found, maybe redirect or show error
        navigate('/', {replace: true}); 
      }
    }
  }, [productId, products, isEditMode, navigate]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    else if (formData.name.length > 255) newErrors.name = 'Name cannot exceed 255 characters.';
    
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    else if (formData.description.length > 2000) newErrors.description = 'Description cannot exceed 2000 characters.';

    if (formData.price <= 0) newErrors.price = 'Price must be a positive number.';
    if (isNaN(formData.price)) newErrors.price = 'Price must be a number.';

    // if (formData.tags.length === 0) newErrors.tags = 'At least one tag is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
    if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
     if (errors.tags) {
        setErrors(prev => ({...prev, tags: undefined}));
    }
  };

  const handleSuggestTags = async () => {
    if (!formData.name || !formData.description) {
      setErrors(prev => ({
        ...prev,
        name: !formData.name ? 'Name is needed for suggestions.' : prev.name,
        description: !formData.description ? 'Description is needed for suggestions.' : prev.description
      }));
      return;
    }
    setIsSuggestingTags(true);
    setFormError(null);
    try {
      const suggested = await suggestTags(formData.name, formData.description);
      // Merge with existing tags, avoiding duplicates
      const newTagsSet = new Set([...formData.tags, ...suggested]);
      setFormData(prev => ({ ...prev, tags: Array.from(newTagsSet) }));
    } catch (error) {
      console.error("Failed to suggest tags:", error);
      setFormError(`Failed to suggest tags: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (isEditMode && productId) {
        await onSubmit(productId, formData);
      } else {
        await onSubmit(formData);
      }
      // Navigation is handled by App.tsx after successful submit
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError(`Submission failed: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
    } 
    // setIsLoading(false) will be handled in App or here if navigation fails
  };

  if (isEditMode && !products) return <LoadingSpinner fullPage/>; // Waiting for products prop for edit mode
  if (isEditMode && productId && products && !products.find(p => p.id === productId)) {
      return <div className="text-center p-8 text-red-500">Product not found.</div>;
  }


  return (
    <div className="container mx-auto max-w-2xl">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
          {isEditMode ? 'Edit Product' : 'Create New Product'}
        </h1>
        {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Product Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            maxLength={255}
            required
          />
          <Textarea
            label="Product Description"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            maxLength={2000}
            required
          />
          <Input
            label="Price"
            id="price"
            name="price"
            type="number"
            value={formData.price.toString()} // Input type number expects string value
            onChange={handleChange}
            error={errors.price}
            min="0.01"
            step="0.01"
            required
          />
          <div>
            <TagInput
              tags={formData.tags}
              setTags={handleTagsChange}
              label="Tags"
              id="tags"
              error={errors.tags}
            />
            <Button 
              type="button" 
              onClick={handleSuggestTags} 
              variant="ghost" 
              size="sm"
              isLoading={isSuggestingTags}
              className="mt-1 text-sm"
              disabled={isSuggestingTags || !formData.name || !formData.description}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17.437 14.846a4.5 4.5 0 01-3.09 3.09L11.5 18.75l.813-2.846a4.5 4.5 0 013.09-3.09L18.25 12z" />
              </svg>
              {isSuggestingTags ? 'Suggesting...' : 'Auto-Suggest Tags (AI)'}
            </Button>
             {isSuggestingTags && <span className="ml-2 text-xs text-gray-500">AI is thinking...</span>}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-8">
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isEditMode ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormPage;
