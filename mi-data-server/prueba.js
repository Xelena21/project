const express = require('express');
const mysql = require('mysql2/promise');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, content) => {
        if (err) {
            console.error('Error al leer el archivo HTML:', err);
            res.status(500).send('Error en el servidor');
        } else {
            console.log('Solicitud de página recibida');
            res.status(200).send(content);
        }
    });
});

app.get('/api/ubicaciones', async (req, res) => {
    try {
        console.log('Solicitud de datos recibida');

        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'Matt',
            password: '14241543',
            database: 'gps_data'
        });

        const [rows, fields] = await connection.execute('SELECT * FROM ubicaciones');
        connection.end();

        console.log('Datos obtenidos de la base de datos:', rows);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');

    ws.on('message', (message) => {
        console.log(`Mensaje recibido desde el cliente: ${message}`);
    });
});

server.listen(3000, () => {
    console.log('Servidor web iniciado en http://localhost:3000');
});
