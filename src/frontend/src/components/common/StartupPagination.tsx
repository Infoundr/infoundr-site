import React from 'react';

interface Props {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const StartupPagination: React.FC<Props> = ({ totalPages, currentPage, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
      >
        &lt;
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg ${
            currentPage === page
              ? 'bg-purple-600 text-white font-semibold'
              : 'border border-gray-200 text-gray-500 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
      >
        &gt;
      </button>
    </div>
  );
};

export default StartupPagination;


