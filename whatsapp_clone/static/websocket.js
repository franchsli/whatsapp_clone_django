import { get, modifyNotification, scroll_to_bottom,
  create_message_html, toggleReadMore, showDropdown,
   run_element_animation, checked, not_empty,
    toggle_element_inner_text, load_emojis, switch_emojis } from  './tools.js';

console.log("websocket.js is loaded!");
const user = document.getElementById('profile-pic')
const user_id = user.getAttribute('data-user')
const user_phone_number = user.getAttribute('data-phone')
const chat_websocket = new WebSocket(`ws://${window.location.host}/`)
const status_websocket = new WebSocket(`ws://${window.location.host}/status/`)
const chat_form = document.getElementById("chat-creation-form")
const chat_modal = document.getElementById('NewChat')
const chat_display = document.getElementById('chat-display')
const contact_form = document.getElementById("contact-creation-form")
const contact_modal = document.getElementById('NewContact')
const status_form = document.getElementById('status_form')
const status_modal = document.getElementById('CreateStatusModal')
const status_submit_button = document.getElementById('status-submit')
const stauts_image_preview = document.getElementById('status-imagePreview')
const status_image_input = document.getElementById('id_image')
console.log(`IMAGE INPUT: ${status_image_input}\nIMAGE PREVIEW: ${stauts_image_preview}`)
const notification_audio = new Audio('static/Audio/app/message_received.mp3')
const message_sent_audio = new Audio('static/Audio/app/message_sent.mp3')
const error_audio = new Audio('static/Audio/app/error_sound.mp3')
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
                    imageInput.addEventListener('change', () => {
                        previewImage()
                    });

                    
                    delete_message_option_buttons.forEach( button => {
                        button.onclick = function() {
                            console.log('SCROLL!!')
                            // delete the message
                            setTimeout(scroll_to_bottom, 1000)
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

/**
 * Tells the websocket to reconnect to the provided chat channel.
 * @param {HTMLElement} chat 
 */
window.summon_chat = function(chat){
    chat_websocket.send(JSON.stringify({
        'type':'reconnect',
        'reconnect_to': chat.dataset.chat
    }))
    localStorage.setItem('receiver_username', chat.dataset.contact)
    localStorage.setItem('chat_id', chat.dataset.chat)
    localStorage.setItem('contact_phone_number', chat.dataset.contactPhone)

}

/**
 * Displays a preview of the image provided image input element in the provided HTML div element..
 * @param {HTMLInputElement} image_input The element that contains the image.
 * @param {HTMLDivElement} image_preview The element that will contain the image preview.
 */
function previewImage(image_input=undefined, image_preview=undefined) {
    // if no image input and image preview elements have been provided
    // gets the default image input and preview HTML elements
    if (image_input === undefined && image_preview === undefined){
        console.log('IF STATEMENT RAN')
        image_input = document.getElementById('imageInput');
        image_preview = document.getElementById('imagePreview');
    }

    //else if (typeof(image_input)){}
    console.log(typeof(image_input))
    console.log(typeof(image_preview))
    console.log(typeof(image_input) === typeof(HTMLInputElement))
    console.log('GOT THE IMAGE INPUT AND PREVIEW')
    console.log(`IMAGE INPUT: ${image_input}\nIMAGE PREVIEW: ${image_preview}`)

    let file = image_input.files[0];

    if (file) {
        let reader = new FileReader();

        reader.onload = function (event) {
            // Display image preview
            let preview = document.createElement('img');
            preview.style.maxHeight = '200px'
            preview.style.maxWidth = '200px'
            preview.classList.add('m-3')
            preview.src = event.target.result;
            actual_image_data = event.target.result
            preview.alt = 'Image Preview';

            // Clear previous previews
            while (image_preview.firstChild) {
                image_preview.removeChild(image_preview.firstChild);
            }

            image_preview.appendChild(preview);
        };

        reader.readAsDataURL(file);
    }
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
                chat_websocket.send(JSON.stringify({
                    'type': instance_type,
                    'contact_name': element.dataset.contactName,
                    'contact_phone_number': element.id
                }))}}}
    else if(instance_type === 'create_contact'){
        chat_websocket.send(JSON.stringify({
            'type': instance_type,
            'contact_name': form_elements[1].value,
            'contact_phone_number': form_elements[2].value
        }))
    }
    return false
}


