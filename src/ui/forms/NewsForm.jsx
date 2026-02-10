/* eslint-disable react/prop-types */
import React, { useState } from 'react';
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
import { Upload } from 'lucide-react';

/**
 * NewsForm - Form component for News/Article entity
 * 
 * @param {object} formData - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {object} errors - Validation errors object
 */
export function NewsForm({ formData = {}, onChange, errors = {} }) {
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange?.({ ...formData, [name]: value });
    };

    const handleSelectChange = (name, value) => {
        onChange?.({ ...formData, [name]: value });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange?.({ ...formData, thumbnail: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onChange?.({ ...formData, newsGallery: files });

            // Create previews
            const previews = [];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    previews.push(reader.result);
                    if (previews.length === files.length) {
                        setGalleryPreviews(previews);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleStatusChange = (value) => {
        onChange?.({ ...formData, status: value });
    };

    return (
        <div className="space-y-4">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div
                    className="border-2 border-dashed border-sky-400 bg-sky-50 rounded-lg p-8 text-center cursor-pointer hover:bg-sky-100/50 transition-colors"
                    onClick={() => document.getElementById('news-thumbnail').click()}
                >
                    {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="mx-auto max-h-32 rounded" />
                    ) : (
                        <>
                            <img src="/upload-placeholder.png" alt="Upload" className="mx-auto h-12 w-12 mb-2" />
                            <p className="text-sm text-sky-600 font-medium">Upload vertical icon or select from library</p>
                        </>
                    )}
                </div>
                <Input
                    id="news-thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                />
                {errors.thumbnail && (
                    <p className="text-sm text-red-500">{errors.thumbnail}</p>
                )}
            </div>

            {/* News Gallery Upload */}
            <div className="space-y-2">
                <Label>News Gallery</Label>
                <div
                    className="border-2 border-dashed border-sky-400 bg-sky-50 rounded-lg p-8 text-center cursor-pointer hover:bg-sky-100/50 transition-colors"
                    onClick={() => document.getElementById('news-gallery').click()}
                >
                    {galleryPreviews.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {galleryPreviews.map((preview, idx) => (
                                <img key={idx} src={preview} alt={`Gallery ${idx + 1}`} className="h-20 w-full object-cover rounded" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <img src="/upload-placeholder.png" alt="Upload" className="mx-auto h-12 w-12 mb-2" />
                            <p className="text-sm text-sky-600 font-medium">Upload vertical icon or select from library</p>
                        </>
                    )}
                </div>
                <Input
                    id="news-gallery"
                    name="newsGallery"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                />
                {errors.newsGallery && (
                    <p className="text-sm text-red-500">{errors.newsGallery}</p>
                )}
            </div>

            {/* Article Title */}
            <div className="space-y-2">
                <Label htmlFor="articleTitle">Article Title</Label>
                <Input
                    id="articleTitle"
                    name="articleTitle"
                    placeholder="Enter article title..."
                    value={formData.articleTitle || ''}
                    onChange={handleChange}
                />
                {errors.articleTitle && (
                    <p className="text-sm text-red-500">{errors.articleTitle}</p>
                )}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                    value={formData.category || ''}
                    onValueChange={(value) => handleSelectChange('category', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Company News" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="company-news">Company News</SelectItem>
                        <SelectItem value="industry-news">Industry News</SelectItem>
                        <SelectItem value="press-release">Press Release</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                </Select>
                {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                )}
            </div>

            {/* Author Name */}
            <div className="space-y-2">
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                    id="authorName"
                    name="authorName"
                    placeholder="Enter author name..."
                    value={formData.authorName || ''}
                    onChange={handleChange}
                />
                {errors.authorName && (
                    <p className="text-sm text-red-500">{errors.authorName}</p>
                )}
            </div>

            {/* Article Excerpt */}
            <div className="space-y-2">
                <Label htmlFor="articleExcerpt">Article Excerpt</Label>
                <Textarea
                    id="articleExcerpt"
                    name="articleExcerpt"
                    placeholder="Write your article excerpt here..."
                    value={formData.articleExcerpt || ''}
                    onChange={handleChange}
                    rows={3}
                />
                {errors.articleExcerpt && (
                    <p className="text-sm text-red-500">{errors.articleExcerpt}</p>
                )}
            </div>

            {/* Sub Article Content */}
            <div className="space-y-2">
                <Label htmlFor="subArticleContent">Sub Article Content</Label>
                <Textarea
                    id="subArticleContent"
                    name="subArticleContent"
                    placeholder="Write your article content here..."
                    value={formData.subArticleContent || ''}
                    onChange={handleChange}
                    rows={4}
                />
                {errors.subArticleContent && (
                    <p className="text-sm text-red-500">{errors.subArticleContent}</p>
                )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                    id="tags"
                    name="tags"
                    placeholder="Add tags separated by commas..."
                    value={formData.tags || ''}
                    onChange={handleChange}
                />
                {errors.tags && (
                    <p className="text-sm text-red-500">{errors.tags}</p>
                )}
            </div>

            {/* Publish Date */}
            <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                    id="publishDate"
                    name="publishDate"
                    type="date"
                    value={formData.publishDate || ''}
                    onChange={handleChange}
                />
                {errors.publishDate && (
                    <p className="text-sm text-red-500">{errors.publishDate}</p>
                )}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                    value={formData.status || 'published'}
                    onValueChange={handleStatusChange}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="published" id="news-published" />
                        <Label htmlFor="news-published" className="font-normal cursor-pointer">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="news-draft" />
                        <Label htmlFor="news-draft" className="font-normal cursor-pointer">Draft</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="scheduled" id="news-scheduled" />
                        <Label htmlFor="news-scheduled" className="font-normal cursor-pointer">Scheduled</Label>
                    </div>
                </RadioGroup>
                {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                )}
            </div>
        </div>
    );
}
