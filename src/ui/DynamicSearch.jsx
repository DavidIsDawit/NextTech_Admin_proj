import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';

function DynamicSearch({ value, onChange, placeholder }) {
    return (
        <div className="relative flex-1 w-full sm:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch size={20} className="text-gray-600" />

            </div>
            <input
                type="text"
                placeholder={placeholder || "Search..."}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
