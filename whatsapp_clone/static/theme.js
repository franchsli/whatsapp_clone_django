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


document.addEventListener('DOMContentLoaded', () => {
    const actual_theme = localStorage.getItem('theme')
    actual_theme === 'light' ? light_theme(): dark_theme()
})