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
 * Creates all the HTML code for a message and adds it to the current opened chat.
 * @param {*} text The text of the message.
 * @param {String} image_src The path of the image.
 * @param {Boolean} sent_by_auth_user True if the one who sent the message is the actual authenticated user, False otherwise.
 */
function create_message_html(text, image_src="undefined", sent_by_auth_user=true){
    const messages = document.getElementById('chat-messages')
    const message_container = document.createElement('div')
    const new_message = document.createElement('li')
    const message_text = document.createElement('span')
    const message_image = document.createElement('img')

    // display the message image
    message_image.classList.add('mw-100', 'mh-100')
    message_image.src = image_src
    message_image.alt = ''
    // set the style acording to who sent the message
    if (sent_by_auth_user){new_message.classList.add('list-unstyled-item', 'me-3', 'mt-3', 'rounded', 'message', 'user-message')}
    else {new_message.classList.add('list-unstyled-item', 'me-3', 'mt-3', 'rounded', 'message', 'contact-message')}
    message_container.classList.add('d-flex', 'flex-column', 'p-2')
    // display the message text
    message_text.innerText = text

    message_container.appendChild(message_image)
    message_container.appendChild(message_text)
    new_message.appendChild(message_container)
    messages.appendChild(new_message)
    messages.scroll(0, 10000)

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
 * Displays the chat and it's messages in the HTML.
 * @param {String} contact The name of the contact.
 * @param {HTMLImageElement} contact_photo The contact's HTML image.
 * @param {Array} messages An array of the message's ids in the chat. 
 */
async function display_chat(contact, contact_photo, messages){
    const contact_name_display = document.getElementById('contact-name')
    const contact_photo_display = document.getElementById('contact-picture')
    const chat_messages_display = document.getElementById('chat-messages')
    const user = document.getElementById('profile-pic')
    const user_id = user.getAttribute('data-user')
    contact_name_display.innerHTML = contact
    contact_photo_display.src = contact_photo.src
    let message_data
    let cleaned = false

    if (messages[0] !== ''){
        for (let index = 0; index < messages.length; index++) {
            let message_id = messages[index];
            message_data = await get(`/api/messages/${message_id}`)
            if (!cleaned) {
                chat_messages_display.innerHTML = ''
                cleaned = true}
            console.log(message_data.image)
            create_message_html(message_data.text, message_data.image, message_data.sender_user === parseInt(user_id))}
    }
    else{
        if (!cleaned) {
            chat_messages_display.innerHTML = ''
            cleaned = true}
    }

    
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



export {get, post, create_message_html, modifyNotification, display_chat, switch_collapse}