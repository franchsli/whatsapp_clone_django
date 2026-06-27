import * as tools from  './tools.js';

class ChatWebSocket{
    constructor({url = '', parentAppClass = null}){
        this.clientWebSocket = new WebSocket(url)
        this.clientWebSocket.onopen = async (event) => {
            console.log('CONNECTION OPENED WITH CHAT WEBSOCKET')
            this.app = parentAppClass
            this.app.newMessage = false

        }

        this.clientWebSocket.onmessage = async (event) => {
            const data = JSON.parse(event.data)
            debugger
            this.message = data.message
            this.senderId = data.sender_id
            this.chatId = data.chat_id
            this.image = data.image
            this.senderContactName = data.sender_contact_name
            this.chatIsArchived = data.chat_is_archived === 'True' ? true : false
            if (data.type === 'chat_message'){
                this.handleChatMessage()
            }
        
            else if (data.type === 'chat_notification'){
                this.handleChatNotification()
            }
        
            else if (data.type === 'chat_message_deletion'){
                this.handleMessageDeletion()
            }
        
            else if (data.type === 'chat_message_edition'){
                this.handleMessageEdition()
            }

            else if (data.type === 'chat_creation'){
                this.handleChatCreation(data.contact_name)
            }

            else if (data.type === 'chat_opening'){
                this.handleChatOpening(data.chat_opener_id, data.chat_id)
            }

            else if (data.type === 'contact_creation'){
                this.handleContactCreation(data.contact_name)
            }

            else if (data.type === 'group_creation') {
                this.handleGroupCreation(data.group_name)
            }

        }

        this.clientWebSocket.onerror = (error) => {
            console.log('WS State:', this.clientWebSocket.readyState);
            console.log('WS Error:', error)
        };

        this.clientWebSocket.onclose = (event) => {
            console.log('WS Closed. Code:', event.code, 'Reason:', event.reason);
            console.log('Was clean?:', event.wasClean);
        }
    }
    /**
     * Send the chat message data to the websocket.
     * @param {String} messageType The type of the message.
     * @param {String} messageText The text of the message.
     * @param {String} messageImage A string of image data encoded in base64.
     * @param {String} messageSenderId The id of who sent the chat message.
     */
    sendMessage (messageType, messageText, messageImage, messageSenderId){
        tools.sendToWebsocket(this.clientWebSocket, {
            'type': messageType,
            'message': messageText,
            'image': messageImage,
            'receiver_username': sessionStorage.getItem('receiverUsername'),
            'sender_id': messageSenderId,
            'chat_id': sessionStorage.getItem('chatId'),
            'chat_members_phones': sessionStorage.getItem('chatMembersPhones'),
            'reply_to': sessionStorage.getItem('replyTo')
        })
        // removes the item to avoid bugs
        sessionStorage.removeItem('replyTo')
    }

    handleChatMessage(){
        // if the message was sent by the auth user, play a sound and update the chat list
        // only append the message's HTML otherwise
        if (userId === this.senderId){
            this.app.messageSentAudio.play()
            this.app.newMessage = true
            htmx.ajax('GET', `/display_chat/${sessionStorage.getItem('chatId')}`, '#chat-display').then(() => {
                tools.updateChatList()
                this.app.newMessage = false
            })
        }
        else {
            // timeout to make sure the new message is already stored in the database before requesting it
            setTimeout(() => {
                htmx.ajax('GET', `/append_message/${sessionStorage.getItem('chatId')}`, {target:'#chat-messages', swap:'beforeend'}).then( () => {
                    tools.updateChatList()
                })  
            }, 500)
 
        }
    }

    handleChatNotification(){
        debugger
        const displayedChatContactInfo = document.getElementById('contact-name')
        let notiFromOpenedChat = false
        // if a chat is opened
        if (displayedChatContactInfo){
            // Tells whether or not the notification is from the currently opened chat
            notiFromOpenedChat = displayedChatContactInfo.dataset.userObjectId === this.senderId
        }
        if(!this.chatIsArchived && !notiFromOpenedChat){
            tools.triggerNotification(this.senderContactName, this.message, this.app.messageReceivedAudio)
            tools.updateChatList()

        }
    }

