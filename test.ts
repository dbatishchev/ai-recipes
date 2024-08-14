import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

console.log(process.env.OPENAI_API_KEY);

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this environment variable
});

async function analyzeGroceryPhoto(imagePath: string) {
  try {
    // Read the image file and encode it to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", 
              text: `
                    You are now a cooking advisor. I'm trying to save money and use the ingredients I have. THOROUGHLY analyze all the ingredients visible in all of these images, list out every single one that you can see. Be very thorough and identify every single ingredient visible. There should be dozens of items you list out.
                    Then after you make the list use the list to make and give me a list of several recipes I can make with what's on hand. Include a few recipes I could make with $10 or less of more ingredients from the supermarket.  
                    Provide the response in the following JSON format:
                    {
                      "ingredients": ["ingredient1", "ingredient2", ...],
                      "recipes": [
                        {
                          "name": "Recipe Name",
                          "description": "Brief description of the recipe",
                          "ingredients": ["ingredient1", "ingredient2", ...],
                          "instructions": "Brief cooking instructions"
                        },
                        ...
                      ],
                      "additional_recipes": [
                        {
                          "name": "Recipe Name",
                          "description": "Brief description of the recipe",
                          "ingredients": ["ingredient1", "ingredient2", ...],
                          "instructions": "Brief cooking instructions"
                        },
                        ...
                      ]
                    }
                `,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 3000,
    });

    console.log("Identified grocery products:");
    console.log(response.choices[0].message.content);

    const responseText = response.choices[0].message.content;
    if (!responseText) {
      console.error("No response from OpenAI");
      return;
    }

    // Extract JSON content from the response
    const jsonStartIndex = responseText.indexOf('{');
    const jsonEndIndex = responseText.lastIndexOf('}') + 1;
    const jsonContent = responseText.slice(jsonStartIndex, jsonEndIndex);

    console.log("!!!!");
    console.log(jsonContent);

    // Parse the extracted JSON content
    const parsedResponse = JSON.parse(jsonContent);

    // Extract ingredients and recipes
    const { ingredients, recipes } = parsedResponse;

    // Log the parsed data
    console.log("Identified ingredients:");
    console.log(ingredients);

    console.log("\nSuggested recipes:");
    recipes.forEach((recipe: any, index: number) => {
      console.log(`\nRecipe ${index + 1}: ${recipe.name}`);
      console.log(`Description: ${recipe.description}`);
      console.log("Ingredients:", recipe.ingredients.join(", "));
      console.log(`Instructions: ${recipe.instructions}`);
    });

    // Return the parsed data for further use if needed
    return parsedResponse;
  } catch (error) {
    console.error("Error analyzing the image:", error);
  }
}

// Path to your image file
const imagePath = path.join(__dirname, 'grocery_photo.jpg');

async function main() {
  // Run the analysis
  const groceriesAndRecipes = await analyzeGroceryPhoto(imagePath);
  // Generate images for each recipe
  if (groceriesAndRecipes && groceriesAndRecipes.recipes) {
    console.log("\nGenerating images for recipes...");
    for (const recipe of groceriesAndRecipes.recipes) {
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `A high-quality, appetizing photo of ${recipe.name}. The description of the dish is: ${recipe.description}. The dish should look professionally plated and well-lit, showcasing the key ingredients and final presentation.`,
          n: 1,
          size: "1024x1024",
        });

        if (imageResponse.data && imageResponse.data[0].url) {
          console.log(`Generated image for ${recipe.name}: ${imageResponse.data[0].url}`);
          fs.writeFileSync(path.join(__dirname, `recipe_${recipe.name}.jpg`), imageResponse.data[0].url);
          console.log(`Saved image for ${recipe.name} to ${path.join(__dirname, `recipe_${recipe.name}.jpg`)}`);
        } else {
          console.log(`Failed to generate image for ${recipe.name}`);
        }
      } catch (error) {
        console.error(`Error generating image for ${recipe.name}:`, error);
      }
    }
  } else {
    console.log("No recipes found to generate images for.");
  }
}

main().catch(console.error);