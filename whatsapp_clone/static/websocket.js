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
const user = document.getElementById('profile-pic')
const user_id = user.getAttribute('data-user')

async function display_chat(contact, messages){
    const contact_name_display = document.getElementById('contact-name')
    const chat_messages_display = document.getElementById('chat-messages')

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




socket.addEventListener('open', () => {

    new_message_input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && new_message_input.value !== ''){
            //socket.send(`${localStorage.getItem('receiver_username')}chat_message${user_id}${new_message_input.value}`)
            socket.send(JSON.stringify({
                'type':'message',
                'message': new_message_input.value,
                'receiver_username': localStorage.getItem('receiver_username'),
                'sender_user_id': user_id
            }))
            //create_message_html(new_message_input.value)
            new_message_input.value = ''}})
    
    chats.forEach( chat => {
        chat.onclick = function(){
        chat.dataset.messages = chat.dataset.messages.replace('[', '')
        chat.dataset.messages = chat.dataset.messages.replace(']', '')
        chat.dataset.messages = chat.dataset.messages.replace(',', '')
        display_chat(chat.dataset.contact, chat.dataset.messages.split(' '))
        //socket.send(`reconnect${chat.dataset.chat}`)
        socket.send(JSON.stringify({
            'type':'reconnect',
            'reconnect_to': chat.dataset.chat
        }))
        localStorage.setItem('receiver_username', chat.dataset.contact)

    }})

})

socket.addEventListener('message', (event) => {
    console.log('message from server', event.data , 'type:', event.type)
    let message
    let sender_id
    if (event.data.includes('chat_message')){
        message = event.data.replace('chat_message', '')
        sender_id = message[0]
        message = message.replace(sender_id, '')
        create_message_html(message, user_id === sender_id)}

    else if (event.data.includes('chat_notification')){
        message = event.data.replace('chat_notification', '')
        sender_id = message[0]
        message = message.replace(sender_id, '')
        //create_message_html(message, user_id === sender_id)
        alert(message)
        console.warn(message)
        console.log(message)}


})

socket.addEventListener('error', (error) => {
    console.error(error)
})