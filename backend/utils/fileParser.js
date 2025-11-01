import fs from 'fs/promises';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse'); 

export const parseFile = async (filePath) => {
  try {
    console.log('Parsing file:', filePath);
    const buffer = await fs.readFile(filePath);
    console.log('File size:', buffer.length, 'bytes');

    if (filePath.toLowerCase().endsWith('.pdf')) {
      console.log('Processing as PDF file');
      try {
        const pdfData = await pdfParse(buffer);
        console.log('✅ PDF parsing successful');
        console.log('Extracted text length:', pdfData.text.length);
        return pdfData.text;
      } catch (pdfError) {
        console.error('❌ PDF parsing error:', pdfError);
        throw new Error('Failed to parse PDF: ' + pdfError.message);
      }
    }

    console.log('Processing as text file');
    const text = buffer.toString('utf-8');
    console.log('Extracted text length:', text.length);
    return text;
  } catch (error) {
    console.error('❌ Error parsing file:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};
