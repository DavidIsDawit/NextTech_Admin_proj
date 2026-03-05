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
 * NewsForm - Form component for News/Article entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function NewsForm({ formData = {}, onChange, errors = {} }) {
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

    const handleSelectChange = (name, value) => {
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
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative lg:mx-24 md:mx-28 mx-16 ${errors.imageCover ? 'border-red-500 bg-red-50' : 'border-[#136ECA]'}`}
                    onClick={() => document.getElementById('news-imageCover').click()}
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
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                            <p className="text-sm text-gray-600">
                                Drag your news cover image to start uploading
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                            <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer hover:bg-blue-50 transition">
                                Browse files
                            </div>
                        </div>
                    </div>
                </div>
                <Input
                    id="news-imageCover"
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

            {/* News Images (Gallery) Upload */}
            <div className="space-y-2">
                <Label>News Images (Gallery)</Label>
                {/* Upload zone — click to browse */}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors  ${errors.images ? 'border-red-500 bg-red-50' : 'border-[#136ECA]'}`}
                    onClick={() => document.getElementById('news-images').click()}
                >
                    <div className="flex flex-col items-center">
                        {/* Preview grid — shown INSIDE upload zone */}
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
                                Drag news gallery images to start uploading
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                            <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer hover:bg-blue-50 transition">
                                Browse files
                            </div>
                        </div>
                    </div>
                </div>
                {/* Native input for multi-select */}
                <input
                    id="news-images"
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


            {/* Article Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Article Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Enter article title..."
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
                <Select
                    value={formData.catagory || ''}
                    onValueChange={(value) => handleSelectChange('catagory', value)}
                >
                    <SelectTrigger className={errors.catagory ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Company News" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="company-news">Company News</SelectItem>
                        <SelectItem value="industry-news">Industry News</SelectItem>
                        <SelectItem value="press-release">Press Release</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                </Select>
                {errors.catagory && (
                    <p className="text-sm text-red-500">{errors.catagory}</p>
                )}
            </div>

            {/* Author Name */}
            <div className="space-y-2">
                <Label htmlFor="author">Author Name</Label>
                <Input
                    id="author"
                    name="author"
                    placeholder="Enter author name..."
                    value={formData.author || ''}
                    onChange={handleChange}
                    className={errors.author ? 'border-red-500' : ''}
                />
                {errors.author && (
                    <p className="text-sm text-red-500">{errors.author}</p>
                )}
            </div>

            {/* Description One */}
            <div className="space-y-2">
                <Label htmlFor="descriptionOne">Article Description One</Label>
                <Textarea
                    id="descriptionOne"
                    name="descriptionOne"
                    placeholder="Write your article content here..."
                    value={formData.descriptionOne || ''}
                    onChange={handleChange}
                    rows={3}
                    className={errors.descriptionOne ? 'border-red-500' : ''}
                />
                {errors.descriptionOne && (
                    <p className="text-sm text-red-500">{errors.descriptionOne}</p>
                )}
            </div>

            {/* Description Two */}
            <div className="space-y-2">
                <Label htmlFor="descriptionTwo">Article Description Two</Label>
                <Textarea
                    id="descriptionTwo"
                    name="descriptionTwo"
                    placeholder="Write more content here..."
                    value={formData.descriptionTwo || ''}
                    onChange={handleChange}
                    rows={4}
                    className={errors.descriptionTwo ? 'border-red-500' : ''}
                />
                {errors.descriptionTwo && (
                    <p className="text-sm text-red-500">{errors.descriptionTwo}</p>
                )}
            </div>

            {/* Description Three */}
            <div className="space-y-2">
                <Label htmlFor="discriptionThree">Article Description Three</Label>
                <Textarea
                    id="discriptionThree"
                    name="discriptionThree"
                    placeholder="Write more content here..."
                    value={formData.discriptionThree || ''}
                    onChange={handleChange}
                    rows={4}
                    className={errors.discriptionThree ? 'border-red-500' : ''}
                />
                {errors.discriptionThree && (
                    <p className="text-sm text-red-500">{errors.discriptionThree}</p>
                )}
            </div>

            {/* Description Four */}
            <div className="space-y-2">
                <Label htmlFor="discriptionFour">Article Description Four</Label>
                <Textarea
                    id="discriptionFour"
                    name="discriptionFour"
                    placeholder="Write more content here..."
                    value={formData.discriptionFour || ''}
                    onChange={handleChange}
                    rows={4}
                    className={errors.discriptionFour ? 'border-red-500' : ''}
                />
                {errors.discriptionFour && (
                    <p className="text-sm text-red-500">{errors.discriptionFour}</p>
                )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                    id="tags"
                    name="tags"
                    placeholder="Add tags separated by commas..."
                    value={formData.tags || ''}
                    onChange={handleChange}
                    className={errors.tags ? 'border-red-500' : ''}
                />
                {errors.tags && (
                    <p className="text-sm text-red-500">{errors.tags}</p>
                )}
            </div>

            {/* Happened On Date */}
            <div className="space-y-2">
                <Label htmlFor="happenedOn">Published Date</Label>
                <Input
                    id="happenedOn"
                    name="happenedOn"
                    type="date"
                    value={formData.happenedOn || ''}
                    onChange={handleChange}
                    className={errors.happenedOn ? 'border-red-500' : ''}
                />
                {errors.happenedOn && (
                    <p className="text-sm text-red-500">{errors.happenedOn}</p>
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
                        <RadioGroupItem value="published" id="news-published" />
                        <Label htmlFor="news-published" className="font-normal cursor-pointer">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="news-draft" />
                        <Label htmlFor="news-draft" className="font-normal cursor-pointer">Draft</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="scheduled" id="news-scheduled" />
                        <Label htmlFor="news-scheduled" className="font-normal cursor-pointer">Scheduled</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
