import { get, modifyNotification, scroll_to_bottom,
  create_message_html, toggleReadMore, showDropdown,
   run_element_animation, checked, not_empty,
    toggle_element_inner_text, load_emojis, switch_emojis } from  './tools.js';

console.log("websocket.js is loaded!");
const user = document.getElementById('profile-pic')
const user_id = user.getAttribute('data-user')
const socket = new WebSocket(`ws://${window.location.host}/`)
const chat_form = document.getElementById("chat-creation-form")
const chat_display = document.getElementById('chat-display')
const contact_form = document.getElementById("contact-creation-form")
const status_form = document.getElementById('status_form')
const status_submit_button = document.getElementById('status-submit')
const status_modal = document.getElementById('CreateStatusModal')
const stauts_image_preview = document.getElementById('status-imagePreview')
const status_image_input = document.getElementById('id_image')
const status_progress_bar = document.getElementById('status-upload-progress')
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
    socket.send(JSON.stringify({
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
                socket.send(JSON.stringify({
                    //'type': 'create_chat',
                    'type': instance_type,
                    'contact_name': element.dataset.contactName,
                    'contact_phone_number': element.id
                }))}}}
    else if(instance_type === 'create_contact'){
        socket.send(JSON.stringify({
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
    // gets the image preview div and updated it over time.
    status_image_input.addEventListener('change', () => {
        previewImage(status_image_input, stauts_image_preview)
    })
    // resets the status form progess bar value when the modal is closed.
    status_modal.addEventListener('hidden.bs.modal', function (event) {
        status_progress_bar.setAttribute('value', 0)
        console.log('Modal has been closed!')
    })

    status_submit_button.onclick = (event) => {
        event.preventDefault()
        if (not_empty(status_form)){
            htmx.trigger('#status-submit', 'secure-submit', {})
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
    // fills the status form progress bar
    htmx.on('#status_form', 'htmx:xhr:progress', function(evt) {
        htmx.find('#status-upload-progress').setAttribute('value', evt.detail.loaded/evt.detail.total * 100)
        console.log(evt.detail.loaded/evt.detail.total * 100)
    })

    /**
     * handle different htmx events and what to do after they're executed.
     * @param {HTMLElement} elt 
     * @param {Event} event 
     * @param {Object} data 
     */
    htmx.logger = function(elt, event, data) {
        // cleans the status creation form fields (text, image and preview if exists.)
        if (event === 'htmx:afterSettle' && data.pathInfo.requestPath === '/create_status/'){
            const form_text = document.getElementById('id_text')
            const form_image = document.getElementById('id_image')
            const form_image_preview_container = document.getElementById('status-imagePreview')
            const form_image_preview = form_image_preview_container.querySelector('img')

            form_text.value = ''
            form_image.value = ''
            if (form_image_preview){
                form_image_preview.src = ''
                form_image_preview.alt = ''
            }
            // notify the user that the status has been succesfully created.
            const toastNotification = document.getElementById('liveToast')
            modifyNotification('Server', 'Status uploaded succesfully!')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            toastBootstrap.show()
            notification_audio.play()
        }

        else if (event === 'htmx:afterSettle' && data.pathInfo.requestPath === '/statuses/'){
            const show_muted_statuses_button = document.getElementById('show-muted-statuses')
            const muted_statuses = document.getElementById('muted-statuses-contact-list')
            show_muted_statuses_button.onclick = (event) => {
                toggle_element_inner_text(show_muted_statuses_button, 'Show', 'Hide')
                if (event === 'htmx:afterSettle' && show_muted_statuses_button.innerText === 'Show'){
                    // FIX
                    function s(){
                        muted_statuses.textContent = ''
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
