import React, { useState } from 'react';

function SearchBox({ onSearch }) {
  const [city, setCity] = useState('');

  const handleSearch = () => {
    onSearch(city);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-box">
      <i className="fa-solid fa-location-dot"></i>
      <input
        type="text"
        placeholder="Search for a city..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleSearch} aria-label="Search">
        <i className="fa-solid fa-magnifying-glass"></i>
      </button>
    </div>
  );
}

export default SearchBox;
