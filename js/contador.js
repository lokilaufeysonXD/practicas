// setInterval(function () {
//     location.reload();
// }, 5000);

let contador = 0;
let limiteActivo = false;

function incrementar() {
    if (limiteActivo && contador >= 10) return;
    contador++;
    document.getElementById("contador").innerHTML = contador;
    limitar_contador();
}

function decrementar() {
    if (limiteActivo && contador <= -10) return;
    contador--;
    document.getElementById("contador").innerHTML = contador;
    limitar_contador();
}

function resetear() {
    contador = 0;
    document.getElementById("contador").innerHTML = contador;
    limitar_contador();
}

function limitar() {
    limiteActivo = !limiteActivo;
    let botonLimite = document.getElementById("limitar");

    if (limiteActivo) {
        botonLimite.style.color = "red";
        if (contador > 10) contador = 10;
        else if (contador < -10) contador = -10;
        document.getElementById("contador").innerHTML = contador;
    } else {
        botonLimite.style.color = "green";
    }
}

function limitar_contador() {
    if (contador >= 11 || contador <= -11) {
        document.getElementById("limitar").disabled = true;
        document.getElementById("limitar").style.cursor = "not-allowed";
    } else {
        document.getElementById("limitar").disabled = false;
        document.getElementById("limitar").style.cursor = "pointer";
    }
}