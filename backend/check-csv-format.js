import fs from 'fs';

// Read first line to count headers
const content = fs.readFileSync('./ml/career_guidance_dataset.csv', 'utf-8');
const headerLine = content.split('\n')[0];
const headers = headerLine.split(',');

console.log(`Total headers: ${headers.length}\n`);
console.log('Headers:');
headers.forEach((h, i) => {
  console.log(`${i}: ${h.substring(0, 40)}`);
});

// Now count commas in first data row to understand structure
const firstDataLine = content.split('\n')[1];
const commas = (firstDataLine.match(/,/g) || []).length;
console.log(`\nFirst row has ${commas} commas`);
console.log(`Expected ${headers.length - 1} commas based on headers\n`);

// Show where the mismatch is
const expectedCommas = headers.length - 1;
if (commas !== expectedCommas) {
  console.log(`⚠️ Mismatch: ${commas} commas but ${headers.length} headers`);
  console.log('This CSV file needs proper parsing!');
}
