import React, { useState } from 'react';
import { DeleteModal } from '@/ui/modals/DeleteModal';
import { FormModal } from '@/ui/modals/FormModal';
import {
    TeamForm,
    ServiceForm,
    ProjectForm,
    MediaForm,
    CertificateForm,
    CounterForm,
    NewsForm,
    PartnerForm,
    FAQForm,
    TestimonialForm
} from '@/ui';
import { Button } from '@/ui/button';

/**
 * ModalExamples - Demonstration page showing how to use all modal components
 */
export default function ModalExamples() {
    // Modal visibility states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteMediaModalOpen, setDeleteMediaModalOpen] = useState(false);
    const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);
    const [editServiceModalOpen, setEditServiceModalOpen] = useState(false);
    const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
    const [addMediaModalOpen, setAddMediaModalOpen] = useState(false);
    const [addCertificateModalOpen, setAddCertificateModalOpen] = useState(false);
    const [addCounterModalOpen, setAddCounterModalOpen] = useState(false);
    const [addNewsModalOpen, setAddNewsModalOpen] = useState(false);
    const [addPartnerModalOpen, setAddPartnerModalOpen] = useState(false);
    const [addFAQModalOpen, setAddFAQModalOpen] = useState(false);
    const [addTestimonialModalOpen, setAddTestimonialModalOpen] = useState(false);

    // Form data states
    const [teamFormData, setTeamFormData] = useState({});
    const [serviceFormData, setServiceFormData] = useState({
        title: 'Web Development',
        category: 'web-development',
        description: 'Professional web development services',
    });
    const [projectFormData, setProjectFormData] = useState({});
    const [mediaFormData, setMediaFormData] = useState({});
    const [certificateFormData, setCertificateFormData] = useState({});
    const [counterFormData, setCounterFormData] = useState({});
    const [newsFormData, setNewsFormData] = useState({});
    const [partnerFormData, setPartnerFormData] = useState({});
    const [faqFormData, setFAQFormData] = useState({});
    const [testimonialFormData, setTestimonialFormData] = useState({});

    // Loading states
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete handlers
    const handleDelete = async () => {
        setIsDeleting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('Item deleted');
        setIsDeleting(false);
        setDeleteModalOpen(false);
    };

    // Generic submit handler
    const handleSubmit = (formName, formData, setModalOpen, setFormData) => async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log(`${formName} submitted:`, formData);
        setIsSubmitting(false);
        setModalOpen(false);
        setFormData({});
    };

    return (
        <div className="container mx-auto px-4">
            <div className="mx-auto  space-y-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold">Modal Components Examples</h1>
                    <p className="mt-2 text-gray-600">
                        Click the buttons below to see all form modal components in action.
                    </p>
                </div>

                {/* Example Buttons Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Delete Modal Example */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">Delete Modal</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Confirmation modal for delete operations.
                        </p>
                        <div className="space-y-2">
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteModalOpen(true)}
                                className="w-full"
                            >
                                Open Delete Modal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteMediaModalOpen(true)}
                                className="w-full"
                            >
                                Delete Media Example
                            </Button>
                        </div>
                    </div>

                    {/* Add Team Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">Team Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Add team member with image upload.
                        </p>
                        <Button
                            onClick={() => setAddTeamModalOpen(true)}
                            className="w-full"
                        >
                            Add Team Member
                        </Button>
                    </div>

                    {/* Edit Service Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">Service Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Service with thumbnail and gallery.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setEditServiceModalOpen(true)}
                            className="w-full"
                        >
                            Edit Service
                        </Button>
                    </div>

                    {/* Add Project Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">Project Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Project with comprehensive fields.
                        </p>
                        <Button
                            onClick={() => setAddProjectModalOpen(true)}
                            className="w-full"
                        >
                            Add Project
                        </Button>
                    </div>

                    {/* Add Media Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">Media Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Gallery/video management form.
                        </p>
                        <Button
                            onClick={() => setAddMediaModalOpen(true)}
                            className="w-full"
                        >
                            Add Media
                        </Button>
                    </div>

                    {/* Add Certificate Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">Certificate Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            PDF upload with drag-and-drop.
                        </p>
                        <Button
                            onClick={() => setAddCertificateModalOpen(true)}
                            className="w-full"
                        >
                            Add Certificate
                        </Button>
                    </div>

                    {/* Add Counter Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">Counter Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Statistics/counter management.
                        </p>
                        <Button
                            onClick={() => setAddCounterModalOpen(true)}
                            className="w-full"
                        >
                            Add Counter
                        </Button>
                    </div>

                    {/* Add News Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">News Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Article publishing with full content.
                        </p>
                        <Button
                            onClick={() => setAddNewsModalOpen(true)}
                            className="w-full"
                        >
                            Publish Article
                        </Button>
                    </div>

                    {/* Add Partner Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">Partner Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Partner with PDF/image upload.
                        </p>
                        <Button
                            onClick={() => setAddPartnerModalOpen(true)}
                            className="w-full"
                        >
                            Add Partner
                        </Button>
                    </div>

                    {/* Add FAQ Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">FAQ Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Frequently Asked Questions management.
                        </p>
                        <Button
                            onClick={() => setAddFAQModalOpen(true)}
                            className="w-full"
                        >
                            Add FAQ
                        </Button>
                    </div>

                    {/* Add Testimonial Modal */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-xl font-semibold">Testimonial Form</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Client testimonials with drag-and-drop.
                        </p>
                        <Button
                            onClick={() => setAddTestimonialModalOpen(true)}
                            className="w-full"
                        >
                            Add Testimonial
                        </Button>
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                    <h3 className="mb-2 text-lg font-semibold text-blue-900">
                        How to Use These Components
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>
                            <strong>DeleteModal:</strong> Import and pass entityName, itemName, and onConfirm callback.
                        </li>
                        <li>
                            <strong>FormModal:</strong> Wrap any form component and handle submission via onSubmit.
                        </li>
                        <li>
                            <strong>Form Components:</strong> Pass formData and onChange to control form state.
                        </li>
                        <li>
                            All modals use controlled state with open/onOpenChange props.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Modal Instances */}

            {/* Delete Modal */}
            <DeleteModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={handleDelete}
                entityName="Team"
                itemName="ISO 9001:2015 Quality Management"
                description="This action cannot be undone. The certificate will be permanently removed."
                isDeleting={isDeleting}
            />

            {/* Delete Media Modal */}
            <DeleteModal
                open={deleteMediaModalOpen}
                onOpenChange={setDeleteMediaModalOpen}
                onConfirm={() => {
                    setIsDeleting(true);
                    setTimeout(() => {
                        setIsDeleting(false);
                        setDeleteMediaModalOpen(false);
                    }, 1500);
                }}
                entityName="Media"
                itemName="Foundation Construction Progress"
                description="This media file will be permanently removed from your gallery. This action cannot be undone."
                isDeleting={isDeleting}
                image="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=600"
            />

            {/* Add Team Modal */}
            <FormModal
                open={addTeamModalOpen}
                onOpenChange={setAddTeamModalOpen}
                onSubmit={handleSubmit('Team', teamFormData, setAddTeamModalOpen, setTeamFormData)}
                title="Upload New Team"
                isSubmitting={isSubmitting}
                submitLabel="Save Team"
            >
                <TeamForm
                    formData={teamFormData}
                    onChange={setTeamFormData}
                />
            </FormModal>

            {/* Edit Service Modal */}
            <FormModal
                open={editServiceModalOpen}
                onOpenChange={setEditServiceModalOpen}
                onSubmit={handleSubmit('Service', serviceFormData, setEditServiceModalOpen, setServiceFormData)}
                title="Edit Service"
                isSubmitting={isSubmitting}
                submitLabel="Update Service"
                size="lg"
            >
                <ServiceForm
                    formData={serviceFormData}
                    onChange={setServiceFormData}
                />
            </FormModal>

            {/* Add Project Modal */}
            <FormModal
                open={addProjectModalOpen}
                onOpenChange={setAddProjectModalOpen}
                onSubmit={handleSubmit('Project', projectFormData, setAddProjectModalOpen, setProjectFormData)}
                title="Add New Project"
                isSubmitting={isSubmitting}
                submitLabel="Create Project"
                size="lg"
            >
                <ProjectForm
                    formData={projectFormData}
                    onChange={setProjectFormData}
                />
            </FormModal>

            {/* Add Media Modal */}
            <FormModal
                open={addMediaModalOpen}
                onOpenChange={setAddMediaModalOpen}
                onSubmit={handleSubmit('Media', mediaFormData, setAddMediaModalOpen, setMediaFormData)}
                title="Add New Media"
                isSubmitting={isSubmitting}
                submitLabel="Upload Media"
                size="lg"
            >
                <MediaForm
                    formData={mediaFormData}
                    onChange={setMediaFormData}
                />
            </FormModal>

            {/* Add Certificate Modal */}
            <FormModal
                open={addCertificateModalOpen}
                onOpenChange={setAddCertificateModalOpen}
                onSubmit={handleSubmit('Certificate', certificateFormData, setAddCertificateModalOpen, setCertificateFormData)}
                title="Add New Certificate"
                isSubmitting={isSubmitting}
                submitLabel="Save Certificate"
            >
                <CertificateForm
                    formData={certificateFormData}
                    onChange={setCertificateFormData}
                />
            </FormModal>

            {/* Add Counter Modal */}
            <FormModal
                open={addCounterModalOpen}
                onOpenChange={setAddCounterModalOpen}
                onSubmit={handleSubmit('Counter', counterFormData, setAddCounterModalOpen, setCounterFormData)}
                title="Add New Counter"
                isSubmitting={isSubmitting}
                submitLabel="Save Counter"
            >
                <CounterForm
                    formData={counterFormData}
                    onChange={setCounterFormData}
                />
            </FormModal>

            {/* Add News Modal */}
            <FormModal
                open={addNewsModalOpen}
                onOpenChange={setAddNewsModalOpen}
                onSubmit={handleSubmit('News', newsFormData, setAddNewsModalOpen, setNewsFormData)}
                title="Publish New Article"
                isSubmitting={isSubmitting}
                submitLabel="Publish Article"
                size="lg"
            >
                <NewsForm
                    formData={newsFormData}
                    onChange={setNewsFormData}
                />
            </FormModal>

            {/* Add Partner Modal */}
            <FormModal
                open={addPartnerModalOpen}
                onOpenChange={setAddPartnerModalOpen}
                onSubmit={handleSubmit('Partner', partnerFormData, setAddPartnerModalOpen, setPartnerFormData)}
                title="Upload New Partner"
                isSubmitting={isSubmitting}
                submitLabel="Save Partner"
            >
                <PartnerForm
                    formData={partnerFormData}
                    onChange={setPartnerFormData}
                />
            </FormModal>

            {/* Add FAQ Modal */}
            <FormModal
                open={addFAQModalOpen}
                onOpenChange={setAddFAQModalOpen}
                onSubmit={handleSubmit('FAQ', faqFormData, setAddFAQModalOpen, setFAQFormData)}
                title="Add New FAQ"
                isSubmitting={isSubmitting}
                submitLabel="Save FAQ"
                size="lg"
            >
                <FAQForm
                    formData={faqFormData}
                    setFormData={setFAQFormData}
                />
            </FormModal>

            {/* Add Testimonial Modal */}
            <FormModal
                open={addTestimonialModalOpen}
                onOpenChange={setAddTestimonialModalOpen}
                onSubmit={handleSubmit('Testimonial', testimonialFormData, setAddTestimonialModalOpen, setTestimonialFormData)}
                title="Upload New Testimonial"
                isSubmitting={isSubmitting}
                submitLabel="Save Testimonial"
            >
                <TestimonialForm
                    formData={testimonialFormData}
                    setFormData={setTestimonialFormData}
                />
            </FormModal>
        </div>
    );
}
