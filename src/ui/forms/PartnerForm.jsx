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
        if (formData.partnerFile && typeof formData.partnerFile === 'string') {
            // If it's a URL, show the filename or a placeholder
            const fileName = formData.partnerFile.split('/').pop();
            setFilePreview(fileName);
        }
    }, [formData.partnerFile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange?.({ ...formData, partnerFile: file });
            setFilePreview(file.name);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
            onChange?.({ ...formData, partnerFile: file });
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
                    className="border-2 border-dashed border-sky-400 bg-sky-50 rounded-lg p-12 text-center cursor-pointer hover:bg-sky-100/50 transition-colors"
                    onClick={() => document.getElementById('partner-file').click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {filePreview ? (
                        <div className="space-y-2">
                            <img src="/upload-placeholder.png" alt="Upload" className="mx-auto h-12 w-12" />
                            <p className="text-sm font-medium text-gray-700">{filePreview}</p>
                            <p className="text-xs text-gray-500">Click to change file</p>
                        </div>
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
                    id="partner-file"
                    name="partnerFile"
                    type="file"
                    accept=".pdf,application/pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {errors.partnerFile && (
                    <p className="text-sm text-red-500">{errors.partnerFile}</p>
                )}
            </div>

            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Ethiopian Airline, EthioTelecom, SafariCom..."
                    value={formData.name || ''}
                    onChange={handleChange}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            {/* Company */}
            <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                    id="company"
                    name="company"
                    placeholder="e.g., Ethiopian Airline, EthioTelecom, SafariCom..."
                    value={formData.company || ''}
                    onChange={handleChange}
                />
                {errors.company && (
                    <p className="text-sm text-red-500">{errors.company}</p>
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
                        <RadioGroupItem value="published" id="partner-published" />
                        <Label htmlFor="partner-published" className="font-normal cursor-pointer">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="partner-draft" />
                        <Label htmlFor="partner-draft" className="font-normal cursor-pointer">Draft</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="archived" id="partner-archived" />
                        <Label htmlFor="partner-archived" className="font-normal cursor-pointer">Archived</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
