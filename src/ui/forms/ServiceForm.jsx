/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/ui/select';
import { Upload, X } from 'lucide-react';
import { buildImageUrl } from '@/api/api';

/**
 * ServiceForm - Form component for Service entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function ServiceForm({ formData = {}, onChange, errors = {} }) {
    const [imageCoverPreview, setImageCoverPreview] = useState(null);
    const [imagesPreview, setImagesPreview] = useState([]);

    // Initialize previews from existing data
    React.useEffect(() => {
        let objectUrl;
        if (formData.imageCover instanceof File) {
            objectUrl = URL.createObjectURL(formData.imageCover);
            setImageCoverPreview(objectUrl);
        } else if (formData.imageCover && typeof formData.imageCover === 'string') {
            setImageCoverPreview(buildImageUrl(formData.imageCover));
        } else {
            setImageCoverPreview(null);
        }

        const objectUrls = [];
        if (objectUrl) objectUrls.push(objectUrl);

        if (formData.images && Array.isArray(formData.images)) {
            const previews = formData.images.map(img => {
                if (img instanceof File) {
                    const url = URL.createObjectURL(img);
                    objectUrls.push(url);
                    return url;
                }
                return buildImageUrl(img);
            });
            setImagesPreview(previews);
        } else {
            setImagesPreview([]);
        }

        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [formData.imageCover, formData.images]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleImageCoverChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange?.({ ...formData, imageCover: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageCoverPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImagesChange = (e) => {
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length === 0) return;

        // Accumulate with previously selected files (don't replace)
        const updatedImages = [...(formData.images || []), ...newFiles];
        onChange?.({ ...formData, images: updatedImages });

        // Reset the input so the same file can be added again if needed
        e.target.value = '';
    };

    const handleRemoveImage = (idx) => {
        const updatedImages = (formData.images || []).filter((_, i) => i !== idx);
        onChange?.({ ...formData, images: updatedImages });
    };

    const handleStatusChange = (value) => {
        onChange?.({ ...formData, status: value });
    };

    return (
        <div className="space-y-4">
            {/* Image Cover Upload */}
            <div className="space-y-2">
                <Label>Cover Image</Label>
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-blue-50 transition-colors relative  ${errors.imageCover ? 'border-red-500 bg-red-50' : 'border-[#136ECA]'}`}
                    onClick={() => document.getElementById('service-imageCover').click()}
                >
                    <div className="flex flex-col items-center">
                        {imageCoverPreview && (
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src={imageCoverPreview}
                                    alt="Cover preview"
                                    className="w-48 h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                                    onError={(e) => { e.target.src = "/upload-placeholder.png"; }}
                                />
                                {!(formData.imageCover instanceof File) && (
                                    <span className="text-xs text-gray-400 mt-2 italic text-center">Current Cover</span>
                                )}
                            </div>
                        )}
                        {!imageCoverPreview && (
                            <div className="flex flex-col items-center justify-center">
                                <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                                <p className="text-sm text-gray-600">
                                    Drag your service cover image to start uploading
                                </p>
                                <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                                <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer bg-blue-50 transition">
                                    Browse files
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Input
                    id="service-imageCover"
                    name="imageCover"
                    type="file"
                    accept="image/*"
                    onChange={handleImageCoverChange}
                    className="hidden"
                />
                {errors.imageCover && (
                    <p className="text-sm text-red-500">{errors.imageCover}</p>
                )}
            </div>

            {/* Service Images Upload */}
            <div className="space-y-2">
                <Label>Service Images (Gallery)</Label>
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-blue-50 transition-colors relative ${errors.images ? 'border-red-500 bg-red-50' : 'border-[#136ECA]'}`}
                    onClick={() => document.getElementById('service-images').click()}
                >
                    <div className="flex flex-col items-center">
                        {imagesPreview.length > 0 && (
                            <div className="w-full mb-6">
                                <p className="text-xs text-gray-500 font-medium mb-3">
                                    {imagesPreview.length} image{imagesPreview.length > 1 ? 's' : ''} selected
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {imagesPreview.map((preview, idx) => (
                                        <div key={idx} className="relative group aspect-square">
                                            <img
                                                src={preview}
                                                alt={`Gallery ${idx + 1}`}
                                                className="h-full w-full object-cover rounded-lg border border-gray-200 shadow-sm"
                                                onError={(e) => { e.target.src = "/upload-placeholder.png"; }}
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Don't trigger file picker
                                                    handleRemoveImage(idx);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                title="Remove image"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                            <p className="text-sm text-gray-600">
                                Drag service gallery images to start uploading
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                            <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer bg-blue-50 transition">
                                Browse files
                            </div>
                        </div>
                    </div>
                </div>
                <Input
                    id="service-images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="hidden"
                />
                {errors.images && (
                    <p className="text-sm text-red-500">{errors.images}</p>
                )}
            </div>

            {/* Service Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Enter service title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                )}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="catagory">Category</Label>
                <Input
                    id="catagory"
                    name="catagory"
                    placeholder="e.g., Consultation"
                    value={formData.catagory || ''}
                    onChange={handleChange}
                    className={errors.catagory ? 'border-red-500' : ''}
                />
                {errors.catagory && (
                    <p className="text-sm text-red-500">{errors.catagory}</p>
                )}
            </div>

            {/* Service Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Service Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of the service..."
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                )}
            </div>

            {/* Headline */}
            <div className="space-y-2">
                <Label htmlFor="headLine">Headline</Label>
                <Input
                    id="headLine"
                    name="headLine"
                    placeholder="Enter main headline"
                    value={formData.headLine || ''}
                    onChange={handleChange}
                    className={errors.headLine ? 'border-red-500' : ''}
                />
                {errors.headLine && (
                    <p className="text-sm text-red-500">{errors.headLine}</p>
                )}
            </div>

            {/* Optional Subsections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="subTitleOne">Sub Title One</Label>
                    <Input id="subTitleOne" name="subTitleOne" value={formData.subTitleOne || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subdescriptionOne">Sub Description One</Label>
                    <Input id="subdescriptionOne" name="subdescriptionOne" value={formData.subdescriptionOne || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subTitleTwo">Sub Title Two</Label>
                    <Input id="subTitleTwo" name="subTitleTwo" value={formData.subTitleTwo || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subdescriptionTwo">Sub Description Two</Label>
                    <Input id="subdescriptionTwo" name="subdescriptionTwo" value={formData.subdescriptionTwo || ''} onChange={handleChange} />
                </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                    value={formData.status || Active}
                    onValueChange={handleStatusChange}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Active" id="service-active" />
                        <Label htmlFor="service-active" className="font-normal cursor-pointer">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Inactive" id="service-inactive" />
                        <Label htmlFor="service-inactive" className="font-normal cursor-pointer">Inactive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="service-draft" />
                        <Label htmlFor="service-draft" className="font-normal cursor-pointer">Draft</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
