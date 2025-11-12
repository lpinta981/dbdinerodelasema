// Service Worker completo para PWA Dinero de la Semana
// Versión: 1.0.0

const CACHE_NAME = 'dinero-semana-v1';
const DATA_CACHE_NAME = 'dinero-semana-data-v1';

// Archivos estáticos para cachear
const STATIC_FILES = [
    '/',
    '/index.html',
    '/app.js',
    '/config.js',
    '/styles.css',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// URLs de API que deben usar network-first
const API_URLS = [
    'supabase.co',
    'api.manasakilla.com'
];

// Instalación: Precachear archivos estáticos
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker v1.0.0');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching archivos estáticos');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                // Forzar activación inmediata
                return self.skipWaiting();
            })
    );
});

// Activación: Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                            console.log('[SW] Eliminando caché antigua:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Tomar control de todos los clientes inmediatamente
                return self.clients.claim();
            })
    );
});

// Fetch: Estrategias de cache inteligentes
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Solo interceptar peticiones GET
    if (request.method !== 'GET') return;
    
    // Estrategia para APIs (Network First)
    if (API_URLS.some(apiUrl => url.href.includes(apiUrl))) {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // Estrategia para archivos estáticos (Cache First)
    if (STATIC_FILES.some(file => url.pathname === file || url.href === file)) {
        event.respondWith(cacheFirst(request));
        return;
    }
    
    // Para todo lo demás, intentar red primero
    event.respondWith(networkFirst(request));
});

// Estrategia Cache First (para archivos estáticos)
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Error en cacheFirst:', error);
        return caches.match('/index.html'); // Fallback
    }
}

// Estrategia Network First (para APIs y datos dinámicos)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cachear respuestas exitosas de API
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Red no disponible, buscando en caché:', request.url);
        
        // Intentar servir desde caché
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Si no hay caché, retornar error offline
        return new Response(
            JSON.stringify({
                error: 'Sin conexión',
                message: 'Aplicación en modo offline. Algunas funciones no están disponibles.',
                offline: true
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: '1.0.0' });
    }
});

// Sync en background (para funcionalidad offline)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Función de sincronización en background
async function doBackgroundSync() {
    try {
        // Aquí podrías sincronizar datos pendientes cuando vuelva la conexión
        console.log('[SW] Ejecutando sincronización en background');
        
        // Enviar mensaje a la aplicación
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                message: 'Sincronización completada'
            });
        });
    } catch (error) {
        console.log('[SW] Error en background sync:', error);
    }
}