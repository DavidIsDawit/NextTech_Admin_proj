/* eslint-disable react/prop-types */
import React, { useState } from 'react';
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
import { Upload } from 'lucide-react';

/**
 * CertificateForm - Form component for Certificate entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function CertificateForm({ formData = {}, onChange, errors = {} }) {
    const [filePreview, setFilePreview] = useState(null);

    // Initialize preview from existing data
    React.useEffect(() => {
        if (formData.thumbnail && typeof formData.thumbnail === 'string') {
            // Show the filename or preview path
            const fileName = formData.thumbnail.split('/').pop();
            setFilePreview(fileName);
        }
    }, [formData.thumbnail]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleSelectChange = (name, value) => {
        onChange?.({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange?.({ ...formData, certificate: file });
            setFilePreview(file.name);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
            onChange?.({ ...formData, certificate: file });
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
            {/* Certificate Upload */}
            <div className="space-y-2">
                <div
                    className="border-2 border-dashed border-sky-400 bg-sky-50 rounded-lg p-12 text-center cursor-pointer hover:bg-sky-100/50 transition-colors"
                    onClick={() => document.getElementById('certificate-file').click()}
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
                    id="certificate-file"
                    name="certificate"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {errors.certificate && (
                    <p className="text-sm text-red-500">{errors.certificate}</p>
                )}
            </div>

            {/* Certificate Name */}
            <div className="space-y-2">
                <Label htmlFor="certificateName">Certificate Name</Label>
                <Input
                    id="certificateName"
                    name="certificateName"
                    placeholder="e.g., ISO 9001:2015 Quality Management"
                    value={formData.certificateName || ''}
                    onChange={handleChange}
                />
                {errors.certificateName && (
                    <p className="text-sm text-red-500">{errors.certificateName}</p>
                )}
            </div>

            {/* From */}
            <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Input
                    id="from"
                    name="from"
                    placeholder="e.g., Ethiopian Airlines, Ethiotelecom, SafariCom"
                    value={formData.from || ''}
                    onChange={handleChange}
                />
                {errors.from && (
                    <p className="text-sm text-red-500">{errors.from}</p>
                )}
            </div>

            {/* Type */}
            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                    value={formData.type || ''}
                    onValueChange={(value) => handleSelectChange('type', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="ISO Certification" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="iso-certification">ISO Certification</SelectItem>
                        <SelectItem value="quality-management">Quality Management</SelectItem>
                        <SelectItem value="safety-certification">Safety Certification</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && (
                    <p className="text-sm text-red-500">{errors.type}</p>
                )}
            </div>

            {/* Issue Date */}
            <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={handleChange}
                />
                {errors.issueDate && (
                    <p className="text-sm text-red-500">{errors.issueDate}</p>
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
                        <RadioGroupItem value="published" id="cert-published" />
                        <Label htmlFor="cert-published" className="font-normal cursor-pointer">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="cert-draft" />
                        <Label htmlFor="cert-draft" className="font-normal cursor-pointer">Draft</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="archived" id="cert-archived" />
                        <Label htmlFor="cert-archived" className="font-normal cursor-pointer">Archived</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
