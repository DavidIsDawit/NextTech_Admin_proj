/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Upload } from 'lucide-react';

/**
 * PartnerForm - Form component for Partner entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function PartnerForm({ formData = {}, onChange, errors = {} }) {
    const [filePreview, setFilePreview] = useState(null);

    // Initialize preview from existing data
    React.useEffect(() => {
        if (formData.partnerImage && typeof formData.partnerImage === 'string') {
            // If it's a URL, show the filename or a placeholder
            const fileName = formData.partnerImage.split('/').pop();
            setFilePreview(fileName);
        }
    }, [formData.partnerImage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange?.({ ...formData, partnerImage: file });
            setFilePreview(file.name);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onChange?.({ ...formData, partnerImage: file });
            setFilePreview(file.name);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleStatusChange = (value) => {
        onChange?.({ ...formData, status: value });
    };

    return (
        <div className="space-y-4">
            {/* Partner File Upload */}
            <div className="space-y-2">
                <div
                    className="border-2 border-dashed border-[#136ECA] rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative lg:mx-24 md:mx-28 mx-16"
                    onClick={() => document.getElementById('partnerImage').click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="flex flex-col items-center">
                        {formData.partnerImage instanceof File && (
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src={URL.createObjectURL(formData.partnerImage)}
                                    alt="Preview"
                                    className="w-48 h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                                />
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                            <p className="text-sm text-gray-600">
                                Drag your partner image to start uploading
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                            <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer hover:bg-blue-50 transition">
                                Browse files
                            </div>
                        </div>
                    </div>
                </div>
                <Input
                    id="partnerImage"
                    name="partnerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {errors.partnerImage && (
                    <p className="text-sm text-red-500">{errors.partnerImage}</p>
                )}
            </div>

            {/* Company / Partner Name */}
            <div className="space-y-2">
                <Label htmlFor="partnerName">Partner Name</Label>
                <Input
                    id="partnerName"
                    name="partnerName"
                    placeholder="e.g., Ethiopian Airline, EthioTelecom, SafariCom..."
                    value={formData.partnerName || ''}
                    onChange={handleChange}
                />
                {errors.partnerName && (
                    <p className="text-sm text-red-500">{errors.partnerName}</p>
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
                        <RadioGroupItem value="Active" id="partner-active" />
                        <Label htmlFor="partner-active" className="font-normal cursor-pointer">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Inactive" id="partner-inactive" />
                        <Label htmlFor="partner-inactive" className="font-normal cursor-pointer">Inactive</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
