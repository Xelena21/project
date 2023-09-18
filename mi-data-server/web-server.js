const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');
const exec = require('child_process').exec;


const connectionOptions = {
    host: 'database-1.c3u4cniuznve.us-east-2.rds.amazonaws.com', // Dirección del servidor MySQL
    user: 'xmaiguel',      // Usuario de la base de datos
    password: 'xelena20012001', // Contraseña del usuario
    database: 'database-1'  // Nombre de la base de datos
};
const WEBHOOK_SECRET = 'xelena20012001';  // Asegúrate de cambiar esto por un valor seguro y aleatorio.
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
app.get('/api/ubicaciones/ultimo', async (req, res) => {
    try {
        const connection = await connectToDB();
        const [rows, fields] = await connection.execute('SELECT * FROM ubicaciones ORDER BY id DESC LIMIT 1');
        console.log('Último dato obtenido de la base de datos:', rows[0]);
        connection.end();

        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron registros' });
        }
    } catch (error) {
        console.error('Error al obtener el último dato:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

app.get('/api/ubicaciones/por-fecha', async (req, res) => {
    try {
        // Obtén la fecha de la solicitud desde los parámetros de la URL
        var fechaConsulta = req.query.fecha; // Debes incluir la fecha en el formato adecuado
        console.log(fechaConsulta)

        if (!fechaConsulta) {
            return res.status(400).json({ message: 'Debes proporcionar una fecha para la consulta' });
        }

        const connection = await connectToDB();
        // Utiliza un parámetro en la consulta SQL para obtener los datos de la fecha especificada
        const [rows, fields] = await connection.execute('SELECT * FROM ubicaciones WHERE DATE(CONVERT_TZ(time_stamp, "UTC", "America/Bogota")) = ? ORDER BY id DESC', [fechaConsulta]);
        connection.end();

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'No se encontraron registros para la fecha especificada' });
        }
    } catch (error) {
        console.error('Error al obtener los datos por fecha:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


app.post('/webhook', express.json(), (req, res) => {
    const crypto = require('crypto');


    let expectedSignature = "sha256=" + crypto.createHmac('sha256', WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');

    if (req.headers['x-hub-signature-256'] !== expectedSignature) {
        console.error('Firma no coincide. Posible intento de ataque.');
        return res.status(403).send('Signature mismatch');
    }

    exec('cd /home/ubuntu/diseño/project && git pull && pm2 restart 0 && pm2 restart 1 ', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error ejecutando el comando: ${error}`);
            return res.status(500).send('Server Internal Error');
        }
        console.log(`Resultado del comando: ${stdout}`);
        return res.status(200).send('Deployed!');
    });
});


const webServerPort = 3000;
httpServer.listen(webServerPort, () => {
    console.log(`Servidor web iniciado en http://localhost:${webServerPort}`);
});
