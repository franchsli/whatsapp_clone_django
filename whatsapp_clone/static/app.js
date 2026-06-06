import * as tools from  './tools.js';

class ChatWebSocket{
    constructor({url = '', parent_app_class = null}){
        this.client_websocket = new WebSocket(url)
        this.client_websocket.onopen = async (event) => {
            console.log('CONNECTION OPENED WITH CHAT WEBSOCKET')
            this.app = parent_app_class
            this.app.new_message = false

        }

        this.client_websocket.onmessage = async (event) => {
            const data = JSON.parse(event.data)
            debugger
            this.message = data.message
            this.sender_id = data.sender_id
            this.chat_id = data.chat_id
            this.image = data.image
            this.sender_contact_name = data.sender_contact_name
            this.chat_is_archived = data.chat_is_archived === 'True' ? true : false
            if (data.type === 'chat_message'){
                this.handle_chat_message()
            }
        
            else if (data.type === 'chat_notification'){
                this.handle_chat_notification()
            }
        
            else if (data.type === 'chat_message_deletion'){
                this.handle_message_deletion()
            }
        
            else if (data.type === 'chat_message_edition'){
                this.handle_message_edition()
            }

        }

        this.client_websocket.onerror = (error) => {
            console.log('WS State:', this.client_websocket.readyState);
            console.log('WS Error:', error)
        };

        this.client_websocket.onclose = (event) => {
            console.log('WS Closed. Code:', event.code, 'Reason:', event.reason);
            console.log('Was clean?:', event.wasClean);
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
        tools.send_to_websocket(this.client_websocket, {
            'type': message_type,
            'message': message_text,
            'image': message_image,
            'receiver_username': sessionStorage.getItem('receiver_username'),
            'sender_id': message_sender_id,
            'chat_id': sessionStorage.getItem('chat_id'),
            'chat_members_phones': sessionStorage.getItem('chat_members_phones'),
            'reply_to': sessionStorage.getItem('reply_to')
        })
        // removes the item to avoid bugs
        sessionStorage.removeItem('reply_to')
    }

    handle_chat_message(){
        // if the message was sent by the auth user, play a sound and update the chat list
        // only append the message's HTML otherwise
        if (user_id === this.sender_id){
            this.app.message_sent_audio.play()
            this.app.new_message = true
            htmx.ajax('GET', `/display_chat/${sessionStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                tools.update_chat_list()
                this.app.new_message = false
            })
        }
        else {
            // timeout to make sure the new message is already stored in the database before requesting it
            setTimeout(() => {
                htmx.ajax('GET', `/append_message/${sessionStorage.getItem('chat_id')}`, {target:'#chat-messages', swap:'beforeend'}).then( () => {
                    tools.update_chat_list()
                })  
            }, 500)
 
        }
    }

    handle_chat_notification(){
        debugger
        const displayed_chat_contact_info = document.getElementById('contact-name')
        let noti_from_opened_chat = false
        // if a chat is opened
        if (displayed_chat_contact_info){
            // Tells whether or not the notification is from the currently opened chat
            noti_from_opened_chat = displayed_chat_contact_info.dataset.userObjectId === this.sender_id
        }
        if(!this.chat_is_archived && !noti_from_opened_chat){
            tools.triggerNotification(this.sender_contact_name, this.message, this.app.message_received_audio)
            tools.update_chat_list()

        }
    }

    handle_message_deletion(){
        this.handle_ui_update()
    }

    handle_message_edition(){
        this.handle_ui_update()
    }

    handle_ui_update(){
        /**
        * the JS code (receiver) analises the websocket message
        * and then decides whether or not to update the UI using
        * a HTMX.ajax request.
        */
        tools.update_chat_list()
        if (this.sender_id === user_id){
            return
        }
        this.app.new_message = true
        if (document.getElementById('contact-name') !== null){
            if (sessionStorage.getItem('chat_id') === this.chat_id) {
                htmx.ajax('GET', `/display_chat/${sessionStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                    tools.scroll_to_bottom()
                })
                
            } 
        }
    }

}

