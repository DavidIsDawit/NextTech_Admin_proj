/* eslint-disable react/prop-types */
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/ui/dialog';
import { Button } from '@/ui/button';

/**
 * FormModal - Reusable modal for Add/Edit forms
 * 
 * @param {boolean} open - Controls modal visibility
 * @param {function} onOpenChange - Callback when modal open state changes
 * @param {function} onSubmit - Callback when form is submitted
 * @param {string} title - Modal title (e.g., "Add Team Member", "Edit Service")
 * @param {string} description - Optional description text
 * @param {React.ReactNode} children - Form content to render
 * @param {boolean} isSubmitting - Loading state during submission
 * @param {string} submitLabel - Custom label for submit button (default: "Save")
 * @param {string} size - Modal size: "sm", "md", "lg", "xl" (default: "md")
 */
export function FormModal({
    open,
    onOpenChange,
    onSubmit,
    title,
    description,
    children,
    isSubmitting = false,
    submitLabel = 'Save',
    size = 'md',
}) {
    const sizeClasses = {
        sm: 'sm:max-w-[425px]',
        md: 'sm:max-w-[525px]',
        lg: 'sm:max-w-[725px]',
        xl: 'sm:max-w-[825px]',
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(e);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={sizeClasses[size]}>
                <DialogHeader className="mb-4 border-b pb-4 shadow-sm">
                    <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm text-gray-600">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form Content & Actions */}
                    <div className="max-h-[85vh] overflow-y-auto no-scrollbar px-1 space-y-6">
                        <div>
                            {children}
                        </div>

                        {/* Form Actions */}
                        <DialogFooter className="gap-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#00adef] hover:bg-[#00adef]/90 text-white"
                            >
                                {isSubmitting ? 'Saving...' : submitLabel}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
