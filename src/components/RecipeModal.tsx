import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string;
  };
}

export function RecipeModal({ isOpen, onClose, recipe }: RecipeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{recipe.title}</DialogTitle>
          <DialogDescription>{recipe.description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="font-semibold">Ingredients:</h3>
          <ul className="list-disc list-inside">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">Instructions:</h3>
          <p>{recipe.instructions}</p>
        </div>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </DialogContent>
    </Dialog>
  );
}