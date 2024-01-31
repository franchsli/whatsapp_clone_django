async function get(url){
    const response = await fetch(url)
    const data = response.json()
    return data
}

function post(url, data){
    const csrf_token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'content-type':'aplication/json', 
        'X-CSRFToken': csrf_token }
    })
    .then(response => console.log(response.json))
    .catch(error => console.log(error.message))
}

/**
 * Moves the scrollbar  at the bottom of the messages in chat.
 */
function scroll_to_bottom(){
    const messages = document.getElementById('chat-messages')
    messages.scroll(0, 100000)

}
/**
 * Manipulates the notification toast in the HTML
 * @param {String} contact_name The name of the contact who sent the message.
 * @param {*} message The text of the message that was sent.
 */
function modifyNotification(contact_name, message){
    const toastNotification = document.getElementById('liveToast')
    let contact_name_display = toastNotification.querySelector('strong')
    let message_display = toastNotification.querySelector('.toast-body')
    contact_name_display.innerHTML = contact_name
    message_display.innerHTML = message

}


/**
 * Unshowns all the actual showing collapses in the HTML.
 */
function switch_collapse(){
    const collapse_parts = document.querySelectorAll('.collapse')
    collapse_parts.forEach(collapse => {
        if (collapse.classList.contains('show')){
            collapse.classList.remove('show')
        }
        
    });
}



export {get, post, modifyNotification, switch_collapse, scroll_to_bottom}