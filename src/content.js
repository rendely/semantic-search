// content.js - the content scripts which is run in the context of web pages, and has access
// to the DOM and other web APIs.

// Example usage:
function classify(query, target, isLucky = false) {
    const message = {
        action: 'classify',
        text: query,
    }
    chrome.runtime.sendMessage(message, (response) => {
        // console.log('received user data', response);
        const answer =  response[(isLucky ? 0 : ansIndex)].value;
        console.log(query, answer, ansIndex);
        target.value = answer;
        target.style.backgroundColor = 'cyan';
        ansIndex++;
        if (ansIndex > 4) ansIndex = 0;
    });

}

document.addEventListener('keydown', (e) => {
    if (e.key === 'i' && e.metaKey){
        autofillElement({target: document.activeElement})
    }
    if (e.key === 'u' && e.metaKey){
        const inputs = document.querySelectorAll('input');
        const textInputs = Array.from(inputs).filter(i => i.type === 'text');
        textInputs.forEach(t => autofillElement({target: t}))
    }
},true);

let ansIndex = 0;

document.addEventListener('focus', (e) => ansIndex = 0, true);

document.addEventListener('blur', saveInputs, true);


function getElementQuery(target){
    const parentString = target.parentElement.innerText;
    const grandparentString = target.parentElement.parentElement.innerText;
    const placeholder = target.placeholder;
    const query = (parentString.length < 4 ? grandparentString : parentString) + placeholder;
    return query;
}

function autofillElement(e) {
    const query = getElementQuery(e.target);
    classify(query, e.target, true);
}

function saveInputs(e){
    if (e.target.nodeName !== 'INPUT' && e.target.type !== 'text') return 
    const key = getElementQuery(e.target);
    const value = e.target.value;
    const message = {
        action: 'save',
        save: {key, value},
    }
    chrome.runtime.sendMessage(message, (response) => {
        console.log(response);
    });
}