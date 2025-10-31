'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';

interface ImageUploadProps {
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  existingImages?: string[];
}

export default function ImageUpload({
  onUploadSuccess,
  onUploadError,
  multiple = false,
  maxFiles = 5,
  existingImages = [],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const [previewImages, setPreviewImages] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max files limit
    if (multiple && uploadedImages.length + files.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);

    try {
      if (multiple) {
        // Upload multiple images
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append('images[]', file);
        });

        const response = await api.post('/v1/vendor/images/upload-multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          const newImages = response.data.data.map((img: any) => img.full_url);
          setUploadedImages([...uploadedImages, ...newImages]);
          setPreviewImages([...previewImages, ...newImages]);
          onUploadSuccess?.(newImages[0]);
        }
      } else {
        // Upload single image
        const formData = new FormData();
        formData.append('image', files[0]);

        const response = await api.post('/v1/vendor/images/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          const imageUrl = response.data.data.full_url;
          setUploadedImages([imageUrl]);
          setPreviewImages([imageUrl]);
          onUploadSuccess?.(imageUrl);
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      onUploadError?.(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setPreviewImages(newPreviews);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || (!multiple && uploadedImages.length >= 1)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || (!multiple && uploadedImages.length >= 1) || (multiple && uploadedImages.length >= maxFiles)}
          className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Uploading...</span>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📸</div>
              <div className="text-sm font-medium text-gray-700">
                {multiple ? `Click to upload images (max ${maxFiles})` : 'Click to upload image'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                JPEG, PNG, JPG, GIF, WEBP (max 5MB)
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Image Previews */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
              >
                ✕
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-indigo-600 text-white text-xs font-semibold rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Info */}
      {multiple && uploadedImages.length > 0 && (
        <div className="text-sm text-gray-600">
          {uploadedImages.length} of {maxFiles} images uploaded
        </div>
      )}
    </div>
  );
}

