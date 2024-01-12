import { get } from  './apitools.js';
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

const new_message_input = document.getElementById('new-message') 
const socket = new WebSocket(`ws://${window.location.host}/`)
const chats = document.querySelectorAll('.chat')
const chat_display = document.getElementById('chat-display')
const chat_messages_display = document.getElementById('chat-messages')



socket.addEventListener('open', () => {

    new_message_input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && new_message_input.value !== ''){
            socket.send(`chat_message${new_message_input.value}`)
            create_message_html(new_message_input.value)
            new_message_input.value = ''}})
    
    chats.forEach( chat => {
        chat.onclick = function(){
        chat.dataset.messages = chat.dataset.messages.replace('[', '')
        chat.dataset.messages = chat.dataset.messages.replace(']', '')
        chat.dataset.messages = chat.dataset.messages.replace(',', '')
        display_chat(chat.dataset.contact, chat.dataset.messages.split(' '))
        socket.send(`reconnect${chat.dataset.chat}`)

    }})

})

socket.addEventListener('message', (event) => {
    console.log('message from server', event.data , 'type:', event.type)
    create_message_html(event.data.replace('chat_message', ''), false)

})