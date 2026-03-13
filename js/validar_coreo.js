// ////////////// conexion a la base de datos //////////////

// const mysql = require('mysql2/promise');

// (async () => {
//     try {
//         const conn = await mysql.createConnection({
//             host: 'localhost',
//             user: 'root',
//             password: '',
//             database: 'tarea_rocio'
//         });

//         const [rows] = await conn.execute('SELECT * FROM usuarios');
//         console.log(rows);
//     } catch (error) {
//         console.error("Error al conectar a la base de datos:", error);
//     }
// })();