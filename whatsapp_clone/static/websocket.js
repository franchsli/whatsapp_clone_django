import { get, modifyNotification, scroll_to_bottom, create_message_html, toggleReadMore, showDropdown } from  './tools.js';

console.log("websocket.js is loaded!");
const user = document.getElementById('profile-pic')
const user_id = user.getAttribute('data-user')
const socket = new WebSocket(`ws://${window.location.host}/`)
const chat_form = document.getElementById("chat-creation-form")
const chat_display = document.getElementById('chat-display')
const contact_form = document.getElementById("contact-creation-form")
const notification_audio = new Audio('static/Audio/app/message_received.mp3')
const message_sent_audio = new Audio('static/Audio/app/message_sent.mp3')
let actual_image_data

// Callback function to execute when mutations are observed
const mutationCallback = function(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Check if a new element is added
            const addedNodes = mutation.addedNodes;
            for (const addedNode of addedNodes) {
                if (addedNode.nodeType === 1 && addedNode.tagName === 'FOOTER'){ // Check if it's an footer element node
                    // Execute your code when a new element is created
                    //console.log('ITS A FOOTER')
                    window.new_message_input = document.getElementById('new-message')
                    window.new_message_button = document.getElementById('send-message-button')
                    window.delete_message_option_buttons = document.querySelectorAll('.delete-message')
                    const imageInput = document.getElementById('imageInput')
                    imageInput.addEventListener('change', previewImage);

                    
                    delete_message_option_buttons.forEach( button => {
                        button.onclick = function() {
                            console.log('SCROLL!!')
                             // delete the message
                            htmx.ajax('DELETE', `/delete_message/${button.dataset.chat}/${button.dataset.message}` , 
                            {target:'#chat-messages', 
                            swap:'outerHTML', 
                            headers: {
                                'X-CSRFToken': button.dataset.token
                            }}).then(() => {
                                // this code will be executed after the 'htmx:afterOnLoad' event,
                                // and before the 'htmx:xhr:loadend' event
                                // when the message is deleted and the response is loaded, scroll
                                scroll_to_bottom()
                            });
                            console.log('SCROLLED!!')
                        }})
                    
                    
                    new_message_input.addEventListener('keypress', (event) => {
                        if (event.key === 'Enter' && (new_message_input.value !== '' || imageInput.value !== '')){
                
                            send_message('message', new_message_input.value, imageInput.value !== '' ? actual_image_data : '', user_id)
                            
                            new_message_input.value = ''
                            //deletes the selected image
                            if (imageInput.value != ''){
                                imageInput.value = ''
                                document.getElementById('imagePreview').firstChild.remove()
                            }
                            
                        }})
                    
                
                    new_message_button.onclick = () => {
                        if (new_message_input.value !== '' || imageInput.value !== ''){
                            send_message('message', new_message_input.value, imageInput.value !== '' ? actual_image_data : '', user_id)
                            
                            new_message_input.value = ''
                            //deletes the selected image
                            if (imageInput.value != ''){
                                imageInput.value = ''
                                document.getElementById('imagePreview').firstChild.remove()
                            }}}
                    
                    
                        scroll_to_bottom()

                }}}}};

// Create a MutationObserver with the callback
const observer = new MutationObserver(mutationCallback);

// Configure the observer to watch for changes in the container's children
const observerConfig = { childList: true };

// Start observing the target container
observer.observe(chat_display, observerConfig);

window.summon_chat = function(chat){

    socket.send(JSON.stringify({
        'type':'reconnect',
        'reconnect_to': chat.dataset.chat
    }))
    localStorage.setItem('receiver_username', chat.dataset.contact)
    localStorage.setItem('chat_id', chat.dataset.chat)
    localStorage.setItem('contact_phone_number', chat.dataset.contactPhone)

}


function previewImage() {
    let imageInput = document.getElementById('imageInput');
    let imagePreview = document.getElementById('imagePreview');

    let file = imageInput.files[0];

    if (file) {
        let reader = new FileReader();

        reader.onload = function (event) {
            // Display image preview
            let preview = document.createElement('img');
            preview.style.maxHeight = '200px'
            preview.style.maxWidth = '200px'
            preview.classList.add('m-3')
            preview.src = event.target.result;
            //localStorage.setItem('image_data', event.target.result)
            actual_image_data = event.target.result
            preview.alt = 'Image Preview';

            // Clear previous previews
            while (imagePreview.firstChild) {
                imagePreview.removeChild(imagePreview.firstChild);
            }

            imagePreview.appendChild(preview);
        };

        reader.readAsDataURL(file);
    }
}



function checked(form){
    console.log(form.elements)
    for (let index = 0; index < form.elements.length; index++) {
        let element = form.elements[index];
        if (element.checked){
            return true}
    }
    return false
}

/**
 * Sends a message to the websocket for creating the desired instance using the given form data.
 * @param {HTMLFormElement} form The HTML form element that contains all the inputs data to be set to the websocket.
 * @param {String} instance_type A string telling the websocket consumer what type of instance it should create.
 * @returns {false} To avoid form submission.
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
    return false
}



function send_message (message_type, message_text, message_image, message_sender_id){
    socket.send(JSON.stringify({
        'type': message_type,
        'message': message_text,
        'image': message_image,
        'receiver_username': localStorage.getItem('receiver_username'),
        'sender_user_id': message_sender_id,
        'chat_id': localStorage.getItem('chat_id'),
        'contact_phone_number': localStorage.getItem('contact_phone_number')
    }))

}


socket.addEventListener('open', () => {
    window.toggleReadMore = function(text_id){
        toggleReadMore(text_id)
    }

    window.showDropdown  = function (event, dropdown_id) {
        showDropdown(event, dropdown_id)
    }

    chat_form.onsubmit = () => {
        console.log('HANDLED')
        if (!checked(chat_form)){
            const validation_message = document.getElementById('chat-validation-message')
            validation_message.innerText = 'Please select a contact to create chat with'
        }
        else{
            create_instance(chat_form, 'create_chat')
            const toastNotification = document.getElementById('liveToast')
            modifyNotification('Server', 
            'The chat was created successfully!! Update your chat list by clicking the "chats" button.')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            toastBootstrap.show()
        }
        return false;   
    }

    contact_form.onsubmit = () => {
        create_instance(contact_form, 'create_contact')
        const toastNotification = document.getElementById('liveToast')
        modifyNotification('Server', 
        'The contact was created successfully! Update your contacts list by clicking the "contacts" button.')
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
        toastBootstrap.show()
        const inputs = contact_form.getElementsByTagName('input')
        // clears phonenumber and contact name fields.
        inputs[1].value = ''
        inputs[2].value = ''
        return false;
    }


})

socket.addEventListener('message',async (event) => {
    console.log('message from server', event.data , 'type:', event.type)
    let message
    let sender_id
    let message_data
    let text
    let image
    if (event.data.includes('chat_message')){
        message = event.data.replace('chat_message', '')
        message_data = message.split('-')
        sender_id = message_data[0]
        text = message_data[1]
        image = message_data[2]
        console.log(`IMAGE:${image}`)
        console.log(typeof(localStorage.getItem('image_data')))
        // if the message was sent by the auth user, play a sound and update the chat list
        // only render the HTML otherwise
        if (user_id === sender_id){
            message_sent_audio.play()
            htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display')
        }
        else {
            create_message_html(text, image, user_id === sender_id)
        }
    
    }

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
        notification_audio.play()
    }


})

socket.addEventListener('error', (error) => {
    console.error(error)
})
