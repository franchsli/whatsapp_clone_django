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
 * Creates all the HTML code for a message and adds it to the current opened chat.
 * @param {*} text The text of the message.
 * @param {String} image_src The path of the image.
 * @param {Boolean} sent_by_auth_user True if the one who sent the message is the actual authenticated user, False otherwise.
 */
function create_message_html(text, image_src="undefined", sent_by_auth_user=true){
    const messages = document.getElementById('chat-messages')
    const message_container = document.createElement('div')
    const new_message = document.createElement('li')
    const message_text = document.createElement('span')
    const message_image = document.createElement('img')

    // display the message image
    message_image.classList.add('mw-100', 'mh-100')
    message_image.src = image_src
    message_image.alt = ''
    // set the style acording to who sent the message
    if (sent_by_auth_user){
        new_message.classList.add('list-unstyled-item', 'me-3',
             'mt-3', 'rounded', 'message', 'user-message')
    }
    else {
        new_message.classList.add('list-unstyled-item', 'ms-3', 'mt-3',
             'rounded', 'message', 'contact-message')
    }
    message_container.classList.add('d-flex', 'flex-column', 'p-2')
    // display the message text
    message_text.innerText = text

    message_container.appendChild(message_image)
    message_container.appendChild(message_text)
    new_message.appendChild(message_container)
    messages.appendChild(new_message)
    scroll_to_bottom()

}



/**
 * Manipulates the notification toast in the HTML
 * @param {String} contact_name The name of the contact who sent the message.
 * @param {*} message The text of the message that was sent.
 */
function modifyNotification(contact_name, message){
    const toastNotification = document.getElementById('liveToast')
    let contact_name_display = toastNotification.querySelector('strong')
    let message_display = toastNotification.querySelector('.toast-body')
    contact_name_display.innerHTML = contact_name
    message_display.innerHTML = message

}


/**
 * Unshowns all the actual showing collapses in the HTML.
 */
function switch_collapse(){
    const collapse_parts = document.querySelectorAll('.collapse')
    collapse_parts.forEach(collapse => {
        if (collapse.classList.contains('show')){
            collapse.classList.remove('show')
        }
        
    });
}

/**
 * Adds a button that show more or less of the specified text content.
 * @param {String} text_id The id of the HTML element that contains the text.
 */
function toggleReadMore(text_id) {
    const content = document.getElementById(`text-${text_id}`)
    if (content.clientHeight === 200 ){
        const toggle_button = document.createElement('button')
        toggle_button.innerText = 'Show more'
        toggle_button.classList.add('btn' ,'btn-link')
        toggle_button.style.justifySelf = "end"
    
        toggle_button.onclick = function(){
            content.style.maxHeight = content.style.maxHeight === '200px' ? 'none' : '200px'
            content.style.overflow = content.style.overflow === 'hidden' ? 'visible' : 'hidden'
            toggle_button.textContent = content.style.maxHeight === '200px' ? 'Show more' : 'Show less'
        }
        content.insertAdjacentElement('afterend', toggle_button)
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
 * Runs the animation in a HTMLelement if and only if it has one.
 * @param {HTMLElement} element 
 */
function run_element_animation(element){
    try {
        element.style.animationPlayState = 'running';
    } catch (error) {
        console.log(`This does not have an animation:\n${element}`)
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
 * @returns {Boolean}
 */
function not_empty(form){
    for (let index = 0; index < form.elements.length; index++) {
        let element = form.elements[index];
        if (element.value.trim() != '' && element.type !== 'hidden'){
            return true}
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
    emoji_category_header.classList.add('dropdown-item')
    emoji_category_header.innerText = emoji_list_name.split('-').join(' ')
    parent_element.appendChild(emoji_category_header)

    fetch(`https://emojihub.yurace.pro/api/all/category/${emoji_list_name}`)
    .then( (response) => {
        return response.json()
    })
    .then( (emojis) => {
        for (let index = 0; index < emojis.length; index++) {
            let new_button = document.createElement('button')
            new_button.innerHTML = emojis[index].htmlCode[0]
            new_button.classList.add('btn', 'm-1', 'action')
            new_button.style.fontSize = '30px'
            new_button.onclick = (event) => {
                event.stopPropagation();
                display_button_inner_text(new_button, input)
            }
            parent_element.appendChild(new_button)
            //const pattern = /^[A-Za-z0-9]+$/;
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
            htmx.ajax('GET', '/archived_chats', {target:'#chats-and-more', swap:'innerHTML'})
            scroll_to_bottom()
        } else {
            htmx.ajax('GET', '/chats', {target:'#chat-list', swap:'outerHTML'})
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

export {get, post, modifyNotification,
     scroll_to_bottom, create_message_html, 
     toggleReadMore, showDropdown, run_element_animation,
      checked, not_empty, toggle_element_inner_text,
    load_emojis, switch_emojis, switch_checkboxes, 
    toggle_element_display, previewImage, update_chat_list, at_least_one_attr,
    exchange_elements_class, switch_element_visibility, load_more_messages, 
    load_older_messages, remove_duplicates
}