import { pipeline } from '@xenova/transformers';

const answerer = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');

const question = 'What is the KTN number?';
const context = `
First Name: John
Last Name: Snow
Date of Birth: 1990-05-15
Gender: Male
Marital Status: Single
Phone Number: +1 (555) 123-4567
Email: john.snow@example.com
Address: 123 Winterfell Lane, Castle Black, The North, Westeros, 01010
Social Security Number (SSN): 123-45-6789


Health Insurance: 123456
Primary Care Physician: Dr. Maester Aemon
Allergies: Penicillin
Current Medications: None
Blood Type: O+
Emergency Contact: Arya Stark (+1 (555) 987-6543)


Current Employer: Night's Watch
Job Title: Lord Commander
Department: Defence
Work Email: john.snow@thenightswatch.org
Work Phone Number: +1 (555) 890-1234
Office Address: The Wall, Castle Black, The North, Westeros, 01010


Highest Degree Obtained: Bachelor of Arms
University: The Citadel
Graduation Year: 2012
Major: Battle Tactics and Leadership


Passport Number: W12345678
Nationality: Westerosi
Frequent Flyer Number: Royal Air: 56789-123
Known Traveler Number (KTN): KTN1234567890
Preferred Airlines: Royal Air, Dragonfly Air
Destination Preferences: Dragonstone, King's Landing, Winterfell


Bank Name: Iron Bank of Braavos
Account Number: 000123456789
Routing Number: 110000000
Credit Card Type: Visa
Credit Card Number: 4111 1111 1111 1111
Expiration Date: 01/25
CVV: 123


LinkedIn: [linkedin.com/in/johnsnow](https://linkedin.com/in/johnsnow)
Twitter: [@johnsnow_nw](https://twitter.com/johnsnow_nw)
Facebook: [facebook.com/john.snow.nightswatch](https://facebook.com/john.snow.nightswatch)
Instagram: [@lordcommander_snow](https://instagram.com/lordcommander_snow)


Favorite Food: Roast Direwolf
Hobbies: Swordfighting, Horse Riding, Exploring the North
Pet Name: Ghost
Pet Type: Direwolf
Languages Spoken: Common Tongue, Dothraki, Valyrian`

const output = await answerer(question, context, {topk:2} );

console.log(output)

const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
const output2 = await extractor('This is a simple test.', { pooling: 'mean', normalize: true });

const output3 = await extractor('This is a complicated problem.', { pooling: 'mean', normalize: true });

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

console.log(cosineSimilarity(output2.data, output3.data)); // Output: 0.9746318461970762