import React, { useState, useEffect } from 'react';
import { sweetAPI } from '../services/api';
import SweetCard from '../components/sweet/SweetCard';
import SearchBar from '../components/sweet/SearchBar';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const HomePage = () => {
  const [sweets, setSweets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1) Initial load
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [sweetsRes, categoriesRes] = await Promise.all([
          sweetAPI.getAll(),
          sweetAPI.getCategories()
        ]);
        setSweets(sweetsRes.data.data.sweets);
        setCategories(categoriesRes.data.data.categories);
      } catch (err) {
        console.error(err);
        setError('Failed to load sweets. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Explicit search called by SearchBar form submit
  const handleSearch = async (params) => {
    try {
      setLoading(true);
      setError(null);
      const res = await sweetAPI.search(params);
      setSweets(res.data.data.sweets);
    } catch (err) {
      console.error(err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading sweets..." />;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SearchBar categories={categories} onSearch={handleSearch} />
      {error && <ErrorMessage message={error} onRetry={() => window.location.reload()} />}
      
      {!error && sweets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No sweets found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sweets.map(sweet => (
          <SweetCard key={sweet._id} sweet={sweet} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
