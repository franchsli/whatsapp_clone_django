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
 * Does a POST request to the specified URL and returns the response in  JSON format
 * if the response is succesful, logs an error otherwise.
 * @param {String} url The url to which the request will be made.
 * @param {Object} data The object containing all the data to be sent to the endpoint.
 * @param {String} token The csrf token.
 */
function post(url, data, token){
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'content-type':'aplication/json', 
        'X-CSRFToken': token}
    })
    .then(response => console.log(response.json))
    .catch(error => console.log(error.message))
}

/**
 * Moves the scrollbar  at the bottom of the messages in chat.
 */
function scroll_to_bottom(){
    const messages = document.getElementById('chat-messages')
    if (messages){
        messages.scroll(0, messages.scrollHeight - messages.clientHeight)
    }
}

/**
 * Manipulates the notification toast in the HTML
 * @param {String} contact_name The name of the contact who sent the message.
 * @param {String} message The text of the message that was sent.
 */
function modifyNotification(contact_name, message){
    const toastNotification = document.getElementById('liveToast')
    let contact_name_display = toastNotification.querySelector('strong')
    let message_display = toastNotification.querySelector('.toast-body')
    contact_name_display.innerHTML = contact_name
    message_display.innerHTML = message

}

/**
 * Adds a button that show more or less of the specified text content.
 * @param {String} text_id The id of the HTML element that contains the text.
 */
function toggleReadMore(text_id) {
    const content_html = document.getElementById(`text-${text_id}`)
    if (content_html.clientHeight === 200){
        const toggle_button = document.createElement('button')
        toggle_button.innerText = 'Show more'
        toggle_button.classList.add('btn' ,'btn-link')
        toggle_button.style.color = "var(--bs-link-color)"
        toggle_button.style.justifySelf = "end"
    
        toggle_button.onclick = function(){
            content_html.style.maxHeight = content_html.style.maxHeight === '200px' ? 'none' : '200px'
            toggle_button.textContent = content_html.style.maxHeight === '200px' ? 'Show more' : 'Show less'
        }
        content_html.insertAdjacentElement('afterend', toggle_button)
    }
}

/**
 * Shows the dropdown  in the same place where it was called.
 * @param {Event} event The event.
 * @param {String} dropdown_id The id of the dropdown that was called.
 */
