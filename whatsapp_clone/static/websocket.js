import { get, create_message_html, modifyNotification, display_chat } from  './tools.js';

const user = document.getElementById('profile-pic')
const user_id = user.getAttribute('data-user')
const user_username = user.getAttribute('data-username')
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

socket.addEventListener('message',async (event) => {
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
        //alert(message)
        let sender_user_data = await get(`/api/users/${sender_id}`)

        console.warn(message)
        console.log(message)
        const toastNotification = document.getElementById('liveToast')
        modifyNotification(sender_user_data.username, message)
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
        toastBootstrap.show()
    }


})

socket.addEventListener('error', (error) => {
    console.error(error)
})