class StatusWebSocket {
    constructor({url = '', parent_app_class = null}){
        this.client_websocket = new WebSocket(url)
        this.app = parent_app_class
        this.client_websocket.onopen = () => {
            console.log('CONNECTION OPENED WITH STATUS WEBSOCKET')
            window.delete_status = (button) => {
                tools.send_to_websocket(this.client_websocket, {
                    'type':'DELETE',
                    'user_id': button.dataset.creator,
                    'status_id': button.dataset.status
                })
                console.log("DELETED")

            }
        }
        this.client_websocket.onmessage = async (event) => {
            const status_data = JSON.parse(event.data)
            if (status_data.type === 'status_notification'){
                // if the user_id of the user who triggered the message is not the same
                // as the auth user, think about displaying a notification.
                if (status_data.user_id !== user_id){
                    const status_sender_data = await tools.get(`/api/contacts/?phone_number=${status_data.sender_phone_number}&created_by=${user_id}`)
                    debugger
                    // if the contacts IS NOT muted from statuses
                    // display a notification
                    if (!status_sender_data[0].statuses_muted){
                        tools.triggerNotification('Server', `${status_sender_data[0].name} uploaded a status!!!`, 
                            this.app.status_notification_audio)
        
                    }
                }
                // otherwise, it means that the user
                // used the form, so clean it and display a success notification
                else {
                    debugger
                    this.app.status_form.reset()
                    // if the image preview exists, delete it.
                    const image_container = this.app.status_image_preview_container
                    if (image_container) {
                        image_container.remove()
                        this.app.status_image_preview_container = null
                    }
                    const validation_message = document.getElementById('status-validation-message')
                    validation_message.innerText = ''
                    const color_input = document.getElementById('id_color')
                    if (color_input.jscolor) {
                        color_input.jscolor.fromString('#000000');
                    }
                    //notify the user
                    tools.triggerNotification('Server', 'Status uploaded successfully!',
                        this.app.notification_audio
                    )
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
        }
        this.client_websocket.onerror = (error) => {
            console.log('WS State:', this.readyState);
            console.log('WS Error:', error)
        };

        this.client_websocket.onclose = (event) => {
            console.log('WS Closed. Code:', event.code, 'Reason:', event.reason);
            console.log('Was clean?:', event.wasClean);
        }
    }

    /**
     * Send the status' data to the websocket to create a new status.
     * @param {String} user_id 
     * @param {String} user_phone_number 
     * @param {String} text 
     * @param {String} image_src 
     * @param {String} color 
     */
    send_status(user_id, user_phone_number, text, image_src, color){
        tools.send_to_websocket(this.client_websocket, {
            'type': 'CREATE',
            'user_id': user_id,
            'sender_phone_number': user_phone_number,
            'text': text,
            'image': image_src,
            'color': color,
        })
    }

}


class App {
    constructor(){
        // set up all the variables needed
        window.user = document.getElementById('profile-pic')
        window.user_id = user.getAttribute('data-user')
        window.user_phone_number = user.getAttribute('data-phone')
        // sets the Websocket protocol depending on the WEB protocol
        this.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.chat_websocket = new ChatWebSocket({url: `${this.protocol}//${window.location.host}/`,
                                                    parent_app_class: this})
        this.status_websocket = new StatusWebSocket({url: `${this.protocol}//${window.location.host}/status/`,
                                                    parent_app_class: this})
        this.chats_and_more = document.getElementById("chats-and-more")
        this.chat_form = document.getElementById("chat-creation-form")
        this.chat_modal = document.getElementById('NewChat')
        this.chat_display = document.getElementById('chat-display')
        this.contact_form = document.getElementById("contact-creation-form")
        this.contact_modal = document.getElementById('NewContact')
        this.status_form = document.getElementById('status_form')
        this.status_modal = document.getElementById('CreateStatusModal')
        this.status_submit_button = document.getElementById('status-submit')
        this.status_image_preview_container = null
        this.status_image_input = document.getElementById('id_image')
        this.notification_audio = new Audio('static/Audio/app/notification.mp3')
        this.message_received_audio = new Audio('static/Audio/app/message_received.mp3')
        this.message_sent_audio = new Audio('static/Audio/app/message_sent.mp3')
        this.error_audio = new Audio('static/Audio/app/error_sound.mp3')
        this.status_notification_audio = new Audio('static/Audio/app/new_status.mp3')
        this.new_message = false
        this.debug_logs = 'relevant'
        this.debugging_mode = false
        
    }

    load_event_listeners(){
        this.chat_form.onsubmit = async (event) => {
            event.preventDefault()
            debugger
            const chat_form_validation = await tools.validate_chat_form(this.chat_form)
            const validation_message_container = document.getElementById('chat-validation-message')
            if (!chat_form_validation.is_valid){
                this.error_audio.play()
                tools.showValidationErrorMessage(validation_message_container, chat_form_validation.message)
            }
            else{
                if (chat_form_validation.intention === 'create_chat') {
                    tools.create_chat_via_consumer(this.chat_form, this.chat_websocket.client_websocket)
                    tools.triggerNotification('Server', 
                        'The chat was created successfully!! Update your chat list by clicking the "chats" button.',
                        this.notification_audio)
                    tools.update_chat_list()
                }
                else {
                    const group_name_container = chat_form.querySelector('input[type="text"]')
                    const group_name = group_name_container.value.trim()
                    tools.create_group_via_consumer(this.chat_form, 
                        this.chat_websocket.client_websocket, group_name)
                    tools.triggerNotification('Server', 
                        'The group was created successfully!! Update your chat list by clicking the "chats" button.',
                        this.notification_audio)
                    tools.update_chat_list()
                    
                }
            }
        }
        this.contact_form.onsubmit = async () => {
            debugger
            const contact_form_validation = await tools.validate_contact_form(this.contact_form)
            if (contact_form_validation.is_valid) {
                tools.create_contact_via_consumer(this.contact_form, this.chat_websocket.client_websocket)
                tools.triggerNotification('Server', 
                    'The contact was created successfully! Update your contacts list by clicking the "contacts" button.',
                    this.notification_audio)
                tools.update_chat_list()
            }
            else {
                const validation_message_container = document.getElementById('contact-validation-message')
                tools.showValidationErrorMessage(validation_message_container, contact_form_validation.message)
                this.error_audio.play()
            }
        }

        this.status_form.onsubmit = (event) => {
            debugger
            event.preventDefault();
            const status_form_validaton = tools.validate_status_form(this.status_form)
            if (status_form_validaton.is_valid) {
                const status_input = document.getElementById('id_text')
                const image_container = this.status_image_preview_container
                const image = image_container !== null ? image_container.firstElementChild : null
                const color_field = document.getElementById('id_color')
                this.status_websocket.send_status(
                    user_id,
                    user_phone_number,
                    status_input.value,
                    image !== null ? image.src : null,
                    color_field.value
                )
            } 
            else {
                const validation_message_container = document.getElementById('status-validation-message')
                tools.showValidationErrorMessage(validation_message_container, status_form_validaton.message)
                this.error_audio.play()
            }
            

        }
        // gets the image preview div and updates it on input.
        this.status_image_input.oninput = () => {
            debugger
            const input_was_cleaned = this.status_image_input.files.length === 0
            if (input_was_cleaned) {
                const image = this.status_image_preview_container
                image.remove()
                this.status_image_preview_container = null
            }
            else {
                tools.previewImage(this.status_image_input, this.status_image_preview_container)
                this.status_image_preview_container = document.getElementById('status-imagePreview')
            }
        }

        // resets the chat form values and validation errors when the modal is closed.
        this.chat_modal.addEventListener('hidden.bs.modal', () => {
            const form_title = document.getElementById('NewChatLabel')
            const validation_message = document.getElementById('chat-validation-message')
            validation_message.innerText = ''
            form_title.innerText = 'Start new chat'
            this.chat_form.reset()
        })
        // resets the contact form values and validation errors when the modal is closed.
        this.contact_modal.addEventListener('hidden.bs.modal', () => {
            const validation_message = document.getElementById('contact-validation-message')
            validation_message.innerText = ''
            this.contact_form.reset()
        })

        // same for the status modal.
        this.status_modal.addEventListener('hidden.bs.modal', () => {
            const color_input = document.getElementById('id_color')
            const validation_message = document.getElementById('status-validation-message')
            const image_container = this.status_image_preview_container
            const image = image_container !== null ? image_container.firstElementChild : null
            if (image){
                image.remove()
            }
            validation_message.innerText = ''
            if (color_input.jscolor) {
                color_input.jscolor.fromString('#000000');
            }
            this.status_form.reset()
        })

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                tools.close_chat()
            }
        })
    }

}


