/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Upload, X, Calendar } from 'lucide-react';
import { buildImageUrl } from '@/api/api';

/**
 * PortfolioForm - Matches the UI mockup provided by the user
 */
export function PortfolioForm({ formData = {}, onChange, errors = {} }) {
    const [thumbinalPreview, setThumbinalPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Initialize previews
    useEffect(() => {
        const objectUrls = [];

        // Thumbnail Preview
        if (formData.thumbinal instanceof File) {
            const url = URL.createObjectURL(formData.thumbinal);
            objectUrls.push(url);
            setThumbinalPreview(url);
        } else if (formData.thumbinal && typeof formData.thumbinal === 'string') {
            setThumbinalPreview(buildImageUrl(formData.thumbinal));
        } else {
            setThumbinalPreview(null);
        }

        // Gallery Previews
        if (formData.images && Array.isArray(formData.images)) {
            const previews = formData.images.map(img => {
                if (img instanceof File) {
                    const url = URL.createObjectURL(img);
                    objectUrls.push(url);
                    return url;
                }
                return buildImageUrl(img);
            });
            setGalleryPreviews(previews);
        } else {
            setGalleryPreviews([]);
        }

        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [formData.thumbinal, formData.images]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleThumbinalChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange?.({ ...formData, thumbinal: file });
        }
    };

    const handleGalleryChange = (e) => {
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length === 0) return;

        // Accumulate with previously selected files (don't replace)
        const updatedImages = [...(formData.images || []), ...newFiles];
        onChange?.({ ...formData, images: updatedImages });

        // Reset input for repeat selections
        e.target.value = '';
    };

    const removeGalleryImage = (index) => {
        const newImages = [...(formData.images || [])];
        newImages.splice(index, 1);
        onChange?.({ ...formData, images: newImages });
    };

    return (
        <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar pb-4">

            {/* Thumbnail Upload */}
            <div className="space-y-2">
                <Label className="text-gray-500 font-normal">Thumbnail</Label>
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative min-h-32 flex flex-col items-center justify-center ${errors.thumbinal ? 'border-red-500 bg-red-50' : 'border-[#00adef] bg-[#f8fbff]'}`}
                    onClick={() => document.getElementById('port-thumb').click()}
                >
                    <div className="flex flex-col items-center w-full">
                        {thumbinalPreview && (
                            <div className="mb-4">
                                <img src={thumbinalPreview} className="h-32 w-auto object-contain rounded shadow-sm border border-gray-100" alt="Thumbnail" />
                                {!(formData.thumbinal instanceof File) && (
                                    <p className="text-[10px] text-gray-400 mt-1 italic">Current Thumbnail</p>
                                )}
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center text-[#00adef]">
                            <Upload className="h-10 w-10 mb-2" />
                            <p className="text-xs text-gray-500 font-medium text-center px-4">Upload project icon or click to change</p>
                        </div>
                    </div>
                    <input id="port-thumb" type="file" className="hidden" accept="image/*" onChange={handleThumbinalChange} />
                </div>
                {errors.thumbinal && <p className="text-xs text-red-500">{errors.thumbinal}</p>}
            </div>

            {/* Project Gallery Upload */}
            <div className="space-y-2">
                <Label className="text-gray-500 font-normal">Project Gallery</Label>
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors min-h-32 flex flex-col items-center justify-center ${errors.images ? 'border-red-500 bg-red-50' : 'border-[#00adef] bg-[#f8fbff]'}`}
                    onClick={() => document.getElementById('port-gall').click()}
                >
                    <div className="flex flex-col items-center w-full">
                        {galleryPreviews.length > 0 && (
                            <div className="w-full mb-6">
                                <p className="text-xs text-gray-500 font-medium mb-3">{galleryPreviews.length} image{galleryPreviews.length > 1 ? 's' : ''} selected</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {galleryPreviews.map((p, i) => (
                                        <div key={i} className="relative aspect-square group">
                                            <img src={p} alt="" className="w-full h-full object-cover rounded border border-gray-100 shadow-sm" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeGalleryImage(i);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center text-[#00adef]">
                            <Upload className="h-10 w-10 mb-2" />
                            <p className="text-xs text-gray-500 font-medium text-center px-4">Drag gallery images or select from library</p>
                        </div>
                    </div>
                    <input id="port-gall" type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryChange} />
                </div>
                {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
            </div>

            {/* Project Name */}
            <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-500 font-normal">Project Name</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Structural Engineering Design"
                    value={formData.title || ''}
                    onChange={handleChange}
                    className={`bg-white border-gray-200 focus:border-[#00adef] ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Client */}
            <div className="space-y-2">
                <Label htmlFor="client" className="text-gray-500 font-normal">Client</Label>
                <Input
                    id="client"
                    name="client"
                    placeholder="Ethiopian Airlines"
                    value={formData.client || ''}
                    onChange={handleChange}
                    className={`bg-white border-gray-200 focus:border-[#00adef] ${errors.client ? 'border-red-500' : ''}`}
                />
                {errors.client && <p className="text-xs text-red-500">{errors.client}</p>}
            </div>

            {/* Sector */}
            <div className="space-y-2">
                <Label htmlFor="sector" className="text-gray-500 font-normal">Sector</Label>
                <Input
                    id="sector"
                    name="sector"
                    placeholder="HV-System"
                    value={formData.sector || ''}
                    onChange={handleChange}
                    className={`bg-white border-gray-200 focus:border-[#00adef] ${errors.sector ? 'border-red-500' : ''}`}
                />
                {errors.sector && <p className="text-xs text-red-500">{errors.sector}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="catagory" className="text-gray-500 font-normal">Category</Label>
                <Input
                    id="catagory"
                    name="catagory"
                    placeholder="Machine"
                    value={formData.catagory || ''}
                    onChange={handleChange}
                    className={`bg-white border-gray-200 focus:border-[#00adef] ${errors.catagory ? 'border-red-500' : ''}`}
                />
                {errors.catagory && <p className="text-xs text-red-500">{errors.catagory}</p>}
            </div>

            {/* Project Description (Mapped to descriptionOne) */}
            <div className="space-y-2">
                <Label htmlFor="descriptionOne" className="text-gray-500 font-normal">Project Description</Label>
                <Textarea
                    id="descriptionOne"
                    name="descriptionOne"
                    placeholder="Describe the project, offerings, capabilities, and key features..."
                    value={formData.descriptionOne || ''}
                    onChange={handleChange}
                    rows={4}
                    className={`bg-white border-gray-200 focus:border-[#00adef] resize-none ${errors.descriptionOne ? 'border-red-500' : ''}`}
                />
                {errors.descriptionOne && <p className="text-xs text-red-500">{errors.descriptionOne}</p>}
            </div>

            {/* Result (Mapped to resultOne) */}
            <div className="space-y-2">
                <Label htmlFor="resultOne" className="text-gray-500 font-normal">Result</Label>
                <Textarea
                    id="resultOne"
                    name="resultOne"
                    placeholder="Describe the project, offerings, capabilities, and key features..."
                    value={formData.resultOne || ''}
                    onChange={handleChange}
                    rows={4}
                    className={`bg-white border-gray-200 focus:border-[#00adef] resize-none ${errors.resultOne ? 'border-red-500' : ''}`}
                />
                {errors.resultOne && <p className="text-xs text-red-500">{errors.resultOne}</p>}
            </div>

            {/* Project Requirement */}
            <div className="space-y-2">
                <Label htmlFor="requirement" className="text-gray-500 font-normal">Project Requirement</Label>
                <Textarea
                    id="requirement"
                    name="requirement"
                    placeholder="Add technical requirements separated by commas...."
                    value={formData.requirement || ''}
                    onChange={handleChange}
                    rows={4}
                    className={`bg-white border-gray-200 focus:border-[#00adef] resize-none ${errors.requirement ? 'border-red-500' : ''}`}
                />
                {errors.requirement && <p className="text-xs text-red-500">{errors.requirement}</p>}
            </div>

            {/* Hidden/Extra Fields from Backend (Maintaining Schema) */}
            {/* These are necessary for the 18-field backend, styled minimally */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Additional Content Slides</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="subtitleOne">Subtitle One</Label>
                        <Input id="subtitleOne" name="subtitleOne" className={`text-sm h-8 ${errors.subtitleOne ? 'border-red-500' : ''}`} value={formData.subtitleOne || ''} onChange={handleChange} />
                        {errors.subtitleOne && <p className="text-[10px] text-red-500">{errors.subtitleOne}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subtitleTwo">Subtitle Two</Label>
                        <Input id="subtitleTwo" name="subtitleTwo" className={`text-sm h-8 ${errors.subtitleTwo ? 'border-red-500' : ''}`} value={formData.subtitleTwo || ''} onChange={handleChange} />
                        {errors.subtitleTwo && <p className="text-[10px] text-red-500">{errors.subtitleTwo}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subDescriptionTwo">Description Two</Label>
                        <Input id="subDescriptionTwo" name="subDescriptionTwo" className={`text-sm h-8 ${errors.subDescriptionTwo ? 'border-red-500' : ''}`} value={formData.subDescriptionTwo || ''} onChange={handleChange} />
                        {errors.subDescriptionTwo && <p className="text-[10px] text-red-500">{errors.subDescriptionTwo}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subtitleThere">Subtitle Three</Label>
                        <Input id="subtitleThere" name="subtitleThere" className={`text-sm h-8 ${errors.subtitleThere ? 'border-red-500' : ''}`} value={formData.subtitleThere || ''} onChange={handleChange} />
                        {errors.subtitleThere && <p className="text-[10px] text-red-500">{errors.subtitleThere}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subDescriptionThere">Description Three</Label>
                        <Input id="subDescriptionThere" name="subDescriptionThere" className={`text-sm h-8 ${errors.subDescriptionThere ? 'border-red-500' : ''}`} value={formData.subDescriptionThere || ''} onChange={handleChange} />
                        {errors.subDescriptionThere && <p className="text-[10px] text-red-500">{errors.subDescriptionThere}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="resultTwo">Result Two</Label>
                        <Input id="resultTwo" name="resultTwo" className={`text-sm h-8 ${errors.resultTwo ? 'border-red-500' : ''}`} value={formData.resultTwo || ''} onChange={handleChange} />
                        {errors.resultTwo && <p className="text-[10px] text-red-500">{errors.resultTwo}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="resultThere">Result Three</Label>
                        <Input id="resultThere" name="resultThere" className={`text-sm h-8 ${errors.resultThere ? 'border-red-500' : ''}`} value={formData.resultThere || ''} onChange={handleChange} />
                        {errors.resultThere && <p className="text-[10px] text-red-500">{errors.resultThere}</p>}
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
                <Label htmlFor="happingDate" className="text-gray-500 font-normal">Date</Label>
                <div className="relative">
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        id="happingDate"
                        name="happingDate"
                        type="date"
                        className={`bg-white border-gray-200 focus:border-[#00adef] pr-10 ${errors.happingDate ? 'border-red-500' : ''}`}
                        value={formData.happingDate || ''}
                        onChange={handleChange}
                    />
                </div>
                {errors.happingDate && <p className="text-xs text-red-500">{errors.happingDate}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label className="text-gray-500 font-normal">Status</Label>
                <RadioGroup
                    value={formData.status || 'Active'}
                    onValueChange={(v) => onChange?.({ ...formData, status: v })}
                    className="flex gap-6 pt-1"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Active" id="status-active" />
                        <Label htmlFor="status-active" className="font-normal cursor-pointer text-gray-600">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Inactive" id="status-inactive" />
                        <Label htmlFor="status-inactive" className="font-normal cursor-pointer text-gray-600">Inactive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Draft" id="status-draft" />
                        <Label htmlFor="status-draft" className="font-normal cursor-pointer text-gray-600">Draft</Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
}
