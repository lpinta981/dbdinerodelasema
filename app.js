// =====================================================
// DINERO DE LA SEMANA - Aplicación Principal
// =====================================================

let currentUser = null;
let isAdmin = false;
let currentUserIds = []; // Array de IDs de usuarios vinculados
let allPagos = [];

// =====================================================
// MODAL DE CONFIRMACIÓN PERSONALIZADO
// =====================================================

function showCustomConfirm(options = {}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const content = document.getElementById('custom-confirm-content');
        const title = document.getElementById('confirm-title');
        const message = document.getElementById('confirm-message');
        const iconContainer = document.getElementById('confirm-icon-container');
        const icon = document.getElementById('confirm-icon');
        const acceptBtn = document.getElementById('confirm-accept-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');
        
        // Configuración por defecto
        const config = {
            title: options.title || '¿Estás seguro?',
            message: options.message || '¿Deseas continuar con esta acción?',
            confirmText: options.confirmText || 'Confirmar',
            cancelText: options.cancelText || 'Cancelar',
            type: options.type || 'warning', // warning, danger, success, info
            icon: options.icon || null
        };
        
        // Configurar colores según el tipo
        let iconBgColor = 'bg-orange-100';
        let iconColor = 'text-orange-600';
        let btnColor = 'bg-blue-600 hover:bg-blue-700';
        let iconPath = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
        
        switch(config.type) {
            case 'danger':
                iconBgColor = 'bg-red-100';
                iconColor = 'text-red-600';
                btnColor = 'bg-red-600 hover:bg-red-700';
                iconPath = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
                break;
            case 'success':
                iconBgColor = 'bg-green-100';
                iconColor = 'text-green-600';
                btnColor = 'bg-green-600 hover:bg-green-700';
                iconPath = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
                break;
            case 'info':
                iconBgColor = 'bg-blue-100';
                iconColor = 'text-blue-600';
                btnColor = 'bg-blue-600 hover:bg-blue-700';
                iconPath = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
                break;
            case 'logout':
                iconBgColor = 'bg-purple-100';
                iconColor = 'text-purple-600';
                btnColor = 'bg-purple-600 hover:bg-purple-700';
                iconPath = 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1';
                break;
        }
        
        // Aplicar configuración
        title.textContent = config.title;
        message.textContent = config.message;
        acceptBtn.textContent = config.confirmText;
        cancelBtn.textContent = config.cancelText;
        
        // Aplicar colores
        iconContainer.className = `rounded-full p-4 ${iconBgColor}`;
        icon.className = `w-12 h-12 ${iconColor}`;
        acceptBtn.className = `flex-1 px-4 py-3 text-white font-semibold rounded-lg transition duration-200 ${btnColor}`;
        
        // Cambiar icono
        if (config.icon) {
            icon.innerHTML = config.icon;
        } else {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"></path>`;
        }
        
        // Mostrar modal con animación
        modal.classList.remove('hidden');
        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
        
        // Manejar eventos
        const handleAccept = () => {
            closeCustomConfirm();
            resolve(true);
        };
        
        const handleCancel = () => {
            closeCustomConfirm();
            resolve(false);
        };
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };
        
        // Agregar listeners
        acceptBtn.onclick = handleAccept;
        cancelBtn.onclick = handleCancel;
        document.addEventListener('keydown', handleEscape);
        
        // Click fuera del modal
        modal.onclick = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };
        
        // Limpiar listeners cuando se cierre
        function closeCustomConfirm() {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                document.removeEventListener('keydown', handleEscape);
                acceptBtn.onclick = null;
                cancelBtn.onclick = null;
                modal.onclick = null;
            }, 200);
        }
    });
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación...');
    
    // Verificar sesión existente
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        await handleSuccessfulLogin(session);
    } else {
        showLoginScreen();
    }
    
    // Event listeners
    setupEventListeners();
});

// =====================================================
// AUTENTICACIÓN
// =====================================================

function setupEventListeners() {
    // Login
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    
    // Generar siguiente pago
    document.getElementById('btn-generar-siguiente')?.addEventListener('click', generarSiguientePago);
    
    // Refresh
    document.getElementById('btn-refresh')?.addEventListener('click', loadDashboard);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    const loginBtn = e.target.querySelector('button[type="submit"]');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="animate-pulse">Iniciando sesión...</span>';
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        await handleSuccessfulLogin(data.session);
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        showError('login-error', error.message || 'Error al iniciar sesión');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Iniciar Sesión';
    }
}

