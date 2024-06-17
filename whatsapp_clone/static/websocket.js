import * as tools from  './tools.js';

const user = document.getElementById('profile-pic')
const user_id = user.getAttribute('data-user')
const user_phone_number = user.getAttribute('data-phone')
const chat_websocket = new WebSocket(`ws://${window.location.host}/`)
const status_websocket = new WebSocket(`ws://${window.location.host}/status/`)
const chats_and_more = document.getElementById("chats-and-more")
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
const notification_audio = new Audio('static/Audio/app/message_received.mp3')
const message_sent_audio = new Audio('static/Audio/app/message_sent.mp3')
const error_audio = new Audio('static/Audio/app/error_sound.mp3')

// Callback function to execute when mutations are observed
const chat_mutation_callback = function(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Check if a new element is added
            const addedNodes = mutation.addedNodes;
            for (const addedNode of addedNodes) {
                if (addedNode.nodeType === 1 && addedNode.tagName === 'FOOTER'){ 
                    // Check if it's an footer element node
                    // Execute your code when a new element is created
                    window.new_message_input = document.getElementById('new-message')
                    window.new_message_button = document.getElementById('send-message-button')
                    window.delete_message_option_buttons = document.querySelectorAll('.delete-message')
                    const imageInput = document.getElementById('imageInput')
                    const imagePreview = document.getElementById('imagePreview')
                    imageInput.addEventListener('change', () => {
                        tools.previewImage(imageInput, imagePreview)
                    });

                    
                    delete_message_option_buttons.forEach( button => {
                        button.onclick = function() {
                            console.log('SCROLL!!')
                            // delete the message
                            setTimeout(tools.scroll_to_bottom, 1000)
                            console.log('SCROLLED!!')
                        }})
                    
                    
                    new_message_input.addEventListener('keypress', (event) => {
                        if (event.key === 'Enter' && (new_message_input.value !== '' || imageInput.value !== '')){
                            let image = document.getElementById('imagePreview').firstElementChild
                            send_message('message', new_message_input.value, imageInput.value !== '' ? image.src : '', user_id)
                            
                            new_message_input.value = ''
                            //deletes the selected image
                            if (imageInput.value != ''){
                                imageInput.value = ''
                                image.remove()
                            }
                            
                        }})
                    
                
                    new_message_button.onclick = () => {
                        if (new_message_input.value !== '' || imageInput.value !== ''){
                            let image = document.getElementById('imagePreview').firstElementChild    
                            send_message('message', new_message_input.value, imageInput.value !== '' ? image.src : '', user_id)
                            
                            new_message_input.value = ''
                            //deletes the selected image
                            if (imageInput.value != ''){
                                imageInput.value = ''
                                image.remove()
                            }}}
                        tools.scroll_to_bottom()

                }}}}};

const general_mutations_callback = function(mutationsList, observer) {
    for (let index = 0; index < mutationsList.length; index++) {
        // only trigger all the tooltips if the last mutation
        // has been made
        if (index + 1 === mutationsList.length){
            console.log('LAST MUTATION OBSERVED IN CHATS AND MORE, TRIGGERING TOOLTIPS...')
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
        }
        
    }

};

// Create a MutationObserver with the callback
const chat_observer = new MutationObserver(chat_mutation_callback);
const general_observer = new MutationObserver(general_mutations_callback);

// Configure the observer to watch for changes in the container's children
const observerConfig = { childList: true };

// Start observing the target container
chat_observer.observe(chat_display, observerConfig);
general_observer.observe(chats_and_more, observerConfig)

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

