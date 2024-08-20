import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RecipeModal } from "@/components/RecipeModal";

export default function RecipesSection({ recipes, additionalRecipes }: { recipes: any[], additionalRecipes: any[] }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleViewRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">Suggested Recipes</h2>
      <p className="text-muted-foreground text-lg">
        Based on the ingredients we identified, here are some recipe suggestions.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...recipes, ...additionalRecipes].map((recipe, index) => (
 <Card key={index} className="bg-card text-card-foreground p-4">
            <CardHeader>
              <CardTitle>{recipe.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-[1fr_2fr] gap-4">
              <img
                src={recipe.preview}
                alt={recipe.name}
                width={200}
                height={200}
                className="aspect-square object-cover rounded-lg"
              />
              <p>{recipe.description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" onClick={() => handleViewRecipe(recipe)}>
                View Recipe
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedRecipe && (
        <RecipeModal
          isOpen={!!selectedRecipe}
          onClose={handleCloseModal}
          recipe={selectedRecipe}
        />
      )}
    </div>
  )
}