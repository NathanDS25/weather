import React from 'react';

function ErrorMessage({ message }) {
  return (
    <div className="not-found">
      <img
        src="https://cdn-icons-png.flaticon.com/512/4064/4064269.png"
        alt="Not Found"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <p>{message}</p>
    </div>
  );
}

export default ErrorMessage;
