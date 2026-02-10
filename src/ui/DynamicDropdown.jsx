import PropTypes from 'prop-types';

function DynamicDropdown({ options, value, onChange, defaultOption }) {
    return (
        <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {defaultOption && <option value={defaultOption}>{defaultOption}</option>}
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}

DynamicDropdown.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultOption: PropTypes.string,
};

export default DynamicDropdown;
