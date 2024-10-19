import * as tools from  './tools.js';


function load_global_doc_functions(){
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
        tools.load_older_messages()
    }

    window.date_already_displayed = function(date){
        const similar_layers = document.querySelectorAll(`.date-${date.replaceAll(' ', '')}`)
        const many_similar_layers = similar_layers.length > 1
        if (many_similar_layers){
            return true
        }
        else {
            return false
        }
    }

    window.remove_duplicates = function(class_name){
        tools.remove_duplicates(class_name)
    }

    window.change_element_color = function(desired_color, target_element_id){
        tools.change_element_color(desired_color, target_element_id)
    }

    window.filter_by_value = function(value, element_list){
        tools.filter_by_value(value, element_list)
    }

    window.space_text = function(text_id){
        tools.space_text(text_id)
    }

}



class Chat_Web_Socket extends WebSocket {

    constructor(){
        this.onopen = async (event) => {

        }

        this.onmessage = async (event) => {

        }

        this.onerror = async (event) => {
            
        }
    }
    /**
     * Send the chat message data to the websocket.
     * @param {String} message_type The type of the message.
     * @param {String} message_text The text of the message.
     * @param {String} message_image A string of image data encoded in base64.
     * @param {String} message_sender_id The id of who sent the chat message.
     */
    send_message (message_type, message_text, message_image, message_sender_id){
        this.send(JSON.stringify({
            'type': message_type,
            'message': message_text,
            'image': message_image,
            'receiver_username': localStorage.getItem('receiver_username'),
            'sender_user_id': message_sender_id,
            'chat_id': localStorage.getItem('chat_id'),
            'chat_members_phones': localStorage.getItem('chat_members_phones')
        }))

    }

}

class Status_Web_Socket extends WebSocket {

}


const App = class {
    constructor(){
        // set up all the variables needed
        this.user = document.getElementById('profile-pic')
        this.user_id = user.getAttribute('data-user')
        this.user_phone_number = user.getAttribute('data-phone')
        // sets the Websocket protocol depending on the WEB protocol
        this.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.chat_websocket = new WebSocket(`${protocol}//${window.location.host}/`)
        this.status_websocket = new WebSocket(`${protocol}//${window.location.host}/status/`)
        this.chats_and_more = document.getElementById("chats-and-more")
        this.chat_form = document.getElementById("chat-creation-form")
        this.chat_modal = document.getElementById('NewChat')
        this.chat_display = document.getElementById('chat-display')
        this.contact_form = document.getElementById("contact-creation-form")
        this.contact_modal = document.getElementById('NewContact')
        this.status_form = document.getElementById('status_form')
        this.status_modal = document.getElementById('CreateStatusModal')
        this.status_submit_button = document.getElementById('status-submit')
        this.stauts_image_preview = document.getElementById('status-imagePreview')
        this.status_image_input = document.getElementById('id_image')
        this.notification_audio = new Audio('static/Audio/app/notification.mp3')
        this.message_received_audio = new Audio('static/Audio/app/message_received.mp3')
        this.message_sent_audio = new Audio('static/Audio/app/message_sent.mp3')
        this.error_audio = new Audio('static/Audio/app/error_sound.mp3')
        this.status_notification_audio = new Audio('static/Audio/app/new_status.mp3')
        this.new_message = false
        this.debug_logs = 'relevant'
        this.debugging_mode = false
        // event listeners
        this.chat_form.onsubmit = async (event) => {
            event.preventDefault()
            tools.validate_chat_form(this.chat_form, this.error_audio, this.chat_websocket)
        }
        
    }
    load_functions(){
        load_global_doc_functions()
    }





}