async function handleSuccessfulLogin(session) {
    currentUser = session.user;
    console.log('✅ Usuario autenticado:', currentUser.email);
    
    // Buscar TODOS los usuarios vinculados a este email
    // Estrategia: buscar por email O email_propietario en una sola consulta
    let { data: usuariosVinculados, error: errorUsuarios } = await supabaseClient
        .from('dinerosemana_usuarios')
        .select('id, nombre, rol, email, email_propietario, usuario_ferreteria_id')
        .or(`email.eq.${currentUser.email},email_propietario.eq.${currentUser.email}`);
    
    console.log('🔍 Búsqueda inicial:', usuariosVinculados);
    
    // Si no encontró nada, buscar por vinculación con usuarios_ferreteria
    if ((!usuariosVinculados || usuariosVinculados.length === 0) && currentUser.id) {
        const result = await supabaseClient
            .from('dinerosemana_usuarios')
            .select('id, nombre, rol, email, email_propietario, usuario_ferreteria_id')
            .eq('usuario_ferreteria_id', currentUser.id);
        usuariosVinculados = result.data;
        console.log('🔍 Búsqueda por ferreteria_id:', usuariosVinculados);
    }
    
    // Si encontró usuarios, buscar otros vinculados al mismo email_propietario
    if (usuariosVinculados && usuariosVinculados.length > 0) {
        const todosIds = new Set(usuariosVinculados.map(u => u.id));
        
        // Buscar otros usuarios que compartan el mismo email_propietario
        for (const usuario of usuariosVinculados) {
            if (usuario.email_propietario) {
                const { data: otrosUsuarios } = await supabaseClient
                    .from('dinerosemana_usuarios')
                    .select('id, nombre, rol, email, email_propietario')
                    .eq('email_propietario', usuario.email_propietario);
                
                if (otrosUsuarios) {
                    otrosUsuarios.forEach(u => todosIds.add(u.id));
                }
            }
        }
        
        // Obtener todos los usuarios vinculados
        if (todosIds.size > usuariosVinculados.length) {
            const { data: todosUsuarios } = await supabaseClient
                .from('dinerosemana_usuarios')
                .select('id, nombre, rol, email, email_propietario')
                .in('id', Array.from(todosIds));
            
            usuariosVinculados = todosUsuarios || usuariosVinculados;
        }
    }
    
    // Guardar IDs de todos los usuarios vinculados
    currentUserIds = usuariosVinculados ? usuariosVinculados.map(u => u.id) : [];
    
    // Verificar si es admin (si al menos uno de sus usuarios es admin)
    isAdmin = usuariosVinculados && usuariosVinculados.some(u => u.rol === 'admin');
    
    console.log('👤 Es admin:', isAdmin);
    console.log('🔗 Usuarios vinculados:', usuariosVinculados ? usuariosVinculados.map(u => `${u.nombre} (${u.rol})`).join(', ') : 'ninguno');
    console.log('📋 IDs vinculados:', currentUserIds);
    
    // Mostrar app
    hideElement('loading-screen');
    hideElement('login-screen');
    showElement('app');
    
    // Configurar UI según rol
    setupUI();
    
    // Cargar datos
    await loadDashboard();
}

async function handleLogout() {
    const confirmed = await showCustomConfirm({
        title: '¿Cerrar sesión?',
        message: 'Se cerrará tu sesión actual y tendrás que volver a iniciar sesión.',
        confirmText: 'Cerrar sesión',
        cancelText: 'Cancelar',
        type: 'logout'
    });
    
    if (confirmed) {
        await supabaseClient.auth.signOut();
        location.reload();
    }
}

// =====================================================
// UI SETUP
// =====================================================

function setupUI() {
    // Mostrar email del usuario
    document.getElementById('user-info').textContent = currentUser.email;
    
    if (isAdmin) {
        // Mostrar acciones de admin
        showElement('admin-actions');
        showElement('admin-stats');
        document.getElementById('historial-title').textContent = 'Todos los Pagos';
    } else {
        // Usuario normal
        document.getElementById('historial-title').textContent = 'Mis Pagos';
    }
}

// =====================================================
// CARGAR DASHBOARD
// =====================================================

async function loadDashboard() {
    console.log('📊 Cargando dashboard...');
    
    try {
        // Cargar próximo pago
        await loadProximoPago();
        
        // Cargar lista de pagos
        await loadPagos();
        
        // Si es admin, cargar estadísticas
        if (isAdmin) {
            await loadEstadisticas();
        }
        
    } catch (error) {
        console.error('❌ Error cargando dashboard:', error);
        showToast('Error al cargar datos', 'error');
    }
}