/**
 * Tells the websocket to reconnect to the provided chat channel.
 * @param {HTMLElement} chat 
 */
window.summon_chat = function(chat, chat_websocket){
    const chat_members_phones_container = document.getElementById(chat.dataset.chatMembersPhonesDataId)
    const chat_members_phones = JSON.parse(chat_members_phones_container.firstChild.textContent)
    tools.send_to_websocket(chat_websocket, {
        'type':'reconnect',
        'reconnect_to': chat.dataset.chat
    })
    sessionStorage.setItem('receiver_username', chat.dataset.contact)
    sessionStorage.setItem('chat_id', chat.dataset.chat)
    sessionStorage.setItem('chat_members_phones', chat_members_phones)
    // clears this key to avoid bugs
    sessionStorage.removeItem('reply_to')

}


tools.load_global_doc_functions()

document.addEventListener('DOMContentLoaded', () => {
    const main = new App()
    window.cleanupFunctions = new Map();
    main.load_event_listeners()
    window.chat_websocket = main.chat_websocket.client_websocket
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
                                main.chat_websocket.send_message('message', new_message_input.value, imageInput.value !== '' ? image.src : '', user_id)
                                
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
                                main.chat_websocket.send_message('message', new_message_input.value, imageInput.value !== '' ? image.src : '', user_id)
                                
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
    const chat_observer = new MutationObserver(chat_mutation_callback)
    const general_observer = new MutationObserver(general_mutations_callback)

    // Configure the observer to watch for changes in the container's children
    const observerConfig = { childList: true };

    // Start observing the target container
    chat_observer.observe(main.chat_display, observerConfig);
    general_observer.observe(main.chats_and_more, observerConfig)
    /**
     * Log htmx events in a comprehensive way.
     * @param {HTMLElement} elt 
     * @param {String} event 
     * @param {Object} data 
     */
    htmx.logger = async function(elt, event, data) {
        // debugging :)
        if (main.debugging_mode && data){
            let previous_event = data
            if (main.debug_logs === 'issues'){
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
        else if(event.detail.pathInfo.requestPath.includes('edit_message') && event.detail.requestConfig.verb !== 'get'){
            // same logic as real-time message deletion
            // but this is due to a message edition
            main.chat_websocket.send_message('message_edition', '', '', user_id)
        }
        else if(event.detail.pathInfo.requestPath.includes('delete_message')){
            /**
             * send a message to the chat websocket to tell the receiver
             * that the chat list needs to be updated due to a message deletion,
             * so the JS code (receiver) analises the websocket message
             * and then decides whether or not to update the UI using
             * a HTMX.ajax request.
             */
            main.chat_websocket.send_message('message_deletion', '', '', user_id)
        }
        else if (event.detail.pathInfo.requestPath === '/statuses/'){
            window.user_statuses_caller = document.querySelector('#user-status-caller')
            window.user_status_modal = document.querySelector(`#user-status-modal${user_id}`)
            window.contacts_status_modals = document.querySelectorAll('.contact-status-modal')
            window.status_deletion_buttons = document.querySelectorAll('.status-deletion')
            window.contacts_with_statuses_caller = document.querySelectorAll('.contact-status-caller')
            window.carousel = null
        }
        // loads the default emojis
        if (event.detail.pathInfo.requestPath.includes('display_chat')){
            const emoji_container = document.getElementById('emojis-container')
            const emoji_class = document.querySelector('.emoji-class-active')
            tools.load_emojis(emoji_class.dataset.emojiPack, emoji_container)
            // UPDATE THE CHAT LIST IF THERE WERE UNREAD MESSAGES
            const unread_messages_counter = document.getElementById(`chat-${sessionStorage.getItem('chat_id')}unread-counter`)
            if (unread_messages_counter){
                tools.update_chat_list()
            }
        }
    })
    htmx.on('htmx:beforeRequest', (event) => {
        // cancel the request if the requested chats is already displayed.
        if(event.detail.pathInfo.requestPath.includes('display_chat')){
            if(main.new_message){
                main.new_message = false
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