/**
 * Send the chat message data to the websocket.
 * @param {String} message_type The type of the message.
 * @param {String} message_text The text of the message.
 * @param {String} message_image A string of image data encoded in base64.
 * @param {String} message_sender_id The id of who sent the chat message.
 */
function send_message (message_type, message_text, message_image, message_sender_id){
    chat_websocket.send(JSON.stringify({
        'type': message_type,
        'message': message_text,
        'image': message_image,
        'receiver_username': localStorage.getItem('receiver_username'),
        'sender_user_id': message_sender_id,
        'chat_id': localStorage.getItem('chat_id'),
        'contact_phone_number': localStorage.getItem('contact_phone_number')
    }))

}


chat_websocket.addEventListener('open', () => {
    window.toggleReadMore = function(text_id){
        toggleReadMore(text_id)
    }

    window.showDropdown  = function (event, dropdown_id) {
        showDropdown(event, dropdown_id)
    }

    window.run_element_animation = function(element){
        run_element_animation(element)
    }
    
    window.switch_emojis = function(button){
        switch_emojis(button)
    }

    chat_form.onsubmit = () => {
        console.log('HANDLED')
        if (!checked(chat_form)){
            error_audio.play()
            const validation_message = document.getElementById('chat-validation-message')
            validation_message.innerText = 'Please select a contact to create chat with'
        }


        else{
            for (let index = 0; index < chat_form.elements.length; index++) {
                // when the selected contact (checkbox) is found
                // do a API request and check if the user already have a chat with the
                // said contact (User object id)
                if(chat_form.elements[index].checked){
                    const contact_phone_number = chat_form.elements[index].id
                    break
                }
                
            }
            create_instance(chat_form, 'create_chat')
            const toastNotification = document.getElementById('liveToast')
            modifyNotification('Server', 
            'The chat was created successfully!! Update your chat list by clicking the "chats" button.')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            toastBootstrap.show()
        }
        return false;   
    }

    contact_form.onsubmit = async () => {
        const inputs = contact_form.getElementsByTagName('input')
        // gets the 'list' of Users who have the provided phone_number
        // in the form
        const users = await get(`/api/users/?phone_number=${inputs[2].value}`)
        // gets a list of Contacts created by the User
        // with the provided phone_number
        const contacts = await get(`/api/contacts/?phone_number=${inputs[2].value}&created_by=${user_id}`)
        // if no User created has the introduced phone_number
        // notify the user
        if (users.length === 0){
            const validation_message = document.getElementById('contact-validation-message')
            validation_message.innerText = 'No User with provided Phone, the Phone is not registered in this app.'
            error_audio.play()
        }
        // if the User already created a Contact with such phone, notify the user
        else if (contacts.length > 0){
            const validation_message = document.getElementById('contact-validation-message')
            validation_message.innerText = 'You already created a Contact with that Phone'
            error_audio.play()
            console.log(contacts)
        }
        // if nothing happens, create the contact
        else {
            create_instance(contact_form, 'create_contact')
            const toastNotification = document.getElementById('liveToast')
            modifyNotification('Server', 
            'The contact was created successfully! Update your contacts list by clicking the "contacts" button.')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            toastBootstrap.show()
            notification_audio.play()
            // clears phonenumber and contact name fields.
            inputs[1].value = ''
            inputs[2].value = ''
            // clears the checkboxes
            inputs[3].checked = false
            inputs[4].checked = false

        }

        return false;
    }
    // gets the image preview div and updated it over time.
    status_image_input.addEventListener('change', () => {
        previewImage(status_image_input, stauts_image_preview)
    })

    // resets the contact form values and validation errors when the modal is closed.
    chat_modal.addEventListener('hidden.bs.modal', function (event) {
        const validation_message = document.getElementById('chat-validation-message')
        console.log('CONTACT INPUTS', chat_form.elements)
        for (let index = 0; index < chat_form.elements.length; index++) {
            if (chat_form.elements[index].type === 'checkbox'){
                chat_form.elements[index].checked = false
            }
            
        }
        validation_message.innerText = ''
    })
    // resets the contact form values and validation errors when the modal is closed.
    contact_modal.addEventListener('hidden.bs.modal', function (event) {
        const inputs = contact_form.getElementsByTagName('input')
        const validation_message = document.getElementById('contact-validation-message')
        console.log('CONTACT INPUTS', inputs)
        inputs[1].value = ''
        inputs[2].value = ''
        inputs[3].checked = false
        inputs[4].checked = false
        validation_message.innerText = ''
    })

    // same for the status modal.
    status_modal.addEventListener('hidden.bs.modal', function (event) {
        const inputs = status_form.elements
        const validation_message = document.getElementById('status-validation-message')
        const image_container = document.getElementById('status-imagePreview')
        const image = image_container.firstElementChild
        console.log('STATUS INPUTS',inputs)
        inputs[2].value = ''
        inputs[3].value = ''
        if (image){
            image.remove()
        }
        validation_message.innerText = ''
    })
    

    status_submit_button.onclick = (event) => {
        event.preventDefault()
        if (not_empty(status_form)){
            const status_input = document.getElementById('id_text')
            const image_container = document.getElementById('status-imagePreview')
            const image = image_container.firstElementChild
            status_websocket.send(JSON.stringify({
                'type': 'CREATE',
                'user_id': user_id,
                'sender_phone_number': user_phone_number,
                'text': status_input.value,
                'image': image !== null ? image.src : null,

            }))
        }
        else {
            error_audio.play()
            const validation_message = document.getElementById('status-validation-message')
            validation_message.innerText = 'Please insert data!!!'
            setTimeout(() => {
                validation_message.textContent = ''
            }, 5000)
        }
    }

    /**
     * handle different htmx events and what to do after they're executed.
     * @param {HTMLElement} elt 
     * @param {Event} event 
     * @param {Object} data 
     */
    htmx.logger = function(elt, event, data) {

        if (event === 'htmx:afterSettle' && data.pathInfo.requestPath === '/muted_statuses/'){
            const show_muted_statuses_button = document.getElementById('show-muted-statuses')
            const muted_statuses = document.getElementById('muted-statuses-contact-list')
            show_muted_statuses_button.onclick = toggle_element_inner_text(show_muted_statuses_button, 'Show', 'Hide')
            show_muted_statuses_button.onclick = (event) => {
                if (show_muted_statuses_button.innerText === 'Hide'){
                    // FIX
                    console.log('RAN, TRYING TO DELETE..')
                    function s(){
                        event.preventDefault()
                        muted_statuses.innerHTML = ''
                        console.log('ERASED')
                        console.log(muted_statuses)
                    }
                    s()   
                }
            }
        }
        // loads the default emojis
        else if (event === 'htmx:afterSettle' && data.pathInfo.requestPath.includes('display_chat')){
            const emoji_container = document.getElementById('emojis-container')
            const emoji_class = document.querySelector('.emoji-class-active')
            load_emojis(emoji_class.dataset.emojiPack, emoji_container)
            
        }

        // else {
        //     if (data.pathInfo){
        //         console.log(event, data.pathInfo.requestPath)
        //     }
        //     else{
        //         console.log(event)
        //     }
            
        // }
    }
    htmx.logger()
    // initialize tooltips
    // const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    // const tooltipList = [...tooltipTriggerList].map(tooltipTrigger => {
    //     new bootstrap.Tooltip(tooltipTrigger);
    //     console.log("Tooltip initialized for element:", tooltipTrigger);
    //     return new bootstrap.Tooltip(tooltipTrigger);
    //   });



})

