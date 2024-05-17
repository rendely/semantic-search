import { pipeline } from '@xenova/transformers';

const answerer = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');
const question = 'Insurance number?';
const context = 'Health insurance: 123456\nFirst name: John\nLast name: Snow';
const output = await answerer(question, context);

console.log(output)

const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
const output2 = await extractor('This is a simple test.', { pooling: 'mean', normalize: true });

const output3 = await extractor('This is a complicated problem.', { pooling: 'mean', normalize: true });

console.log(output2.data)

function cosineSimilarity(arr1, arr2) {
if (arr1.length !== arr2.length) {
throw new Error('Arrays must be of the same length.');
}

let dotProduct = 0;
let magnitudeA = 0;
let magnitudeB = 0;

for (let i = 0; i < arr1.length; i++) {
dotProduct += arr1[i] * arr2[i];
magnitudeA += arr1[i] * arr1[i];
magnitudeB += arr2[i] * arr2[i];
}

magnitudeA = Math.sqrt(magnitudeA);
magnitudeB = Math.sqrt(magnitudeB);

if (magnitudeA === 0 || magnitudeB === 0) {
throw new Error('One of the arrays is zero-length.');
}

return dotProduct / (magnitudeA * magnitudeB);
}

// Example usage:
const arr1 = new Float32Array([1, 2, 3]);
const arr2 = new Float32Array([4, 5, 6]);

console.log(cosineSimilarity(output2.data, output3.data)); // Output: 0.9746318461970762