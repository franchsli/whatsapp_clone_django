function create_message_html(text){
    const messages = document.getElementById('chat-messages')
    const new_message = document.createElement('li')
    const message_text = document.createElement('span')
    new_message.classList.add('list-unstyled-item', 'me-3', 'mt-3', 'rounded', 'message', 'user-message')
    message_text.classList.add('p-2')
    message_text.innerHTML = text
    new_message.appendChild(message_text)
    messages.appendChild(new_message)
    messages.scroll(0, 1000)

}

const new_message_input = document.getElementById('new-message') 
const socket = new WebSocket(`ws://${window.location.host}/`)

socket.addEventListener('open', () => {

    new_message_input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && new_message_input.value !== ''){
            //console.log(new_message_input.value)
            socket.send(new_message_input.value)
        }
    
    })
})

socket.addEventListener('message', (event) => {
    console.log('message from server', event.data )
    create_message_html(event.data)
    new_message_input.value = ''
})