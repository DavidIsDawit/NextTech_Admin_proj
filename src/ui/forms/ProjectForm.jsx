/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Upload } from 'lucide-react';

/**
 * ProjectForm - Form component for Project entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function ProjectForm({ formData = {}, onChange, errors = {} }) {
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Initialize previews from existing data
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
                    className="border-2 border-dashed border-sky-400 bg-sky-50 rounded-lg p-8 text-center cursor-pointer hover:bg-sky-100/50 transition-colors"
                    onClick={() => document.getElementById('thumbnail').click()}
                >
                    {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="mx-auto max-h-32 rounded" />
                    ) : (
                        <>
                            <img src="/upload-placeholder.png" alt="Upload" className="mx-auto h-12 w-12 mb-2" />
                            <p className="text-sm text-sky-600 font-medium">Upload project icon or select from library</p>
                        </>
                    )}
                </div>
                <Input
                    id="thumbnail"
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

            {/* Project Gallery Upload */}
            <div className="space-y-2">
                <Label>Project Gallery</Label>
                <div
                    className="border-2 border-dashed border-sky-400 bg-sky-50 rounded-lg p-8 text-center cursor-pointer hover:bg-sky-100/50 transition-colors"
                    onClick={() => document.getElementById('gallery').click()}
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
                            <p className="text-sm text-sky-600 font-medium">Upload project icon or select from library</p>
                        </>
                    )}
                </div>
                <Input
                    id="gallery"
                    name="gallery"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                />
                {errors.gallery && (
                    <p className="text-sm text-red-500">{errors.gallery}</p>
                )}
            </div>

            {/* Project Name */}
            <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                    id="projectName"
                    name="projectName"
                    placeholder="e.g., [Project] Engineering Image"
                    value={formData.projectName || ''}
                    onChange={handleChange}
                />
                {errors.projectName && (
                    <p className="text-sm text-red-500">{errors.projectName}</p>
                )}
            </div>

            {/* Client */}
            <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input
                    id="client"
                    name="client"
                    placeholder="Ethiopian Airlines"
                    value={formData.client || ''}
                    onChange={handleChange}
                />
                {errors.client && (
                    <p className="text-sm text-red-500">{errors.client}</p>
                )}
            </div>

            {/* Sector */}
            <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                    id="sector"
                    name="sector"
                    placeholder="Air System"
                    value={formData.sector || ''}
                    onChange={handleChange}
                />
                {errors.sector && (
                    <p className="text-sm text-red-500">{errors.sector}</p>
                )}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                    id="category"
                    name="category"
                    placeholder="Machine"
                    value={formData.category || ''}
                    onChange={handleChange}
                />
                {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                )}
            </div>

            {/* Project Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the project, offerings, capabilities, and key features..."
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={4}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                )}
            </div>

            {/* Result */}
            <div className="space-y-2">
                <Label htmlFor="result">Result</Label>
                <Textarea
                    id="result"
                    name="result"
                    placeholder="Describe the project's offerings, capabilities, and key features..."
                    value={formData.result || ''}
                    onChange={handleChange}
                    rows={3}
                />
                {errors.result && (
                    <p className="text-sm text-red-500">{errors.result}</p>
                )}
            </div>

            {/* Project Requirement */}
            <div className="space-y-2">
                <Label htmlFor="requirement">Project Requirement</Label>
                <Textarea
                    id="requirement"
                    name="requirement"
                    placeholder="Add technical requirements supported by common..."
                    value={formData.requirement || ''}
                    onChange={handleChange}
                    rows={3}
                />
                {errors.requirement && (
                    <p className="text-sm text-red-500">{errors.requirement}</p>
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
                    value={formData.status || 'active'}
                    onValueChange={handleStatusChange}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="active" />
                        <Label htmlFor="active" className="font-normal cursor-pointer">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inactive" id="inactive" />
                        <Label htmlFor="inactive" className="font-normal cursor-pointer">Inactive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="draft" />
                        <Label htmlFor="draft" className="font-normal cursor-pointer">Draft</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
