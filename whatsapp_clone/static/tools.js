/**
 * Does a GET request to the specified URL and returns the response in  JSON format.
 * @param {String} url the url to which the request will be made
 * @returns {JSON} The response.
 */
async function get(url){
    const response = await fetch(url)
    const data = response.json()
    return data
}

/**
 * Does a PUT request to the specified URL and returns the response in  JSON format
 * if the response is succesful, logs an error otherwise.
 * @param {String} url The url to which the request will be made.
 * @param {Object} data The object containing all the data to be sent to the endpoint.
 * @param {String} token The csrf token.
 */
async function patch(url, data, token){
    const response = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {'Accept': 'application/json, text/plain',
        'Content-Type': 'application/json;charset=UTF-8', 
        'X-CSRFToken': token
        }
    })
    const returnedData = response.json()
    return returnedData
}

/**
 * Moves the scrollbar  at the bottom of the messages in chat.
 */
function scrollToBottom(){
    const messages = document.getElementById('chat-messages')
    if (messages){
        messages.scroll(0, messages.scrollHeight - messages.clientHeight)
    }
}

/**
 * Manipulates the notification toast in the HTML
 * @param {String} contactName The name of the contact who sent the message.
 * @param {String} message The text of the message that was sent.
 */
function modifyNotification(contactName, message){
    const toastNotification = document.getElementById('liveToast')
    let contactNameDisplay = toastNotification.querySelector('strong')
    let messageDisplay = toastNotification.querySelector('.toast-body')
    contactNameDisplay.innerHTML = contactName
    messageDisplay.innerHTML = message

}

/**
 * Adds a button that show more or less of the specified text content.
 * @param {String} textId The id of the HTML element that contains the text.
 */
function toggleReadMore(textId) {
    const contentHtml = document.getElementById(`text-${textId}`)
    if (contentHtml.clientHeight === 200){
        const toggleButton = document.createElement('button')
        toggleButton.innerText = 'Show more'
        toggleButton.classList.add('btn' ,'btn-link')
        toggleButton.style.color = "var(--bs-link-color)"
        toggleButton.style.justifySelf = "end"
    
        toggleButton.onclick = function(){
            contentHtml.style.maxHeight = contentHtml.style.maxHeight === '200px' ? 'none' : '200px'
            toggleButton.textContent = contentHtml.style.maxHeight === '200px' ? 'Show more' : 'Show less'
        }
        contentHtml.insertAdjacentElement('afterend', toggleButton)
    }
}

/**
 * Shows the dropdown  in the same place where it was called.
 * @param {MouseEvent} event The mouse event (right click).
 * @param {String} dropdownId The id of the dropdown that was called.
 */
function showDropdown(event, dropdownId) {
    event.preventDefault();

    // Set the position of the dropdown
    const dropdown = document.getElementById(dropdownId);
    dropdown.style.position = 'fixed';
    dropdown.style.left = `${event.clientX}px`;
    dropdown.style.top = `${event.clientY}px`;

    // Display the dropdown
    dropdown.classList.toggle('show')
    // runs the dropdown animation
    runElementAnimation(dropdown)
    

    // Close the dropdown when clicking outside
    document.addEventListener('click', function closeDropdown() {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeDropdown);
    });
}

/**
 * Runs the animation of the provided class
 *  in a HTMLelement, if no class name is provided, 
 * the element animation will run.
 * @param {HTMLElement} element
 * @param {String} animationClassName
 */
function runElementAnimation(element, animationClassName=''){
    try {
        if (animationClassName === ''){
            element.style.animationPlayState = 'running';
            element.addEventListener('animationend', () => {
                element.style.animationPlayState = 'paused';
            })
        }
        else{
            element.classList.add(animationClassName)
            element.addEventListener('animationend', () => {
                element.classList.remove(animationClassName)
            })
        }

    } catch (error) {
        console.log(`This element does not have an animation:\n${element}`)
    }
    
}

/**
 * Toggles the provided html element inner text between the provided texts.
 * @param {HTMLElement} HTMLElement 
 * @param {String} textA 
 * @param {String} textB 
 */
