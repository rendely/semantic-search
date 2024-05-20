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
        target.value = response[0].value;
        target.style.backgroundColor = 'cyan';
    });

}
document.addEventListener('focus', handleFocus, true);

function handleFocus(e) {
    const query = e.target.parentElement.innerText;
    console.log(query);
    classify(query, e.target);
}