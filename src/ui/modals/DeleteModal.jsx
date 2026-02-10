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
import { FiAlertTriangle } from 'react-icons/fi';

/**
 * DeleteModal - Reusable delete confirmation modal
 * 
 * @param {boolean} open - Controls modal visibility
 * @param {function} onOpenChange - Callback when modal open state changes
 * @param {function} onConfirm - Callback when delete is confirmed
 * @param {string} entityName - Name of the entity being deleted (e.g., "Team", "Service")
 * @param {string} itemName - Specific item name/title being deleted
 * @param {string} description - Warning description text
 * @param {boolean} isDeleting - Loading state during delete operation
 */
export function DeleteModal({
    open,
    onOpenChange,
    onConfirm,
    entityName = 'Item',
    itemName = '',
    image,
    description = 'This action cannot be undone. The item will be permanently removed.',
    isDeleting = false,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="mb-4 items-center space-y-4 border-b pb-4 shadow-sm">
                    {/* Warning Icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                        <FiAlertTriangle className="h-6 w-6 text-red-600" />
                    </div>

                    {/* Title */}
                    <DialogTitle className="text-center text-xl font-semibold">
                        Delete {entityName}?
                    </DialogTitle>

                    {/* Description */}
                    <DialogDescription className="text-center text-sm text-gray-600">
                        {description}
                    </DialogDescription>

                    {/* Item Name Display */}
                    {itemName && (
                        <div className="w-full text-center font-medium text-gray-900">
                            {itemName}
                        </div>
                    )}

                    {/* Image Preview */}
                    {image && (
                        <div className="relative h-48 w-full overflow-hidden rounded-md bg-gray-100">
                            <img
                                src={image}
                                alt="Item to delete"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                </DialogHeader>

                <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
