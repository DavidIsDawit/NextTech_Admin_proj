import { useState, useEffect } from 'react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { CloudUpload } from 'lucide-react';

export function TestimonialForm({ formData, setFormData, errors = {} }) {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (formData.thumbnail && typeof formData.thumbnail === 'string') {
            setPreview(formData.thumbnail);
        }
    }, [formData.thumbnail]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, file: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="space-y-6">
            {/* File Upload Area */}
            <div
                className="border-2 border-dashed border-[#136ECA] rounded-lg p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors relative lg:mx-24 md:mx-28 mx-16"
                onClick={() => document.getElementById('testimonial-file').click()}
            >
                <div className="flex flex-col items-center">
                    {formData.file instanceof File && preview && (
                        <div className="flex flex-col items-center mb-6">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-48 h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                            />
                        </div>
                    )}
                    <div className="flex flex-col items-center justify-center">
                        <CloudUpload className="h-10 w-10 text-[#136ECA] mb-4" />
                        <p className="text-sm text-gray-600">
                            Drag testimonial image here or <span className="underline cursor-pointer">click to browse</span>
                        </p>
                    </div>
                </div>
                <input
                    id="testimonial-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
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
                    value={formData.speciality}
                    onChange={handleChange}
                    placeholder="e.g., CEO, CTO,...."
                    className={errors.speciality ? 'border-red-500' : ''}
                />
            </div>

            {/* Review */}
            <div className="space-y-2">
                <Label htmlFor="review">Review</Label>
                <Textarea
                    id="review"
                    name="review"
                    value={formData.review}
                    onChange={handleChange}
                    placeholder="Describe the project, offerings, capabilities, and key features..."
                    className="min-h-[100px]"
                />
                {errors.review && (
                    <p className="text-sm text-red-500">{errors.review}</p>
                )}
            </div>

            {/* Date */}
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={errors.date ? 'border-red-500' : ''}
                />
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                    className="flex items-center gap-6"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="published" id="t-published" />
                        <Label htmlFor="t-published" className="font-normal text-slate-600">
                            Published
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="t-draft" />
                        <Label htmlFor="t-draft" className="font-normal text-slate-600">
                            Draft
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="archived" id="t-archived" />
                        <Label htmlFor="t-archived" className="font-normal text-slate-600">
                            Archived
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
}
