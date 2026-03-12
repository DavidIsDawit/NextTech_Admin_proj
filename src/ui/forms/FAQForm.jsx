/* eslint-disable react/prop-types */
import React from 'react';
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

export function FAQForm({ formData, setFormData, errors = {} }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    return (
        <div className="space-y-4">
            {/* Question */}
            <div className="space-y-2">
                <Label htmlFor="question" className={errors.question ? 'text-red-500' : ''}>
                    Question <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    placeholder="Enter the question..."
                    className={errors.question ? 'border-red-500' : ''}
                />
                {errors.question && (
                    <p className="text-sm text-red-500">{errors.question}</p>
                )}
            </div>

            {/* Answer */}
            <div className="space-y-2">
                <Label htmlFor="answer" className={errors.answer ? 'text-red-500' : ''}>
                    Answer <span className="text-red-500">*</span>
                </Label>
                <div className={`rounded-md border bg-transparent ${errors.answer ? 'border-red-500' : 'border-input'}`}>
                    <Textarea
                        id="answer"
                        name="answer"
                        value={formData.answer}
                        onChange={handleChange}
                        placeholder="Type your answer here..."
                        className="min-h-[150px] border-0 focus-visible:ring-0"
                    />
                </div>
                {errors.answer && (
                    <p className="text-sm text-red-500">{errors.answer}</p>
                )}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category" className={errors.category ? 'text-red-500' : ''}>
                    Category <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                    </SelectContent>
                </Select>
                {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                )}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label className={errors.status ? 'text-red-500' : ''}>
                    Status <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                    className="flex items-center gap-6"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="published" id="published" />
                        <Label htmlFor="published" className="font-normal text-slate-600">
                            Published
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="draft" />
                        <Label htmlFor="draft" className="font-normal text-slate-600">
                            Draft
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="schedule" id="schedule" />
                        <Label htmlFor="schedule" className="font-normal text-slate-600">
                            Schedule
                        </Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                )}
            </div>


        </div>
    );
}