async function loadProximoPago() {
    try {
        // Obtener TODOS los pagos PENDIENTES (ordenado por fecha, más próximo primero)
        let query = supabaseClient
            .from('dinerosemana_pagos')
            .select(`
                *,
                usuario:dinerosemana_usuarios(nombre)
            `)
            .eq('estado', 'PENDIENTE')
            .order('fecha_asignada', { ascending: true });
        
        // Si no es admin, filtrar solo pagos de los usuarios vinculados
        if (!isAdmin && currentUserIds.length > 0) {
            query = query.in('usuario_id', currentUserIds);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        const proximoPagoCard = document.getElementById('proximos-pagos-card');
        const miniList = document.getElementById('proximos-pagos-mini-list');
        
        if (data && data.length > 0) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            // Mostrar todos los pagos pendientes en el card superior
            miniList.innerHTML = data.map(pago => {
                const fechaAsignada = new Date(pago.fecha_asignada + 'T00:00:00');
                const diasDiferencia = Math.ceil((fechaAsignada - hoy) / (1000 * 60 * 60 * 24));
                
                let mensajeTiempo = '';
                let colorBorder = 'border-orange-400';
                
                if (diasDiferencia < 0) {
                    mensajeTiempo = `⚠️ Atrasado ${Math.abs(diasDiferencia)} ${Math.abs(diasDiferencia) === 1 ? 'día' : 'días'}`;
                    colorBorder = 'border-red-400';
                } else if (diasDiferencia === 0) {
                    mensajeTiempo = '🔔 ¡Hoy!';
                    colorBorder = 'border-yellow-400';
                } else if (diasDiferencia === 1) {
                    mensajeTiempo = '� Mañana';
                } else {
                    mensajeTiempo = `📅 En ${diasDiferencia} días`;
                }
                
                // Si es admin, agregar clases y atributos para hacer clickeable
                const clickableClass = isAdmin ? 'cursor-pointer hover:bg-white/30 active:bg-white/40 transition-all' : '';
                const dataAttributes = isAdmin ? `data-pago-id="${pago.id}" data-usuario-nombre="${pago.usuario.nombre}" onclick="handlePagoClick(this)"` : '';
                
                return `
                    <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 border-l-4 ${colorBorder} ${clickableClass}" ${dataAttributes}>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-bold text-white">${pago.usuario.nombre}</p>
                                <p class="text-xs text-white/80">${formatFecha(pago.fecha_asignada)}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-white">${formatMonto(pago.monto)}</p>
                                <p class="text-xs text-white/90">${mensajeTiempo}</p>
                            </div>
                        </div>
                        ${isAdmin ? '<p class="text-xs text-white/70 mt-2 text-center">👆 Click para marcar como pagado</p>' : ''}
                    </div>
                `;
            }).join('');
            
            // Cambiar color del card según urgencia
            const primerPago = data[0];
            const fechaPrimero = new Date(primerPago.fecha_asignada + 'T00:00:00');
            const diasPrimero = Math.ceil((fechaPrimero - hoy) / (1000 * 60 * 60 * 24));
            
            if (diasPrimero < 0) {
                proximoPagoCard.className = 'bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white';
            } else if (diasPrimero === 0) {
                proximoPagoCard.className = 'bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white';
            } else {
                proximoPagoCard.className = 'bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white';
            }
            
            proximoPagoCard.style.display = 'block';
        } else {
            // No hay pagos pendientes
            proximoPagoCard.className = 'bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white';
            miniList.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-2xl font-bold">¡Todo al día! 🎉</p>
                    <p class="text-sm opacity-90 mt-2">No hay pagos pendientes</p>
                </div>
            `;
            proximoPagoCard.style.display = 'block';
        }
        
    } catch (error) {
        console.error('❌ Error cargando próximo pago:', error);
    }
}

// Función para manejar click en pagos pendientes (solo admin)
async function handlePagoClick(element) {
    if (!isAdmin) return;
    
    const pagoId = element.getAttribute('data-pago-id');
    const usuarioNombre = element.getAttribute('data-usuario-nombre');
    
    // Confirmación personalizada
    const confirmar = await showCustomConfirm({
        title: 'Marcar como pagado',
        message: `¿Confirmas que ${usuarioNombre} ya realizó el pago?`,
        confirmText: 'Sí, marcar como pagado',
        cancelText: 'Cancelar',
        type: 'success'
    });
    
    if (!confirmar) return;
    
    try {
        // Mostrar loading en el elemento
        element.style.opacity = '0.5';
        element.style.pointerEvents = 'none';
        
        const { data, error } = await supabaseClient
            .rpc('marcar_pago_completado', { pago_id: pagoId });
        
        if (error) throw error;
        
        // Mostrar mensaje de éxito
        showToast(`✅ Pago de ${usuarioNombre} marcado como PAGADO`, 'success');
        
        // Recargar datos
        await loadProximoPago();
        await loadPagos();
        await loadStats();
        
    } catch (error) {
        console.error('❌ Error marcando pago:', error);
        showToast('❌ Error al marcar el pago. Intenta de nuevo.', 'error');
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }
}

// Función para mostrar mensajes toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`;
    toast.textContent = message;
    toast.style.minWidth = '250px';
    toast.style.textAlign = 'center';
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, 0)';
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function loadPagos() {
    try {
        console.log('📥 Cargando pagos para IDs:', currentUserIds);
        console.log('🔐 Es admin:', isAdmin);
        
        let query = supabaseClient
            .from('dinerosemana_pagos')
            .select(`
                *,
                usuario:dinerosemana_usuarios(nombre, orden)
            `)
            .order('fecha_asignada', { ascending: false });
        
        // Si no es admin, filtrar solo pagos de los usuarios vinculados
        if (!isAdmin && currentUserIds.length > 0) {
            console.log('🔍 Filtrando pagos para usuarios:', currentUserIds);
            query = query.in('usuario_id', currentUserIds);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        console.log('📦 Pagos cargados:', data);
        console.log('📊 Total pagos encontrados:', data ? data.length : 0);
        
        allPagos = data || [];
        renderPagos(allPagos);
        
    } catch (error) {
        console.error('❌ Error cargando pagos:', error);
        showToast('Error al cargar pagos', 'error');
    }
}

function renderPagos(pagos) {
    const emptyState = document.getElementById('empty-state');
    
    if (!pagos || pagos.length === 0) {
        hideElement('pagos-historial-section');
        showElement('empty-state');
        return;
    }
    
    hideElement('empty-state');
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Filtrar solo los pagados para el historial
    const pagosPagados = pagos.filter(pago => pago.estado === 'PAGADO');
    
    // Ordenar por fecha asignada, más reciente primero
    const pagosOrdenados = pagosPagados.sort((a, b) => {
        const fechaA = new Date(a.fecha_asignada + 'T00:00:00');
        const fechaB = new Date(b.fecha_asignada + 'T00:00:00');
        return fechaB - fechaA;
    });
    
    // Renderizar historial (solo pagados)
    renderSeccionHistorial(pagosOrdenados, hoy);
}

function renderSeccionHistorial(pagos, hoy) {
    const section = document.getElementById('pagos-historial-section');
    const list = document.getElementById('pagos-historial-list');
    
    showElement('pagos-historial-section');
    
    if (!pagos || pagos.length === 0) {
        // Mostrar mensaje de historial vacío
        list.innerHTML = `
            <div class="text-center py-12 bg-white rounded-lg shadow">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-600 font-medium mb-2">Aún no tienes un historial de pagos</p>
                <p class="text-gray-400 text-sm">Los pagos completados aparecerán aquí</p>
            </div>
        `;
        return;
    }
    
    // Ya vienen ordenados y solo pagados
    list.innerHTML = pagos.map(pago => {
        return `
            <div class="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-800 text-lg">${pago.usuario.nombre}</h3>
                        <p class="text-sm text-gray-600">Semana #${pago.semana_numero}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        ✓ PAGADO
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <p class="text-xs text-gray-500">Fecha Asignada</p>
                        <p class="font-semibold text-gray-800">${formatFecha(pago.fecha_asignada)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Monto</p>
                        <p class="font-semibold text-green-600">${formatMonto(pago.monto)}</p>
                    </div>
                </div>
                
                <div class="mb-3">
                    <p class="text-xs text-gray-500">Pagado el</p>
                    <p class="text-sm font-medium text-gray-700">${formatFechaHora(pago.fecha_pagada)}</p>
                </div>
                
                ${pago.notas ? `
                    <div class="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        💬 ${pago.notas}
                    </div>
                ` : ''}
                
                ${isAdmin ? `
                    <div class="flex space-x-2 pt-3 border-t">
                        <button onclick="desmarcarPago('${pago.id}')" 
                            class="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition">
                            ↺ Volver a Pendiente
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function loadEstadisticas() {
    try {
        const { data, error } = await supabaseClient.rpc('obtener_resumen_pagos');
        
        if (error) throw error;
        
        if (data) {
            const totalPagados = data.reduce((sum, item) => sum + parseInt(item.pagos_completados), 0);
            const totalPendientes = data.reduce((sum, item) => sum + parseInt(item.pagos_pendientes), 0);
            
            document.getElementById('total-pagados').textContent = totalPagados;
            document.getElementById('total-pendientes').textContent = totalPendientes;
        }
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
    }
}

// =====================================================
// ACCIONES DE ADMIN
// =====================================================

async function generarSiguientePago() {
    const confirmado = await showCustomConfirm({
        title: 'Generar Siguiente Pago',
        message: '¿Deseas generar el pago para la siguiente persona en la rotación? Esta acción creará un nuevo pago pendiente.',
        confirmText: 'Sí, generar',
        cancelText: 'Cancelar',
        type: 'info'
    });
    
    if (!confirmado) return;
    
    try {
        showToast('Generando pago...', 'info');
        
        const { data, error } = await supabaseClient.rpc('generar_siguiente_pago');
        
        if (error) throw error;
        
        showToast('✓ Pago generado exitosamente', 'success');
        await loadDashboard();
        
    } catch (error) {
        console.error('❌ Error generando pago:', error);
        showToast('Error al generar pago: ' + error.message, 'error');
    }
}

async function marcarComoPagado(pagoId) {
    const confirmado = await showCustomConfirm({
        title: 'Confirmar Pago',
        message: '¿Marcar este pago como completado? Esta acción actualizará el estado del pago.',
        confirmText: 'Marcar como pagado',
        cancelText: 'Cancelar',
        type: 'success'
    });
    
    if (!confirmado) return;
    
    try {
        showToast('Marcando como pagado...', 'info');
        
        const { data, error } = await supabaseClient.rpc('marcar_pago_completado', {
            pago_id: pagoId
        });
        
        if (error) throw error;
        
        showToast('✓ Pago marcado como completado', 'success');
        await loadDashboard();
        
    } catch (error) {
        console.error('❌ Error marcando pago:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

async function desmarcarPago(pagoId) {
    const confirmado = await showCustomConfirm({
        title: 'Revertir Pago',
        message: '¿Volver este pago a estado pendiente? Esta acción revertirá el pago completado.',
        confirmText: 'Sí, revertir',
        cancelText: 'Cancelar',
        type: 'warning'
    });
    
    if (!confirmado) return;
    
    try {
        showToast('Revirtiendo pago...', 'info');
        
        const { data, error } = await supabaseClient.rpc('desmarcar_pago', {
            pago_id: pagoId
        });
        
        if (error) throw error;
        
        showToast('✓ Pago marcado como pendiente', 'success');
        await loadDashboard();
        
    } catch (error) {
        console.error('❌ Error desmarcando pago:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

// =====================================================
// UTILIDADES
// =====================================================

function formatFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-EC', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatFechaHora(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-EC', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatMonto(monto) {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
    }).format(monto);
}

function showElement(id) {
    const element = document.getElementById(id);
    if (element) element.classList.remove('hidden');
}

function hideElement(id) {
    const element = document.getElementById(id);
    if (element) element.classList.add('hidden');
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    // Color según tipo
    if (type === 'success') {
        toast.className = 'fixed bottom-20 left-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
    } else if (type === 'error') {
        toast.className = 'fixed bottom-20 left-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
    } else {
        toast.className = 'fixed bottom-20 left-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50';
    }
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// =====================================================
// FUNCIONES ANTIGUAS - COMENTADAS (Ya no se usan)
// =====================================================

// Función antigua de modal - reemplazada por showCustomConfirm
/*
function showModal(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
        
        const handleConfirm = () => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', handleConfirm);
            resolve(true);
        };
        
        const handleCancel = () => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', handleConfirm);
            resolve(false);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        document.getElementById('modal-cancel').addEventListener('click', handleCancel);
    });
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}
*/

// =====================================================
// UI HELPERS
// =====================================================

function showLoginScreen() {
    hideElement('loading-screen');
    showElement('login-screen');
}

// =====================================================
// FUNCIONES GLOBALES (accesibles desde HTML)
// =====================================================

window.marcarComoPagado = marcarComoPagado;
window.desmarcarPago = desmarcarPago;
