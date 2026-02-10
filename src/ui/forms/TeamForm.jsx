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
                    className="border-2 border-dashed border-sky-400 bg-sky-50 rounded-lg p-12 text-center cursor-pointer hover:bg-sky-100/50 transition-colors"
                    onClick={() => document.getElementById('team-image').click()}
                >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Team member preview" className="mx-auto max-h-32 rounded" />
                    ) : (
                        <>
                            <img src="/upload-placeholder.png" alt="Upload" className="mx-auto h-12 w-12 mb-2" />
                            <p className="text-sm text-sky-600 font-medium">
                                Drag PDF here or <span className="underline">click to browse</span>
                            </p>
                        </>
                    )}
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