function toggleElementInnerText(HTMLElement, textA, textB){
    if (HTMLElement.innerText === textA){
        HTMLElement.innerText = textB
    }
    else{
        HTMLElement.innerText = textA
    }

}


/**
 * Returns if at least one checkbox in the provided form was checked.
 * @param {HTMLFormElement} form The form that contains the checkboxs.
 * @returns {Boolean} Returns true if at least a checkbox in the form was checked, false otherwise.
 */
function checked(form){
    const checkedCheckboxes = form.querySelectorAll('input:checked')
    if (checkedCheckboxes.length >= 1){
        return true;
    }
    else{
        return false;
    }
}


/**
 * Returns true if any input in the provided form is not empty, false otherwise.
 * @param {HTMLFormElement} form 
 * @returns {Boolean}
 */
function notEmpty(form){
    for (let index = 0; index < form.elements.length; index++) {
        const element = form.elements[index];
        // exclude the color input by excluding the id itself
        if (element.value.trim() != '' && element.type !== 'hidden' && element.id !== 'id_color'){
            return true
        }
    }
    return false
}

/**
 * Appends the given button innertext in the provided input
 * @param {HTMLButtonElement} button 
 * @param {HTMLInputElement} input 
 */
function displayButtonInnerText(button, input){
    const previousValue = input.value
    input.value = `${previousValue}${button.innerText}`
}

/**
 * loads the emojis in the array name provided in new buttons (HTML elements)
 * placed in the provided parent.
 * @param {String} emojiListName The name of the emoji category.
 * @param {HTMLElement} parentElement The container of the emojis.
 */
function loadEmojis(emojiListName, parentElement){
    const input = document.getElementById('new-message')
    const emojiCategoryHeader = document.createElement('span')
    const accessKey = '0ab43ec7529b0728fb908ef31e968f5df77d0b5d'
    emojiCategoryHeader.classList.add('p-3')
    emojiCategoryHeader.style.display = "block"
    emojiCategoryHeader.style.width = "100%"
    emojiCategoryHeader.innerText = emojiListName.split('-').join(' ')
    parentElement.appendChild(emojiCategoryHeader)

    fetch(`https://emoji-api.com/categories/${emojiListName}?access_key=${accessKey}`)
    .then( (response) => {
        return response.json()
    })
    .then( (emojis) => {
        for (let index = 0; index < emojis.length; index++) {
            let newButton = document.createElement('button')
            newButton.innerHTML = emojis[index].character
            newButton.classList.add('btn', 'm-1', 'action')
            newButton.style.fontSize = '30px'
            newButton.onclick = (event) => {
                event.stopPropagation();
                displayButtonInnerText(newButton, input)
            }
            parentElement.appendChild(newButton)
        }
    })
    .catch((error) => {console.log(error.message)})
}

/**
 * Clears all the current displayed emojis and displays the one
 * with the category of the provided button dataset.emojiPack.
 * @param {HTMLButtonElement} button The button with the dataset containing
 * the emoji category name.
 */
function switchEmojis(button){
    const previousEmojiClass = document.querySelector('.emoji-class-active')
    const emojiContainer = document.getElementById('emojis-container')
    previousEmojiClass.classList.remove('emoji-class-active')
    emojiContainer.innerHTML = ''
    button.classList.add('emoji-class-active')
    loadEmojis(button.dataset.emojiPack, emojiContainer)
}

/**
 * Switches the purpose of the chat form
 * from creating chats to groups or vice versa
 * @param {HTMLFormElement} form 
 * @param {HTMLElement} formHeader The title of the form 
 */
function switchChatFormPurpose(form, formHeader){
    const checkedCheckboxes = form.querySelectorAll('input:checked')
    const chatName = form.querySelector('input[type="text"]')
    if(checkedCheckboxes.length <= 1){
        form.dataset.creating = 'chat'
        chatName.hidden = true
        chatName.value = ''
        if (formHeader){
            formHeader.innerText = 'Start new chat'
        }
    }
    else{
        form.dataset.creating = 'group'
        chatName.hidden = false
        if (formHeader){
            formHeader.innerText = 'Start new group'
        }
    }
}

/**
 * If the given element is already displayed,
 * hides it and vice versa.
 * @param {HTMLElement} HTMLElement 
 */
