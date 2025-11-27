import React, { useRef, useState } from "react";
import { Button } from "./button";
import { X } from "lucide-react";

interface ImageInputProps {
  onImageCapture?: (file: File) => void;
  preview?: string | null;
  onPreviewChange?: (preview: string | null) => void;
}

export function ImageInput({ onImageCapture, preview, onPreviewChange }: ImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const SQUARE_SIZE = 300; // 300x300px standard size

  const cropAndSaveImage = (imageData: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = SQUARE_SIZE;
      canvas.height = SQUARE_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate crop area to fit the image in 1:1 ratio
      let srcX = 0;
      let srcY = 0;
      let srcWidth = img.width;
      let srcHeight = img.height;

      // Crop to square from center
      if (img.width > img.height) {
        srcX = (img.width - img.height) / 2;
        srcWidth = img.height;
      } else {
        srcY = (img.height - img.width) / 2;
        srcHeight = img.width;
      }

      // Draw cropped image
      ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, SQUARE_SIZE, SQUARE_SIZE);

      // Convert to blob and create file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
          onImageCapture?.(file);

          // Show preview
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            onPreviewChange?.(result);
          };
          reader.readAsDataURL(blob);
        }
      }, "image/jpeg", 0.95);

      setOriginalImage(null);
      setShowCropper(false);
    };
    img.src = imageData;
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    onPreviewChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}
        >
          <div className="space-y-2">
            <div className="text-2xl">📷</div>
            <div className="text-sm font-medium text-gray-700">
              Drag and drop your photo here
            </div>
            <div className="text-xs text-gray-500">
              or click to select (optional)
            </div>
            <div className="text-xs text-gray-400">
              Will be cropped to 1:1 ratio (300x300px)
            </div>
          </div>
        </div>
      ) : (
        <div className="relative inline-block w-full">
          <img
            src={preview}
            alt="Profile preview"
            className="w-full max-w-sm mx-auto rounded-lg border-2 border-gray-200"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-white hover:bg-red-50 text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showCropper && originalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Crop Your Photo</h3>
            <div className="flex justify-center mb-4">
              <img
                src={originalImage}
                alt="Original"
                className="max-w-xs rounded"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCropper(false);
                  setOriginalImage(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => cropAndSaveImage(originalImage)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Crop to Square
              </Button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