chat_websocket.addEventListener('message',async (event) => {
    console.log('message from server', event.data , 'type:', event.type)
    let message
    let sender_id
    let message_data
    let text
    let image
    let sender_username
    let sender_is_archived
    if (event.data.includes('chat_message')){
        message = event.data.replace('chat_message', '')
        message_data = message.split('-')
        sender_id = message_data[0]
        text = message_data[1]
        image = message_data[2]
        console.log(`IMAGE:${image}`)
        // if the message was sent by the auth user, play a sound and update the chat list
        // only render the HTML otherwise
        if (user_id === sender_id){
            message_sent_audio.play()
            htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                if (document.getElementById('chat-list') !== null){
                    if (document.getElementById('archived-chats') !== null) {
                        htmx.ajax('GET', '/archived_chats', {target:'#chats-and-more', swap:'innerHTML'})
                    } else {
                        htmx.ajax('GET', '/chats', {target:'#chat-list', swap:'outerHTML'})
                    }
                    
                }
            })
        }
        else {
            create_message_html(text, image, user_id === sender_id)
        }
    
    }

    else if (event.data.includes('chat_notification')){
        message = event.data.replace('chat_notification', '')
        message = message.split('-')
        sender_id = message[0]
        text = message[1]
        sender_username = message[2]
        sender_is_archived = message[3] === 'True' ? true : false

        console.warn(message)
        console.log(message)
        // if the chats UI is displayed, reload it
        if (document.getElementById('chat-list') !== null){
            if (document.getElementById('archived-chats') !== null) {
                htmx.ajax('GET', '/archived_chats', {target:'#chats-and-more', swap:'innerHTML'})
            } else {
                htmx.ajax('GET', '/chats', {target:'#chat-list', swap:'outerHTML'})
            }
            
        }

        if(!sender_is_archived){
            const toastNotification = document.getElementById('liveToast')
            modifyNotification(sender_username, text)
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            toastBootstrap.show()
            notification_audio.play()
        }
    }


})

