# Modal Components Documentation

This guide explains how to use the reusable modal components in your NextTech Admin project.

## Overview

We have created two main modal components and three example form components:

**Modal Components:**
- `DeleteModal` - For delete confirmations
- `FormModal` - For Add/Edit operations

**Form Components (Examples):**
- `TeamForm` - Team member form
- `ServiceForm` - Service form
- `ProjectForm` - Project form

## Installation

All components are already created in your project. Import them as needed:

```javascript
import { DeleteModal, FormModal } from '@/components';
import { TeamForm, ServiceForm, ProjectForm } from '@/components';
```

## Usage Examples

### 1. DeleteModal

Use this for delete confirmations with a warning dialog.

```javascript
import { useState } from 'react';
import { DeleteModal } from '@/components';
import { Button } from '@/components/ui/button';

function YourPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Your delete API call here
    await api.delete('/team/123');
    setIsDeleting(false);
    setDeleteModalOpen(false);
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={() => setDeleteModalOpen(true)}
      >
        Delete
      </Button>

      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        entityName="Team"
        itemName="John Doe - Software Engineer"
        description="This action cannot be undone. The team member will be permanently removed."
        isDeleting={isDeleting}
      />
    </>
  );
}
```

**DeleteModal Props:**
- `open` (boolean) - Controls visibility
- `onOpenChange` (function) - Callback when open state changes
- `onConfirm` (function) - Called when user confirms deletion
- `entityName` (string) - Type of entity (e.g., "Team", "Service")
- `itemName` (string) - Specific item being deleted
- `description` (string) - Warning message
- `isDeleting` (boolean) - Shows loading state

### 2. FormModal (Add Mode)

Use this to add new items.

```javascript
import { useState } from 'react';
import { FormModal } from '@/components';
import { TeamForm } from '@/components';
import { Button } from '@/components/ui/button';

function YourPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Your create API call here
    await api.post('/team', formData);
    setIsSubmitting(false);
    setAddModalOpen(false);
    setFormData({}); // Reset form
  };

  return (
    <>
      <Button onClick={() => setAddModalOpen(true)}>
        Add Team Member
      </Button>

      <FormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleSubmit}
        title="Add Team Member"
        description="Fill in the details below to add a new team member."
        isSubmitting={isSubmitting}
        submitLabel="Add Member"
      >
        <TeamForm
          formData={formData}
          onChange={setFormData}
        />
      </FormModal>
    </>
  );
}
```

### 3. FormModal (Edit Mode)

Use this to edit existing items.

```javascript
import { useState, useEffect } from 'react';
import { FormModal } from '@/components';
import { ServiceForm } from '@/components';
import { Button } from '@/components/ui/button';

function YourPage({ serviceId }) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing data when modal opens
  useEffect(() => {
    if (editModalOpen) {
      // Fetch service data
      api.get(`/services/${serviceId}`).then(data => {
        setFormData(data);
      });
    }
  }, [editModalOpen, serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Your update API call here
    await api.put(`/services/${serviceId}`, formData);
    setIsSubmitting(false);
    setEditModalOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setEditModalOpen(true)}
      >
        Edit
      </Button>

      <FormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSubmit={handleSubmit}
        title="Edit Service"
        description="Update the service information below."
        isSubmitting={isSubmitting}
        submitLabel="Update Service"
      >
        <ServiceForm
          formData={formData}
          onChange={setFormData}
        />
      </FormModal>
    </>
  );
}
```

**FormModal Props:**
- `open` (boolean) - Controls visibility
- `onOpenChange` (function) - Callback when open state changes
- `onSubmit` (function) - Form submission handler
- `title` (string) - Modal title
- `description` (string, optional) - Subtitle/description
- `children` (React.ReactNode) - Form component
- `isSubmitting` (boolean) - Shows loading state
- `submitLabel` (string) - Custom submit button text (default: "Save")
- `size` (string) - Modal size: "sm", "md", "lg", "xl" (default: "md")

## Creating Your Own Form Components

You can create custom form components for your entities. Here's a template:

```javascript
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function YourCustomForm({ formData = {}, onChange, errors = {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange?.({ ...formData, [name]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fieldName">
          Field Label <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fieldName"
          name="fieldName"
          placeholder="Enter value"
          value={formData.fieldName || ''}
          onChange={handleChange}
          required
        />
        {errors.fieldName && (
          <p className="text-sm text-red-500">{errors.fieldName}</p>
        )}
      </div>
      
      {/* Add more fields as needed */}
    </div>
  );
}
```

## Best Practices

1. **State Management**: Always use controlled state for modals and forms
2. **Loading States**: Use `isDeleting`/`isSubmitting` to disable buttons and show feedback
3. **Form Reset**: Clear form data after successful submission (Add mode)
4. **Error Handling**: Pass errors object to form components for validation feedback
5. **Accessibility**: All components include proper ARIA labels and keyboard navigation

## Live Demo

Visit `/modal-examples` to see all components in action with interactive examples.

## Component Files

- Modal Components: `/src/components/modals/`
- Form Components: `/src/components/forms/`
- Example Page: `/src/pages/ModalExamples.jsx`
