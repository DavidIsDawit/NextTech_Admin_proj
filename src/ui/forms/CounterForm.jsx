/* eslint-disable react/prop-types */
import React from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';

/**
 * CounterForm - Form component for Counter/Statistics entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function CounterForm({ formData = {}, onChange, errors = {} }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleStatusChange = (value) => {
        onChange?.({ ...formData, status: value });
    };

    return (
        <div className="space-y-4">
            {/* Number */}
            <div className="space-y-2">
                <Label htmlFor="number">Number</Label>
                <Input
                    id="number"
                    name="number"
                    type="number"
                    placeholder="e.g., 1,2,3..."
                    value={formData.number || ''}
                    onChange={handleChange}
                />
                {errors.number && (
                    <p className="text-sm text-red-500">{errors.number}</p>
                )}
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Clients, Projects,..."
                    value={formData.title || ''}
                    onChange={handleChange}
                />
                {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                )}
            </div>

            {/* Date */}
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={handleChange}
                />
                {errors.date && (
                    <p className="text-sm text-red-500">{errors.date}</p>
                )}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                    value={formData.status || 'published'}
                    onValueChange={handleStatusChange}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="published" id="counter-published" />
                        <Label htmlFor="counter-published" className="font-normal cursor-pointer">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="counter-draft" />
                        <Label htmlFor="counter-draft" className="font-normal cursor-pointer">Draft</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="archived" id="counter-archived" />
                        <Label htmlFor="counter-archived" className="font-normal cursor-pointer">Archived</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
