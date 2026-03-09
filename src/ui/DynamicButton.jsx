import PropTypes from 'prop-types';
import { cn } from '../lib/utils';

function DynamicButton({ children, onClick, icon: Icon, className, variant = 'primary' }) {
    const baseStyles = "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-[#00A3E0] hover:bg-[#008cc2] text-white focus:ring-[#00A3E0]",
        secondary: "text-[#00A3E0] hover:text-[#008cc2] bg-transparent hover:bg-transparent focus:ring-[#00A3E0]",
        outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-[#00A3E0]",
        danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
        ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    };

    const finalClassName = cn(baseStyles, variants[variant] || variants.primary, className);

    return (
        <button onClick={onClick} className={finalClassName}>
            {Icon && <Icon className={children ? "mr-2" : ""} size={16} />}
            {children}
        </button>
    );
}

DynamicButton.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    icon: PropTypes.elementType,
    className: PropTypes.string,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'ghost']),
};

export default DynamicButton;
