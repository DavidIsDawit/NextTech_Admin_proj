import React, { useState } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { BASE_URL, buildImageUrl } from '@/api/api';
import { toast } from 'sonner';
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
    const [imageError, setImageError] = useState(false); // track preview failures

    // small helper to fix casing issues coming from the API
    // preview helper – the API now returns a full URL but we still accept
    // whatever value comes through (relative or absolute).
    const getImageUrl = (value) => {
        if (!value) return "/upload-placeholder.png";
        return buildImageUrl(value) || "/upload-placeholder.png";
    };

    // Initialize preview from existing data or local file
    React.useEffect(() => {
        let objectUrl;
        if (formData.certificate instanceof File) {
            console.debug('using local File for preview', formData.certificate);
            objectUrl = URL.createObjectURL(formData.certificate);
            setFilePreview(objectUrl);
        } else if (formData.certificateImage && typeof formData.certificateImage === 'string') {
            const url = getImageUrl(formData.certificateImage);
            console.debug('using existing image URL', url);
            setFilePreview(url);
            setImageError(false);
        } else {
            setFilePreview(null);
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [formData.certificate, formData.certificateImage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        console.debug('handleFileChange', file);
        if (file) {
            setImageError(false);
            onChange?.({ ...formData, certificate: file });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            onChange?.({ ...formData, certificate: file });
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
                    className="border-2 border-dashed border-[#136ECA] rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative lg:mx-24 md:mx-28 mx-16"
                    onClick={() => document.getElementById('certificate-file').click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="flex flex-col items-center">
                        {formData.certificate instanceof File && filePreview && (
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src={filePreview}
                                    alt="Preview"
                                    crossOrigin="anonymous"
                                    className="w-48 h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                                    onError={(e) => { e.target.src = "/upload-placeholder.png"; }}
                                />
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                            <p className="text-sm text-gray-600">
                                Drag your certificate image to start uploading
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                            <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer hover:bg-blue-50 transition">
                                Browse files
                            </div>
                        </div>
                    </div>
                </div>
                <Input
                    id="certificate-file"
                    name="certificate"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {errors.certificate && (
                    <p className="text-sm text-red-500">{errors.certificate}</p>
                )}
                {imageError && (
                    <p className="text-sm text-yellow-600">Existing image not available. Please choose a new file.</p>
                )}
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Certificate Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g., ISO 9001:2015 Quality Management"
                    value={formData.title || ''}
                    onChange={handleChange}
                />
                {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                )}
            </div>

            {/* Issued By */}
            <div className="space-y-2">
                <Label htmlFor="issuedBy">Issued By</Label>
                <Input
                    id="issuedBy"
                    name="issuedBy"
                    placeholder="Organization or issuer name"
                    value={formData.issuedBy || ''}
                    onChange={handleChange}
                />
                {errors.issuedBy && (
                    <p className="text-sm text-red-500">{errors.issuedBy}</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                    id="description"
                    name="description"
                    placeholder="Enter certificate description"
                    value={formData.description || ''}
                    onChange={handleChange}
                />
            </div>

            {/* Issue Date */}
            <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    value={formData.issueDate ? new Date(formData.issueDate).toISOString().split('T')[0] : ''}
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
                    value={formData.status || 'Active'}
                    onValueChange={handleStatusChange}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Active" id="cert-active" />
                        <Label htmlFor="cert-active" className="font-normal cursor-pointer">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Inactive" id="cert-inactive" />
                        <Label htmlFor="cert-inactive" className="font-normal cursor-pointer">Inactive</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
