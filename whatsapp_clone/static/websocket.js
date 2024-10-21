import * as tools from  './tools.js';

class Chat_Web_Socket{
    constructor({url = '', parent_app_class = null}){
        this.client_websocket = new WebSocket(url)
        this.client_websocket.onopen = async (event) => {
            console.log('CONNECTION OPENED WITH CHAT WEBSOCKET')
            this.app = parent_app_class
            this.app.new_message = false

        }

        this.client_websocket.onmessage = async (event) => {
            this.message = null
            this.sender_id = null
            this.chat_id = null
            this.message_data = null
            this.text = null
            this.image = null
            this.sender_username = null
            this.chat_is_archived = null
            if (event.data.includes('chat_message')){
                this.handle_chat_message(event)
            }
        
            else if (event.data.includes('chat_notification')){
                this.handle_chat_notification(event)
            }
        
            else if (event.data.includes('message_deletion')){
                this.handle_message_deletion(event)
            }
        
            else if (event.data.includes('message_edition')){
                this.handle_message_edition(event)
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
        this.client_websocket.send(JSON.stringify({
            'type': message_type,
            'message': message_text,
            'image': message_image,
            'receiver_username': localStorage.getItem('receiver_username'),
            'sender_user_id': message_sender_id,
            'chat_id': localStorage.getItem('chat_id'),
            'chat_members_phones': localStorage.getItem('chat_members_phones')
        }))

    }

    handle_chat_message(event){
        console.log(event.data)
        this.message = event.data.replace('chat_message', '')
        this.message_data = this.message.split('-')
        this.sender_id = this.message_data[0]
        this.text = this.message_data[1]
        this.image = this.message_data[2]
        // if the message was sent by the auth user, play a sound and update the chat list
        // only append the message's HTML otherwise
        if (this.user_id === this.sender_id){
            this.app.message_sent_audio.play()
            this.app.new_message = true
            htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                tools.update_chat_list()
                this.app.new_message = false
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

    handle_chat_notification(event){
        this.message = event.data.replace('chat_notification', '')
        this.message = this.message.split('-')
        this.sender_id = this.message[0]
        this.text = this.message[1]
        this.sender_username = this.message[2]
        this.chat_is_archived = this.message[3] === 'True' ? true : false

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
            this.app.message_received_audio.play()
            toastBootstrap.show()
            tools.update_chat_list()

        }
    }

    handle_message_deletion(event){
        this.message = event.data.replace('message_deletion', '')
        this.message = this.message.split('-')
        this.sender_id = this.message[0]
        this.sender_username = this.message[1]
        this.chat_id = this.message[2]
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
            if (localStorage.getItem('chat_id') === chat_id) {
                htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                    tools.scroll_to_bottom()
                })
                
            } 
        }
    }

    handle_message_edition(event){
        console.log(event.data)
        this.message = event.data.replace('message_edition', '')
        this.message = this.message.split('-')
        this.sender_id = this.message[0]
        this.sender_username = this.message[1]
        this.chat_id = this.message[2]
        /**
        * the JS code (receiver) analises the websocket message
        * and then decides whether or not to update the UI using
        * a HTMX.ajax request.
        */
        tools.update_chat_list()
       if (this.sender_id === this.app.user_id){
            return
       }
       this.app.new_message = true
        if (document.getElementById('contact-name') !== null){
            if (localStorage.getItem('chat_id') === this.chat_id) {
                htmx.ajax('GET', `/display_chat/${localStorage.getItem('chat_id')}`, '#chat-display').then(() => {
                    tools.scroll_to_bottom()
                })
            }
        }
    }

}

