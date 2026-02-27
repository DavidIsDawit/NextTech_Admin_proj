/* eslint-disable react/prop-types */
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
        <div className="space-y-6">
            {/* Question */}
            <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
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
                <Label htmlFor="answer">Answer</Label>
                <div className="rounded-md border border-input bg-transparent">
                    {/* Simple Toolbar Placeholder */}
                    <div className="flex items-center gap-2 border-b px-3 py-2 text-sm text-muted-foreground">
                        <button className="hover:text-foreground">Aa</button>
                        <button className="hover:text-foreground">Aa</button>
                        <span className="h-4 w-px bg-border"></span>
                        <button className="hover:text-foreground">List</button>
                        <button className="hover:text-foreground">Link</button>
                    </div>
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
                <Label htmlFor="category">Category</Label>
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
                <Label>Status</Label>
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
            </div>


        </div>
    );
}