chat_websocket.addEventListener('error', (error) => {
    console.error(error)
})



// status websocket handling
status_websocket.addEventListener('open', () => {
    console.log('CONNECTION OPENED WITH STATUS WEBSOCKET')
})

status_websocket.addEventListener('message', async (event) => {
    console.log('STATUS MESSAGE')
    console.log(event.data , 'type:', event.type)
    let status_event_data = event.data.replace('status_notification-','')
    status_event_data = status_event_data.split('-')
    console.log('SPLITTED')
    console.log(status_event_data)
    if (status_event_data.includes('CREATE')){
        // if the user_id of the user who triggered the message is not the same
        // as the auth user, display a notification.
        if (status_event_data[1] !== user_id){
            const toastNotification = document.getElementById('liveToast')
            const status_sender_data = await get(`/api/contacts/?phone_number=${status_event_data[2]}&created_by=${user_id}`)
            modifyNotification('Server', `${status_sender_data[0].name} uploaded a status!!!`)
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            toastBootstrap.show()
            notification_audio.play()
        }
        // otherwise, it means that the user
        // used the form, so clean it and display a success notification
        else {
            const status_form_text = document.getElementById('id_text')
            const status_form_image = document.getElementById('id_image')
            const image_preview_container = document.getElementById('status-imagePreview')
            status_form_text.value = ''
            status_form_image.value = ''
            // if the image preview exists, delete it.
            if (image_preview_container.firstElementChild !== null){
                image_preview_container.firstElementChild.src = ''
            }
            //notify the user
            const toastNotification = document.getElementById('liveToast')
            modifyNotification('Server', 'Status uploaded successfully!')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            toastBootstrap.show()
            notification_audio.play()

        }

    }
    // if the status UI is already displayed, reload it
    // to be able to see the brand new contact status....
    if (document.getElementById('contact-statuses-list') !== null){
            htmx.ajax('GET', '/statuses', '#chats-and-more')
    }

})

status_websocket.addEventListener('error', (error) => {
    console.log(error)
})


// status_websocket.send(JSON.stringify({
//     'type': 'CREATE',
//     'user_id': 'THE ID OF THE USER WHO TRIGGERED THE ACTION',
//     'text': 'SOME TEXT HERE',
//     'image': 'IMAGE ENCODED DATA (GET IT FROM THE FORM)',
// }))

// status_websocket.send(JSON.stringify({
//     'type':'DELETE',
//     'user_id': 'THE ID OF THE USER WHO TRIGGERED THE ACTION',
//     'status_id': 'status_id given from dataset'
// }))