'use server'

import { OpenAI } from 'openai';
import * as fs from 'fs';

export const runtime = 'edge'; // Add this line to use Edge Runtime
export const maxDuration = 300; // Set max duration to 5 minutes (300 seconds)

export async function analyzeGroceryPhoto(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64Image = buffer.toString('base64');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
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
      throw new Error('No response from OpenAI');
    }

    const responseText = response.choices[0].message.content;
    if (!responseText) {
      console.error("No response from OpenAI");
      return;
    }

    // Extract JSON content from the response
    const jsonStartIndex = responseText.indexOf('{');
    const jsonEndIndex = responseText.lastIndexOf('}') + 1;
    const jsonContent = responseText.slice(jsonStartIndex, jsonEndIndex);

    return JSON.parse(jsonContent);
  } catch (error) {
    console.error("Error analyzing the image:", error);
    throw error;
  }
}