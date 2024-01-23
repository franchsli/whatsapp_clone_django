import { get, post, create_message_html, modifyNotification, display_chat, switch_collapse } from  './tools.js';

console.log("websocket.js is loaded!");
const user = document.getElementById('profile-pic')
const user_id = user.getAttribute('data-user')
const new_message_input = document.getElementById('new-message') 
const socket = new WebSocket(`ws://${window.location.host}/`)
const collapse_buttons = document.querySelectorAll('.collapse-switch')
const chat_form = document.getElementById("chat-creation-form")
const contact_form = document.getElementById("contact-creation-form")

/**
 * Sends a message to the websocket for creating the desired instance using the given form data.
 * @param {HTMLFormElement} form The HTML form element that contains all the inputs data to be set to the websocket.
 * @param {String} instance_type A string telling the websocket consumer what type of instance it should create.
 * @returns {false} Returns false avoiding form submission.
 */
function create_instance(form, instance_type){
    const form_elements = form.elements
    console.log(form_elements)
    if (instance_type === 'create_chat'){
        for (let index = 0; index < form_elements.length; index++) {
            let element = form_elements[index];
    
            if (element.checked){
                console.log(`This element: ${element} is checked with id: ${element.id} and name ${element.dataset.contactName}`)
                socket.send(JSON.stringify({
                    //'type': 'create_chat',
                    'type': instance_type,
                    'contact_name': element.dataset.contactName,
                    'contact_phone_number': element.id
                }))}}}
    else {
        socket.send(JSON.stringify({
            'type': instance_type,
            'contact_name': form_elements[1].value,
            'contact_phone_number': form_elements[2].value
        }))
    }


    return false;
}

window.summon_chat = function(chat){
    chat.dataset.messages = chat.dataset.messages.replace('[', '')
    chat.dataset.messages = chat.dataset.messages.replace(']', '')
    chat.dataset.messages = chat.dataset.messages.replaceAll(',', '')
    display_chat(chat.dataset.contact, chat.querySelector('img'), chat.dataset.messages.split(' '))

    socket.send(JSON.stringify({
        'type':'reconnect',
        'reconnect_to': chat.dataset.chat
    }))
    localStorage.setItem('receiver_username', chat.dataset.contact)
    localStorage.setItem('chat_id', chat.dataset.chat)
    localStorage.setItem('contact_phone_number', chat.dataset.contactPhone)
    
}

collapse_buttons.forEach(button => {
    button.onclick = function(){
        switch_collapse()
    }
})

socket.addEventListener('open', () => {

    new_message_input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && new_message_input.value !== ''){
            socket.send(JSON.stringify({
                'type':'message',
                'message': new_message_input.value,
                'receiver_username': localStorage.getItem('receiver_username'),
                'sender_user_id': user_id,
                'chat_id': localStorage.getItem('chat_id'),
                'contact_phone_number': localStorage.getItem('contact_phone_number')
            }))
            
            new_message_input.value = ''}})
    


    chat_form.onsubmit = (event) => {
        event.preventDefault()
        create_instance(chat_form, 'create_chat')
    }

    contact_form.onsubmit = (event) => {
        event.preventDefault()
        create_instance(contact_form, 'create_contact')
    }


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
