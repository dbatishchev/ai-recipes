'use client'

import { Button } from "@/components/ui/button"
import { UploadIcon } from '@/components/Icons'
import { useState, useRef } from 'react'

export default function UploadSection({ onAnalysisComplete }: { onAnalysisComplete: (result: any) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newImages = Array.from(selectedFiles).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
      setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
    }
  };

  const analyzePhotos = async () => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files[]', file);
    });
    try {
      const response = await fetch('/api/analyzeGroceryPhotos', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to analyze photos');
      }
      const result = await response.json();
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Error analyzing photos:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">Upload Your Groceries</h2>
      <p className="text-muted-foreground">
        Take photos of your groceries and we will identify the ingredients and provide recipe suggestions.
      </p>
      <div className="grid gap-4">
        <div className="flex items-center justify-center bg-muted rounded-lg p-8 flex-wrap gap-4">
          <Button size="lg" variant="outline" className="w-48">
            <label className="cursor-pointer flex items-center justify-center gap-2">
            <UploadIcon className="w-6 h-6 mr-2" />
              Upload Photos
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept="image/*" 
                multiple
              />
            </label>
          </Button>
          {files.length > 0 && (
            <Button size="lg" onClick={analyzePhotos} disabled={isUploading}>
              {isUploading ? 'Analyzing...' : 'Analyze Photos'}
            </Button>
          )}
        </div>
        {uploadedImages && (
          <div className="grid grid-cols-3 gap-4">
            {uploadedImages.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Uploaded Grocery Image ${index + 1}`}
                width={200}
                height={200}
                className="aspect-square object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}