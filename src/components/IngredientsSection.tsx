export default function IngredientsSection({ ingredients }: { ingredients: { name: string, amount: string }[] }) {
  return (
    <div className="grid gap-6 pt-4 pb-4">
      <h2 className="text-2xl font-bold">Your Ingredients</h2>
      <p className="text-muted-foreground text-lg">
        Based on the photos you uploaded, here are the ingredients we identified.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredients.map((ingredient, index) => (
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
  )
}