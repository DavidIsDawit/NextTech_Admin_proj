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
 * MediaForm - Form component for Media/Gallery entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function MediaForm({ formData = {}, onChange, errors = {} }) {
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    React.useEffect(() => {
        if (formData.thumbnail && typeof formData.thumbnail === 'string') {
            setThumbnailPreview(formData.thumbnail);
        }
        if (formData.gallery && Array.isArray(formData.gallery)) {
            const strings = formData.gallery.filter(item => typeof item === 'string');
            if (strings.length > 0) {
                setGalleryPreviews(strings);
            }
        }
    }, [formData.thumbnail, formData.gallery]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleSelectChange = (name, value) => {
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
            onChange?.({ ...formData, gallery: files });

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
                    className="border-2 border-dashed border-[#136ECA] rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative lg:mx-24 md:mx-28 mx-16"
                    onClick={() => document.getElementById('media-thumbnail').click()}
                >
                    <div className="flex flex-col items-center">
                        {formData.thumbnail instanceof File && thumbnailPreview && (
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-48 h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                                />
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                            <p className="text-sm text-gray-600">
                                Drag your media thumbnail to start uploading
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                            <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer hover:bg-blue-50 transition">
                                Browse files
                            </div>
                        </div>
                    </div>
                </div>
                <Input
                    id="media-thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                />
                {errors.thumbnail && (
                    <p className="text-sm text-red-500">{errors.thumbnail}</p>
                )}
            </div>

            {/* Gallery Upload */}
            <div className="space-y-2">
                <Label>Gallery</Label>
                <div
                    className="border-2 border-dashed border-[#136ECA] rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative lg:mx-24 md:mx-28 mx-16"
                    onClick={() => document.getElementById('media-gallery').click()}
                >
                    <div className="flex flex-col items-center">
                        {galleryPreviews.length > 0 && Array.isArray(formData.gallery) && formData.gallery.some(item => item instanceof File) && (
                            <div className="space-y-4 w-full mb-6 text-center">
                                <div className="grid grid-cols-3 gap-2">
                                    {galleryPreviews.map((preview, idx) => (
                                        <img key={idx} src={preview} alt={`Gallery ${idx + 1}`} className="h-20 w-full object-cover rounded border border-gray-200" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 italic">
                                    {formData.gallery?.length} items selected
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                            <p className="text-sm text-gray-600">
                                Drag media gallery images to start uploading
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-2">OR</p>
                            <div className="inline-block px-4 py-1 border border-[#136ECA] text-blue-600 text-sm rounded-md cursor-pointer hover:bg-blue-50 transition">
                                Browse files
                            </div>
                        </div>
                    </div>
                </div>
                <Input
                    id="media-gallery"
                    name="gallery"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                />
                {errors.gallery && (
                    <p className="text-sm text-red-500">{errors.gallery}</p>
                )}
            </div>

            {/* Media Title */}
            <div className="space-y-2">
                <Label htmlFor="mediaTitle">Media Title</Label>
                <Input
                    id="mediaTitle"
                    name="mediaTitle"
                    placeholder="e.g., Construction Site Phase 1"
                    value={formData.mediaTitle || ''}
                    onChange={handleChange}
                />
                {errors.mediaTitle && (
                    <p className="text-sm text-red-500">{errors.mediaTitle}</p>
                )}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                    value={formData.category || ''}
                    onValueChange={(value) => handleSelectChange('category', value)}
                >
                    <SelectTrigger>
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
                {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                )}
            </div>

            {/* File Type */}
            <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select
                    value={formData.fileType || ''}
                    onValueChange={(value) => handleSelectChange('fileType', value)}
                >
                    <SelectTrigger>
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
                        <RadioGroupItem value="published" id="media-published" />
                        <Label htmlFor="media-published" className="font-normal cursor-pointer">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="media-draft" />
                        <Label htmlFor="media-draft" className="font-normal cursor-pointer">Draft</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="archived" id="media-archived" />
                        <Label htmlFor="media-archived" className="font-normal cursor-pointer">Archived</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