// trigger all the tooltips in the webpage
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
chat_websocket.addEventListener('open', () => {
    console.log('CONNECTION OPENED WITH CHAT WEBSOCKET')

    window.toggleReadMore = function(text_id){
        tools.toggleReadMore(text_id)
    }

    window.showDropdown  = function (event, dropdown_id) {
        tools.showDropdown(event, dropdown_id)
    }

    window.run_element_animation = function(element){
        tools.run_element_animation(element)
    }
    
    window.switch_emojis = function(button){
        tools.switch_emojis(button)
    }

    window.switch_checkboxes = function(form){
        tools.switch_checkboxes(form)
    }

    window.toggle_element_inner_text = function(HTML_element, text_a, text_b){
        tools.toggle_element_inner_text(HTML_element, text_a, text_b)
    }

    window.toggle_element_display = function(HTML_element){
        tools.toggle_element_display(HTML_element)
    }

    window.exchange_elements_class = function(element_a, element_b, class_a, class_b){
        tools.exchange_elements_class(element_a, element_b, class_a, class_b)
    }

    window.load_more_messages = function(html_element){
        tools.load_more_messages(html_element)
    }

    window.load_older_messages = function(){
        load_older_messages()
    }

    window.date_already_displayed = function(date){
        const similar_layers = document.querySelectorAll(`.date-${date.replaceAll(' ', '')}`)
        const many_similar_layers = similar_layers.length > 1
        if (many_similar_layers){
            return true
        }
        else {
            console.log('FALSE')
            return false
        }
    }

    window.remove_duplicates = function(class_name){
        tools.remove_duplicates(class_name)
    }


    chat_form.onsubmit = async (event) => {
        event.preventDefault()

        console.log('HANDLED')
        if (!tools.checked(chat_form)){
            error_audio.play()
            const validation_message = document.getElementById('chat-validation-message')
            validation_message.innerText = 'Please select a contact to create chat with'
        }


        else{
            for (let index = 0; index < chat_form.elements.length; index++) {
                // when the selected contact (checkbox) is found
                if(chat_form.elements[index].checked){
                    const contact_phone_number = chat_form.elements[index].id
                    const contact_user_object = await tools.get(`/api/users/?phone_number=${contact_phone_number}`)
                    const contact_user_id = contact_user_object[0].id
                    // do an API request and check if the user already have a chat with the
                    // said contact (User object id)
                    const already_created_chats_with_contact = await tools.get(`/api/chats/?user_id=${user_id}&user_id=${contact_user_id}`)
                    
                    
                    // if the user has already a chat with the contact, display an error
                    if(already_created_chats_with_contact.length > 0){
                        error_audio.play()
                        const validation_message = document.getElementById('chat-validation-message')
                        validation_message.innerText = 'You already have a chat with this contact, check your chat list.'
                    }
                    // create the chat otherwise
                    else {
                        create_instance(chat_form, 'create_chat')
                        const toastNotification = document.getElementById('liveToast')
                        tools.modifyNotification('Server', 
                        'The chat was created successfully!! Update your chat list by clicking the "chats" button.')
                        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
                        toastBootstrap.show()
                    }
                    break
                }
            }
        }
        return false;   
    }

    contact_form.onsubmit = async () => {
        const inputs = contact_form.getElementsByTagName('input')
        // gets the 'list' of Users who have the provided phone_number
        // in the form
        const users = await tools.get(`/api/users/?phone_number=${inputs[2].value}`)
        // gets a list of Contacts created by the User
        // with the provided phone_number
        const contacts = await tools.get(`/api/contacts/?phone_number=${inputs[2].value}&created_by=${user_id}`)
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
        }
        // if nothing happens, create the contact
        else {
            create_instance(contact_form, 'create_contact')
            const toastNotification = document.getElementById('liveToast')
            tools.modifyNotification('Server', 
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
        tools.previewImage(status_image_input, stauts_image_preview)
    })

    // resets the contact form values and validation errors when the modal is closed.
    chat_modal.addEventListener('hidden.bs.modal', function (event) {
        const validation_message = document.getElementById('chat-validation-message')
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
        if (tools.not_empty(status_form)){
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
    htmx.logger = async function(elt, event, data) {
        // loads the default emojis
        if (event === 'htmx:afterSettle' && data.pathInfo.requestPath.includes('display_chat')){
            const emoji_container = document.getElementById('emojis-container')
            const emoji_class = document.querySelector('.emoji-class-active')
            tools.load_emojis(emoji_class.dataset.emojiPack, emoji_container)
            // UPDATE THE CHAT LIST IF THERE WERE UNREAD MESSAGES
            const unread_messages_counter = document.getElementById(`chat-${localStorage.getItem('chat_id')}unread-counter`)
            if (unread_messages_counter){
                tools.update_chat_list()
            }
            
        }

        else if (event === 'htmx:afterSettle' && data.pathInfo.requestPath === '/statuses/'){
            // logic there
            window.user_statuses_caller = document.querySelector('#user-status-caller')
            window.user_status_modal = document.querySelector(`#user-status-modal${user_id}`)
            window.contacts_status_modals = document.querySelectorAll('.contact-status-modal')
            window.status_deletion_buttons = document.querySelectorAll('.status-deletion')
            window.contacts_with_statuses_caller = document.querySelectorAll('.contact-status-caller')
            window.carousel = null
            window.carousel_instance = null
        }

        else if(event === 'htmx:afterSettle' && data.pathInfo.requestPath.includes('delete_message')){
            /**
             * send a message to the chat websocket to tell the receiver
             * that the chat list needs to be updated due to a message deletion,
             * so the JS code (receiver) analises the websocket message
             * and then decides whether or not to update the UI using
             * a HTMX.ajax request.
             */
            send_message('message_deletion', '', '', user_id)
        }

        else if(event === 'htmx:afterSettle' && data.pathInfo.requestPath.includes('edit_message')){
            // same logic as real-time message deletion
            // but this is due to a message edition
            send_message('message_edition', '', '', user_id)
        }
        // sets a global variable with the 'scrollable view' height before loaidng the messages
        else if(event === 'htmx:beforeRequest' && data.pathInfo.requestPath.includes('previous_messages')){
            const messages = document.getElementById('chat-messages')
            window.previous_scrollable_view = messages.scrollHeight - messages.clientHeight
            console.log('height before', previous_scrollable_view)
        }
        // scroll to the previous scroll height before loading older messages
        else if(event === 'htmx:afterSettle' && data.pathInfo.requestPath.includes('previous_messages')){
            const messages = document.getElementById('chat-messages')
            const actual_scrollable_view = messages.scrollHeight - messages.clientHeight
            console.log('height after', actual_scrollable_view)
            messages.scroll(0, actual_scrollable_view - previous_scrollable_view)
            console.log('SCROLLED AFTER OLDER MESSAGES THE DISTANCE OF', actual_scrollable_view - previous_scrollable_view)
        }


    }
    htmx.logger()


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
    console.log(event.data.includes('chat_message'))
    console.log(event.data.includes('chat_notification'))
    console.log(event.data.includes('message_deletion'))
    console.log(event.data.includes('message_edition'))
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
        }
        htmx.ajax('GET', `/append_message/${localStorage.getItem('chat_id')}`, {target:'#chat-messages', swap:'beforeend'}).then(() => {
            tools.update_chat_list()
        })

    
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
        tools.update_chat_list()

        if(!sender_is_archived){
            const toastNotification = document.getElementById('liveToast')
            tools.modifyNotification(sender_username, text)
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            toastBootstrap.show()
            notification_audio.play()
        }
    }

    else if (event.data.includes('message_deletion')){
        message = event.data.replace('chat_message_deletion', '')
        message = message.split('-')
        sender_id = message[0]
        sender_username = message[1]
        /**
        * the JS code (receiver) analises the websocket message
        * and then decides whether or not to update the UI using
        * a HTMX.ajax request.
        */
        tools.update_chat_list()
        if (document.getElementById('contact-name') !== null){
            console.log('CHAT IS DISPLAYED.. TRYING TO RELOAD...')
            if (document.getElementById('contact-name').innerText === sender_username) {
    
                htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                    console.log('MESSAGES RELOADED')
                    tools.scroll_to_bottom()
                })
                
            }
            
        }

    }

    else if (event.data.includes('message_edition')){
        message = event.data.replace('chat_message_deletion', '')
        message = message.split('-')
        sender_id = message[0]
        sender_username = message[1]
        /**
        * the JS code (receiver) analises the websocket message
        * and then decides whether or not to update the UI using
        * a HTMX.ajax request.
        */
        tools.update_chat_list()
        if (document.getElementById('contact-name') !== null){
            console.log('CHAT IS DISPLAYED.. TRYING TO RELOAD...')
            if (document.getElementById('contact-name').innerText === sender_username) {
    
                htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                    console.log('MESSAGES RELOADED')
                    tools.scroll_to_bottom()
                })
                
            }
            
        }

    }


})

