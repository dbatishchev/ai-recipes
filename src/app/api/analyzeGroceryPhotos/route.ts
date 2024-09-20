import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 600;
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files[]') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const base64Images = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
      })
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", 
              text: `You are now a cooking advisor. I'm trying to save money and use the ingredients I have. THOROUGHLY analyze all the ingredients visible in all of these images, list out every single one that you can see. Be very thorough and identify every single ingredient visible. There should be dozens of items you list out.
                    Then after you make the list use the list to make and give me a list of several recipes I can make with what's on hand. Include a few recipes I could make with $10 or less of more ingredients from the supermarket.  
                    Provide the response in the following JSON format:
                    {
                      "ingredients": [{ "name": "ingredient1", "amount": "amount1" }, { "name": "ingredient2", "amount": "amount2" }, ...],
                      "recipes": [
                        {
                          "name": "Recipe Name",
                          "description": "Brief description of the recipe",
                          "ingredients": [{ "name": "ingredient1", "amount": "amount1" }, { "name": "ingredient2", "amount": "amount2" }, ...],
                          "instructions": ["instruction1", "instruction2", ...]
                        },
                        ...
                      ]
                    }`
            },
            // @ts-ignore
            ...base64Images.map(base64Image => ({
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            })),
          ],
        },
      ],
      max_tokens: 4096,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    const jsonStartIndex = content.indexOf('{');
    const jsonEndIndex = content.lastIndexOf('}') + 1;
    const jsonContent = content.slice(jsonStartIndex, jsonEndIndex);

    console.log(jsonContent);

    // generate previews for each recipe
    const analysisResult = JSON.parse(jsonContent);
    const recipes = [...analysisResult.recipes];
    const previews = await Promise.all(recipes.map(async (recipe: any) => {
      return await generateImage(recipe.name, recipe.description);
    }));
    recipes.forEach((recipe: any, index: number) => {
      recipe.preview = previews[index];
    });

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error analyzing the images: ", error);
    return NextResponse.json({ error: 'Error analyzing the images' }, { status: 500 });
  }
}

const generateImage = async (name: string, description: string) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `${name}, food photography, warm light`;

    const imageResponse = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    if (imageResponse.data && imageResponse.data[0].url) {
      return imageResponse.data[0].url;
    } else {
      console.log(`Failed to generate image for ${name}`);
      return null;
    }
  } catch (error) {
    console.error(`Error generating image for ${name}:`, error);
    return null;
  }
}