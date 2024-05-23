import { pipeline, env } from '@xenova/transformers';
import {data} from './data.js';

// Skip initial check for local models, since we are not loading any local models.
env.allowLocalModels = false;

// Due to a bug in onnxruntime-web, we must disable multithreading for now.
// See https://github.com/microsoft/onnxruntime/issues/14445 for more information.
env.backends.onnx.wasm.numThreads = 1;

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

data.map(async (d) => {
    d.embed = await classify(d.key);
    return d
});


////////////////////// Message Events /////////////////////
// 
// Listen for messages from the UI, process it, and send the result back.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === 'save') {
        console.log('Saving',message);
        const newData = message.save;

        // Check if that key already exists, if yes update value
        const oldData = data.find(d => d.key === newData.key)
        if (oldData){
            oldData.value = newData.value;
            (async function () {oldData.embed = await classify(newData.key)})();
            sendResponse(oldData);
            return;
        }
        
        // Else push the new value
        (async function () {newData.embed = await classify(newData.key)})();
        data.push(newData);
        sendResponse(newData);
    }

    if (message.action === 'classify') {
        console.log(data);

        // Run model prediction asynchronously
        (async function () {
            // Perform classification

            let result = await classify(message.text);

            const results = await Promise.all(
                data.map(async (d) => {
                    d.score = cosineSimilarity(result.data, d.embed.data);
                    return d
                })
            );
            results.sort((a, b) => b.score - a.score)

            sendResponse(results.slice(0, 5));

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