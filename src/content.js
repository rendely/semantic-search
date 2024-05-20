// content.js - the content scripts which is run in the context of web pages, and has access
// to the DOM and other web APIs.

// Example usage:
function classify(query, target) {

    const message = {
        action: 'classify',
        text: query,
    }
    chrome.runtime.sendMessage(message, (response) => {
        console.log('received user data', response);
        target.value = response[ansIndex].value;
        target.style.backgroundColor = 'cyan';
        ansIndex++;
        if (ansIndex > 4) ansIndex = 0;
    });

}

document.addEventListener('keydown', (e) => {
    if (e.key === 'i' && e.metaKey){
        handleFocus({target: document.activeElement})
    }
},true);

let ansIndex = 0;

document.addEventListener('focus', (e) => ansIndex = 0, true);

// document.addEventListener('focus', handleFocus, true);

function handleFocus(e) {
    const query = e.target.parentElement.innerText + e.target.placeholder;
    console.log(query);
    classify(query, e.target);
}