chat_websocket.addEventListener('error', (error) => {
    console.error(error)
})



// status websocket handling
status_websocket.addEventListener('open', () => {
    console.log('CONNECTION OPENED WITH STATUS WEBSOCKET')
    window.status_app = {
        pending_updates : false
    }
    window.delete_status = function(button){
        status_websocket.send(JSON.stringify({
            'type':'DELETE',
            'user_id': button.dataset.creator,
            'status_id': button.dataset.status
        }))
        console.log('FRONT-END SENT:')
        console.log(`user:${button.dataset.creator}\nstatus:${button.dataset.status}`)
        console.log('NEXT STATUS')
        if (carousel_instance !== null){
            carousel_instance.next()
        }
    }
    window.init_status_carousel = function(status_carousel){
        carousel = status_carousel

        carousel_instance = new bootstrap.Carousel(carousel, {
        interval: 5000,
        touch: false
        })
        console.log('INITIALIZED CAROUSEL')
    }

    window.show_modal = function(modal){
        modal.setAttribute('status', 'showing')
        console.log('CHANGED TO SHOWING')
    }
    window.hide_modal = function(modal){
        modal.setAttribute('status', 'hidden')
        // if there any pendient updates in the UI, update it
        if(status_app.pending_updates){
            htmx.ajax('GET', '/statuses', '#chats-and-more')
            .then( () => {
                status_app.pending_updates = false
            })
        }
        console.log('CHANGED TO HIDDEN')
    }


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
        // as the auth user, think displaying a notification.
        if (status_event_data[1] !== user_id){
            const status_sender_data = await tools.get(`/api/contacts/?phone_number=${status_event_data[2]}&created_by=${user_id}`)
            // if the contacts IS NOT muted from statuses
            // display a notification
            if (!status_sender_data[0].statuses_muted){
                const toastNotification = document.getElementById('liveToast')
                tools.modifyNotification('Server', `${status_sender_data[0].name} uploaded a status!!!`)
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
                toastBootstrap.show()
                notification_audio.play()

            }
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
            tools.modifyNotification('Server', 'Status uploaded successfully!')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            toastBootstrap.show()
            notification_audio.play()

        }

    }
    // if the status UI is already displayed and the user status modal is hidden, reload the view
    // to be able to see the brand new contact status....
    const status_modals = document.querySelectorAll('.status-modal')
    const status_modals_showing = tools.at_least_one_attr(status_modals, 'status', 'showing')
    console.log(status_modals_showing)
    if (document.getElementById('contact-statuses-list') !== null){
        status_app = {
            pending_updates : true
        }
        console.log('RELOADING STATUS VIEW')
        if (!status_modals_showing){
            htmx.ajax('GET', '/statuses', '#chats-and-more')
            .then( () => {
                status_app.pending_updates = false
                console.log('RELOADED STATUS VIEW')
            })
        }
            
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