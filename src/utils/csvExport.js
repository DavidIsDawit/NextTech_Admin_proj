/**
 * Exports data to a CSV file.
 * @param {Array} data - The array of objects to export.
 * @param {string} fileName - The desired name of the CSV file (without extension).
 * @param {Object} headersMap - An object mapping data keys to CSV header labels. 
 *                              Example: { title: "Title", category: "Category" }
 */
export const exportToCSV = (data, fileName, headersMap) => {
    if (!data || !data.length) return;

    const headerKeys = Object.keys(headersMap);
    const headerLabels = Object.values(headersMap).join(",");

    const csvRows = data.map((item) => {
        return headerKeys
            .map((key) => {
                let value = item[key] ?? "";

                // Handle React components or icons if they accidentally pass through
                if (typeof value === "function" || (typeof value === "object" && value !== null && !Array.isArray(value))) {
                    value = "";
                }

                // Escape double quotes and wrap value in double quotes
                return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(",");
    });

    const csvContent = [headerLabels, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
