async function get(url){
    const response = await fetch(url)
    const data = response.json()
    return data
}

function create_message_html(text, user_message=true){
    const messages = document.getElementById('chat-messages')
    const new_message = document.createElement('li')
    const message_text = document.createElement('span')
    if (user_message){new_message.classList.add('list-unstyled-item', 'me-3', 'mt-3', 'rounded', 'message', 'user-message')}
    else {new_message.classList.add('list-unstyled-item', 'me-3', 'mt-3', 'rounded', 'message', 'contact-message')}
    message_text.classList.add('p-2')
    message_text.innerHTML = text
    new_message.appendChild(message_text)
    messages.appendChild(new_message)
    messages.scroll(0, 10000)

}
function modifyNotification(contact_name, message){
    const toastNotification = document.getElementById('liveToast')
    let contact_name_display = toastNotification.querySelector('strong')
    let message_display = toastNotification.querySelector('.toast-body')
    contact_name_display.innerHTML = contact_name
    message_display.innerHTML = message

}

async function display_chat(contact, messages){
    const contact_name_display = document.getElementById('contact-name')
    const chat_messages_display = document.getElementById('chat-messages')
    const user = document.getElementById('profile-pic')
    const user_id = user.getAttribute('data-user')

    contact_name_display.innerHTML = contact
    let message_data

    let cleaned = false
    for (let index = 0; index < messages.length; index++) {
        let message_id = messages[index];
        message_data = await get(`/api/messages/${message_id}/`)
        console.log(message_data)
        console.log(message_data.text)
        console.log(typeof(message_data.sender_user))
        console.log(typeof(parseInt(user_id)))
        if (!cleaned) {
            chat_messages_display.innerHTML = ''
            cleaned = true}
        create_message_html(message_data.text, message_data.sender_user === parseInt(user_id))
        
    }
}

export {get, create_message_html, modifyNotification, display_chat}