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
        const score = response[(isLucky ? 0 : ansIndex)].score;
        console.log(query, answer, score, ansIndex);
        if (!isLucky || score > 0.4){
            target.value = answer + ` (${score.toPrecision(2)})`;
            target.style.backgroundColor = 'cyan';
            ansIndex++;
        }
        if (ansIndex > 4) ansIndex = 0;
    });

}

document.addEventListener('keydown', (e) => {
    console.log('keydown');
    if (e.key === 'i' && e.metaKey){
        autofillElement({target: document.activeElement})
    }
    if (e.key === 'u' && e.metaKey){
        const inputs = document.querySelectorAll('input, textarea');
        const textInputs = Array.from(inputs).filter(i => i.type === 'text' || i.type === 'email' || i.nodeName === 'TEXTAREA');
        textInputs.forEach(t => autofillElement({target: t},true));
        const checkboxInputs =  Array.from(inputs).filter(i => i.type === 'checkbox');
        console.log(checkboxInputs)
        checkboxInputs.forEach(c => autoFillCheckbox({target: c},true))

    }
    if (e.key === 'j' && e.metaKey){
        saveInputs(document.activeElement)
    }
},true);

let ansIndex = 0;

document.addEventListener('focus', (e) => ansIndex = 0, true);

document.addEventListener('blur', (e) => saveInputs(e.target), true);


function getElementQuery(target){
    const parentString = target.parentElement.innerText;
    const grandparentString = target.parentElement.parentElement.innerText;
    const placeholder = target.placeholder;
    const query = (parentString.length < 4 ? grandparentString : parentString) + placeholder;
    return query;
}


function autoFillCheckbox(c){
    console.log(c.target);
}

function autofillElement(e, isLucky=false) {
    const query = getElementQuery(e.target);
    classify(query, e.target,isLucky);
}

function saveInputs(target){
    if ((target.nodeName !== 'INPUT' && target.nodeName !== 'TEXTAREA')) return 
    if ((target.nodeName === 'INPUT' && target.type !== 'text')) return 
    const key = getElementQuery(target);
    const value = target.value;
    if (key.length < 4 || value.length < 2) return
    const message = {
        action: 'save',
        save: {key, value},
    }
    chrome.runtime.sendMessage(message, (response) => {
        console.log(response);
    });
    target.style.backgroundColor = 'red';
}