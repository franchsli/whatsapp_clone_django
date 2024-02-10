async function get(url){
    const response = await fetch(url)
    const data = response.json()
    return data
}

function post(url, data){
    const csrf_token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'content-type':'aplication/json', 
        'X-CSRFToken': csrf_token }
    })
    .then(response => console.log(response.json))
    .catch(error => console.log(error.message))
}

/**
 * Moves the scrollbar  at the bottom of the messages in chat.
 */
function scroll_to_bottom(){
    const messages = document.getElementById('chat-messages')
    //.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
    messages.scroll(0, messages.scrollHeight - messages.clientHeight)

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
 * 
 * @param {String} text_id 
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

function showDropdown(event, dropdown_id) {
    event.preventDefault();

    // Set the position of the dropdown
    const dropdown = document.getElementById(`customDropdown-${dropdown_id}`);
    dropdown.style.position = 'fixed';
    dropdown.style.left = `${event.clientX}px`;
    dropdown.style.top = `${event.clientY}px`;

    // Display the dropdown
    dropdown.classList.toggle('show')
    console.log(dropdown.style.animation)
    console.log(dropdown.style.animationPlayState)
    console.log(dropdown.style)
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
export {get, post, modifyNotification, scroll_to_bottom, create_message_html, toggleReadMore, showDropdown, run_element_animation}