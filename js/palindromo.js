       // Función para limpiar el texto (eliminar acentos, espacios, signos de puntuación y pasar a minúsculas)
        function cleanText(text) {
            // Eliminar acentos y diacríticos
            const withoutAccents = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            // Eliminar caracteres no alfanuméricos (excepto letras y números)
            const alphanumeric = withoutAccents.toLowerCase().replace(/[^a-z0-9]/g, "");
            return alphanumeric;
        }

        // Función para verificar si es palíndromo
        function isPalindrome(text) {
            const cleaned = cleanText(text);
            if (cleaned.length === 0) return false; // Texto vacío no es palíndromo
            const reversed = cleaned.split('').reverse().join('');
            return cleaned === reversed;
        }

        // Elementos del DOM
        const textInput = document.getElementById('textInput');
        const checkBtn = document.getElementById('checkBtn');
        const resultCard = document.getElementById('resultCard');
        const resultText = document.getElementById('resultText');
        const resultMessage = document.getElementById('resultMessage');
        const example1 = document.getElementById('example1');
        const example2 = document.getElementById('example2');

        // Función para actualizar el resultado en la UI
        function updateResult(text) {
            const palindrome = isPalindrome(text);
            if (text.trim() === '') {
                // Caso vacío
                resultCard.className = 'result-card';
                resultMessage.textContent = 'Introduce algún texto';
            } else if (palindrome) {
                resultCard.className = 'result-card palindrome';
                resultText.textContent = '✅ ¡Sí!';
                resultMessage.textContent = `"${text}" es un palíndromo`;
            } else {
                resultCard.className = 'result-card not-palindrome';
                resultText.textContent = '❌ No';
                resultMessage.textContent = `"${text}" no es un palíndromo`;
            }
        }

        // Evento al hacer clic en el botón
        checkBtn.addEventListener('click', () => {
            updateResult(textInput.value);
        });

        // Evento al presionar Enter en el campo de texto
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkBtn.click();
            }
        });

        // Ejemplos interactivos
        example1.addEventListener('click', () => {
            textInput.value = 'Anita lava la tina';
            checkBtn.click();
        });

        example2.addEventListener('click', () => {
            textInput.value = 'Hola mundo';
            checkBtn.click();
        });

        // Opcional: comprobar al cargar con el texto por defecto (vacío)
        updateResult('');