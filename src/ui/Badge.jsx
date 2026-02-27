import PropTypes from "prop-types";

function Badge({ children, type }) {
    const styles = {
        Active: "bg-green-100 text-green-700",
        active: "bg-green-100 text-green-700",
        published: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
        inactive: "bg-red-100 text-red-700",
        archived: "bg-red-100 text-red-700",
        disable: "bg-red-100 text-red-700",
        Draft: "bg-orange-100 text-orange-700",
        draft: "bg-orange-100 text-orange-700",
        schedule: "bg-blue-100 text-blue-700",
    };

    const className = `px-3 py-1 rounded-full text-xs font-semibold ${styles[type] || "bg-gray-100 text-gray-700"
        }`;

    return <span className={className}>{children}</span>;
}

Badge.propTypes = {
    children: PropTypes.node.isRequired,
    type: PropTypes.string.isRequired,
};

export default Badge;
