/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/ui/select';
import { getCounterDropdown } from '@/api/counterApi';

/**
 * CounterForm - Form component for Counter/Statistics entity
 * 
 * @param {object} formData - Current form data
 * @param {function} setFormData - Callback when form data changes
 * @param {object} errors - Validation errors object
 * @param {string[]} existingNames - Names already used in the counter table
 * @param {string} formType - 'add' or 'edit'
 */
export function CounterForm({ formData = {}, setFormData, errors = {}, existingNames = [], formType = 'add' }) {
    const [allNames, setAllNames] = useState(['Clients', 'Experiences', 'Projects', 'Awards']);

    useEffect(() => {
        const fetchNames = async () => {
            try {
                const response = await getCounterDropdown();
                if (response.status === 'success' && response.data?.validNames) {
                    setAllNames(response.data.validNames);
                }
            } catch (error) {
                console.error("Failed to fetch counter names:", error);
            }
        };
        fetchNames();
    }, []);

    // Filter names to only show those not already in use (except for the current item being edited)
    const availableNames = React.useMemo(() => {
        if (formType === 'edit') {
            return allNames.filter(name => !existingNames.includes(name) || name === (formData.name || formData.title));
        }
        return allNames.filter(name => !existingNames.includes(name));
    }, [allNames, existingNames, formType, formData.name, formData.title]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Map UI field names to backend fields
        const fieldName = name === 'number' ? 'value' : (name === 'title' ? 'name' : name);

        // Cast to number if it's the value/number field
        const finalValue = fieldName === 'value' ? (value === '' ? 0 : Number(value)) : value;

        setFormData?.((prev) => ({ ...prev, [fieldName]: finalValue }));
    };

    const handleSelectChange = (name, value) => {
        setFormData?.((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4">
            {/* Number (Value) */}
            <div className="space-y-2">
                <Label htmlFor="value">Value (Number)</Label>
                <Input
                    id="value"
                    name="number"
                    type="number"
                    placeholder="e.g., 15"
                    value={formData.value ?? formData.number ?? ''}
                    onChange={handleChange}
                    className={errors.value ? 'border-red-500' : ''}
                />
                {errors.value && (
                    <p className="text-sm text-red-500">{errors.value}</p>
                )}
            </div>

            {/* Title (Name Enum) */}
            <div className="space-y-2">
                <Label htmlFor="name">Counter Type</Label>
                <Select
                    value={(formData.name || formData.title) || ""}
                    onValueChange={(value) => handleSelectChange('name', value)}
                    disabled={formType === 'edit'} // Usually counter names (types) aren't changed after creation
                >
                    <SelectTrigger className={errors.name ? 'border-red-500' : ''}>
                        <SelectValue placeholder={formType === 'edit' ? (formData.name || formData.title) : "Select counter type"} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableNames.map((name) => (
                            <SelectItem key={name} value={name}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {formType === 'edit' && (
                    <p className="text-xs text-gray-400 mt-1 italic">Counter type cannot be changed. Values only.</p>
                )}
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                    value={formData.status || 'active'}
                    onValueChange={(value) => handleSelectChange('status', value)}
                    className="flex flex-wrap gap-6"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="counter-active" />
                        <Label htmlFor="counter-active" className="font-normal cursor-pointer text-slate-600">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inactive" id="counter-inactive" />
                        <Label htmlFor="counter-inactive" className="font-normal cursor-pointer text-slate-600">Inactive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="counter-draft" />
                        <Label htmlFor="counter-draft" className="font-normal cursor-pointer text-slate-600">Draft</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
