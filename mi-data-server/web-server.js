const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');

const connectionOptions = {
    host: 'database-1.c3u4cniuznve.us-east-2.rds.amazonaws.com', // Dirección del servidor MySQL
    user: 'xmaiguel',      // Usuario de la base de datos
    password: 'xelena20012001', // Contraseña del usuario
    database: 'database-1'  // Nombre de la base de datos
};

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer);

// Conexión a la base de datos
async function connectToDB() {
    try {
        const connection = await mysql.createConnection(connectionOptions);
        console.log('Conexión exitosa a la base de datos');
        return connection;
    } catch (error) {
        console.error('Error al conectarse a la base de datos:', error);
        throw error; // Propaga el error para que sea manejado en el lugar adecuado
    }
}

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

app.get('/api/ubicaciones', async (req, res) => {
    try {
        const connection = await connectToDB();
        const [rows, fields] = await connection.execute('SELECT * FROM ubicaciones');
        console.log('Datos obtenidos de la base de datos:', rows);
        connection.end();

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

const webServerPort = 3000;
httpServer.listen(webServerPort, () => {
    console.log(`Servidor web iniciado en http://localhost:${webServerPort}`);
});
