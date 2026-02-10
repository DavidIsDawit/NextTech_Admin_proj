/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';

/**
 * ServiceForm - Form component for Service entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function ServiceForm({ formData = {}, onChange, errors = {} }) {
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange?.({ ...formData, thumbnail: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onChange?.({ ...formData, serviceGallery: files });

            // Create previews
            const previews = [];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    previews.push(reader.result);
                    if (previews.length === files.length) {
                        setGalleryPreviews(previews);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleStatusChange = (value) => {
        onChange?.({ ...formData, status: value });
    };

    return (
        <div className="space-y-4">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div
                    className="border-2 border-dashed border-sky-400 bg-sky-50 rounded-lg p-8 text-center cursor-pointer hover:bg-sky-100/50 transition-colors "
                    onClick={() => document.getElementById('service-thumbnail').click()}
                >
                    {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="mx-auto max-h-32 rounded" />
                    ) : (
                        <>
                            <img src="/upload-placeholder.png" alt="Upload" className="mx-auto h-12 w-12 mb-2" />
                            <p className="text-sm text-sky-600 font-medium">Upload service icon or select from library</p>
                        </>
                    )}
                </div>
                <Input
                    id="service-thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                />
                {errors.thumbnail && (
                    <p className="text-sm text-red-500">{errors.thumbnail}</p>
                )}
            </div>

            {/* Service Gallery Upload */}
            <div className="space-y-2">
                <Label>Service Gallery</Label>
                <div
                    className="border-2 border-dashed border-sky-400 bg-sky-50 rounded-lg p-8 text-center cursor-pointer hover:bg-sky-100/50 transition-colors"
                    onClick={() => document.getElementById('service-gallery').click()}
                >
                    {galleryPreviews.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {galleryPreviews.map((preview, idx) => (
                                <img key={idx} src={preview} alt={`Gallery ${idx + 1}`} className="h-20 w-full object-cover rounded" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <img src="/upload-placeholder.png" alt="Upload" className="mx-auto h-12 w-12 mb-2" />
                            <p className="text-sm text-sky-600 font-medium">Upload service icon or select from library</p>
                        </>
                    )}
                </div>
                <Input
                    id="service-gallery"
                    name="serviceGallery"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                />
                {errors.serviceGallery && (
                    <p className="text-sm text-red-500">{errors.serviceGallery}</p>
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
                />
                {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                )}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                    id="category"
                    name="category"
                    placeholder="e.g., Consultation"
                    value={formData.category || ''}
                    onChange={handleChange}
                />
                {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                )}
            </div>

            {/* Service Short Description */}
            <div className="space-y-2">
                <Label htmlFor="shortDescription">Service Short Description</Label>
                <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    placeholder="Brief description of the service..."
                    value={formData.shortDescription || ''}
                    onChange={handleChange}
                    rows={3}
                />
                {errors.shortDescription && (
                    <p className="text-sm text-red-500">{errors.shortDescription}</p>
                )}
            </div>

            {/* Full Service Description */}
            <div className="space-y-2">
                <Label htmlFor="fullDescription">Sub Service Description</Label>
                <Textarea
                    id="fullDescription"
                    name="fullDescription"
                    placeholder="Detailed description of the service..."
                    value={formData.fullDescription || ''}
                    onChange={handleChange}
                    rows={4}
                />
                {errors.fullDescription && (
                    <p className="text-sm text-red-500">{errors.fullDescription}</p>
                )}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                    value={formData.status || 'active'}
                    onValueChange={handleStatusChange}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="service-active" />
                        <Label htmlFor="service-active" className="font-normal cursor-pointer">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="disable" id="service-disable" />
                        <Label htmlFor="service-disable" className="font-normal cursor-pointer">Inactive</Label>
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
