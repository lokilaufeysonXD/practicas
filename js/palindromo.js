function esPalindromo() {
    let inputElemento = document.getElementById("palindromo");
    let textoIngresado = inputElemento.value.trim();

    if (textoIngresado === "") {
        document.getElementById("caja-flotante").style.display = "none";
        document.getElementById("resultado").innerHTML = ""; // Limpiamos el texto principal
        return;
    }

    console.log(textoIngresado);

    let arrayDeLetras = textoIngresado.split("");

    console.log(arrayDeLetras);

    let textoInvertido = arrayDeLetras.reverse().join("");

    console.log(textoInvertido);

    if (textoIngresado === textoInvertido) {
        console.log("Es un palindromo");
        document.getElementById("resultado-flotante").innerHTML = "¡Sí! Es un palíndromo.";

        let resultadoElemento = document.getElementById("resultado");
        resultadoElemento.innerHTML = "¡Sí! Es un palíndromo.";
        resultadoElemento.style.color = "green"; // Cambiar a verde

    } else {
        console.log("No es un palindromo");
        document.getElementById("resultado-flotante").innerHTML = "No es un palíndromo.";

        let resultadoElemento = document.getElementById("resultado");
        resultadoElemento.innerHTML = "No es un palíndromo.";
        resultadoElemento.style.color = "red"; // Cambia a rojo
    }


    let cajaFlotante = document.getElementById("caja-flotante");
    cajaFlotante.style.display = "block";

    setTimeout(function () {
        cajaFlotante.style.display = "none";
    }, 3000);
}


//////////////////// esto si quieres lo dejas es complicado lo tuve que buscar porque no me recordaba ////////////////////////

// Detectar cuando se presiona la tecla "Enter" en el input
// Esperamos a que todo el HTML cargue primero antes de buscar el elemento
document.addEventListener("DOMContentLoaded", function () {
    let inputPalindromo = document.getElementById("palindromo");

    // Verificamos que el input exista antes de agregarle el evento
    if (inputPalindromo) {
        inputPalindromo.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Evita recargar
                esPalindromo(); // Ejecuta la revisión
            }
        });
    }
});