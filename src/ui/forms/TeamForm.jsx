/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Upload } from 'lucide-react';

/**
 * TeamForm - Form component for Team Member entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function TeamForm({ formData = {}, onChange, errors = {} }) {
    const [imagePreview, setImagePreview] = useState(null);

    // Initialize preview from existing data
    React.useEffect(() => {
        if (formData.image && typeof formData.image === 'string') {
            setImagePreview(formData.image);
        }
    }, [formData.image]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange?.({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStatusChange = (value) => {
        onChange?.({ ...formData, status: value });
    };

    return (
        <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
                <div
                    className="border-2 border-dashed border-[#136ECA] rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative lg:mx-24 md:mx-28 mx-16"
                    onClick={() => document.getElementById('team-image').click()}
                >
                    <div className="flex flex-col items-center">
                        {formData.image instanceof File && imagePreview && (
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src={imagePreview}
                                    alt="Team member preview"
                                    className="w-48 h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                                />
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                            <p className="text-sm text-gray-600">
                                Drag your team member image here or <span className="underline cursor-pointer">click to browse</span>
                            </p>
                        </div>
                    </div>
                </div>
                <Input
                    id="team-image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                />
                {errors.image && (
                    <p className="text-sm text-red-500">{errors.image}</p>
                )}
            </div>

            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Abebe, Bontu,..."
                    value={formData.name || ''}
                    onChange={handleChange}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            {/* Specialty */}
            <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                    id="specialty"
                    name="specialty"
                    placeholder="e.g., CEO,CTO,..."
                    value={formData.specialty || ''}
                    onChange={handleChange}
                />
                {errors.specialty && (
                    <p className="text-sm text-red-500">{errors.specialty}</p>
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
                        <RadioGroupItem value="published" id="team-published" />
                        <Label htmlFor="team-published" className="font-normal cursor-pointer">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="team-draft" />
                        <Label htmlFor="team-draft" className="font-normal cursor-pointer">Draft</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="archived" id="team-archived" />
                        <Label htmlFor="team-archived" className="font-normal cursor-pointer">Archived</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
