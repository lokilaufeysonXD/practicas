<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "tarea_rocio";

// Conexión
$conn = mysqli_connect($host, $user, $password, $database);

// Verificar conexión
if (!$conn) {
    die("Error de conexión: " . mysqli_connect_error());
}

echo "Conexión exitosa";
