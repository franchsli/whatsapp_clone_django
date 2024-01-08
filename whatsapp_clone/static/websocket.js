const socket = new WebSocket(`ws://${window.location.host}/`)


socket.addEventListener('open', () => {
    socket.send('HOLAAAAAAAAAAAAAAAAAAAAAAAAAA')
})

socket.addEventListener('message', (event) => {
    console.log('message from server', event.data )
})