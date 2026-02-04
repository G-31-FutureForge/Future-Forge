import fs from 'fs';

const csvText = fs.readFileSync('./ml/career_guidance_dataset.csv', 'utf-8');
const lines = csvText.split('\n');

console.log('=== CSV STRUCTURE ===\n');
console.log('HEADERS:');
console.log(lines[0]);
console.log('\n=== FIRST ROW (after10th) ===');
console.log(lines[1]);
console.log('\n=== SECOND ROW (after10th) ===');
console.log(lines[2]);
console.log('\n=== 11TH ROW (after12th) ===');
console.log(lines[11]);
