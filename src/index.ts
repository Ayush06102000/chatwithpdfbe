import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeEmbeddings } from "@langchain/pinecone";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenAI } from "@google/genai";
import fs from 'fs'


require('dotenv').config()
const ai = new GoogleGenAI({ apiKey: process.env. GOOGLE_API_KEY});
//@ts-ignore
async function main(pdfPath,query){ 

    const path = pdfPath;

    const loader = new PDFLoader(path);
    
    const docs = await loader.load();
    console.log(docs)
    const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 5000,
  chunkOverlap: 50,
});


const splittedDocs = await textSplitter.splitDocuments(docs);

function countTokens(text: string): number {
  return text.split(/\s+/).length;
}

// const texts = splittedDocs
//   .map(doc => doc.pageContent)
//   .filter(text => countTokens(text) <= 96); // Prevent oversized inputs


const embeddings = new PineconeEmbeddings({
  model: "multilingual-e5-large",
}); 

// const singleVector = await embeddings.embedDocuments(texts);


const vectorStore = await MemoryVectorStore.fromDocuments(
  splittedDocs,
  embeddings
);


// You can now perform similarity search like this:
const results = await vectorStore.similaritySearch(query, 3);

   const customPrompt = `Based on the following prompt explain the question if question doesn't belong to the prompt respond with question doesnot belong to pdf if belong give answer only  no next line anything and only give answer in a professional and easy language related to prompt   Question is ${query}`;

  const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: customPrompt +"\n\n"+ results.map(doc => doc.pageContent).join("\n\n"),
        },
      ],
    },
  ],
});
console.log(response.text)
return  response.text;

}

export default main;



  


