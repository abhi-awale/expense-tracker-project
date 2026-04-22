const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const buildPagination = ({ page, limit, totalItems }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);

  return {
    currentPage,
    limit,
    totalItems,
    totalPages,
    offset: (currentPage - 1) * limit,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
};

module.exports = {
  parsePositiveInt,
  buildPagination,
};