    handleMessageDeletion(){
        this.handleUiUpdate()
    }

    handleMessageEdition(){
        this.handleUiUpdate()
    }

    handleUiUpdate(){
        /**
        * the JS code (receiver) analises the websocket message
        * and then decides whether or not to update the UI using
        * a HTMX.ajax request.
        */
        tools.updateChatList()
        if (this.senderId === userId){
            return
        }
        this.app.newMessage = true
        if (document.getElementById('contact-name') !== null){
            if (sessionStorage.getItem('chatId') === this.chatId) {
                htmx.ajax('GET', `/display_chat/${sessionStorage.getItem('chatId')}`, '#chat-display').then(() => {
                    tools.scrollToBottom()
                })
                
            } 
        }
    }

    /**
     * 
     * @param {String} contactName 
     */
    handleChatCreation(contactName){
        if (this.app.timeoutId) {
            clearTimeout(this.app.timeoutId)
            this.app.timeoutId = null
        }
        tools.resetChatForm(this.app.chatForm)
        tools.triggerNotification('Server', 
            `The chat with ${contactName} was created successfully!! Update your chat list by clicking the "chats" button.`,
            this.app.notificationAudio)
        tools.updateChatList()
    }

    /**
     * 
     * @param {String} contactName 
     */
    handleContactCreation(contactName){
        if (this.app.timeoutId) {
            clearTimeout(this.app.timeoutId)
            this.app.timeoutId = null
        }
        tools.reset_contact_form(this.app.contactForm)
        tools.triggerNotification('Server', 
            `The contact ${contactName} was created successfully! 
            Update your contacts list by clicking the "contacts" button.`,
            this.app.notificationAudio)
        tools.updateContactList()
    }

    /**
     * 
     * @param {String} groupName 
     */
    handleGroupCreation(groupName){
        if (this.app.timeoutId) {
            clearTimeout(this.app.timeoutId)
            this.app.timeoutId = null
        }
        tools.resetChatForm(this.app.chatForm)
        tools.triggerNotification('Server', 
            `The group ${groupName} was created successfully!! Update your chat list by clicking the "chats" button.`,
            this.app.notificationAudio)
        tools.updateChatList()
    }

    /**
     * 
     * @param {String} chatOpenerId 
     * @param {String} chatId 
     */
    handleChatOpening(chatOpenerId, chatId){
        if (chatOpenerId !== userId && document.getElementById(chatId)) {
            tools.updateChatList()
        }
    }

}

class StatusWebSocket {
    constructor({url = '', parentAppClass = null}){
        this.clientWebSocket = new WebSocket(url)
        this.app = parentAppClass
        this.clientWebSocket.onopen = () => {
            console.log('CONNECTION OPENED WITH STATUS WEBSOCKET')
            window.deleteStatus = (button) => {
                tools.sendToWebsocket(this.clientWebSocket, {
                    'type':'DELETE',
                    'user_id': button.dataset.creator,
                    'status_id': button.dataset.status
                })
                console.log("DELETED")

            }
        }
        this.clientWebSocket.onmessage = async (event) => {
            const statusData = JSON.parse(event.data)
            if (statusData.type === 'status_notification'){
                await this.handleStatusNotification(statusData.user_id, statusData.sender_phone_number)
            }
            // if the status UI is already displayed and the user status modal is hidden, reload the view
            // to be able to see the brand new contact status....
            const statusModals = document.querySelectorAll('.status-modal')
            const statusModalsShowing = tools.atLeastOneAttr(statusModals, 'status', 'showing')
            if (document.getElementById('contact-statuses-list') !== null){
                statusApp = {
                    pendingUpdates : true
                }
                if (!statusModalsShowing){
                    htmx.ajax('GET', '/statuses', '#chats-and-more')
                    .then( () => {
                        statusApp.pendingUpdates = false
                    })
                } 
            }
        }
        this.clientWebSocket.onerror = (error) => {
            console.log('WS State:', this.readyState);
            console.log('WS Error:', error)
        };

        this.clientWebSocket.onclose = (event) => {
            console.log('WS Closed. Code:', event.code, 'Reason:', event.reason);
            console.log('Was clean?:', event.wasClean);
        }
    }

