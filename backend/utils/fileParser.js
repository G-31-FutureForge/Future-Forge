import fs from 'fs/promises';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const parseFile = async (filePath) => {
  try {
    console.log('Parsing file:', filePath);
    const buffer = await fs.readFile(filePath);
    console.log('File size:', buffer.length, 'bytes');

    // Check if the file is a PDF by content (magic number)
    if (buffer.slice(0, 5).toString('ascii').startsWith('%PDF-')) {
      console.log('Processing as PDF file');
      try {
        // Resolve pdf-parse robustly across ESM/CJS shapes
        // Use CommonJS resolution through createRequire (reliable across Node versions)
        let pdfParseFn = require('pdf-parse');
        // Normalize odd export shapes just in case
        if (pdfParseFn && typeof pdfParseFn !== 'function') {
          if (typeof pdfParseFn.default === 'function') {
            pdfParseFn = pdfParseFn.default;
          } else if (pdfParseFn.pdfParse && typeof pdfParseFn.pdfParse === 'function') {
            pdfParseFn = pdfParseFn.pdfParse;
          }
        }

        console.log('pdf-parse resolved type:', typeof pdfParseFn);

        if (typeof pdfParseFn !== 'function') {
          console.warn('pdf-parse not resolved as function, falling back to pdfjs-dist');
          // Fallback: parse with pdfjs (loaded dynamically to avoid startup errors)
          let pdfjs;
          try {
            pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
          } catch (e1) {
            try {
              pdfjs = await import('pdfjs-dist');
            } catch (e2) {
              try {
                pdfjs = await import('pdfjs-dist/build/pdf.js');
              } catch (e3) {
                throw new Error('pdfjs-dist not available for fallback parsing');
              }
            }
          }
          const typed = (typeof Buffer !== 'undefined' && Buffer.isBuffer(buffer))
            ? new Uint8Array(buffer)
            : (buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer));
          const doc = await pdfjs.getDocument({ data: typed }).promise;
          let text = '';
          for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
            const page = await doc.getPage(pageNum);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(' ') + '\n';
          }
          return text;
        }

        const pdfData = await pdfParseFn(buffer);
        console.log('✅ PDF parsing successful');
        console.log('Extracted text length:', pdfData.text.length);
        return pdfData.text;
      } catch (pdfError) {
        console.error('❌ PDF parsing error:', pdfError);
        // Final fallback to pdfjs in case pdf-parse failed at runtime
        try {
          let pdfjs;
          try {
            pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
          } catch (e1) {
            try {
              pdfjs = await import('pdfjs-dist');
            } catch (e2) {
              pdfjs = await import('pdfjs-dist/build/pdf.js');
            }
          }
          const typed = (typeof Buffer !== 'undefined' && Buffer.isBuffer(buffer))
            ? new Uint8Array(buffer)
            : (buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer));
          const doc = await pdfjs.getDocument({ data: typed }).promise;
          let text = '';
          for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
            const page = await doc.getPage(pageNum);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(' ') + '\n';
          }
          console.log('✅ PDF parsing successful via pdfjs fallback');
          return text;
        } catch (fallbackErr) {
          console.error('❌ PDF parsing fallback error:', fallbackErr);
          throw new Error('Failed to parse PDF: ' + (fallbackErr.message || pdfError.message));
        }
      }
    }

    // For non-PDF files, treat as UTF-8 text.
    console.log('Processing as text file');
    const text = buffer.toString('utf-8');
    console.log('Extracted text length:', text.length);
    return text;
  } catch (error) {
    console.error('❌ Error parsing file:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};
