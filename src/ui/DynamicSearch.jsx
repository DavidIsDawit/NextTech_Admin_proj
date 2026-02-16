import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';
import { Input } from "./input";

function DynamicSearch({ value, onChange, placeholder }) {
    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <FiSearch size={20} className="text-gray-600" />
            </div>
            <Input
                type="text"
                placeholder={placeholder || "Search..."}
                className="pl-10 h-10"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

DynamicSearch.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

export default DynamicSearch;
