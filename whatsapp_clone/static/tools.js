const smileys = ['😀', '😃','😄','😁','😆',
    '😅','🤣','😂','🙂','😉',
    '😊','😇','🥰','😍','🤩',
    '😘','😗','☺️','😚','😙',
    '🥲','😏','😋','😛','😜',
    '🤪','😝','🤗','🤭','🫢',
    '🫣','🤫','🤔','🫡','🤤',
    '🤠','🥳','🥸','😎','🤓',
    '🧐','🙃','🫠','🤐','🤨',
    '😐','😑','😶','🫥','😶‍🌫️',
    '😒','🙄','😬','😮‍💨','🤥',
    '🫨', '😌','😔','😪','😴',
    '😷','🤒','🤕','🤢','🤮',
    '🤧','🥵','🥶','🥴','😵',
    '😵‍💫','🤯','🥱','😕',
    '🫤','😟','🙁','☹️','😮',
    '😯','😲','😳','🥺','🥹',
    '😦','😧','😨','😰','😥',
    '😢','😭','😱','😖','😣',
    '😞','😓','😩','😫','😤',
    '😡','😠','🤬','👿','😈',
    '👿','💀','☠️','💩','🤡',
    '👹','👺','👻','👽','👾',
    '🤖','😺','😸','😹','😻',
    '😼','😽','🙀','😿','😾',
    '🙈','🙉','🙊',
]

const people = [
    '👋','🤚','🖐️','✋','🖖','🫱',
    '🫲','🫳','🫴','🫷','🫸','👌',
    '🤌','🤏','✌️','🤞','🫰','🤟',
    '🤘','🤙','👈','👉','👆','🖕',
    '👇','☝️','🫵','👍','👎','✊',
    '👊','🤛','🤜','👏','🙌','🫶',
    '👐','🤲','🤝','🙏','✍️','💅',
    '🤳','💪','🦾','🦿','🦵','🦶',
    '👂','🦻','👃','🧠','🫀','🫁',
    '🦷','🦴','👀','👅','👄','🫦',
    '👣','🧬','🩸',
]

const emoji_list = [smileys, ]



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
    messages.scroll(0, messages.scrollHeight - messages.clientHeight)
    //console.log('SCROLLED:', messages.scrollHeight - messages.clientHeight)
    //console.log('SCROLL A:', messages.scrollHeight)
    //console.log('SCROLL B:', messages.clientHeight)

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
    if (sent_by_auth_user){new_message.classList.add('list-unstyled-item', 'me-3', 'mt-3', 'rounded', 'message', 'user-message')}
    else {new_message.classList.add('list-unstyled-item', 'ms-3', 'mt-3', 'rounded', 'message', 'contact-message')}
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
    const dropdown = document.getElementById(`customDropdown-${dropdown_id}`);
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
    console.log(form.elements)
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
    console.log(form.elements)
    for (let index = 0; index < form.elements.length; index++) {
        let element = form.elements[index];
        if (element.value.trim() != '' && element.type !== 'hidden'){
            console.log(`ELEMENT:${element}\nVALUE:${element.value}\nTYPE${element.type}`)
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
    console.log('RAN')
    console.log(previous_value)
    console.log(input.value)
}

/**
 * loads the emojis in the array name provided in new buttons (HTML elements)
 * placed in the provided parent.
 * @param {String} emoji_list_name
 * @param {HTMLElement} parent_element 
 */
function load_emojis(emoji_list_name, parent_element){
    let emoji_list
    if(emoji_list_name === 'smileys'){
        emoji_list = smileys
    }

    const input = document.getElementById('new-message')
    for (let index = 0; index < emoji_list.length; index++) {
        let new_button = document.createElement('button')
        new_button.innerText = emoji_list[index]
        new_button.classList.add('btn', 'm-1', 'action')
        new_button.style.fontSize = '30px'
        new_button.onclick = (event) => {
            event.stopPropagation();
            display_button_inner_text(new_button, input)
        }
        parent_element.appendChild(new_button)
    }
}


export {get, post, modifyNotification,
     scroll_to_bottom, create_message_html, 
     toggleReadMore, showDropdown, run_element_animation,
      checked, not_empty, toggle_element_inner_text,
    load_emojis,
}