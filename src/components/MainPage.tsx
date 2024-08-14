'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import UploadSection from '@/components/UploadSection'
import IngredientsSection from '@/components/IngredientsSection'
import RecipesSection from '@/components/RecipesSection'

export function MainPage() {
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalysisComplete = (result: any) => {
    console.log("Analysis complete", result);
    setAnalysisResult(result);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-6">
        <div className="grid gap-8">
          <UploadSection onAnalysisComplete={handleAnalysisComplete} />
          {analysisResult && (
            <>
              <IngredientsSection ingredients={analysisResult.ingredients} />
              <RecipesSection 
                recipes={analysisResult.recipes} 
                additionalRecipes={analysisResult.additional_recipes} 
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}