import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const file = files.file as formidable.File;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const buffer = fs.readFileSync(file.filepath);
      const base64Image = buffer.toString('base64');

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
        return res.status(500).json({ error: 'No response from OpenAI' });
      }

      const jsonStartIndex = content.indexOf('{');
      const jsonEndIndex = content.lastIndexOf('}') + 1;
      const jsonContent = content.slice(jsonStartIndex, jsonEndIndex);

      return res.status(200).json(JSON.parse(jsonContent));
    });
  } catch (error) {
    console.error("Error analyzing the image:", error);
    return res.status(500).json({ error: 'Error analyzing the image' });
  }
}