    /**
     * Send the status' data to the websocket to create a new status.
     * @param {String} userId 
     * @param {String} userPhoneNumber 
     * @param {String} text 
     * @param {String} imageSrc 
     * @param {String} color 
     */
    send_status(userId, userPhoneNumber, text, imageSrc, color){
        tools.sendToWebsocket(this.clientWebSocket, {
            'type': 'CREATE',
            'user_id': userId,
            'sender_phone_number': userPhoneNumber,
            'text': text,
            'image': imageSrc,
            'color': color,
        })
    }

    /**
     * 
     * @param {Object} statusSenderData The data
     * of the one who uploaded the status.
     */
    displayStatusNotification(statusSenderData){
        // if the contacts IS NOT muted from statuses
        // display a notification
        if (!statusSenderData[0].statuses_muted){
            tools.triggerNotification('Server', `${statusSenderData[0].name} uploaded a status!!!`, 
                this.app.statusNotificationAudio)
        }
    }

    /**
     * 
     * @param {String} senderId
     * @param {String} senderPhoneNumber
     */
    async handleStatusNotification(senderId, senderPhoneNumber){
        // if the userId of the user who triggered the message is not the same
        // as the auth user, think about displaying a notification.
        if (senderId !== userId){
            const statusSenderData = await tools.get(`/api/contacts/?phone_number=${senderPhoneNumber}&created_by=${userId}`)
            debugger
            this.displayStatusNotification(statusSenderData)
        }
        // otherwise, it means that the user
        // used the form, so clean it and display a success notification
        else {
            debugger
            if (this.app.timeoutId) {
                clearTimeout(this.app.timeoutId)
                this.app.timeoutId = null
            }
            const imageContainer = this.app.statusImagePreviewContainer
            tools.resetStatusForm(this.app.statusForm, imageContainer)
            // if the image preview exists in memory, delete it.
            if (imageContainer) {
                this.app.statusImagePreviewContainer = null
            }
            //notify the user
            tools.triggerNotification('Server', 'Status uploaded successfully!',
                this.app.notificationAudio
            )
        }   
    }

}


class App {
    constructor(){
        // set up all the variables needed
        window.user = document.getElementById('profile-pic')
        window.userId = user.getAttribute('data-user')
        window.userPhoneNumber = user.getAttribute('data-phone')
        // sets the Websocket protocol depending on the WEB protocol
        this.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.chatWebSocket = new ChatWebSocket({url: `${this.protocol}//${window.location.host}/`,
                                                    parentAppClass: this})
        this.statusWebSocket = new StatusWebSocket({url: `${this.protocol}//${window.location.host}/status/`,
                                                    parentAppClass: this})
        this.chatsAndMore = document.getElementById("chats-and-more")
        this.chatForm = document.getElementById("chat-creation-form")
        this.chatSubmitButton = document.getElementById('chat-submit-btn')
        this.chatModal = document.getElementById('NewChat')
        this.chatDisplay = document.getElementById('chat-display')
        this.contactForm = document.getElementById("contact-creation-form")
        this.contactSubmitButton = document.getElementById('contact-submit-btn')
        this.contactModal = document.getElementById('NewContact')
        this.statusForm = document.getElementById('status_form')
        this.statusModal = document.getElementById('CreateStatusModal')
        this.statusSubmitButton = document.getElementById('status-submit-btn')
        this.statusImagePreviewContainer = null
        this.statusImageInput = document.getElementById('id_image')
        this.notificationAudio = new Audio('static/Audio/app/notification.mp3')
        this.messageReceivedAudio = new Audio('static/Audio/app/message_received.mp3')
        this.messageSentAudio = new Audio('static/Audio/app/message_sent.mp3')
        this.errorAudio = new Audio('static/Audio/app/error_sound.mp3')
        this.statusNotificationAudio = new Audio('static/Audio/app/new_status.mp3')
        this.newMessage = false
        this.timeoutId = null
        this.timeoutLength = 5000
        this.debugLogs = 'relevant'
        this.debuggingMode = true
        
    }

