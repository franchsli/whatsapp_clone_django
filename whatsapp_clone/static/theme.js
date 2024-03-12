const dark_theme = () => {
    const html = document.querySelector('html')
    html.setAttribute('data-bs-theme', 'dark')
    const icon = document.getElementById('theme-icon')
    icon.classList.remove('bi-moon-fill')
    icon.classList.add('bi-sun-fill')
    localStorage.setItem('theme', 'dark')
}
const light_theme = () => {
    const html = document.querySelector('html')
    html.setAttribute('data-bs-theme', 'light')
    const icon = document.getElementById('theme-icon')
    icon.classList.remove('bi-sun-fill')
    icon.classList.add('bi-moon-fill')
    localStorage.setItem('theme', 'light')
}
const switch_theme = () => {
    const actual_theme = localStorage.getItem('theme')
    actual_theme === 'light' ? dark_theme(): light_theme()


}

const apply_current_theme = () => {
    const actual_theme = localStorage.getItem('theme')
    actual_theme === 'light' ? light_theme(): dark_theme()
}

document.addEventListener('DOMContentLoaded', () => {
    apply_current_theme()
})

htmx.on('htmx:afterSettle', (event) => {
    /**
     * if the user went back to the initial UI (where the theme icon is)
     * matches the icon with the actual theme.
     */
    if (event.detail.pathInfo.requestPath === '/display_user_ui/'){
        apply_current_theme()
    }
})