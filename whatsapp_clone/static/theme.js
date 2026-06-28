const darkTheme = () => {
    const html = document.querySelector('html')
    html.setAttribute('data-bs-theme', 'dark')
    const icon = document.getElementById('theme-icon')
    if (icon){
        icon.classList.remove('bi-moon-fill')
        icon.classList.add('bi-sun-fill')
        localStorage.setItem('theme', 'dark')}
}
const lightTheme = () => {
    const html = document.querySelector('html')
    html.setAttribute('data-bs-theme', 'light')
    const icon = document.getElementById('theme-icon')
    if (icon){
        icon.classList.remove('bi-sun-fill')
        icon.classList.add('bi-moon-fill')
        localStorage.setItem('theme', 'light')}
}
const switchTheme = () => {
    const actualTheme = localStorage.getItem('theme')
    actualTheme === 'light' ? darkTheme(): lightTheme()


}

const applyCurrentTheme = () => {
    const actualTheme = localStorage.getItem('theme')
    actualTheme === 'light' ? lightTheme(): darkTheme()
}

document.addEventListener('DOMContentLoaded', () => {
    applyCurrentTheme()
})

htmx.on('htmx:afterSettle', (event) => {
    /**
     * if the user went back to the initial UI (where the theme icon is)
     * matches the icon with the actual theme.
     */
    if (event.detail.pathInfo.requestPath === '/display_user_ui/'){
        applyCurrentTheme()
    }
})