    loadEventListeners(){
        this.chatForm.onsubmit = async (event) => {
            debugger
            event.preventDefault()
            tools.setButtonLoading(this.chatSubmitButton)
            const chatFormValidation = await tools.validateChatForm(this.chatForm)
            const validationMessageContainer = document.getElementById('chat-validation-message')
            if (!chatFormValidation.isValid){
                this.errorAudio.play()
                tools.showValidationErrorMessage(validationMessageContainer, chatFormValidation.message)
                tools.setButtonReady(this.chatSubmitButton)
            }
            else{
                if (chatFormValidation.intention === 'create_chat') {
                    tools.createChatViaConsumer(this.chatForm, this.chatWebSocket.clientWebSocket)
                    this.timeoutId = setTimeout (() => {
                        tools.notifyFormSubmissionTimeout(this.chatSubmitButton, this.errorAudio)
                    }, this.timeoutLength)
                }
                else {
                    const groupNameContainer = this.chatForm.querySelector('input[type="text"]')
                    const groupName = groupNameContainer.value.trim()
                    tools.createGroupViaConsumer(this.chatForm, 
                        this.chatWebSocket.clientWebSocket, groupName)
                    this.timeoutId = setTimeout (() => {
                        tools.notifyFormSubmissionTimeout(this.chatSubmitButton, this.errorAudio)
                    }, this.timeoutLength)
                    
                }
            }
        }
        this.contactForm.onsubmit = async (event) => {
            debugger
            event.preventDefault()
            tools.setButtonLoading(this.contactSubmitButton)
            const contactFormValidation = await tools.validate_contact_form(this.contactForm)
            if (contactFormValidation.isValid) {
                tools.createContactViaConsumer(this.contactForm, this.chatWebSocket.clientWebSocket)
                this.timeoutId = setTimeout (() => {
                    tools.notifyFormSubmissionTimeout(this.contactSubmitButton, this.errorAudio)
                }, this.timeoutLength)
            }
            else {
                const validationMessageContainer = document.getElementById('contact-validation-message')
                tools.showValidationErrorMessage(validationMessageContainer, contactFormValidation.message)
                this.errorAudio.play()
                tools.setButtonReady(this.contactSubmitButton)
            }
        }

        this.statusForm.onsubmit = (event) => {
            debugger
            event.preventDefault();
            tools.setButtonLoading(this.statusSubmitButton)
            const statusFormValidaton = tools.validate_status_form(this.statusForm)
            if (statusFormValidaton.isValid) {
                const statusInput = document.getElementById('id_text')
                const imageContainer = this.statusImagePreviewContainer
                const image = imageContainer !== null ? imageContainer.firstElementChild : null
                const colorField = document.getElementById('id_color')
                this.statusWebSocket.sendStatus(
                    userId,
                    userPhoneNumber,
                    statusInput.value,
                    image !== null ? image.src : null,
                    colorField.value
                )
                this.timeoutId = setTimeout (() => {
                    tools.notifyFormSubmissionTimeout(this.statusSubmitButton, this.errorAudio)
                }, this.timeoutLength)
            } 
            else {
                const validationMessageContainer = document.getElementById('status-validation-message')
                tools.showValidationErrorMessage(validationMessageContainer, statusFormValidaton.message)
                this.errorAudio.play()
                tools.setButtonReady(this.statusSubmitButton)
            }
            

        }
        // gets the image preview div and updates it on input.
        this.statusImageInput.oninput = () => {
            debugger
            const inputWasCleaned = this.statusImageInput.files.length === 0
            if (inputWasCleaned) {
                const image = this.statusImagePreviewContainer
                image.remove()
                this.statusImagePreviewContainer = null
            }
            else {
                tools.previewImage(this.statusImageInput, this.statusImagePreviewContainer)
                this.statusImagePreviewContainer = document.getElementById('status-imagePreview')
            }
        }

        // resets the chat form values and validation errors when the modal is closed.
        this.chatModal.addEventListener('hidden.bs.modal', () => {
            tools.resetChatForm(this.chatForm)
        })
        // resets the contact form values and validation errors when the modal is closed.
        this.contactModal.addEventListener('hidden.bs.modal', () => {
            tools.resetContactForm(this.contactForm)
        })

        // same for the status modal.
        this.statusModal.addEventListener('hidden.bs.modal', () => {
            tools.resetStatusForm(this.statusForm, this.statusImagePreviewContainer)
        })

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                tools.closeChat()
            }
        })
    }

}


