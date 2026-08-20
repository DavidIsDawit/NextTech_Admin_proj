/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Upload } from 'lucide-react';
import { buildImageUrl } from '@/api/api';

export function TestimonialForm({ formData = {}, onChange, errors = {} }) {
    const [preview, setPreview] = useState(null);
    const [hoverRating, setHoverRating] = useState(null);

    const currentRateValue = Number(formData.rate ?? formData.rating ?? 0);
    const currentRate = Number.isFinite(currentRateValue) ? currentRateValue : null;
    const displayRate = hoverRating ?? currentRate ?? 0;

    useEffect(() => {
        if (formData.file instanceof File) {
            // Handled by handleFileChange for new uploads
        } else if (formData.image && typeof formData.image === 'string') {
            setPreview(buildImageUrl(formData.image));
        } else if (formData.thumbnail && typeof formData.thumbnail === 'string') {
            // some older code might use .thumbnail
            setPreview(buildImageUrl(formData.thumbnail));
        }
    }, [formData.image, formData.thumbnail, formData.file]);

    const getStarValue = (event, index) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const relativeX = event.clientX - rect.left;
        const fraction = Math.max(0.1, Math.min(0.9, Number((relativeX / rect.width * 0.9).toFixed(1))));

        if (fraction >= 0.9) {
            return Number(index + 1);
        }

        return Number(Math.min(5, Math.max(0.1, index + fraction)).toFixed(1));
    };

    const handleRateMouseMove = (event, index) => {
        const nextValue = getStarValue(event, index);
        setHoverRating(nextValue);
    };

    const handleRateMouseLeave = () => {
        setHoverRating(null);
    };

    const handleRateClick = (event, index) => {
        const nextValue = getStarValue(event, index);
        onChange?.({ ...formData, rate: nextValue });
        setHoverRating(nextValue);
    };

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
            onChange?.({ ...formData, file: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="space-y-6">
            {/* File Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-blue-50 transition-colors relative ${errors.image || errors.file ? 'border-red-500 bg-red-50' : 'border-[#136ECA]'}`}
                onClick={() => document.getElementById('testimonial-file').click()}
            >
                <div className="flex flex-col items-center">
                    {preview && (
                        <div className="flex flex-col items-center mb-6">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-48 h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                                onError={(e) => { e.target.src = "/upload-placeholder.png"; }}
                            />
                            {!(formData.file instanceof File) && (
                                <span className="text-xs text-gray-400 mt-2 italic text-center">Current Photo</span>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col items-center justify-center">
                        <Upload className="h-10 w-10 text-[#136ECA] mb-4" />
                        <p className="text-sm text-gray-600">
                            Drag testimonial image here or <span className="underline cursor-pointer">click to browse</span>
                        </p>
                    </div>
                </div>
                <input
                    id="testimonial-file"
                    name="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {(errors.image || errors.file) && (
                    <p className="text-sm text-red-500">{errors.image || errors.file}</p>
                )}
            </div>

            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className={errors.name ? 'text-red-500' : ''}>
                    Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="e.g., Abebe Kebede, Muzeying,...."
                    className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            {/* Speciality */}
            <div className="space-y-2">
                <Label htmlFor="specality" className={errors.specality ? 'text-red-500' : ''}>
                    Speciality <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="specality"
                    name="specality"
                    value={formData.specality || formData.specialty || formData.speciality || ''}
                    onChange={handleChange}
                    placeholder="e.g., CEO, CTO,...."
                    className={errors.specality ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.specality && (
                    <p className="text-sm text-red-500">{errors.specality}</p>
                )}
            </div>

            {/* Testimony / Review */}
            <div className="space-y-2">
                <Label htmlFor="testimony" className={errors.testimony || errors.review ? 'text-red-500' : ''}>
                    Testimony <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="testimony"
                    name="testimony"
                    value={formData.testimony || formData.review || ''}
                    onChange={handleChange}
                    placeholder="Describe the project, offerings, capabilities, and key features..."
                    className={`min-h-[100px] ${errors.testimony || errors.review ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {(errors.testimony || errors.review) && (
                    <p className="text-sm text-red-500">{errors.testimony || errors.review}</p>
                )}
            </div>

            {/* Date */}
            <div className="space-y-2">
                <Label htmlFor="date" className={errors.date ? 'text-red-500' : ''}>
                    Date <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={handleChange}
                    className={errors.date ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.date && (
                    <p className="text-sm text-red-500">{errors.date}</p>
                )}
            </div>

            {/* Rating - between date and status */}
            <div className="space-y-2">
                <Label className={errors.rate ? 'text-red-500' : ''}>
                    Rating <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-1 text-2xl select-none">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const fillLevel = Math.max(0, Math.min(1, displayRate - (star - 1)));
                            const isFilled = fillLevel >= 1;
                            const isPartial = fillLevel > 0 && fillLevel < 1;

                            return (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseMove={(event) => handleRateMouseMove(event, star - 1)}
                                    onMouseLeave={handleRateMouseLeave}
                                    onClick={(event) => handleRateClick(event, star - 1)}
                                    className="transition transform hover:scale-110 focus:outline-none"
                                    aria-label={`Rate ${star} star`}
                                >
                                    <span
                                        className={`${isFilled ? 'text-amber-400' : isPartial ? 'text-amber-300' : 'text-slate-300'} ${fillLevel > 0 ? 'drop-shadow-sm' : ''}`}
                                    >
                                        ★
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="text-sm font-medium text-slate-700">
                        {currentRate === null ? '—' : (Number.isInteger(displayRate) ? displayRate.toFixed(0) : displayRate.toFixed(1))} / 5
                    </div>
                </div>
                {errors.rate && (
                    <p className="text-sm text-red-500">{errors.rate}</p>
                )}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label className={errors.status ? 'text-red-500' : ''}>
                    Status 
                    {/* <span className="text-red-500">*</span> */}
                </Label>
                <RadioGroup
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                    className="flex items-center gap-6"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Active" id="t-active" />
                        <Label htmlFor="t-active" className="font-normal text-slate-600">
                            Active
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Inactive" id="t-inactive" />
                        <Label htmlFor="t-inactive" className="font-normal text-slate-600">
                            Inactive
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="t-draft" />
                        <Label htmlFor="t-draft" className="font-normal text-slate-600">
                            Draft
                        </Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
