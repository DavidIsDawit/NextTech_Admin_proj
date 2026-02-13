import PropTypes from "prop-types";

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [1];
  let left, right;

  if (currentPage <= 3) {
    left = 2;
    right = Math.min(totalPages - 1, 4);
  } else if (currentPage >= totalPages - 2) {
    left = Math.max(2, totalPages - 3);
    right = totalPages - 1;
  } else {
    left = currentPage - 1;
    right = currentPage + 1;
  }

  if (left > 2) pages.push("...");

  for (let i = left; i <= right && i < totalPages; i++) {
    pages.push(i);
  }

  if (right < totalPages - 1) pages.push("...");
  if (right < totalPages) pages.push(totalPages);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 md:w-28 py-2 border rounded text-base disabled:opacity-50 hover:bg-gray-50"
      >
        Previous
      </button>

      {pages.map((page, idx) => (
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 border rounded text-base ${currentPage === page
              ? "bg-blue-500 text-white border-blue-500"
              : "hover:bg-gray-50"
              }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded text-base disabled:opacity-50 hover:bg-gray-50"
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