/**
 * Tells the websocket to reconnect to the provided chat channel.
 * @param {HTMLElement} chat 
 */
window.summonChat = function(chat, chatWebSocket){
    const chatMembersPhonesContainer = document.getElementById(chat.dataset.chatMembersPhonesDataId)
    const chatMembersPhones = JSON.parse(chatMembersPhonesContainer.firstChild.textContent)
    tools.send_to_websocket(chatWebSocket, {
        'type':'reconnect',
        'reconnect_to': chat.dataset.chat
    })
    sessionStorage.setItem('receiverUsername', chat.dataset.contact)
    sessionStorage.setItem('chatId', chat.dataset.chat)
    sessionStorage.setItem('chatMembersPhones', chatMembersPhones)
    // clears this key to avoid bugs
    sessionStorage.removeItem('replyTo')

}

/**
 * Notifies to the websocket that the user is opening a chat.
 * @param {HTMLElement} chat 
 * @param {WebSocket} chatWebSocket 
 */
window.notifyChatOpening = function(chat, chatWebSocket){
    debugger
    tools.sendToWebsocket(chatWebSocket, {
        'type': 'chat_opening',
        'chat_opener_id': userId,
        'chat_id': chat.id,
        'chat_members_phones': sessionStorage.getItem('chatMembersPhones'),
    })
}


tools.loadGlobalDocFunctions()

