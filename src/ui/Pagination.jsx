import PropTypes from "prop-types";

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-2 sm:px-4 md:w-28 py-2 border rounded text-xs sm:text-sm md:text-base disabled:opacity-50 hover:bg-[#E0F2FE] hover:text-[#00A3E0] bg-white transition-colors"
      >
        Previous
      </button>

      {pages.length > 0 && (
        <div className="flex space-x-1 sm:space-x-2">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`px-2.5 sm:px-4 py-2 border rounded text-xs sm:text-sm md:text-base transition-colors ${
                currentPage === page
                  ? "bg-[#00A3E0] text-white border-[#00A3E0]"
                  : "bg-white text-gray-600 hover:bg-[#E0F2FE] hover:text-[#00A3E0] border-gray-200"
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
        className="px-2 sm:px-4 md:w-28 py-2 border rounded text-xs sm:text-sm md:text-base disabled:opacity-50 hover:bg-[#E0F2FE] hover:text-[#00A3E0] bg-white transition-colors"
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
