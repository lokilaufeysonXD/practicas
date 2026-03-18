<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once "conexion.php";

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {

    // ── GET: obtener todos los usuarios ──
    case "GET":
        $sql = "SELECT * FROM users ORDER BY id ASC";
        $result = mysqli_query($conn, $sql);

        if (!$result) {
            echo json_encode(["error" => "Error al consultar: " . mysqli_error($conn)]);
            exit;
        }

        $users = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $users[] = $row;
        }
        echo json_encode($users);
        break;

    // ── POST: crear usuario ──
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            echo json_encode(["error" => "Datos inválidos"]);
            exit;
        }

        $nombre       = mysqli_real_escape_string($conn, trim($data["nombre"]      ?? ""));
        $edad         = (int)($data["edad"]        ?? 0);
        $email        = mysqli_real_escape_string($conn, trim($data["email"]        ?? ""));
        $telefono     = mysqli_real_escape_string($conn, trim($data["telefono"]     ?? ""));
        $fecha_nac    = !empty($data["fecha_nacimiento"]) ? "'" . mysqli_real_escape_string($conn, $data["fecha_nacimiento"]) . "'" : "NULL";
        $ciudad       = mysqli_real_escape_string($conn, trim($data["ciudad"]       ?? ""));
        $departamento = mysqli_real_escape_string($conn, trim($data["departamento"] ?? ""));
        $salario      = (float)($data["salario"]   ?? 0);
        $estado       = mysqli_real_escape_string($conn, trim($data["estado"]       ?? "Activo"));

        if (empty($nombre)) {
            echo json_encode(["error" => "El nombre es obligatorio"]);
            exit;
        }

        $sql = "INSERT INTO users (nombre, edad, email, telefono, fecha_nacimiento, ciudad, departamento, salario, estado)
                VALUES ('$nombre', $edad, '$email', '$telefono', $fecha_nac, '$ciudad', '$departamento', $salario, '$estado')";

        if (mysqli_query($conn, $sql)) {
            echo json_encode([
                "success" => true,
                "message" => "Usuario creado correctamente",
                "id"      => mysqli_insert_id($conn)
            ]);
        } else {
            echo json_encode(["error" => "Error al crear: " . mysqli_error($conn)]);
        }
        break;

    // ── PUT: actualizar usuario ──
    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || empty($data["id"])) {
            echo json_encode(["error" => "ID requerido"]);
            exit;
        }

        $id           = (int)$data["id"];
        $nombre       = mysqli_real_escape_string($conn, trim($data["nombre"]      ?? ""));
        $edad         = (int)($data["edad"]        ?? 0);
        $email        = mysqli_real_escape_string($conn, trim($data["email"]        ?? ""));
        $telefono     = mysqli_real_escape_string($conn, trim($data["telefono"]     ?? ""));
        $fecha_nac    = !empty($data["fecha_nacimiento"]) ? "'" . mysqli_real_escape_string($conn, $data["fecha_nacimiento"]) . "'" : "NULL";
        $ciudad       = mysqli_real_escape_string($conn, trim($data["ciudad"]       ?? ""));
        $departamento = mysqli_real_escape_string($conn, trim($data["departamento"] ?? ""));
        $salario      = (float)($data["salario"]   ?? 0);
        $estado       = mysqli_real_escape_string($conn, trim($data["estado"]       ?? "Activo"));

        $sql = "UPDATE users SET
                    nombre='$nombre',
                    edad=$edad,
                    email='$email',
                    telefono='$telefono',
                    fecha_nacimiento=$fecha_nac,
                    ciudad='$ciudad',
                    departamento='$departamento',
                    salario=$salario,
                    estado='$estado'
                WHERE id=$id";

        if (mysqli_query($conn, $sql)) {
            echo json_encode(["success" => true, "message" => "Usuario actualizado"]);
        } else {
            echo json_encode(["error" => "Error al actualizar: " . mysqli_error($conn)]);
        }
        break;

    // ── DELETE: eliminar usuario ──
    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);
        $id = (int)($data["id"] ?? 0);

        if (!$id) {
            echo json_encode(["error" => "ID requerido"]);
            exit;
        }

        $sql = "DELETE FROM users WHERE id=$id";

        if (mysqli_query($conn, $sql)) {
            echo json_encode(["success" => true, "message" => "Usuario eliminado"]);
        } else {
            echo json_encode(["error" => "Error al eliminar: " . mysqli_error($conn)]);
        }
        break;

    default:
        echo json_encode(["error" => "Método no permitido"]);
        break;
}

mysqli_close($conn);
