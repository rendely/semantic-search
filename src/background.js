// background.js - Handles requests from the UI, runs the model, then sends back a response

import { pipeline, env } from '@xenova/transformers';


const data = [
    { "key": "First Name", "value": "John" },
    { "key": "Last Name", "value": "Snow" },
    { "key": "Date of Birth", "value": "1990-05-15" },
    { "key": "Gender", "value": "Male" },
    { "key": "Marital Status", "value": "Single" },
    { "key": "Phone", "value": "+1 (555) 123-4567" },
    { "key": "Phone number", "value": "+1 (555) 123-4567" },
    { "key": "Mobile", "value": "+1 (555) 123-4567" },
    { "key": "Email", "value": "john.snow@example.com" },
    { "key": "Why do you want to work here", "value": "Excited about opportunity" },
    { "key": "Address", "value": "123 Winterfell Lane, Castle Black, The North, Westeros, 01010" },
    { "key": "City", "value": "Castle Black" },
    { "key": "Country", "value": "The North" },
    { "key": "Social Security Number (SSN)", "value": "123-45-6789" },
    { "key": "Health Insurance", "value": "123456" },
    { "key": "Primary Care Physician", "value": "Dr. Maester Aemon" },
    { "key": "Allergies", "value": "Penicillin" },
    { "key": "Current Medication", "value": "None" },
    { "key": "Blood Type", "value": "O+" },
    { "key": "Emergency Contact", "value": "Arya Stark (+1 (555) 987-6543)" },
    { "key": "Current Employer", "value": "Night's Watch" },
    { "key": "Job Title", "value": "Lord Commander" },
    { "key": "Department", "value": "Defence" },
    { "key": "Compensation", "value": "$100k" },
    { "key": "Salary", "value": "$100k" },
    { "key": "Desired salary", "value": "$100k" },
    { "key": "Work Email", "value": "john.snow@thenightswatch.org" },
    { "key": "Work Phone Number", "value": "+1 (555) 890-1234" },
    { "key": "Office Address", "value": "The Wall, Castle Black, The North, Westeros, 01010" },
    { "key": "Highest Degree Obtained", "value": "Bachelor of Arms" },
    { "key": "Earliest start date, begin date", "value": "July 2024" },
    { "key": "Times available to work", "value": "Mon-Fri 9am to 5pm" },
    { "key": "University", "value": "The Citadel" },
    { "key": "Graduation Year", "value": "2012" },
    { "key": "Major", "value": "Battle Tactics and Leadership" },
    { "key": "Passport Number", "value": "W12345678" },
    { "key": "Nationality", "value": "Westerosi" },
    { "key": "Frequent Flyer Number", "value": "56789-123" },
    { "key": "Known Traveler Number (KTN)", "value": "KTN1234567890" },
    { "key": "Preferred Airlines", "value": "Royal Air, Dragonfly Air" },
    { "key": "Destination Preferences", "value": "Dragonstone, King's Landing, Winterfell" },
    { "key": "Bank Name", "value": "Iron Bank of Braavos" },
    { "key": "Account Number", "value": "000123456789" },
    { "key": "Routing Number", "value": "110000000" },
    { "key": "Credit Card Type", "value": "Visa" },
    { "key": "Credit Card Number", "value": "4111 1111 1111 1111" },
    { "key": "Expiration Date", "value": "01/25" },
    { "key": "CVV", "value": "123" },
    { "key": "LinkedIn", "value": "https://linkedin.com/in/johnsnow" },
    { "key": "Twitter", "value": "https://twitter.com/johnsnow_nw" },
    { "key": "Facebook", "value": "https://facebook.com/john.snow.nightswatch" },
    { "key": "Instagram", "value": "https://instagram.com/lordcommander_snow" },
    { "key": "Favorite Food", "value": "Roast Direwolf" },
    { "key": "Hobbies", "value": "Swordfighting, Horse Riding, Exploring the North" },
    { "key": "Pet Name", "value": "Ghost" },
    { "key": "Pet Type", "value": "Direwolf" },
    { "key": "Languages Spoken", "value": "Common Tongue, Dothraki, Valyrian" }
]

