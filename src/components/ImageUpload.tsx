import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { imagesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  category?: string;
  singleMode?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  category = 'products',
  singleMode = false
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const result = await imagesApi.upload(file);
      if (singleMode) {
        onImagesChange([result.image.url]);
      } else {
        const newImages = [...images, result.image.url];
        onImagesChange(newImages);
      }
      toast({
        title: 'Image uploaded',
        description: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = () => {
    const newImages = [...images, ''];
    onImagesChange(newImages);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    onImagesChange(newImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const filteredImages = images.filter(img => img.trim() !== '');

  return (
    <div className="space-y-4">
      <Label>Images ({filteredImages.length}/{maxImages})</Label>

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || (!singleMode && filteredImages.length >= maxImages)}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        {!singleMode && (
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlAdd}
            disabled={filteredImages.length >= maxImages}
          >
            Add URL
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Image display */}
      {singleMode ? (
        // Single image mode
        <div className="space-y-2">
          {images[0] ? (
            <div className="flex items-center gap-2 p-2 border rounded">
              {images[0].startsWith('http') ? (
                <>
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={images[0]}
                    onChange={(e) => onImagesChange([e.target.value])}
                    placeholder="Image URL"
                    className="flex-1"
                  />
                </>
              ) : (
                <>
                  <img
                    src={images[0]}
                    alt="Uploaded image"
                    className="w-10 h-10 object-cover rounded border"
                  />
                  <span className="text-sm text-muted-foreground flex-1 truncate">
                    {images[0].split('/').pop()}
                  </span>
                </>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onImagesChange([''])}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Input
              value=""
              onChange={(e) => onImagesChange([e.target.value])}
              placeholder="Image URL"
            />
          )}
        </div>
      ) : (
        // Multiple images mode
        <div className="space-y-2">
          {images.map((image, index) => (
            <div key={index} className="flex items-center gap-2">
              {image.startsWith('http') ? (
                // URL input
                <div className="flex-1 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={image}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="Image URL"
                    className="flex-1"
                  />
                </div>
              ) : image ? (
                // Uploaded image preview
                <div className="flex-1 flex items-center gap-2">
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-10 h-10 object-cover rounded border"
                  />
                  <span className="text-sm text-muted-foreground flex-1 truncate">
                    {image.split('/').pop()}
                  </span>
                </div>
              ) : (
                // Empty URL input
                <Input
                  value={image}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="Image URL"
                  className="flex-1"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};