document.addEventListener('DOMContentLoaded', () => {
    const main = new App()
    window.cleanupFunctions = new Map();
    main.loadEventListeners()
    window.chatWebSocket = main.chatWebSocket.clientWebSocket
    // Callback function to execute when mutations are observed
    const chatMutationCallback = function(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check if a new element is added
                const addedNodes = mutation.addedNodes;
                for (const addedNode of addedNodes) {
                    // Check if it's a footer element node
                    if (addedNode.nodeType === 1 && addedNode.tagName === 'FOOTER'){ 
                        window.newMessageInput = document.getElementById('new-message')
                        window.newMessageButton = document.getElementById('send-message-button')
                        window.deleteMessageOptionButtons = document.querySelectorAll('.delete-message')
                        const imageInputCaller = document.getElementById('imageInputCaller')
                        const imageInput = document.getElementById('imageInput')
                        const imagePreview = document.getElementById('imagePreview')
                        imageInput.addEventListener('change', () => {
                            tools.previewImage(imageInput, imagePreview)
                        });

                        
                        deleteMessageOptionButtons.forEach( button => {
                            button.onclick = function() {
                                // scroll to bottom after deleting the message
                                setTimeout(tools.scrollToBottom, 1000)
                            }})
                        
                        imageInputCaller.addEventListener('click', (event) => {
                            event.preventDefault()
                            imageInput.click()
                        })
                        
                        
                        newMessageInput.addEventListener('keypress', (event) => {
                            if (event.key === 'Enter' && (newMessageInput.value !== '' || imageInput.value !== '')){
                                let image = document.getElementById('imagePreview').firstElementChild
                                main.chatWebSocket.sendMessage('message', newMessageInput.value, imageInput.value !== '' ? image.src : '', userId)
                                
                                newMessageInput.value = ''
                                //deletes the selected image
                                if (imageInput.value != ''){
                                    imageInput.value = ''
                                    image.remove()
                                }      
                            }})
                        
                    
                        newMessageButton.onclick = () => {
                            if (newMessageInput.value !== '' || imageInput.value !== ''){
                                let image = document.getElementById('imagePreview').firstElementChild    
                                main.chatWebSocket.sendMessage('message', newMessageInput.value, imageInput.value !== '' ? image.src : '', userId)
                                
                                newMessageInput.value = ''
                                //deletes the selected image
                                if (imageInput.value != ''){
                                    imageInput.value = ''
                                    image.remove()
                                }}}
                            tools.scrollToBottom()

                    }}}}};

    const generalMutationsCallback = function(mutationsList, observer) {
        for (let index = 0; index < mutationsList.length; index++) {
            // only trigger all the tooltips if the last mutation
            // has been made
            if (index + 1 === mutationsList.length){
                tools.triggerTooltips()
            }
            
        }

    };
    // Create a MutationObserver with the callback
    const chatObserver = new MutationObserver(chatMutationCallback)
    const generalObserver = new MutationObserver(generalMutationsCallback)

    // Configure the observer to watch for changes in the container's children
    const observerConfig = { childList: true };

    // Start observing the target container
    chatObserver.observe(main.chatDisplay, observerConfig);
    generalObserver.observe(main.chatsAndMore, observerConfig)
    /**
     * Log htmx events in a comprehensive way.
     * @param {HTMLElement} elt 
     * @param {String} event 
     * @param {Object} data 
     */
    htmx.logger = async function(elt, event, data) {
        // debugging :)
        if (main.debuggingMode && data){
            let previousEvent = data
            if (main.debugLogs === 'issues'){
                if(data.pathInfo){
                    if(!data.pathInfo.responsePath && !data.successful){
                        console.log('AN ERROR HAS OCURRED')
                        console.log("PREVIOUS EVENT DATA:\n", previousEvent)
                        console.log("ACTUAL EVENT:\n", data)
                    }
                }
            }
            else if (main.debugLogs === 'relevant'){
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
            window.previousScrollableView = messages.scrollHeight - messages.clientHeight
        }
    })
    htmx.on('htmx:afterSettle', (event) => {
        // scroll to the previous scroll height before loading older messages
        if(event.detail.pathInfo.requestPath.includes('previous_messages')){
            const messages = document.getElementById('chat-messages')
            const actualScrollableView = messages.scrollHeight - messages.clientHeight
            messages.scroll(0, actualScrollableView - previousScrollableView)
        }
        else if(event.detail.pathInfo.requestPath.includes('edit_message') && event.detail.requestConfig.verb !== 'get'){
            // same logic as real-time message deletion
            // but this is due to a message edition
            main.chatWebSocket.sendMessage('message_edition', '', '', userId)
        }
        else if(event.detail.pathInfo.requestPath.includes('delete_message')){
            /**
             * send a message to the chat websocket to tell the receiver
             * that the chat list needs to be updated due to a message deletion,
             * so the JS code (receiver) analises the websocket message
             * and then decides whether or not to update the UI using
             * a HTMX.ajax request.
             */
            main.chatWebSocket.sendMessage('message_deletion', '', '', userId)
        }
        else if (event.detail.pathInfo.requestPath === '/statuses/'){
            window.userStatusesCaller = document.querySelector('#user-status-caller')
            window.userStatusModal = document.querySelector(`#user-status-modal${userId}`)
            window.contactsStatusModals = document.querySelectorAll('.contact-status-modal')
            window.statusDeletionButtons = document.querySelectorAll('.status-deletion')
            window.contactsWithStatusesCaller = document.querySelectorAll('.contact-status-caller')
            window.carousel = null
        }
        // loads the default emojis
        if (event.detail.pathInfo.requestPath.includes('display_chat')){
            const emojiContainer = document.getElementById('emojis-container')
            const emojiClass = document.querySelector('.emoji-class-active')
            tools.loadEmojis(emojiClass.dataset.emojiPack, emojiContainer)
            // UPDATE THE CHAT LIST IF THERE WERE UNREAD MESSAGES
            const unreadMessagesCounter = document.getElementById(`chat-${sessionStorage.getItem('chatId')}unread-counter`)
            if (unreadMessagesCounter){
                tools.updateChatList()
            }
        }
    })
    htmx.on('htmx:beforeRequest', (event) => {
        // cancel the request if the requested chats is already displayed.
        if(event.detail.pathInfo.requestPath.includes('display_chat')){
            if(main.newMessage){
                main.newMessage = false
                return
            }
            const displayedChat =  document.getElementById('displayed-chat-info')
            if(displayedChat){
                const urlParams = event.detail.pathInfo.requestPath.split('/')
                const chatId = displayedChat.dataset.displayedChat
                // if the id of the displayed chat is the same as requested chat id
                // abort the request
                if(chatId === urlParams[urlParams.length - 1]){
                    event.preventDefault()
                }
            }
        }
    })

})