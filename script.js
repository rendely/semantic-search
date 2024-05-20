import { pipeline } from '@xenova/transformers';

const answerer = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');

const question = 'You are on growlerz.com Custom Portal page. What should you input to the form field asking about Pet Name?';
const context = `
First Name: John.
Last Name: Snow.
Date of Birth: 1990-05-15.
Gender: Male.
Marital Status: Single.
Phone Number: +1 (555) 123-4567.
Email: john.snow@example.com.
Address: 123 Winterfell Lane, Castle Black, The North, Westeros, 01010.
Social Security Number (SSN): 123-45-6789.

Health Insurance: 123456.
Primary Care Physician: Dr. Maester Aemon.
Allergies: Penicillin.
Current Medication is None.
Blood Type is O+.
Emergency Contact: Arya Stark (+1 (555) 987-6543).

Current Employer: Night's Watch.
Job Title: Lord Commander.
Department: Defence.
Work Email: john.snow@thenightswatch.org.
Work Phone Number: +1 (555) 890-1234.
Office Address: The Wall, Castle Black, The North, Westeros, 01010.

Highest Degree Obtained: Bachelor of Arms.
University: The Citadel.
Graduation Year: 2012.
Major: Battle Tactics and Leadership.

Passport Number: W12345678.
Nationality: Westerosi.
Frequent Flyer Number: Royal Air: 56789-123.
Known Traveler Number (KTN): KTN1234567890.
Preferred Airlines: Royal Air, Dragonfly Air.
Destination Preferences: Dragonstone, King's Landing, Winterfell.

Bank Name: Iron Bank of Braavos.
Account Number: 000123456789.
Routing Number: 110000000.
Credit Card Type: Visa.
Credit Card Number: 4111 1111 1111 1111.
Expiration Date: 01/25.
CVV: 123.

LinkedIn: [linkedin.com/in/johnsnow](https://linkedin.com/in/johnsnow).
Twitter: [@johnsnow_nw](https://twitter.com/johnsnow_nw).
Facebook: [facebook.com/john.snow.nightswatch](https://facebook.com/john.snow.nightswatch).
Instagram: [@lordcommander_snow](https://instagram.com/lordcommander_snow).

Favorite Food: Roast Direwolf.
Hobbies: Swordfighting, Horse Riding, Exploring the North.
Pet Name: Ghost.
Pet Type: Direwolf.
Languages Spoken: Common Tongue, Dothraki, Valyrian`

const output = await answerer(question, context, {topk:10} );

// console.log(output)


const data = [
    {"key": "First Name", "value": "John"},
    {"key": "Last Name", "value": "Snow"},
    {"key": "Date of Birth", "value": "1990-05-15"},
    {"key": "Gender", "value": "Male"},
    {"key": "Marital Status", "value": "Single"},
    {"key": "Phone Number", "value": "+1 (555) 123-4567"},
    {"key": "Email", "value": "john.snow@example.com"},
    {"key": "Address", "value": "123 Winterfell Lane, Castle Black, The North, Westeros, 01010"},
    {"key": "Social Security Number (SSN)", "value": "123-45-6789"},
    {"key": "Health Insurance", "value": "123456"},
    {"key": "Primary Care Physician", "value": "Dr. Maester Aemon"},
    {"key": "Allergies", "value": "Penicillin"},
    {"key": "Current Medication", "value": "None"},
    {"key": "Blood Type", "value": "O+"},
    {"key": "Emergency Contact", "value": "Arya Stark (+1 (555) 987-6543)"},
    {"key": "Current Employer", "value": "Night's Watch"},
    {"key": "Job Title", "value": "Lord Commander"},
    {"key": "Department", "value": "Defence"},
    {"key": "Work Email", "value": "john.snow@thenightswatch.org"},
    {"key": "Work Phone Number", "value": "+1 (555) 890-1234"},
    {"key": "Office Address", "value": "The Wall, Castle Black, The North, Westeros, 01010"},
    {"key": "Highest Degree Obtained", "value": "Bachelor of Arms"},
    {"key": "University", "value": "The Citadel"},
    {"key": "Graduation Year", "value": "2012"},
    {"key": "Major", "value": "Battle Tactics and Leadership"},
    {"key": "Passport Number", "value": "W12345678"},
    {"key": "Nationality", "value": "Westerosi"},
    {"key": "Frequent Flyer Number", "value": "Royal Air: 56789-123"},
    {"key": "Known Traveler Number (KTN)", "value": "KTN1234567890"},
    {"key": "Preferred Airlines", "value": "Royal Air, Dragonfly Air"},
    {"key": "Destination Preferences", "value": "Dragonstone, King's Landing, Winterfell"},
    {"key": "Bank Name", "value": "Iron Bank of Braavos"},
    {"key": "Account Number", "value": "000123456789"},
    {"key": "Routing Number", "value": "110000000"},
    {"key": "Credit Card Type", "value": "Visa"},
    {"key": "Credit Card Number", "value": "4111 1111 1111 1111"},
    {"key": "Expiration Date", "value": "01/25"},
    {"key": "CVV", "value": "123"},
    {"key": "LinkedIn", "value": "https://linkedin.com/in/johnsnow"},
    {"key": "Twitter", "value": "https://twitter.com/johnsnow_nw"},
    {"key": "Facebook", "value": "https://facebook.com/john.snow.nightswatch"},
    {"key": "Instagram", "value": "https://instagram.com/lordcommander_snow"},
    {"key": "Favorite Food", "value": "Roast Direwolf"},
    {"key": "Hobbies", "value": "Swordfighting, Horse Riding, Exploring the North"},
    {"key": "Pet Name", "value": "Ghost"},
    {"key": "Pet Type", "value": "Direwolf"},
    {"key": "Languages Spoken", "value": "Common Tongue, Dothraki, Valyrian"}
    ]



const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

await Promise.all(data.map(async (d) => {
    d.embed = await extractor(d.key,  { pooling: 'mean', normalize: true });
    return d
}));

// console.log(data.slice(0,4))
const query = {key: 'LinkedIn Profile\n\n\nPlease ensure to provide either your LinkedIn profile or Resume, we require at least one of the two.'}
query.embed = await extractor(query.key,  { pooling: 'mean', normalize: true });

const results = await Promise.all(
    data.map(async (d) => {
        d.score = cosineSimilarity(query.embed.data, d.embed.data);
        return d
    })
);

results.sort((a,b) => b.score - a.score)
console.log(results.slice(0,3));

// console.log(cosineSimilarity(query.embed.data, data[9].embed.data)); // Output: 0.
// const output2 = await extractor('This is a simple test.', { pooling: 'mean', normalize: true });

// const output3 = await extractor('This is a complicated problem.', { pooling: 'mean', normalize: true });

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

// console.log(cosineSimilarity(output2.data, output3.data)); 

// Output: 0.9746318461970762