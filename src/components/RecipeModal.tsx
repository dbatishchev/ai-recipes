import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: {
    name: string;
    description: string;
    ingredients: { name: string, amount: string }[];
    instructions: string[];
    preview: string;
  };
}

export function RecipeModal({ isOpen, onClose, recipe }: RecipeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle>{recipe.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4 max-h-[80vh] h-[80vh]">
          <div className="space-y-4">
            <div>
              <img src={recipe.preview} alt={recipe.name} />
            </div>
            <div>
              {recipe.description}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Ingredients:</h3>
              <ul className="flex flex-col gap-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-xl">•</span>
                    <div>
                      <span className="font-semibold text-lg">{ingredient.name}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{ingredient.amount}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside flex flex-col gap-2">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          </div>
        </ScrollArea>
        <Button onClick={onClose} className="mt-4 flex-none">Close</Button>
      </DialogContent>
    </Dialog>
  );
}