// Expresión regular para validar email (sencilla pero efectiva)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Elementos del DOM
const emailInput = document.getElementById('emailInput');
const iconValid = document.getElementById('iconValid');
const iconInvalid = document.getElementById('iconInvalid');
const messageDiv = document.getElementById('message');
const validateBtn = document.getElementById('validateBtn');
const exampleBadges = document.querySelectorAll('.example-badge');

// Función para validar email y actualizar la interfaz
function validateEmail(email) {
    const isValid = emailRegex.test(email);
    const trimmed = email.trim();

    // Actualizar clases del input
    if (trimmed === '') {
        emailInput.classList.remove('valid', 'invalid');
        iconValid.style.display = 'none';
        iconInvalid.style.display = 'none';
        messageDiv.className = 'message';
        messageDiv.textContent = '';
        return;
    }

    if (isValid) {
        emailInput.classList.add('valid');
        emailInput.classList.remove('invalid');
        iconValid.style.display = 'block';
        iconInvalid.style.display = 'none';
        messageDiv.className = 'message success';
        messageDiv.textContent = '✅ Formato válido';
    } else {
        emailInput.classList.add('invalid');
        emailInput.classList.remove('valid');
        iconValid.style.display = 'none';
        iconInvalid.style.display = 'block';
        messageDiv.className = 'message error';
        messageDiv.textContent = '❌ Formato inválido. Debe incluir @ y dominio (ej: usuario@dominio.com)';
    }
}

// Validar mientras el usuario escribe (retroalimentación inmediata)
emailInput.addEventListener('input', function () {
    validateEmail(this.value);
});

// También al perder el foco (por si acaso)
emailInput.addEventListener('blur', function () {
    validateEmail(this.value);
});

// Botón validar (por si quieren forzar, aunque ya hay feedback)
validateBtn.addEventListener('click', function () {
    validateEmail(emailInput.value);
});

// Permitir Enter en el input
emailInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        validateEmail(this.value);
    }
});

// Ejemplos interactivos
exampleBadges.forEach(badge => {
    badge.addEventListener('click', function () {
        const email = this.getAttribute('data-email');
        emailInput.value = email;
        validateEmail(email);
        // Opcional: dar foco al input
        emailInput.focus();
    });
});

// Validar al cargar (con campo vacío)
validateEmail('');