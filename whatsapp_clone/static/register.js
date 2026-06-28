import {previewImage} from  './tools.js';

const formImageInput = document.getElementById('id_photo')

formImageInput.addEventListener('change', () => {
    previewImage(formImageInput, null)
})