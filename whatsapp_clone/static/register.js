import {previewImage} from  './tools.js';

const form_image_input = document.getElementById('id_photo')

form_image_input.addEventListener('change', () => {
    previewImage(form_image_input, null)
})