function showDropdown(event, dropdown_id) {
    event.preventDefault();

    // Set the position of the dropdown
    const dropdown = document.getElementById(dropdown_id);
    dropdown.style.position = 'fixed';
    dropdown.style.left = `${event.clientX}px`;
    dropdown.style.top = `${event.clientY}px`;

    // Display the dropdown
    dropdown.classList.toggle('show')
    // runs the dropdown animation
    run_element_animation(dropdown)
    

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
 * @param {String} animation_class_name
 */
function run_element_animation(element, animation_class_name=''){
    try {
        if (animation_class_name === ''){
            element.style.animationPlayState = 'running';
            element.addEventListener('animationend', () => {
                element.style.animationPlayState = 'paused';
            })
        }
        else{
            element.classList.add(animation_class_name)
            element.addEventListener('animationend', () => {
                element.classList.remove(animation_class_name)
            })
        }

    } catch (error) {
        console.log(`This element does not have an animation:\n${element}`)
    }
    
}

/**
 * Toggles the provided html element inner text between the provided texts.
 * @param {HTMLElement} HTML_element 
 * @param {String} text_a 
 * @param {String} text_b 
 */
function toggle_element_inner_text(HTML_element, text_a, text_b){
    if (HTML_element.innerText === text_a){
        HTML_element.innerText = text_b
    }
    else{
        HTML_element.innerText = text_a
    }

}


/**
 * Returns if at least one checkbox in the provided form was checked.
 * @param {HTMLFormElement} form The form that contains the checkboxs.
 * @returns {Boolean} Returns true if at least a checkbox in the form was checked, false otherwise.
 */
function checked(form){
    for (let index = 0; index < form.elements.length; index++) {
        let element = form.elements[index];
        if (element.checked){
            return true}
    }
    return false
}

/**
 * Returns true if any input in the provided form is not empty, false otherwise.
 * @param {HTMLFormElement} form 
 * @param {String} excluded_type The type of input that will be excluded from the
 * verification
 * @returns {Boolean}
 */
function not_empty(form, excluded_type='color'){
    for (let index = 0; index < form.elements.length; index++) {
        const element = form.elements[index];
        if (element.value.trim() != '' && element.type !== 'hidden' && element.type !== excluded_type){
            return true
        }
        else{
            run_element_animation(element, 'shake-horizontal')
        }
    }
    return false
}

/**
 * Appends the given button innertext in the provided input
 * @param {HTMLButtonElement} button 
 * @param {HTMLInputElement} input 
 */
function display_button_inner_text(button, input){
    const previous_value = input.value
    input.value = `${previous_value}${button.innerText}`
}

/**
 * loads the emojis in the array name provided in new buttons (HTML elements)
 * placed in the provided parent.
 * @param {String} emoji_list_name The name of the emoji category.
 * @param {HTMLElement} parent_element The container of the emojis.
 */
function load_emojis(emoji_list_name, parent_element){
    const input = document.getElementById('new-message')
    const emoji_category_header = document.createElement('span')
    const access_key = '0ab43ec7529b0728fb908ef31e968f5df77d0b5d'
    emoji_category_header.classList.add('p-3')
    emoji_category_header.style.display = "block"
    emoji_category_header.style.width = "100%"
    emoji_category_header.innerText = emoji_list_name.split('-').join(' ')
    parent_element.appendChild(emoji_category_header)

    fetch(`https://emoji-api.com/categories/${emoji_list_name}?access_key=${access_key}`)
    .then( (response) => {
        return response.json()
    })
    .then( (emojis) => {
        for (let index = 0; index < emojis.length; index++) {
            let new_button = document.createElement('button')
            new_button.innerHTML = emojis[index].character
            new_button.classList.add('btn', 'm-1', 'action')
            new_button.style.fontSize = '30px'
            new_button.onclick = (event) => {
                event.stopPropagation();
                display_button_inner_text(new_button, input)
            }
            parent_element.appendChild(new_button)
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
function switch_emojis(button){
    const previous_emoji_class = document.querySelector('.emoji-class-active')
    const emoji_container = document.getElementById('emojis-container')
    previous_emoji_class.classList.remove('emoji-class-active')
    emoji_container.innerHTML = ''
    button.classList.add('emoji-class-active')
    load_emojis(button.dataset.emojiPack, emoji_container)
}

/**
 * Applies an event listener
 * in the provided form checkboxes,
 * to prevent multiple checkboxes being selected.
 * @param {HTMLFormElement} form 
 */
function switch_checkboxes(form){
    const elements = form.elements
    for (let i = 0; i < elements.length; i++) {
        if(elements[i].type === 'checkbox'){
            elements[i].addEventListener('change', () => {
                // if the current checkbox is checked
                // uncheck all the other checkboxes
                if(elements[i].checked){
                    for (let j = 0; j < elements.length; j++) {
                        if(elements[i] !== elements[j]){
                            elements[j].checked = false
                        }
                    }
                }
            })
        }
        
    }

}

/**
 * If the given element is already displayed,
 * hides it and vice versa.
 * @param {HTMLElement} HTML_element 
 */
function toggle_element_display(HTML_element){
    if(HTML_element.style.display === 'none'){
        HTML_element.style.display = 'flex'
    }
    else {
        HTML_element.style.display = 'none'
    }
    run_element_animation(HTML_element)
}

/**
 * Displays a preview of the image provided image input element in the provided HTML div element..
 * @param {HTMLInputElement} image_input The element that contains the image.
 * @param {HTMLDivElement} image_preview The element that will contain the image preview.
 */
function previewImage(image_input=null, image_preview=null) {
    // if no image preview element have been provided
    // creates default preview HTML element
    if (image_preview === null){
        image_preview = document.createElement('div')
        image_input.insertAdjacentElement('afterend', image_preview)

    }

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
 * Updates the chat list (if displayed)
 */
function update_chat_list(){
    if (document.getElementById('chat-list') !== null){
        if (document.getElementById('archived-chats') !== null) {
            htmx.ajax('GET', '/chats/True', {target:'#chats-and-more', swap:'innerHTML'})
            scroll_to_bottom()
        } else {
            htmx.ajax('GET', '/chats/False', {target:'#chat-list', swap:'outerHTML'})
            scroll_to_bottom()
        }
        
    }
}

/**
 * Uses HTMX and loads older messages in the displayed chat.
 */
function load_older_messages(){
    if (document.getElementById('chat-messages') !== null){
        htmx.ajax('GET', `/previous_messages/${localStorage.getItem('chat_id')}/${localStorage.getItem('oldest_message_date')}/`,
         {target:'#chat-messages', swap:'afterbegin'})
        
    }
}

/**
 * Returns if at least one HTML
 * element in html_elements have the given
 * attribute with the desired value
 * @param {Array} html_elements 
 * @param {String} attribute 
 * @param {String} value
 * @return {Boolean} True if at least
 * one html element meet the requirements.
 */
function at_least_one_attr(html_elements, attribute, value){
    let found = false
    for (let index = 0; index < html_elements.length; index++) {
        const element = html_elements[index];
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
 * @param {HTMLElement} element_a The element that has the class A.
 * @param {HTMLElement} element_b The element that has the class B.
 * @param {String} class_a The class name of the element A.
 * @param {String} class_b The class name of the element B.
 */
function exchange_elements_class(element_a, element_b, class_a, class_b){
    element_a.classList.replace(class_a, class_b)
    element_b.classList.replace(class_b, class_a)

}

/**
 * Hides or displays a HTML element
 * @param {HTMLElement} element The element to be manipulated.
 * @param {String} display_type The desired display type for the element.
 */
function switch_element_visibility(element, display_type='block'){
    if(element.style.display !== 'none'){
        element.style.display = 'none'
    }
    else{
        element.style.display = display_type
    }
}

/**
 * Decides whether or not to load more messages in the given message list
 * @param {HTMLElement} message_list 
 */
function load_more_messages(message_list){
    if (message_list.scrollTop === 0){
        const oldest_message = document.querySelector('.message')
        localStorage.setItem('oldest_message_date', oldest_message.dataset.date)
        load_older_messages()
    }
}

/**
 * Removes all the found HTML elements with the given class
 * name but the first one
 * @param {String} class_name 
 */
function remove_duplicates(class_name){
    const duplicates = document.querySelectorAll(`.${class_name}`)
    for (let index = 0; index < duplicates.length; index++) {
        if(index !== 0){
            const element = duplicates[index];
            element.remove()
        }
    }
}

/**
 * Changes the color of the found element with the given ID with the desired one.
 * @param {String} desired_color The new color for the target element.
 * @param {String} target_element_id The ID of the target element.
 */
function change_element_color(desired_color, target_element_id){
    const target_element_HTML = document.getElementById(target_element_id)
    if (target_element_HTML){
        target_element_HTML.style.color = desired_color
    }
}

/**
 * Hides all the list items in the given list
 * that don't contain the given value.
 * @param {String} value Value to search for in the
 * list items.
 * @param {HTMLUListElement | HTMLOListElement} element_list
 */
function filter_by_value(value, element_list){
    let list_items = element_list.children
    // determines what will be filtered
    // either contacts, chats or settings
    let filter_by = '.chat-name' 
    if (list_items[0].id === "contact-list"){
        list_items = list_items[0].children
        filter_by = '.contact-name'
    }
    else{
        filter_by = ''
    }
    for (let index = 0; index < list_items.length; index++){
        const element = list_items[index]
        if(element){
            let element_text
            if (filter_by !== ''){
                element_text = element.querySelector(filter_by).textContent
            }
            else {
                element_text = element.textContent
            }
            // if it doesn't contain the value, make it invisible
            if(!element_text.toLowerCase().includes(value.toLowerCase())){
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
function split_word(word, length){
    const original_len = word.length
    let words = []
    let counter = 0
    while (original_len !== words.join('').length && counter < original_len){
        words.push(word.slice(counter, length + counter - 1))
        counter += length
    }
    return words
}


/**
 * Adds spaces in every word inside a text if the word it's too long.
 * @param {String} text_id The id of the HTML element that contains the text.
 * @returns {String} The spaced text.
 */
function space_text(text_id){
    const text_container = document.getElementById(`text-${text_id}`)
    const container_text = text_container.textContent
    const words = container_text.split(' ')
    for (let index = 0; index < words.length; index++){
        const word = words[index];
        // If a word in the text has more than 33 chars
        if (word.length > 33){
            // split the word into different words
            // until each one have less than 33 chars
            words[index] = split_word(word, 33).join('-')
        }
    }
    // returns a text with trailing spaces
    // in every word to display it properly
    text_container.textContent = words.join(' ')
}

/**
 * Returns true only if only all the inputs in the given form are filled.
 * @param {HTMLFormElement} form
 * @return {Boolean}
 */
function fully_filled(form){
    const inputs = form.elements
    for (let index = 0; index < inputs.length; index++) {
        const element = inputs[index];
        if (element.value.trim() === ''){
            return false
        }
    }
    return true;
}

/**
 * Activates all the tooltipis in the document.
 */
function trigger_tooltips(){
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
}

/**
 * Checks whether or not a WebSocket is ready to send and receive messages.
 * @param {WebSocket} websocket 
 */
function cand_send_messages(websocket){
    return websocket.readyState === websocket.OPEN
}

/**
 * Sends a message to the websocket for creating the desired instance using the given form data.
 * @param {HTMLFormElement} form The HTML form element that contains all the inputs data to be set to the websocket.
 * @param {String} instance_type A string telling the websocket consumer what type of instance it should create.
 * @param {WebSocket} websocket The Websocket that has the desired consumer.
 * @returns {false} To avoid form submission.
 */
function create_instance_via_consumer(form, instance_type, websocket){
    if (cand_send_messages(websocket)){
        const form_elements = form.elements
        if (instance_type === 'create_chat'){
            for (let index = 0; index < form_elements.length; index++) {
                let element = form_elements[index];
        
                if (element.checked){
                    websocket.send(JSON.stringify({
                        'type': instance_type,
                        'contact_name': element.dataset.contactName,
                        'contact_phone_number': element.id
                    }))}}}
        else if(instance_type === 'create_contact'){
            websocket.send(JSON.stringify({
                'type': instance_type,
                'contact_name': form_elements[1].value,
                'contact_phone_number': form_elements[2].value
            }))
        }
    }

    else {
        console.error('THE GIVEN WEBSOCKET IS NOT OPEN')
    }
    return false
}

/**
 * Validates a chat form.
 * @param {HTMLFormElement} chat_form 
 * @param {HTMLAudioElement} error_audio 
 * @param {WebSocket} websocket 
 * @returns false to stop normal form submission
 */
async function validate_chat_form(chat_form, error_audio, websocket){
    if (!checked(chat_form)){
        error_audio.play()
        const validation_message = document.getElementById('chat-validation-message')
        validation_message.innerText = 'Please select a contact to create chat with'
    }

    else{
        for (let index = 0; index < chat_form.elements.length; index++) {
            // when the selected contact (checkbox) is found
            if(chat_form.elements[index].checked){
                const contact_phone_number = chat_form.elements[index].id
                const contact_user_object = await get(`/api/users/?phone_number=${contact_phone_number}`)
                const contact_user_id = contact_user_object[0].id
                // do an API request and check if the user already have a chat with the
                // said contact (User object id)
                const already_created_chats_with_contact = await get(`/api/chats/?user_id=${user_id}&user_id=${contact_user_id}`)
                
                
                // if the user has already a chat with the contact, display an error
                if(already_created_chats_with_contact.length > 0){
                    error_audio.play()
                    const validation_message = document.getElementById('chat-validation-message')
                    validation_message.innerText = 'You already have a chat with this contact, check your chat list.'
                }
                // create the chat otherwise
                else {
                    create_instance_via_consumer(chat_form, 'create_chat', websocket)
                    const toastNotification = document.getElementById('liveToast')
                    modifyNotification('Server', 
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

/**
 * Creates a contact via websocket with the given form data if and
 * only if the form is valid.
 * @param {HTMLFormElement} contact_form 
 * @param {HTMLAudioElement} error_audio 
 * @param {HTMLAudioElement} notification_audio 
 * @param {Websocket} websocket 
 * @returns
 */
async function validate_contact_form(contact_form, error_audio, notification_audio, websocket){
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
    }
    // if nothing happens, create the contact
    else {
        create_instance_via_consumer(contact_form, 'create_contact', websocket)
        const toastNotification = document.getElementById('liveToast')
        modifyNotification('Server', 
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

/**
 * Creates a status via websocket if and only if
 * the stauts form is valid,
 * @param {HTMLAudioElement} error_audio 
 * @param {WebSocket} status_websocket 
 * @param {String} user_id
 */
async function validate_status_form(error_audio, status_websocket){
    console.log(not_empty(status_form))
    if (not_empty(status_form)){
        const status_input = document.getElementById('id_text')
        const image_container = document.getElementById('status-imagePreview')
        const image = image_container.firstElementChild
        status_websocket.websocket_client.send(JSON.stringify({
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
 * Loads many functions so they can be used
 * anywhere (document or js files)
 */
function load_global_doc_functions(){
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

    window.switch_checkboxes = function(form){
        switch_checkboxes(form)
    }

    window.toggle_element_inner_text = function(HTML_element, text_a, text_b){
        toggle_element_inner_text(HTML_element, text_a, text_b)
    }

    window.toggle_element_display = function(HTML_element){
        toggle_element_display(HTML_element)
    }

    window.exchange_elements_class = function(element_a, element_b, class_a, class_b){
        exchange_elements_class(element_a, element_b, class_a, class_b)
    }

    window.load_more_messages = function(html_element){
        load_more_messages(html_element)
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
            return false
        }
    }

    window.remove_duplicates = function(class_name){
        remove_duplicates(class_name)
    }

    window.change_element_color = function(desired_color, target_element_id){
        change_element_color(desired_color, target_element_id)
    }

    window.filter_by_value = function(value, element_list){
        filter_by_value(value, element_list)
    }

    window.space_text = function(text_id){
        space_text(text_id)
    }

    window.status_app = {
        pending_updates : false
    }

    window.init_status_carousel = function(status_carousel){
        carousel = status_carousel
        carousel_instance = new bootstrap.Carousel(carousel, {
        interval: 5000,
        touch: false,
        })
        const status_container = carousel.parentElement
        const status_bars = status_container.querySelectorAll('.status-progress')
        const statuses_len = status_bars.length
        status_bars[0].classList.add('viewed')
        // everytime the carousel is in a new slide
        carousel.addEventListener('slid.bs.carousel', (event) => {
            // check the current slide as viewed
            status_bars[event.to].classList.add('viewed')
            // sylize it depending on the content.
            const status_content_wrapper = event.relatedTarget.querySelector('.status-content-wrapper')
            const text_container = status_content_wrapper.querySelector('.status-text-overlay')
            const text = text_container.firstElementChild
            if (text.innerText.length > 32) {
                text_container.classList.replace('status-text-overlay', 'status-large-text-overlay')
                if(text.innerText.length > 450){
                    text_container.style.overflowY = 'scroll'
                    text_container.style.height = '80%'
                }
            }
            if (statuses_len - 1 === event.to){
                setTimeout(() => {
                    const carousel_header = carousel.nextElementSibling
                    const user_info_header = carousel_header.querySelector('.d-flex')
                    const hide_button = user_info_header.querySelector('.btn-close')
                    // closes the carousel instance and hides the modal containing it.
                    carousel_instance.dispose()
                    hide_button.click()
                }, 5000)
            }
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

    /**
     * Loads an image source in the img element found with the given id.
     * @param {String} url 
     * @param {String} image_html_element_id 
     */
    window.preview_chat_image = function(url, image_html_element_id){
        const image_html = document.getElementById(image_html_element_id)
        image_html.src = url
    }

}

export {
    get, post, modifyNotification,
    scroll_to_bottom, toggleReadMore, showDropdown, 
    run_element_animation, checked, not_empty, 
    toggle_element_inner_text, load_emojis, switch_emojis, 
    switch_checkboxes, toggle_element_display, previewImage, 
    update_chat_list, at_least_one_attr, exchange_elements_class, 
    switch_element_visibility, load_more_messages, load_older_messages, 
    remove_duplicates, change_element_color, filter_by_value, 
    space_text, split_word, trigger_tooltips, 
    create_instance_via_consumer, validate_chat_form, validate_contact_form,
    validate_status_form, cand_send_messages, load_global_doc_functions
}