/**
 * Formats a number or numeric string into a shortened version with suffixes (K, M, B).
 * Examples: 1000 -> 1K, 1500 -> 1.5K, 1000000 -> 1M
 * @param {number|string} val 
 * @returns {string}
 */
export const formatNumber = (val) => {
    if (val === null || val === undefined) return "";

    // Extract numeric part if it has a '+' or other non-numeric suffix
    const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));

    if (isNaN(num)) return val.toString();

    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + "B";
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + "K";
    }

    return num.toString();
};