// Skip initial check for local models, since we are not loading any local models.
env.allowLocalModels = false;

// Due to a bug in onnxruntime-web, we must disable multithreading for now.
// See https://github.com/microsoft/onnxruntime/issues/14445 for more information.
env.backends.onnx.wasm.numThreads = 1;


// const answerer = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');

// const output = await answerer('name', 'my name is matt', {topk:10} );

// console.log(output);

class PipelineSingleton {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }

        return this.instance;
    }
}

// Create generic classify function, which will be reused for the different types of events.
const classify = async (text) => {
    // Get the pipeline instance. This will load and build the model when run for the first time.
    let model = await PipelineSingleton.getInstance((data) => {
        // You can track the progress of the pipeline creation here.
        // e.g., you can send `data` back to the UI to indicate a progress bar
        // console.log('progress', data)
    });

    // Actually run the model on the input text
    let result = await model(text, { pooling: 'mean', normalize: true });
    return result;
};

classify('namess').then(r => console.log(r))

data.map(async (d) => {
    d.embed = await classify(d.key);
    return d
});

console.log(data);

// async function getData(){
//   const data1 = await classify('name');
//   const data2 = await classify('name2');
//   console.log(data1);
//   console.log(data2);
//   console.log(cosineSimilarity(data1.data, data2.data));
// }

// getData();

////////////////////// 1. Context Menus //////////////////////
//
// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
chrome.runtime.onInstalled.addListener(function () {
    // Register a context menu item that will only show up for selection text.
    chrome.contextMenus.create({
        id: 'classify-selection',
        title: 'Classify "%s"',
        contexts: ['selection'],
    });
});

// Perform inference when the user clicks a context menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    // Ignore context menu clicks that are not for classifications (or when there is no input)
    if (info.menuItemId !== 'classify-selection' || !info.selectionText) return;

    // Perform classification on the selected text
    let result = await classify(info.selectionText);

    // Do something with the result
    chrome.scripting.executeScript({
        target: { tabId: tab.id },    // Run in the tab that the user clicked in
        args: [result],               // The arguments to pass to the function
        function: (result) => {       // The function to run
            // NOTE: This function is run in the context of the web page, meaning that `document` is available.
            console.log('result', result)
            console.log('document', document)
        },
    });
});
//////////////////////////////////////////////////////////////

////////////////////// 2. Message Events /////////////////////
// 
// Listen for messages from the UI, process it, and send the result back.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('sender', sender)

    //TODO: REFACTOR
    if (message.action === 'save') {
        console.log('Saving',message);
        const newData = message.save;
        const old = data.find(d => d.key === newData.key)
        if (old){
            old.value = newData.value;
            (async function () {old.embed = await classify(newData.key)})();
            sendResponse(old);

        }
        console.log(newData);
        (async function () {newData.embed = await classify(newData.key)})();
        data.push(newData);
        console.log(data);
        sendResponse(newData);
    }

    if (message.action === 'classify') {
        console.log(data);

        // Run model prediction asynchronously
        (async function () {
            // Perform classification

            let result = await classify(message.text);
            // sendResponse({data: data, result: result})
            // console.log(result);
            // console.log(data[0]);
            const results = await Promise.all(
                data.map(async (d) => {
                    d.score = cosineSimilarity(result.data, d.embed.data);
                    return d
                })
            );
            results.sort((a, b) => b.score - a.score)
            // console.log(results.slice(0,3));
            // Send response back to UI
            sendResponse(results.slice(0, 5));
            // sendResponse(data[0].key)
        })();

        // return true to indicate we will send a response asynchronously
        // see https://stackoverflow.com/a/46628145 for more information
        return true;
    }
});
//////////////////////////////////////////////////////////////



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