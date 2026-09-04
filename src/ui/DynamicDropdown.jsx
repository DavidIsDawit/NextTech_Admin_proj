import PropTypes from 'prop-types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/ui/select';

function DynamicDropdown({ options, value, onChange, defaultOption }) {
    const cleanDefaultOption = typeof defaultOption === 'string' ? defaultOption.trim() : '';
    const normalizedOptions = Array.from(
        new Set(
            (options || [])
                .filter((option) => typeof option === 'string' && option.trim() !== '')
                .filter((option) => option !== cleanDefaultOption)
        )
    );

    const selectOptions = cleanDefaultOption
        ? [cleanDefaultOption, ...normalizedOptions]
        : normalizedOptions;

    const matchedOption = selectOptions.find(
        (opt) => opt.toLowerCase() === (value || '').toLowerCase()
    );
    const selectedValue = matchedOption || (typeof value === 'string' && value.trim() !== '' ? value : undefined);

    return (
        <Select
            value={selectedValue}
            onValueChange={onChange}
        >
            <SelectTrigger
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-base text-left shadow-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 sm:text-sm"
            >
                <SelectValue placeholder={cleanDefaultOption || 'Select an option'} />
            </SelectTrigger>
            <SelectContent className="max-h-40 overflow-y-auto">
                {selectOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

DynamicDropdown.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultOption: PropTypes.string,
};

export default DynamicDropdown;
