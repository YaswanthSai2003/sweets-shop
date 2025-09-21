import React, { useState, useEffect } from 'react';
import { sweetAPI } from '../../services/api';
import { showToast } from '../../utils/helpers';

const SweetForm = ({ sweet, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    image: '🍬'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sweet) {
      setFormData({
        name: sweet.name || '',
        category: sweet.category || '',
        price: sweet.price || '',
        quantity: sweet.quantity || '',
        description: sweet.description || '',
        image: sweet.image || '🍬'
      });
    }
  }, [sweet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than $0';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...formData,
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description.trim()
      };

      if (sweet) {
        await sweetAPI.update(sweet._id, data);
      } else {
        await sweetAPI.create(data);
      }

      onSave();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          (sweet ? 'Failed to update product' : 'Failed to create product');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const emojiOptions = [
    '🍬', '🍭', '🍰', '🧁', '🍪', '🍩', '🍫', '🍦', '🥧', '🍯',
    '🎂', '🍮', '🍡', '🥮', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝'
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {sweet ? 'Update Product' : 'Add New Product'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Chocolate Cupcake"
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Cakes, Cookies, Candies"
              required
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
        </div>

        {/* Price and Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              placeholder="0"
              required
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>
        </div>

        {/* Image Emoji */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Icon
          </label>
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{formData.image}</div>
            <select
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {emojiOptions.map(emoji => (
                <option key={emoji} value={emoji}>
                  {emoji}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Describe this delicious sweet..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (sweet ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SweetForm;
