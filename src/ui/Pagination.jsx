import PropTypes from "prop-types";

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 md:w-28 py-2 border rounded text-base disabled:opacity-50 hover:bg-gray-50 bg-white"
      >
        Previous
      </button>

      {pages.length > 0 && (
        <div className="flex space-x-2">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 border rounded text-base ${
                currentPage === page
                  ? "bg-[#00A3E0] text-white border-[#00A3E0]"
                  : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || totalPages === 0}
        className="px-4 md:w-28 py-2 border rounded text-base disabled:opacity-50 hover:bg-gray-50 bg-white"
      >
        Next
      </button>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
