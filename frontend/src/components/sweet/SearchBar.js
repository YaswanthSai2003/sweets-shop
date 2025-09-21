import React, { useState } from 'react';

const SearchBar = ({ categories, onSearch }) => {
  const [params, setParams] = useState({
    name: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (field, value) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '')
    );
    onSearch(filtered);
  };

  const handleClear = () => {
    setParams({ name: '', category: '', minPrice: '', maxPrice: '' });
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit} className="card mb-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="form-label">Name</label>
          <input
            type="text"
            value={params.name}
            onChange={e => handleChange('name', e.target.value)}
            className="form-input"
            placeholder="Search name"
          />
        </div>
        <div>
          <label className="form-label">Category</label>
          <select
            value={params.category}
            onChange={e => handleChange('category', e.target.value)}
            className="form-input"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Min Price</label>
          <input
            type="number"
            value={params.minPrice}
            onChange={e => handleChange('minPrice', e.target.value)}
            className="form-input"
            placeholder="0.00"
            step="0.01"
          />
        </div>
        <div>
          <label className="form-label">Max Price</label>
          <input
            type="number"
            value={params.maxPrice}
            onChange={e => handleChange('maxPrice', e.target.value)}
            className="form-input"
            placeholder="999.99"
            step="0.01"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button type="button" onClick={handleClear} className="btn btn-secondary">
          Clear Filters
        </button>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
