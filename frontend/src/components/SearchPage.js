import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SearchPage.css';

const SearchPage = () => {
  const [results, setResults] = useState([]); // Store search results
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const location = useLocation(); // React Router hook to get query parameters
  const query = new URLSearchParams(location.search).get('query'); // Extract `query` parameter

  useEffect(() => {
    if (query) {
      fetch(`/api/search?name=${encodeURIComponent(query)}`) // Call backend API
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch search results');
          }
          return response.json();
        })
        .then((data) => {
          setResults(data.data || []); // Set search results
          setLoading(false); // Stop loading
        })
        .catch((err) => {
          setError(err.message); // Set error message
          setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="search-results">
      <h2>Search Results for &quot;{query}&quot;</h2>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <ul>
          {results.map((result) => (
            <li key={result.product_id} className="search-result-item">
              <h3>{result.name}</h3>
              <p>{result.description}</p>
              <p>Price: ${result.price}</p>
              <p>{result.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchPage;