function toggleElementDisplay(HTMLElement){
    if(HTMLElement.style.display === 'none'){
        HTMLElement.style.display = 'flex'
    }
    else {
        HTMLElement.style.display = 'none'
    }
    runElementAnimation(HTMLElement)
}

/**
 * Displays a preview of the image provided image input element in the provided HTML div element..
 * @param {HTMLInputElement} imageInput The element that contains the image.
 * @param {HTMLDivElement} imagePreview The element that will contain the image preview.
 */
function previewImage(imageInput=null, imagePreview=null) {
    // if no image preview element have been provided
    // creates default preview HTML element
    if (imagePreview === null){
        imagePreview = document.createElement('div')
        imagePreview.id = 'status-imagePreview'
        imageInput.insertAdjacentElement('afterend', imagePreview)

    }

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

/**
 * Updates the chat list (if displayed)
 */
function updateChatList(){
    if (document.getElementById('chat-list') !== null){
        // if the archived chats list is present, reload it
        if (document.getElementById('archived-chats') !== null) {
            htmx.ajax('GET', '/chats/True', {target:'#chats-and-more', swap:'innerHTML'})
            scrollToBottom()
        // else, reload the non archived chats list
        } else {
            htmx.ajax('GET', '/chats/False', {target:'#chat-list', swap:'outerHTML'})
            scrollToBottom()
        }
        
    }
}

function updateContactList(){
    if (document.getElementById('contact-list') !== null) {
        htmx.ajax('GET', '/contacts/', {target: '#contact-list', swap:'innerHTML'})
    }
}

/**
 * Uses HTMX and loads older messages in the displayed chat.
 */
function loadOlderMessages(){
    if (document.getElementById('chat-messages') !== null){
        htmx.ajax('GET', `/previous_messages/${sessionStorage.getItem('chatId')}/${sessionStorage.getItem('oldestMessageDate')}/`,
         {target:'#chat-messages', swap:'afterbegin'})
        
    }
}

/**
 * Returns if at least one HTML
 * element in htmlElements have the given
 * attribute with the desired value
 * @param {Array} htmlElements 
 * @param {String} attribute 
 * @param {String} value
 * @return {Boolean} True if at least
 * one html element meet the requirements.
 */
function atLeastOneAttr(htmlElements, attribute, value){
    let found = false
    for (let index = 0; index < htmlElements.length; index++) {
        const element = htmlElements[index];
        if (element.getAttribute(attribute) === value){
            found = true
            break
        }
    }
    return found
}

/**
 * Removes the given class from their respective element
 * and adds the class b to element a and so.
 * @param {HTMLElement} elementA The element that has the class A.
 * @param {HTMLElement} elementB The element that has the class B.
 * @param {String} classA The class name of the element A.
 * @param {String} classB The class name of the element B.
 */
function exchangeElementsClass(elementA, elementB, classA, classB){
    elementA.classList.replace(classA, classB)
    elementB.classList.replace(classB, classA)

}

/**
 * Decides whether or not to load more messages in the given message list
 * @param {HTMLElement} messageList 
 */
function loadMoreMessages(messageList){
    if (messageList.scrollTop === 0){
        const oldestMessage = document.querySelector('.message')
        sessionStorage.setItem('oldestMessageDate', oldestMessage.dataset.date)
        loadOlderMessages()
    }
}

/**
 * Removes all the found HTML elements with the given class
 * name but the first one
 * @param {String} className 
 */
function removeDuplicates(className){
    const duplicates = document.querySelectorAll(`.${className}`)
    for (let index = 0; index < duplicates.length; index++) {
        if(index !== 0){
            const element = duplicates[index];
            element.remove()
        }
    }
}

/**
 * Changes the color (hex value) of the given input with the desired one.
 * @param {String} desiredColor The new color (hex value) for the the input.
 * @param {HTMLInputElement} input The input that will be altered.
 */
function changeInputColor(desiredColor, input){
    input.value = desiredColor
}

/**
 * Hides all the list items in the given list
 * that don't contain the given value.
 * @param {String} value Value to search for in the
 * list items.
 * @param {HTMLUListElement | HTMLOListElement} elementList
 */
function filterByValue(value, elementList){
    let listItems = elementList.children
    // determines what will be filtered
    // either contacts, chats or settings
    let filterBy = '.chat-name' 
    if (listItems[0].id === "contact-list"){
        listItems = listItems[0].children
        filterBy = '.contact-name'
    }
    else{
        filterBy = ''
    }
    for (let index = 0; index < listItems.length; index++){
        const element = listItems[index]
        if(element){
            let elementText
            if (filterBy !== ''){
                elementText = element.querySelector(filterBy).textContent
            }
            else {
                elementText = element.textContent
            }
            // if it doesn't contain the value, make it invisible
            if(!elementText.toLowerCase().includes(value.toLowerCase())){
                element.classList.remove('d-flex')
                element.style.display = "none"
            }
            // make visible the invisible objects otherwise
            else {
                if(!element.classList.contains('d-flex')){
                    element.classList.add('d-flex')
                }
            }
        }
    }
}

/**
 * Splits a word into a list of sub-words which contains
 * the number of characters in the word divided into equal parts
 * @param {String} word The word to be splited.
 * @param {Number} length The number of characters each sub-word sould have.
 * @returns {Array} A list containing all the sub-words from word.
 */
function splitWord(word, length){
    const originaLen = word.length
    let words = []
    let counter = 0
    while (originaLen !== words.join('').length && counter < originaLen){
        words.push(word.slice(counter, length + counter - 1))
        counter += length
    }
    return words
}


/**
 * Adds spaces in every word inside a text if the word it's too long.
 * @param {String} textId The id of the HTML element that contains the text.
 * @returns {String} The spaced text.
 */
function spaceText(textId){
    const textContainer = document.getElementById(`text-${textId}`)
    const containerText = textContainer.textContent
    const words = containerText.split(' ')
    for (let index = 0; index < words.length; index++){
        const word = words[index];
        // If a word in the text has more than 33 chars
        if (word.length > 33){
            // split the word into different words
            // until each one have less than 33 chars
            words[index] = splitWord(word, 33).join('-')
        }
    }
    // returns a text with trailing spaces
    // in every word to display it properly
    textContainer.textContent = words.join(' ')
}


/**
 * Activates all the tooltipis in the document.
 */
function triggerTooltips(){
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
}

/**
 * Checks whether or not a WebSocket is ready to send and receive messages.
 * @param {WebSocket} websocket 
 */
function canSendMessages(websocket){
    return websocket.readyState === websocket.OPEN
}

/**
 * Sends the given data to the given websocket
 * @param {WebSocket} websocket 
 * @param {Object} data 
 */
function sendToWebsocket(websocket, data){
    if (canSendMessages(websocket)){
        websocket.send(JSON.stringify(data))
    }
    else {
        console.error(`THE GIVEN WEBSOCKET AT ${websocket.url} IS NOT OPEN`)
    }
}


/**
 * Sends a message to the given websocket to create a chat
 * using the form's data.
 * @param {HTMLFormElement} form 
 * @param {WebSocket} websocket 
 */
function createChatViaConsumer(form, websocket){
    const checkedInput = form.querySelector('input:checked')
    sendToWebsocket(websocket, {
        'type': 'create_chat',
        'contact_name': checkedInput.dataset.contactName,
        'contact_phone_number': checkedInput.id
    })
}

/**
 * Sends a message to the given websocket to create a group
 * using the form's data and the given name for the group.
 * @param {HTMLFormElement} form 
 * @param {WebSocket} websocket 
 */
function createGroupViaConsumer(form, websocket, groupName){
    const checkedInputs = form.querySelectorAll('input:checked')
    let phoneNumbers = [...checkedInputs].map((input) => input.id)
    sendToWebsocket(websocket, {
        'type': 'create_group',
        'group_name': groupName,
        'contacts_phone_numbers': phoneNumbers
    })
}

/**
 * Sends a message to the given websocket to create a contact
 * using the form's data.
 * @param {HTMLFormElement} form 
 * @param {WebSocket} websocket 
 */
function createContactViaConsumer(form, websocket){
    sendToWebsocket(websocket, {
        'type': 'create_contact',
        'contact_name': form.elements[1].value,
        'contact_phone_number': form.elements[2].value
    })
}

/**
 * Returns if the user has at least one chat with the contact
 * with the given phone number.
 * @precondition The contact must exist in the database.
 * This function doesn't handle cases where it doesn't.
 * @param {String} contactPhoneNumber
 * @returns {boolean} 
 */
async function hasChatWithContact(contactPhoneNumber){
    const contactUserObject = await get(`/api/users/?phone_number=${contactPhoneNumber}`)
    const contactUserId = contactUserObject[0].id
    // do an API request and check if the user already have a chat with the
    // said contact (User object id)
    const alreadyCreatedChatsWithContact = await get(`/api/chats/?user_id=${userId}&user_id=${contactUserId}`)
    // exclude all the groups
    return alreadyCreatedChatsWithContact.some((chat) => chat.admins.length === 0)
}

/**
 * Returns an Object with the validation results for the chat form, example:
 * {isValid : false, message: "Please select a contact"}
 * @param {HTMLFormElement} chatForm
 * @returns {Object} An object containing whether or not the form is valid, 
 * a corresponding message and the intention of the form. 
 */
async function validateChatForm(chatForm){
    debugger
    let isValid = true
    let message
    // keep track of what's the form being used to
    let intention = 'create_chat'
    if (!checked(chatForm)){
        isValid = false
        message = 'Please select a contact to create chat with'
    }
    else{
        const checkedCheckboxes = chatForm.querySelectorAll('input:checked')
        if (checkedCheckboxes.length >= 2){
            const groupNameContainer = chatForm.querySelector('input[type="text"]')
            const groupName = groupNameContainer.value.trim()
            if (groupName === ''){
                isValid = false
                message = 'You must give the group a name!'
            }
            else {
                intention = 'create_group'
            }
        }

        else {
            const contactPhoneNumber = document.querySelector('input:checked').id
            const userHasChatWithContact = await hasChatWithContact(contactPhoneNumber)

            if(userHasChatWithContact){
                isValid = false
                message = 'You already have a chat with this contact, check your chat list.'
            }
        }
    }
    return {isValid: isValid, message: message, intention: intention}
}


/**
 * Returns an Object with the validation results for the contact form, example:
 * {isValid : false, message: "User not in this app"}
 * @param {HTMLFormElement} contactForm
 * @returns {Object} An object containing whether or not the form is valid 
 * and a corresponding message. 
 */
async function validateContactForm(contactForm){
    debugger
    let isValid = true
    let message
    const inputs = contactForm.getElementsByTagName('input')
    // gets the 'list' of Users who have the provided phone number
    // in the form
    const users = await get(`/api/users/?phone_number=${inputs[2].value}`)
    // gets a list of Contacts created by the User
    // with the provided phone number
    const contacts = await get(`/api/contacts/?phone_number=${inputs[2].value}&created_by=${userId}`)
    // if no User created has the introduced phone number
    // notify the user
    if (users.length === 0){
        isValid = false
        message = 'No User with provided Phone, the Phone is not registered in this app.'
    }
    // if the User already created a Contact with such phone, notify the user
    else if (contacts.length > 0){
        isValid = false
        message = 'You already created a Contact with that Phone'
    }
    return {isValid: isValid, message: message}
}


/**
 * Returns an Object with the validation results for the status form, example:
 * {isValid : false, message: "Insert data"}
 * @param {HTMLFormElement} statusForm
 * @returns {Object} An object containing whether or not the form is valid 
 * and a corresponding message.
 */
function validateStatusForm(statusForm){
    let isValid = true
    let message
    if (!notEmpty(statusForm)) {
        isValid = false
        message = 'Please insert data!!!'
    }
    return {isValid: isValid, message: message}
}

/**
 * Resets the chat form to its default values and state.
 * @param {HTMLFormElement} chatForm 
 */
function resetChatForm(chatForm){
    const formTitle = document.getElementById('NewChatLabel')
    const validationMessage = document.getElementById('chat-validation-message')
    validationMessage.innerText = ''
    formTitle.innerText = 'Start new chat'
    const groupNameInput = document.getElementById('group-name')
    if (!groupNameInput.hidden) {
        groupNameInput.hidden = true
    }
    chatForm.reset()
    const chatSubmitButton = document.getElementById('chat-submit-btn')
    setButtonReady(chatSubmitButton)
}

/**
 * Resets the contact form to its default values and state.
 * @param {HTMLFormElement} contactForm 
 */
function resetContactForm(contactForm){
    const validationMessage = document.getElementById('contact-validation-message')
    validationMessage.innerText = ''
    contactForm.reset()
    const contactSubmitButton = document.getElementById('contact-submit-btn')
    setButtonReady(contactSubmitButton)
}

/**
 * Resets the status form to its default values and state.
 * @param {HTMLFormElement} statusForm
 * @param {HTMLDivElement} imagePreviewContainer The image preview container in the form.
 */
function resetStatusForm(statusForm, imagePreviewContainer){
    const colorInput = document.getElementById('id_color')
    const validationMessage = document.getElementById('status-validation-message')
    const imageContainer = imagePreviewContainer
    const image = imageContainer !== null ? imageContainer.firstElementChild : null
    if (image){
        image.remove()
    }
    validationMessage.innerText = ''
    if (colorInput.jscolor) {
        colorInput.jscolor.fromString('#000000');
    }
    statusForm.reset()
    const statusSubmitButton = document.getElementById('status-submit-btn')
    setButtonReady(statusSubmitButton)
}

/**
 * Sets the state of the given button to a loading one
 * preventing from further use.
 * @param {HTMLButtonElement} button The submit button in the form. 
 */
function setButtonLoading(button){
    button.setAttribute('disabled', 'true')
    const buttonSubmitTextContainer = button.querySelector('.submit-btn-text')
    buttonSubmitTextContainer.setAttribute('hidden', 'true')
    const loadingStatusContainer = button.querySelector('.loading-status-container')
    loadingStatusContainer.removeAttribute('hidden')
}

/**
 * Sets the state of the given button to a ready one
 * allowing further use.
 * @param {HTMLButtonElement} button The submit button in the form. 
 */
function setButtonReady(button){
    button.removeAttribute('disabled')
    const buttonSubmitTextContainer = button.querySelector('.submit-btn-text')
    buttonSubmitTextContainer.removeAttribute('hidden')
    const loadingStatusContainer = button.querySelector('.loading-status-container')
    loadingStatusContainer.setAttribute('hidden', 'true')
}

/**
 * Notifies the user a form timeout and prepares
 * the submit button to try again.
 * @param {HTMLButtonElement} submitButton 
 * @param {HTMLAudioElement} notificationAudio 
 */
function notifyFormSubmissionTimeout(submitButton, notificationAudio){
    triggerNotification('Server', 'Something went wrong, please try again.', notificationAudio)
    setButtonReady(submitButton)
}

/**
 * Loads the reply preview HTML to the desired message
 * @param {String} messageId 
 * @param {Boolean} fromRequestUser 
 * @param {String} requestUserId Required only if fromRequestUser is false
 */
async function replyToMessage(messageId, fromRequestUser, requestUserId) {
    // data of the replied message
    const messageData = await get(`/api/messages/${messageId}/`)
    // stores the replied message id for later
    sessionStorage.setItem('replyTo', messageId)
    const replyPreview = document.getElementById('reply-preview')
    replyPreview.innerHTML = ''
    // creating the html elements for the preview...
    const container = document.createElement('div')
    const senderName = document.createElement('span')
    const previewText = document.createElement('span')
    // styling with classes
    container.classList.add('p-2', 'd-flex', 'flex-column', 'w-100')
    previewText.id = `text-${messageId}1`
    previewText.classList.add('d-flex', 'text-body-tertiary')
    // add them to the DOM
    replyPreview.appendChild(container)
    container.appendChild(senderName)
    container.appendChild(previewText)
    if (messageData.image){
        previewText.innerText = 'Photo 📷'
    }
    else {
        previewText.innerText = messageData.text
    }
    if (fromRequestUser){
        const requestUser = await get(`/api/users/${messageData.sender_user}/`)
        senderName.innerText = `${requestUser.username} (You)`
    }
    else{
        const contact = await get(`/api/users/${messageData.sender_user}/`)
        const senders = await get(`/api/contacts/?phone_number=${contact.phone_number}&created_by=${requestUserId}`)
        senderName.innerText = senders[0].name
    }


}

/**
 * Reset the given status progress bar.
 * @param {HTMLElement} progressBar 
 */
function clearStatusProgress(progressBar){
    progressBar.classList.remove('viewing', 'viewed')
}

/**
 * Returns an Object with the validation results for the status form, example:
 * {isValid : false, message: "Insert data"}
 * @param {HTMLFormElement} archiveForm
 * @returns {Object} An object containing whether or not the form is valid 
 * and a corresponding message.
 */
function validateArchiveForm(archiveForm){
    let isValid = true
    let message
    if (!checked(archiveForm)) {
        isValid = false
        message = 'INVALID, PLEASE SELECT AT LEAST ONE CHAT'
    }
    return {isValid: isValid, message: message}
}

/**
 * Handles the submission of the archive form
 * and checks it's valid before proceeding with the operations.
 * @param {HTMLFormElement} form 
 */
async function handleArchiveFormSubmission(form){
    const archiveFormValidation = validateArchiveForm(form)
    if(archiveFormValidation.isValid){
        for (let index = 0; index < form.elements.length; index++) {
            const chat = form.elements[index];
            if (chat.checked){
                const chatInstance = await get(`/api/chats/${chat.id}/`)
                const data = {archived_by: [...chatInstance.archived_by, form.dataset.user]}
                const response = await patch(`/api/chats/${chat.id}/`, 
                    data,
                     form.firstElementChild.value)
            }
        }
        // show the updated chat list (unarchived chats)
        htmx.ajax('GET', '/chats/False', {target:'#archive-chats-form', swap:'outerHTML'})
    }
    else{
        const messageContainer = form.querySelector('.validation-error')
        messageContainer.innerText = archiveFormValidation.message
    }
}

/**
 * Shows a notification showing who sent it 
 * and what does it say and plays the given audio
 * for the notification
 * @param {String} senderName The one who sent the notification
 * @param {String} text
 * @param {HTMLAudioElement} notificationAudio 
 */
function triggerNotification(sender, text, notificationAudio){
    const toastNotification = document.getElementById('liveToast')
    modifyNotification(sender, text)
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastNotification)
    toastBootstrap.show()
    notificationAudio.play()
}

