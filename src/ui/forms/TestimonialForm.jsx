/* eslint-disable react/prop-types */
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { CloudUpload } from 'lucide-react';

export function TestimonialForm({ formData, setFormData, errors = {} }) {
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
        }
    };

    return (
        <div className="space-y-6">
            {/* File Upload Area */}
            <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-sky-400 bg-sky-50 py-10 text-center hover:bg-sky-100/50 transition-colors">
                <div className="mb-2 rounded-full bg-white p-3 shadow-sm">
                    <CloudUpload className="h-8 w-8 text-sky-500" />
                </div>
                <p className="text-sm font-medium text-sky-600">
                    Drag PDF here or click to browse
                </p>
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                />
                {formData.file && (
                    <p className="mt-2 text-xs text-slate-600">
                        Selected: {formData.file.name}
                    </p>
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
