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
import { Upload, X } from 'lucide-react';
import { buildImageUrl } from '@/api/api';

/**
 * MediaForm - Form component for Media/Gallery entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function MediaForm({ formData = {}, onChange, errors = {} }) {
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [imagesPreview, setImagesPreview] = useState([]);

    React.useEffect(() => {
        let objectUrl;
        if (formData.coverImage instanceof File) {
            objectUrl = URL.createObjectURL(formData.coverImage);
            setCoverImagePreview(objectUrl);
        } else if (formData.coverImage && typeof formData.coverImage === 'string') {
            setCoverImagePreview(buildImageUrl(formData.coverImage));
        } else {
            setCoverImagePreview(null);
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
    }, [formData.coverImage, formData.images]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleSelectChange = (name, value) => {
        onChange?.({ ...formData, [name]: value });
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange?.({ ...formData, coverImage: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result);
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
            {/* Cover Image Upload */}
            <div className="space-y-2">
                <Label>Cover Image</Label>
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-blue-50 transition-colors relative  ${errors.coverImage ? 'border-red-500 bg-red-50' : 'border-[#136ECA]'}`}
                    onClick={() => document.getElementById('media-coverImage').click()}
                >
                    <div className="flex flex-col items-center">
                        {formData.coverImage instanceof File && coverImagePreview && (
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src={coverImagePreview}
                                    alt="Cover preview"
                                    className="w-48 h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                                />
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                            <p className="text-sm text-gray-600">
                                Drag your cover image to start uploading
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                            <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer bg-blue-50 transition">
                                Browse files
                            </div>
                        </div>
                    </div>
                </div>
                <Input
                    id="media-coverImage"
                    name="coverImage"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                />
                {errors.coverImage && (
                    <p className="text-sm text-red-500">{errors.coverImage}</p>
                )}
            </div>

            {/* Images Gallery Upload */}
            <div className="space-y-2">
                <Label>Gallery Images</Label>
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-blue-50 transition-colors relative  ${errors.images ? 'border-red-500 bg-red-50' : 'border-[#136ECA]'}`}
                    onClick={() => document.getElementById('media-gallery').click()}
                >
                    <div className="flex flex-col items-center">
                        {imagesPreview.length > 0 && (
                            <div className="w-full mb-6">
                                <p className="text-xs text-gray-500 font-medium mb-3">
                                    {imagesPreview.length} image{imagesPreview.length > 1 ? 's' : ''} selected
                                </p>
                                <div className={imagesPreview.length === 1 ? "flex justify-center mb-6" : "grid grid-cols-4 gap-2"}>
                                    {imagesPreview.map((preview, idx) => (
                                        <div key={idx} className={`relative group ${imagesPreview.length === 1 ? "w-48" : "aspect-square"}`}>
                                            <img
                                                src={preview}
                                                alt={`Gallery ${idx + 1}`}
                                                className={`rounded-lg border border-gray-200 shadow-sm ${imagesPreview.length === 1 ? "w-full h-auto object-contain" : "h-full w-full object-cover"}`}
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
                                Drag media gallery images to start uploading
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                            <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer bg-blue-50 transition">
                                Browse files
                            </div>
                        </div>
                    </div>
                </div>
                <Input
                    id="media-gallery"
                    name="images"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleImagesChange}
                    className="hidden"
                />
                {errors.images && (
                    <p className="text-sm text-red-500">{errors.images}</p>
                )}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="catagory">Category</Label>
                <Select
                    value={formData.catagory || ''}
                    onValueChange={(value) => handleSelectChange('catagory', value)}
                >
                    <SelectTrigger className={errors.catagory ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="projects">Projects</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                {errors.catagory && (
                    <p className="text-sm text-red-500">{errors.catagory}</p>
                )}
            </div>

            {/* File Type */}
            <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select
                    value={formData.fileType || ''}
                    onValueChange={(value) => handleSelectChange('fileType', value)}
                >
                    <SelectTrigger className={errors.fileType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                </Select>
                {errors.fileType && (
                    <p className="text-sm text-red-500">{errors.fileType}</p>
                )}
            </div>


            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                    value={formData.status}
                    onValueChange={handleStatusChange}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Active" id="media-active" />
                        <Label htmlFor="media-active" className="font-normal cursor-pointer">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Inactive" id="media-inactive" />
                        <Label htmlFor="media-inactive" className="font-normal cursor-pointer">Inactive</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
