/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Upload } from 'lucide-react';
import { buildImageUrl } from '@/api/api';

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
        let objectUrl;
        if (formData.image instanceof File) {
            objectUrl = URL.createObjectURL(formData.image);
            setImagePreview(objectUrl);
        } else if (formData.image && typeof formData.image === 'string') {
            setImagePreview(buildImageUrl(formData.image));
        } else {
            setImagePreview(null);
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
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
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative lg:mx-24 md:mx-28 mx-16 ${errors.image ? 'border-red-500 bg-red-50' : 'border-[#136ECA]'}`}
                    onClick={() => document.getElementById('team-image').click()}
                >
                    <div className="flex flex-col items-center">
                        {imagePreview && (
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src={imagePreview}
                                    alt="Team member preview"
                                    className="w-48 h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                                    onError={(e) => { e.target.src = "/upload-placeholder.png"; }}
                                />
                                {!(formData.image instanceof File) && (
                                    <span className="text-xs text-gray-400 mt-2 italic text-center">Current Photo</span>
                                )}
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
                    className={errors.name ? 'border-red-500' : ''}
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
                    className={errors.specialty ? 'border-red-500' : ''}
                />
                {errors.specialty && (
                    <p className="text-sm text-red-500">{errors.specialty}</p>
                )}
            </div>


            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                    value={formData.status || 'Active'}
                    onValueChange={handleStatusChange}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Active" id="team-active" />
                        <Label htmlFor="team-active" className="font-normal cursor-pointer">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Inactive" id="team-inactive" />
                        <Label htmlFor="team-inactive" className="font-normal cursor-pointer">Inactive</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