/**
 * Shows the validation error message in the given container.
 * @param {HTMLElement} container 
 * @param {String} message 
 */
function showValidationErrorMessage(container, message){
    container.innerText = message
}


/**
 * Loads many functions so they can be used
 * anywhere (document or js files)
 */
function loadGlobalDocFunctions(){
    window.toggleReadMore = function(textId){
        toggleReadMore(textId)
    }

    window.showDropdown  = function (event, dropdownId) {
        showDropdown(event, dropdownId)
    }

    window.runElementAnimation = function(element){
        runElementAnimation(element)
    }
    
    window.switchEmojis = function(button){
        switchEmojis(button)
    }

    window.switchChatFormPurpose = function(form, formHeader){
        switchChatFormPurpose(form, formHeader)
    }

    window.toggleElementInnerText = function(HTMLElement, textA, textB){
        toggleElementInnerText(HTMLElement, textA, textB)
    }

    window.toggleElementDisplay = function(HTMLElement){
        toggleElementDisplay(HTMLElement)
    }

    window.exchangeElementsClass = function(elementA, elementB, classA, classB){
        exchangeElementsClass(elementA, elementB, classA, classB)
    }

    window.loadMoreMessages = function(htmlElement){
        loadMoreMessages(htmlElement)
    }

    window.loadOlderMessages = function(){
        loadOlderMessages()
    }

    window.dateAlreadyDisplayed = function(date){
        const similarLayers = document.querySelectorAll(`.date-${date.replaceAll(' ', '')}`)
        const manySimilarLayers = similarLayers.length > 1
        if (manySimilarLayers){
            return true
        }
        else {
            return false
        }
    }

    window.removeDuplicates = function(className){
        removeDuplicates(className)
    }

    window.changeInputColor = function(desiredColor, targetElementId){
        changeInputColor(desiredColor, targetElementId)
    }

    window.filterByValue = function(value, elementList){
        filterByValue(value, elementList)
    }

    window.spaceText = function(textId){
        spaceText(textId)
    }

    window.statusApp = {
        pendingUpdates : false
    }

    window.initStatusCarousel = function(statusCarousel){
        carousel = statusCarousel
        const container = carousel.parentElement.parentElement
        const carouselInstance = new bootstrap.Carousel(carousel, {
        interval: 5000,
        touch: true,
        pause: false,
        ride: true,
        })

        container.addEventListener('mouseenter', () => {
            carouselInstance.pause();
        });

        container.addEventListener('mouseleave', () => {
            carouselInstance.cycle();
        });
        const statusBars = carousel.querySelectorAll('.status-progress')
        const statusesLen = statusBars.length
        statusBars[0].classList.add('viewed')
        // everytime the carousel is in a new slide
        carousel.addEventListener('slid.bs.carousel', (event) => {
            // check the current slide as viewed
            statusBars[event.to].classList.add('viewed')
            // sylize it depending on the content.
            const statusContentWrapper = event.relatedTarget.querySelector('.status-content-wrapper')
            const textContainer = statusContentWrapper.querySelector('.status-text-overlay')
            if (textContainer){
                const text = textContainer.firstElementChild
                if (text.innerText.length > 32) {
                    textContainer.classList.replace('status-text-overlay', 'status-large-text-overlay')
                    if(text.innerText.length > 450){
                        textContainer.style.overflowY = 'scroll'
                        textContainer.style.height = '80%'
                    }
            }
            }
            if (statusesLen - 1 === event.to){
                setTimeout(() => {
                    statusBars.forEach(bar => {
                        clearStatusProgress(bar)
                    });
                    // closes the carousel instance and hides the modal containing it.
                    const hideButton = carousel.querySelector('.btn-close')
                    carouselInstance.dispose()
                    hideButton.click()
                }, 5000)
            }
        })
    }

    window.showModal = function(modal){
        modal.setAttribute('status', 'showing')
    }
    window.hideModal = function(modal){
        modal.setAttribute('status', 'hidden')
        // if there any pendient updates in the UI, update it
        if(statusApp.pendingUpdates){
            htmx.ajax('GET', '/statuses', '#chats-and-more')
            .then( () => {
                statusApp.pendingUpdates = false
            })
        }
    }

    /**
     * Loads an image source in the img element found with the given id.
     * @param {String} url 
     * @param {String} imageHtmlElementId 
     */
    window.previewChatImage = function(url, imageHtmlElementId){
        const imageHtml = document.getElementById(imageHtmlElementId)
        imageHtml.src = url
    }

    window.replyToMessage = function(messageId, fromRequestUser, requestUserId){
        replyToMessage(messageId, fromRequestUser, requestUserId)
    }

    window.handleArchiveFormSubmission = function(form){
        handleArchiveFormSubmission(form)
    }

}

function closeChat(){
    const chatParentContainer = document.getElementById('chat-display')
    chatParentContainer.innerHTML = ''
}

export {
    get, modifyNotification,
    scrollToBottom, toggleReadMore, showDropdown, 
    runElementAnimation, checked, notEmpty, 
    toggleElementInnerText, loadEmojis, switchEmojis, 
    switchChatFormPurpose, toggleElementDisplay, previewImage, 
    updateChatList, updateContactList, atLeastOneAttr, 
    exchangeElementsClass, loadMoreMessages, 
    loadOlderMessages, removeDuplicates, changeInputColor, 
    filterByValue, spaceText, splitWord, triggerTooltips, 
    createChatViaConsumer, createGroupViaConsumer, 
    createContactViaConsumer, validateChatForm,
    validateContactForm, validateStatusForm,
    resetChatForm, resetContactForm, resetStatusForm,
    setButtonLoading, setButtonReady, notifyFormSubmissionTimeout,
    canSendMessages, sendToWebsocket, 
    showValidationErrorMessage, loadGlobalDocFunctions, 
    triggerNotification, closeChat
}