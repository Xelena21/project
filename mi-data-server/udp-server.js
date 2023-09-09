const dgram = require('dgram');
const mysql = require('mysql2');

// Crear una conexión a la base de datos MySQL
const connection = mysql.createConnection({
    host: 'database-1.c3u4cniuznve.us-east-2.rds.amazonaws.com', // Dirección del servidor MySQL
    user: 'xmaiguel',      // Usuario de la base de datos
    password: 'xelena20012001', // Contraseña del usuario
    database: 'database-1'  // Nombre de la base de datos
});

// Crear un socket UDP (servidor) en IPv4
const server = dgram.createSocket('udp4');

// Manejar el evento cuando el servidor está escuchando
server.on('listening', () => {
    const address = server.address();
    console.log(`Servidor UDP escuchando en el puerto ${address.port}`);
});

// Manejar el evento cuando se recibe un mensaje
server.on('message', (message, remoteInfo) => {
    try {
        const data = message.toString(); // Convertir el mensaje a una cadena de texto
        console.log(`Datos recibidos desde ${remoteInfo.address}:${remoteInfo.port}: ${data}`);
        
        // Dividir los datos en partes utilizando ', ' como separador
        const parts = data.split(', ');
        const latitudPart = parts.find(part => part.startsWith('Latitud:'));
        const longitudPart = parts.find(part => part.startsWith('Longitud:'));

        if (latitudPart && longitudPart) {
            // Extraer la latitud y longitud de las partes correspondientes
            const latitud = latitudPart.split(':')[1].trim();
            const longitud = longitudPart.split(':')[1].trim();

            // Obtener la fecha y hora actual en el formato requerido
            const fechaHora = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Consulta SQL para insertar los datos en la base de datos
            const query = 'INSERT INTO ubicaciones (latitud, longitud, fechaHora) VALUES (?, ?, ?)';
            // Ejecutar la consulta con los valores correspondientes
            connection.query(query, [latitud, longitud, fechaHora], (error, results) => {
                if (error) {
                    console.error('Error al almacenar datos en la base de datos:', error);
                } else {
                    console.log('Datos almacenados en la base de datos');
                }
            });
        } else {
            console.error('Datos incompletos recibidos');
        }
    } catch (error) {
        console.error('Error al procesar el mensaje:', error);
    }
});

// Enlazar el servidor al puerto 3001
server.bind(3000);