class Status_Web_Socket {
    constructor({url = '', parent_app_class = null}){
        this.websocket_client = new WebSocket(url)
        this.app = parent_app_class
        this.websocket_client.onopen = () => {
            console.log('CONNECTION OPENED WITH STATUS WEBSOCKET')
            window.delete_status = function(button){
                this.websocket_client.send(JSON.stringify({
                    'type':'DELETE',
                    'user_id': button.dataset.creator,
                    'status_id': button.dataset.status
                }))
                if (carousel_instance !== null){
                    carousel_instance.next()
                }
            }
        }
        this.websocket_client.onmessage = async (event) => {
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
                        this.app.status_notification_audio.play()                
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
                    this.app.notification_audio.play()
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
        }
        this.websocket_client.onerror = (error) => {
            console.log('WS State:', this.readyState);
            console.log('WS Error:', error)
        };

        this.websocket_client.onclose = (event) => {
            console.log('WS Closed. Code:', event.code, 'Reason:', event.reason);
            console.log('Was clean?:', event.wasClean);
        }
    }

}


class App {
    constructor(){
        // set up all the variables needed
        this.user = document.getElementById('profile-pic')
        this.user_id = this.user.getAttribute('data-user')
        this.user_phone_number = this.user.getAttribute('data-phone')
        // sets the Websocket protocol depending on the WEB protocol
        this.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.chat_websocket = new Chat_Web_Socket({url: `${this.protocol}//${window.location.host}/`,
                                                    parent_app_class: this})
        this.status_websocket = new Status_Web_Socket({url: `${this.protocol}//${window.location.host}/status/`,
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
        
    }

    load_event_listeners(){
        this.chat_form.onsubmit = async (event) => {
            event.preventDefault()
            tools.validate_chat_form(this.chat_form, this.error_audio, this.chat_websocket)
        }
        this.contact_form.onsubmit = async () => {
            tools.validate_contact_form(this.contact_form, this.error_audio, this.notification_audio, this.chat_websocket)
        }

        this.status_submit_button.onclick = (event) => {
            event.preventDefault()
            if(tools.cand_send_messages(this.status_websocket)){
                tools.validate_status_form(this.error_audio, this.status_websocket)
            }

        }
        // gets the image preview div and updated it over time.
        this.status_image_input.onchange = () => {
            tools.previewImage(status_image_input, stauts_image_preview)
        }

        // resets the contact form values and validation errors when the modal is closed.
        this.chat_modal.addEventListener('hidden.bs.modal', function (event) {
            const validation_message = document.getElementById('chat-validation-message')
            for (let index = 0; index < chat_form.elements.length; index++) {
                if (chat_form.elements[index].type === 'checkbox'){
                    chat_form.elements[index].checked = false
                }
                
            }
            validation_message.innerText = ''
        })
        // resets the contact form values and validation errors when the modal is closed.
        this.contact_modal.addEventListener('hidden.bs.modal', function (event) {
            const inputs = contact_form.getElementsByTagName('input')
            const validation_message = document.getElementById('contact-validation-message')
            inputs[1].value = ''
            inputs[2].value = ''
            inputs[3].checked = false
            inputs[4].checked = false
            validation_message.innerText = ''
        })

        // same for the status modal.
        this.status_modal.addEventListener('hidden.bs.modal', function (event) {
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
    }

}






/**
 * Tells the websocket to reconnect to the provided chat channel.
 * @param {HTMLElement} chat 
 */
window.summon_chat = function(chat, chat_websocket){
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


tools.load_global_doc_functions()

document.addEventListener('DOMContentLoaded', () => {
    const main = new App()
    window.chat_websocket = main.chat_websocket.client_websocket
    // Callback function to execute when mutations are observed
    const chat_mutation_callback = function(mutationsList, observer) {
        console.log(main.chat_websocket.client_websocket)
        console.log(main.user_id)
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
                                main.chat_websocket.send_message('message', new_message_input.value, imageInput.value !== '' ? image.src : '', main.user_id)
                                
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
                                main.chat_websocket.send_message('message', new_message_input.value, imageInput.value !== '' ? image.src : '', main.user_id)
                                
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
        else if(event.detail.pathInfo.requestPath.includes('edit_message')){
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