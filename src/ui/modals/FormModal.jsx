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
 * @param {object} errors - Validation errors object
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
    errors = {},
}) {
    const sizeClasses = {
        sm: 'sm:max-w-[425px]',
        md: 'sm:max-w-[525px]',
        lg: 'sm:max-w-[725px]',
        xl: 'sm:max-w-[825px]',
    };

    React.useEffect(() => {
        // Automatically scroll to the first error element when errors change
        if (errors && Object.keys(errors).length > 0) {
            setTimeout(() => {
                // Find the first element indicating an error (border or text color)
                const firstError = document.querySelector('.text-red-500, .border-red-500, .bg-red-50');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // If it's an input, focus it optionally
                    if (firstError.tagName === 'INPUT' || firstError.tagName === 'TEXTAREA') {
                        firstError.focus({ preventScroll: true });
                    }
                }
            }, 100); // Slight delay to ensure DOM has updated with error state
        }
    }, [errors]);

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
                    <div className="max-h-[85vh] overflow-y-auto px-1 space-y-6">
                        {/* General Error Banner */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm animate-in fade-in slide-in-from-top-2">
                                <span className="block sm:inline">{errors.general}</span>
                            </div>
                        )}

                        <div>
                            {children}
                        </div>

                        {/* Form Actions */}
                        <DialogFooter className="gap-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting} >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#00adef] hover:bg-[#00adef]/90 text-white">
                                {isSubmitting ? 'Saving...' : submitLabel}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