// Callback function to execute when mutations are observed
const chat_mutation_callback = function(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Check if a new element is added
            const addedNodes = mutation.addedNodes;
            for (const addedNode of addedNodes) {
                // Check if it's a footer element node
                if (addedNode.nodeType === 1 && addedNode.tagName === 'FOOTER'){ 
                    window.new_message_input = document.getElementById('new-message')
                    window.new_message_button = document.getElementById('send-message-button')
                    window.delete_message_option_buttons = document.querySelectorAll('.delete-message')
                    const imageInputCaller = document.getElementById('imageInputCaller')
                    const imageInput = document.getElementById('imageInput')
                    const imagePreview = document.getElementById('imagePreview')
                    imageInput.addEventListener('change', () => {
                        tools.previewImage(imageInput, imagePreview)
                    });

                    
                    delete_message_option_buttons.forEach( button => {
                        button.onclick = function() {
                            // scroll to bottom after deleting the message
                            setTimeout(tools.scroll_to_bottom, 1000)
                        }})
                    
                    imageInputCaller.addEventListener('click', (event) => {
                        event.preventDefault()
                        imageInput.click()
                    })
                    
                    
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
            tools.trigger_tooltips()
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
    const chat_members_phones_container = document.getElementById(chat.dataset.chatMembersPhonesDataId)
    const chat_members_phones = JSON.parse(chat_members_phones_container.firstChild.textContent)
    chat_websocket.send(JSON.stringify({
        'type':'reconnect',
        'reconnect_to': chat.dataset.chat
    }))
    localStorage.setItem('receiver_username', chat.dataset.contact)
    localStorage.setItem('chat_id', chat.dataset.chat)
    localStorage.setItem('chat_members_phones', chat_members_phones)

}

chat_websocket.addEventListener('open', () => {
    console.log('CONNECTION OPENED WITH CHAT WEBSOCKET')
    new_message = false


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
            notification_audio.play()            
            toastBootstrap.show()
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
        inputs[2].value = ''
        inputs[3].value = ''
        if (image){
            image.remove()
        }
        validation_message.innerText = ''
    })
    

    status_submit_button.onclick = (event) => {
        event.preventDefault()
        console.log(tools.not_empty(status_form))
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
     * Log htmx events in a comprehensive way.
     * @param {HTMLElement} elt 
     * @param {String} event 
     * @param {Object} data 
     */
    htmx.logger = async function(elt, event, data) {
        // debugging :)

        if (debugging_mode && data){
            let previous_event = data
            if (debug_logs === 'issues'){
                if(data.pathInfo){
                    if(!data.pathInfo.responsePath && !data.successful){
                        console.log('AN ERROR HAS OCURRED')
                        console.log("PREVIOUS EVENT DATA:\n", previous_event)
                        console.log("ACTUAL EVENT:\n", data)
                    }
                }
            }
            else if (debug_logs === 'relevant'){
                console.log('EVENT CALLED:', event)
                console.log('ELEMENT THAT ISSUED THE REQUEST:', elt)
                if(data.pathInfo){
                    console.log('REQUEST PATH:', data.pathInfo.requestPath)
                    console.log('RESPONSE PATH:', data.pathInfo.responsePath)
                    console.log('WAS THIS REQUEST SUCCESSFUL?:', data.successful)
                }
            }
        }
    }
    htmx.logger()
    htmx.on('htmx:beforeRequest', (event) => {
        // sets a global variable with the 'scrollable view' height before loaidng the messages
        if(event.detail.pathInfo.requestPath.includes('previous_messages')){
            const messages = document.getElementById('chat-messages')
            window.previous_scrollable_view = messages.scrollHeight - messages.clientHeight
        }
    })
    htmx.on('htmx:afterSettle', (event) => {
        // scroll to the previous scroll height before loading older messages
        if(event.detail.pathInfo.requestPath.includes('previous_messages')){
            const messages = document.getElementById('chat-messages')
            const actual_scrollable_view = messages.scrollHeight - messages.clientHeight
            messages.scroll(0, actual_scrollable_view - previous_scrollable_view)
        }
        else if(event.detail.pathInfo.requestPath.includes('edit_message')){
            // same logic as real-time message deletion
            // but this is due to a message edition
            send_message('message_edition', '', '', user_id)
        }
        else if(event.detail.pathInfo.requestPath.includes('delete_message')){
            /**
             * send a message to the chat websocket to tell the receiver
             * that the chat list needs to be updated due to a message deletion,
             * so the JS code (receiver) analises the websocket message
             * and then decides whether or not to update the UI using
             * a HTMX.ajax request.
             */
            send_message('message_deletion', '', '', user_id)
        }
        else if (event.detail.pathInfo.requestPath === '/statuses/'){
            window.user_statuses_caller = document.querySelector('#user-status-caller')
            window.user_status_modal = document.querySelector(`#user-status-modal${user_id}`)
            window.contacts_status_modals = document.querySelectorAll('.contact-status-modal')
            window.status_deletion_buttons = document.querySelectorAll('.status-deletion')
            window.contacts_with_statuses_caller = document.querySelectorAll('.contact-status-caller')
            window.carousel = null
            window.carousel_instance = null
        }
        // loads the default emojis
        if (event.detail.pathInfo.requestPath.includes('display_chat')){
            const emoji_container = document.getElementById('emojis-container')
            const emoji_class = document.querySelector('.emoji-class-active')
            tools.load_emojis(emoji_class.dataset.emojiPack, emoji_container)
            // UPDATE THE CHAT LIST IF THERE WERE UNREAD MESSAGES
            const unread_messages_counter = document.getElementById(`chat-${localStorage.getItem('chat_id')}unread-counter`)
            if (unread_messages_counter){
                tools.update_chat_list()
            }
        }
    })
    htmx.on('htmx:beforeRequest', (event) => {
        // cancel the request if the requested chats is already displayed.
        if(event.detail.pathInfo.requestPath.includes('display_chat')){
            if(new_message){
                new_message = false
                return
            }
            const displayed_chat =  document.getElementById('displayed-chat-info')
            if(displayed_chat){
                const url_params = event.detail.pathInfo.requestPath.split('/')
                const chat_id = displayed_chat.dataset.displayedChat
                // if the id of the displayed chat is the same as requested chat id
                // abort the request
                if(chat_id === url_params[url_params.length - 1]){
                    event.preventDefault()
                }
            }
        }
    })
})

chat_websocket.addEventListener('message', async (event) => {
    let message
    let sender_id
    let chat_id
    let message_data
    let text
    let image
    let sender_username
    let chat_is_archived
    if (event.data.includes('chat_message')){
        console.log(event.data)
        message = event.data.replace('chat_message', '')
        message_data = message.split('-')
        sender_id = message_data[0]
        text = message_data[1]
        image = message_data[2]
        // if the message was sent by the auth user, play a sound and update the chat list
        // only append the message's HTML otherwise
        if (user_id === sender_id){
            message_sent_audio.play()
            new_message = true
            htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                tools.update_chat_list()
                new_message = false
            })
        }
        else {
            // timeout to make sure the new message is already stored in the database before requesting it
            setTimeout(() => {
                htmx.ajax('GET', `/append_message/${localStorage.getItem('chat_id')}`, {target:'#chat-messages', swap:'beforeend'}).then( () => {
                    tools.update_chat_list()
                })  
            }, 500)
 
        }
    }

    else if (event.data.includes('chat_notification')){
        message = event.data.replace('chat_notification', '')
        message = message.split('-')
        sender_id = message[0]
        text = message[1]
        sender_username = message[2]
        chat_is_archived = message[3] === 'True' ? true : false

        const displayed_chat_contact_info = document.getElementById('contact-name')
        let noti_from_opened_chat = false
        // if a chat is opened
        if (displayed_chat_contact_info){
            // Tells whether or not the notification is from the currently opened chat
            noti_from_opened_chat = displayed_chat_contact_info.dataset.userObjectId === sender_id
        }
        if(!chat_is_archived && !noti_from_opened_chat){
            const toastNotification = document.getElementById('liveToast')
            tools.modifyNotification(sender_username, text)
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
            message_received_audio.play()
            toastBootstrap.show()
            tools.update_chat_list()

        }
    }

    else if (event.data.includes('message_deletion')){
        message = event.data.replace('message_deletion', '')
        message = message.split('-')
        sender_id = message[0]
        sender_username = message[1]
        chat_id = message[2]
        /**
        * the JS code (receiver) analises the websocket message
        * and then decides whether or not to update the UI using
        * a HTMX.ajax request.
        */
        tools.update_chat_list()
        if (sender_id === user_id){
            return
        }
        new_message = true
        if (document.getElementById('contact-name') !== null){
            if (localStorage.getItem('chat_id') === chat_id) {
                htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                    tools.scroll_to_bottom()
                })
                
            } 
        }
    }

    else if (event.data.includes('message_edition')){
        console.log(event.data)
        message = event.data.replace('message_edition', '')
        message = message.split('-')
        sender_id = message[0]
        sender_username = message[1]
        chat_id = message[2]
        /**
        * the JS code (receiver) analises the websocket message
        * and then decides whether or not to update the UI using
        * a HTMX.ajax request.
        */
        tools.update_chat_list()
       if (sender_id === user_id){
            return
       }
       new_message = true
        if (document.getElementById('contact-name') !== null){
            if (localStorage.getItem('chat_id') === chat_id) {
                htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display').then(() => {
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
    }

    window.show_modal = function(modal){
        modal.setAttribute('status', 'showing')
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
    }


})

status_websocket.addEventListener('message', async (event) => {
    let status_event_data = event.data.replace('status_notification-','')
    status_event_data = status_event_data.split('-')
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
                status_notification_audio.play()                
                toastBootstrap.show()

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
            notification_audio.play()
            toastBootstrap.show()
        }

    }
    // if the status UI is already displayed and the user status modal is hidden, reload the view
    // to be able to see the brand new contact status....
    const status_modals = document.querySelectorAll('.status-modal')
    const status_modals_showing = tools.at_least_one_attr(status_modals, 'status', 'showing')
    if (document.getElementById('contact-statuses-list') !== null){
        status_app = {
            pending_updates : true
        }
        if (!status_modals_showing){
            htmx.ajax('GET', '/statuses', '#chats-and-more')
            .then( () => {
                status_app.pending_updates = false
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