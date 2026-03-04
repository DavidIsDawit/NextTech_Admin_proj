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
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative lg:mx-24 md:mx-28 mx-16 ${errors.image || errors.file ? 'border-red-500 bg-red-50' : 'border-[#136ECA]'}`}
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
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Abebe Kebede, Muzeying,...."
                    className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            {/* Speciality */}
            <div className="space-y-2">
                <Label htmlFor="speciality">Speciality</Label>
                <Input
                    id="speciality"
                    name="speciality"
                    value={formData.speciality || ''}
                    onChange={handleChange}
                    placeholder="e.g., CEO, CTO,...."
                    className={errors.speciality ? 'border-red-500' : ''}
                />
                {errors.speciality && (
                    <p className="text-sm text-red-500">{errors.speciality}</p>
                )}
            </div>

            {/* Testimony / Review */}
            <div className="space-y-2">
                <Label htmlFor="testimony">Testimony</Label>
                <Textarea
                    id="testimony"
                    name="testimony"
                    value={formData.testimony || formData.review || ''}
                    onChange={handleChange}
                    placeholder="Describe the project, offerings, capabilities, and key features..."
                    className={`min-h-[100px] ${errors.testimony || errors.review ? 'border-red-500' : ''}`}
                />
                {(errors.testimony || errors.review) && (
                    <p className="text-sm text-red-500">{errors.testimony || errors.review}</p>
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
                    className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                    <p className="text-sm text-red-500">{errors.date}</p>
                )}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                    value={formData.status || 'Active'}
                    onValueChange={(value) => handleSelectChange('status', value)}
                    className="flex items-center gap-6"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="t-active" />
                        <Label htmlFor="t-active" className="font-normal text-slate-600">
                            Active
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inactive" id="t-inactive" />
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
