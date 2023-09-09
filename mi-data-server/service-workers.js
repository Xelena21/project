self.addEventListener('install', event => {
    console.log('Service Worker instalado');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    console.log('Service Worker activado');
});

self.addEventListener('fetch', event => {
    // No hacer nada especial aquí, dejar que los datos sean manejados por el WebSocket
});

self.addEventListener('message', event => {
    // No hacer nada especial aquí, dejar que los datos sean manejados por el WebSocket
});
