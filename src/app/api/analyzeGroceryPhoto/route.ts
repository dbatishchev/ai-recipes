import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 600;
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

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
                    }`
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

    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    const jsonStartIndex = content.indexOf('{');
    const jsonEndIndex = content.lastIndexOf('}') + 1;
    const jsonContent = content.slice(jsonStartIndex, jsonEndIndex);

    return NextResponse.json(JSON.parse(jsonContent));
  } catch (error) {
    console.error("Error analyzing the image:", error);
    return NextResponse.json({ error: 'Error analyzing the image' }, { status: 500 });
  }
}