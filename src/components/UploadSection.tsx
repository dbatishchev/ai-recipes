'use client'

import { Button } from "@/components/ui/button"
import { UploadIcon, CameraIcon } from '@/components/Icons'
import { useState } from 'react'
import { analyzeGroceryPhoto } from '@/app/actions'

export default function UploadSection({ onAnalysisComplete }: { onAnalysisComplete: (result: any) => void }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAndAnalyze(file);
    }
  };

  const uploadAndAnalyze = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await analyzeGroceryPhoto(formData);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Error uploading file:', error);
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
        <div className="flex items-center justify-center bg-muted rounded-lg p-8">
          <Button size="lg" variant="outline" disabled={isUploading} onClick={() => document.getElementById('fileInput')?.click()} className="mr-4">
            <UploadIcon className="w-6 h-6 mr-2" />
            <label className="cursor-pointer">
              {isUploading ? 'Uploading...' : 'Upload Photos'}
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept="image/*" 
                capture="environment"
                disabled={isUploading} 
                id="fileInput" 
              />
            </label>
          </Button>
          <Button size="lg" variant="outline" disabled={isUploading} onClick={() => document.getElementById('cameraInput')?.click()}>
            <CameraIcon className="w-6 h-6 mr-2" />
            Take Photo
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              accept="image/*" 
              capture="user"
              disabled={isUploading} 
              id="cameraInput" 
            />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <img
              key={i}
              src="/placeholder.svg"
              alt="Grocery Image"
              width={200}
              height={200}
              className="aspect-square object-cover rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  )
}