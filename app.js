// DINERO DE LA SEMANA - Aplicación Principal

let currentUser = null;
let isAdmin = false;
let currentUserIds = []; // Array de IDs de usuarios vinculados
let allPagos = [];

// MODAL DE CONFIRMACIÓN PERSONALIZADO

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

// INICIALIZACIÓN

document.addEventListener('DOMContentLoaded', async () => {
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

// UTILIDADES UI

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.className = 'fas fa-eye-slash text-lg';
    } else {
        passwordInput.type = 'password';
        passwordIcon.className = 'fas fa-eye text-lg';
    }
}

// AUTENTICACIÓN

function setupEventListeners() {
    // Login
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    
    // Toggle password visibility
    document.getElementById('toggle-password')?.addEventListener('click', togglePasswordVisibility);
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    
    // Generar siguiente pago
    document.getElementById('btn-generar-siguiente')?.addEventListener('click', generarSiguientePago);
    
    // Generar PDF
    document.getElementById('btn-generar-pdf')?.addEventListener('click', mostrarModalPDF);
    
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
    
    // Buscar TODOS los usuarios vinculados a este email
    // Estrategia: buscar por email O email_propietario en una sola consulta
    let { data: usuariosVinculados, error: errorUsuarios } = await supabaseClient
        .from('dinerosemana_usuarios')
        .select('id, nombre, rol, email, email_propietario, usuario_ferreteria_id')
        .or(`email.eq.${currentUser.email},email_propietario.eq.${currentUser.email}`);
    
    // Si no encontró nada, buscar por vinculación con usuarios_ferreteria
    if ((!usuariosVinculados || usuariosVinculados.length === 0) && currentUser.id) {
        const result = await supabaseClient
            .from('dinerosemana_usuarios')
            .select('id, nombre, rol, email, email_propietario, usuario_ferreteria_id')
            .eq('usuario_ferreteria_id', currentUser.id);
        usuariosVinculados = result.data;
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

// UI SETUP

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

// CARGAR DASHBOARD

async function loadDashboard() {
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
                    mensajeTiempo = `<i class="fas fa-exclamation-triangle text-red-500"></i> Atrasado ${Math.abs(diasDiferencia)} ${Math.abs(diasDiferencia) === 1 ? 'día' : 'días'}`;
                    colorBorder = 'border-red-400';
                } else if (diasDiferencia === 0) {
                    mensajeTiempo = '<i class="fas fa-bell text-yellow-500"></i> ¡Hoy!';
                    colorBorder = 'border-yellow-400';
                } else if (diasDiferencia === 1) {
                    mensajeTiempo = '<i class="fas fa-clock text-blue-500"></i> Mañana';
                } else {
                    mensajeTiempo = `<i class="fas fa-calendar-alt text-blue-500"></i> En ${diasDiferencia} días`;
                }
                
                return `
                    <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 border-l-4 ${colorBorder}">
                        <div class="flex items-center justify-between mb-3">
                            <div>
                                <p class="font-bold text-white">${pago.usuario.nombre}</p>
                                <p class="text-xs text-white/80">${formatFecha(pago.fecha_asignada)}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-white">${formatMonto(pago.monto)}</p>
                                <p class="text-xs text-white/90">${mensajeTiempo}</p>
                            </div>
                        </div>
                        ${isAdmin ? `
                        <div class="flex gap-2">
                            <button onclick="handlePagoClick('${pago.id}', '${pago.usuario.nombre}')" 
                                class="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-300/50 text-white text-xs py-2 px-3 rounded-lg transition-all">
                                ✓ Marcar Pagado
                            </button>
                            <button onclick="handleNotificarPago('${pago.id}', '${pago.usuario.nombre}', '${formatFecha(pago.fecha_asignada)}', '${formatMonto(pago.monto)}')" 
                                class="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-300/50 text-white text-xs py-2 px-3 rounded-lg transition-all">
                                <i class="fas fa-mobile-alt mr-1"></i> Notificar
                            </button>
                        </div>
                        ` : ''}
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
                    <p class="text-2xl font-bold"><i class="fas fa-check-circle text-green-500 mr-2"></i>¡Todo al día!</p>
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
async function handlePagoClick(pagoId, usuarioNombre) {
    if (!isAdmin) return;
    
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
        showToast('Marcando como pagado...', 'info');
        
        const { data, error } = await supabaseClient
            .rpc('marcar_pago_completado', { pago_id: pagoId });
        
        if (error) throw error;
        
        // Mostrar mensaje de éxito
        showToast(`Pago de ${usuarioNombre} marcado como PAGADO`, 'success');
        
        // Enviar mensaje de agradecimiento automático
        await enviarMensajeAgradecimiento(pagoId, usuarioNombre);
        
        // Recargar datos
        await loadProximoPago();
        await loadPagos();
        if (isAdmin) {
            await loadEstadisticas();
        }
        
    } catch (error) {
        console.error('❌ Error marcando pago:', error);
        showToast('Error al marcar el pago. Intenta de nuevo.', 'error');
    }
}

// Función para enviar mensaje de agradecimiento automático
async function enviarMensajeAgradecimiento(pagoId, usuarioNombre) {
    try {
        // Obtener configuración de WhatsApp
        const { data: config, error: errorConfig } = await supabaseClient
            .from('dinerosemana_config')
            .select('apikey, instance')
            .eq('id', 1)
            .single();
            
        if (errorConfig || !config?.apikey || !config?.instance) {
            // Si no hay configuración, no enviar mensaje pero no mostrar error
            return;
        }
        
        // Obtener datos completos del pago y usuario
        const { data: pago, error: errorPago } = await supabaseClient
            .from('dinerosemana_pagos')
            .select(`
                *,
                usuario:dinerosemana_usuarios(nombre, telefono, email)
            `)
            .eq('id', pagoId)
            .single();
            
        if (errorPago || !pago?.usuario?.telefono) {
            // Si no tiene teléfono, no enviar mensaje
            return;
        }
        
        // Crear mensaje profesional de agradecimiento
        const fechaPago = new Date().toLocaleDateString('es-EC', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const mensajeAgradecimiento = `🎉 *¡Pago Confirmado!* 🎉

Hola *${pago.usuario.nombre}*,

✅ Hemos registrado exitosamente tu aporte semanal de *${formatMonto(pago.monto)}*.

📅 *Fecha de registro:* ${fechaPago}
💰 *Monto:* ${formatMonto(pago.monto)}
📋 *Estado:* PAGADO ✓

¡Muchas gracias por tu puntualidad y compromiso con nuestro sistema de aportes familiares! 🏆

Tu contribución es muy valiosa para mantener este hermoso proyecto en funcionamiento.

_Sistema Dinero de la Semana_ 💙
_Mensaje automático de confirmación_`;
        
        // Enviar mensaje de agradecimiento
        const whatsappUrl = `https://api.manasakilla.com/message/sendText/${config.instance}`;
        const whatsappOptions = {
            method: 'POST',
            headers: {
                'apikey': config.apikey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number: pago.usuario.telefono,
                text: mensajeAgradecimiento,
                delay: 0,
                linkPreview: false,
                mentionsEveryOne: false
            })
        };
        
        const response = await fetch(whatsappUrl, whatsappOptions);
        const result = await response.json();
        
        // Manejar errores HTTP
        if (!response.ok) {
            console.error('Error enviando agradecimiento:', response.status, result);
            return;
        }
        
        // Si hay error explícito en la respuesta
        if (result.error === true || (result.status && result.status === 'error')) {
            console.error('Error en respuesta WhatsApp agradecimiento:', result.message);
            return;
        }
        
        // Mostrar confirmación discreta (sin interrumpir el flujo principal)
        setTimeout(() => {
            showToast(`Mensaje de agradecimiento enviado a ${usuarioNombre}`, 'success');
        }, 2000);
        
    } catch (error) {
        // Error silencioso - no interrumpir el flujo principal
        console.error('Error enviando agradecimiento automático:', error);
    }
}

// Función para notificar pago por WhatsApp (solo admin)
async function handleNotificarPago(pagoId, usuarioNombre, fechaAsignada, monto) {
    if (!isAdmin) return;
    
    // Confirmación personalizada
    const confirmar = await showCustomConfirm({
        title: 'Enviar notificación',
        message: `¿Enviar notificación por WhatsApp a ${usuarioNombre} sobre el pago asignado?`,
        confirmText: 'Sí, enviar notificación',
        cancelText: 'Cancelar',
        type: 'info'
    });
    
    if (!confirmar) return;
    
    try {
        showToast('Enviando notificación...', 'info');
        
        // Obtener datos del pago y usuario
        const { data: pago, error: errorPago } = await supabaseClient
            .from('dinerosemana_pagos')
            .select(`
                *,
                usuario:dinerosemana_usuarios(id, nombre, telefono)
            `)
            .eq('id', pagoId)
            .single();
            
        if (errorPago || !pago?.usuario) {
            throw new Error('No se encontró el pago o usuario asociado');
        }
        
        const usuario = pago.usuario;
        
        if (!usuario?.telefono) {
            throw new Error('El usuario no tiene número de teléfono registrado');
        }
        
        if (!usuario?.telefono) {
            throw new Error('El usuario no tiene número de teléfono registrado');
        }
        
        // Obtener configuración de WhatsApp
        const { data: config, error: errorConfig } = await supabaseClient
            .from('dinerosemana_config')
            .select('apikey, instance')
            .eq('id', 1)
            .single();
            
        if (errorConfig) {
            throw new Error('Error al obtener configuración de WhatsApp: ' + errorConfig.message);
        }
        
        if (!config?.apikey || !config?.instance) {
            throw new Error('Configuración de WhatsApp incompleta. Por favor configura la API Key e Instancia en la base de datos.');
        }
        
        // Preparar el mensaje
        const mensaje = `🏦 *DINERO DE LA SEMANA* 🏦

Hola *${usuarioNombre}*,

Te comunicamos que se te ha asignado dar el dinero de la semana correspondiente a:

📅 *Fecha asignada:* ${fechaAsignada}
💰 *Monto:* ${monto}

Por favor, recuerda realizar tu aporte en la fecha indicada.

¡Gracias por tu participación! 😊

_Mensaje automático del sistema_`;
        
        // Enviar mensaje por WhatsApp
        const whatsappUrl = `https://api.manasakilla.com/message/sendText/${config.instance}`;
        const whatsappOptions = {
            method: 'POST',
            headers: {
                'apikey': config.apikey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number: usuario.telefono,
                text: mensaje,
                delay: 0,
                linkPreview: false,
                mentionsEveryOne: false
            })
        };
        

        
        const response = await fetch(whatsappUrl, whatsappOptions);
        const result = await response.json();
        
        // Manejar errores HTTP
        if (!response.ok) {
            let errorMsg = `Error ${response.status}`;
            
            if (response.status === 400) {
                errorMsg = 'Solicitud inválida. Verifica la configuración de API Key e Instancia.';
            } else if (response.status === 401) {
                errorMsg = 'API Key inválida o sin permisos.';
            } else if (response.status === 404) {
                errorMsg = 'Instancia no encontrada. Verifica el nombre de la instancia.';
            } else if (result.message) {
                errorMsg = result.message;
            }
            throw new Error(`Error del servicio WhatsApp (${response.status}): ${errorMsg}`);
        }
        
        // Si llegamos aquí con status 200, es éxito
        // Solo verificar si hay error explícito en la respuesta
        if (result.error === true || (result.status && result.status === 'error')) {
            throw new Error(`Error en WhatsApp: ${result.message || 'Error en el servicio'}`);
        }
        
        // Mostrar mensaje de éxito
        showToast(`✅ Notificación enviada a ${usuarioNombre}`, 'success');
        
    } catch (error) {
        console.error('❌ Error enviando notificación:', error);
        showToast(`❌ Error al enviar notificación: ${error.message}`, 'error');
    }
}

// Función para probar configuración de WhatsApp
async function testWhatsAppConfig() {
    if (!isAdmin) return;
    
    const confirmar = await showCustomConfirm({
        title: 'Probar WhatsApp',
        message: '¿Enviar un mensaje de prueba para verificar la configuración de WhatsApp? Se enviará a tu propio número.',
        confirmText: 'Sí, probar',
        cancelText: 'Cancelar',
        type: 'info'
    });
    
    if (!confirmar) return;
    
    try {
        showToast('Probando configuración de WhatsApp...', 'info');
        
        // Obtener configuración de WhatsApp
        const { data: config, error: errorConfig } = await supabaseClient
            .from('dinerosemana_config')
            .select('apikey, instance')
            .eq('id', 1)
            .single();
            
        if (errorConfig) {
            throw new Error('Error al obtener configuración: ' + errorConfig.message);
        }
        
        if (!config?.apikey || !config?.instance) {
            throw new Error('Configuración de WhatsApp incompleta. Por favor configura la API Key e Instancia en la base de datos.');
        }
        
        // Obtener datos del usuario admin actual
        const { data: usuario, error: errorUsuario } = await supabaseClient
            .from('dinerosemana_usuarios')
            .select('telefono, nombre')
            .eq('email', currentUser.email)
            .single();
            
        if (errorUsuario || !usuario?.telefono) {
            throw new Error('⚠️ No tienes número de teléfono configurado.\n\nPara agregar tu número:\n\n1. Ejecuta:\n   UPDATE dinerosemana_usuarios SET \n   telefono = \'593XXXXXXXXX\' \n   WHERE email = \'' + currentUser.email + '\';');
        }
        
        // Preparar mensaje de prueba
        const mensajePrueba = `🧪 *PRUEBA DE CONFIGURACIÓN* 🧪

Hola *${usuario.nombre}*,

Este es un mensaje de prueba del sistema *Dinero de la Semana*.

✅ Configuración de WhatsApp: *FUNCIONANDO*
📱 API Key: *Válida*
🔗 Instancia: *${config.instance}*

_Mensaje de prueba automático_`;
        
        // Enviar mensaje de prueba
        const whatsappUrl = `https://api.manasakilla.com/message/sendText/${config.instance}`;
        const whatsappOptions = {
            method: 'POST',
            headers: {
                'apikey': config.apikey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number: usuario.telefono,
                text: mensajePrueba,
                delay: 0,
                linkPreview: false,
                mentionsEveryOne: false
            })
        };
        
        const response = await fetch(whatsappUrl, whatsappOptions);
        const result = await response.json();
        
        // Manejar errores HTTP
        if (!response.ok) {
            let errorMsg = `Error ${response.status}`;
            
            if (response.status === 400) {
                errorMsg = 'Solicitud inválida. Verifica API Key e Instancia.';
            } else if (response.status === 401) {
                errorMsg = 'API Key inválida o sin permisos.';
            } else if (response.status === 404) {
                errorMsg = 'Instancia no encontrada.';
            } else if (result.message) {
                errorMsg = result.message;
            }
            throw new Error(`Error ${response.status}: ${errorMsg}`);
        }
        
        // Si llegamos aquí con status 200, es éxito
        // Solo verificar si hay error explícito en la respuesta
        if (result.error === true || (result.status && result.status === 'error')) {
            throw new Error(`Error: ${result.message || 'Error en el servicio'}`);
        }
        
        showToast(`✅ Prueba exitosa! Revisa tu WhatsApp (${usuario.telefono})`, 'success');
        
    } catch (error) {
        console.error('❌ Error en prueba WhatsApp:', error);
        
        // Mostrar error más detallado
        const errorLines = error.message.split('\n');
        if (errorLines.length > 1) {
            // Error con múltiples líneas (instrucciones)
            await showCustomConfirm({
                title: 'Error de Configuración',
                message: error.message,
                confirmText: 'Entendido',
                cancelText: '',
                type: 'warning'
            });
        } else {
            // Error simple
            showToast(`❌ Error: ${error.message}`, 'error');
        }
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
        let query = supabaseClient
            .from('dinerosemana_pagos')
            .select(`
                *,
                usuario:dinerosemana_usuarios(nombre, orden)
            `)
            .order('fecha_asignada', { ascending: false });
        
        // Si no es admin, filtrar solo pagos de los usuarios vinculados
        if (!isAdmin && currentUserIds.length > 0) {
            query = query.in('usuario_id', currentUserIds);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
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

// ACCIONES DE ADMIN

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

// UTILIDADES

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

// FUNCIONES ANTIGUAS - COMENTADAS (Ya no se usan)

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

// UI HELPERS

function showLoginScreen() {
    hideElement('loading-screen');
    showElement('login-screen');
}

// ============================
// FUNCIONES PARA GENERAR PDF
// ============================

// Mostrar modal de filtros PDF
function mostrarModalPDF() {
    if (!isAdmin) return;
    
    // Configurar año actual
    const añoActual = new Date().getFullYear();
    document.getElementById('pdf-period-label').textContent = `Período (${añoActual}):`;
    document.getElementById('pdf-year-text').textContent = `Todo el año ${añoActual}`;
    
    cargarUsuariosParaPDF();
    configurarEventListenersPDF();
    showElement('pdf-filters-modal');
}

// Cargar usuarios en botones con selección múltiple (excluir admin)
async function cargarUsuariosParaPDF() {
    try {
        const { data: usuarios, error } = await supabaseClient
            .from('dinerosemana_usuarios')
            .select('id, nombre, orden, rol')
            .neq('rol', 'admin')  // Excluir administradores
            .order('orden');
        
        const container = document.getElementById('pdf-user-buttons');
        container.innerHTML = '';
        
        if (usuarios && usuarios.length > 0) {
            usuarios.forEach(usuario => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'pdf-user-btn p-3 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600 transition-colors';
                button.dataset.userId = usuario.id;
                button.dataset.selected = 'false';
                button.innerHTML = `<i class="fas fa-user mr-2"></i>${usuario.nombre}`;
                
                button.addEventListener('click', function() {
                    // Toggle selección múltiple
                    if (this.dataset.selected === 'false') {
                        // Seleccionar
                        this.dataset.selected = 'true';
                        this.classList.remove('border-gray-300', 'text-gray-700');
                        this.classList.add('border-red-500', 'bg-red-50', 'text-red-700');
                        this.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${usuario.nombre}`;
                    } else {
                        // Deseleccionar
                        this.dataset.selected = 'false';
                        this.classList.remove('border-red-500', 'bg-red-50', 'text-red-700');
                        this.classList.add('border-gray-300', 'text-gray-700');
                        this.innerHTML = `<i class="fas fa-user mr-2"></i>${usuario.nombre}`;
                    }
                });
                
                container.appendChild(button);
            });
            
            // Configurar botones de Todos/Ninguno
            configurarBotonesSeleccion();
        } else {
            container.innerHTML = '<p class="text-gray-500 text-center col-span-2">No hay usuarios disponibles</p>';
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        document.getElementById('pdf-user-buttons').innerHTML = '<p class="text-red-500 text-center col-span-2">Error cargando usuarios</p>';
    }
}

// Configurar botones de selección múltiple
function configurarBotonesSeleccion() {
    document.getElementById('pdf-select-all').addEventListener('click', function() {
        document.querySelectorAll('.pdf-user-btn').forEach(btn => {
            if (btn.dataset.selected === 'false') {
                btn.click(); // Trigger click para seleccionar
            }
        });
    });
    
    document.getElementById('pdf-clear-all').addEventListener('click', function() {
        document.querySelectorAll('.pdf-user-btn').forEach(btn => {
            if (btn.dataset.selected === 'true') {
                btn.click(); // Trigger click para deseleccionar
            }
        });
    });
}

// Configurar event listeners del modal PDF
function configurarEventListenersPDF() {
    // Radio buttons para tipo de filtro
    document.querySelectorAll('input[name="pdf-filter-type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const userSelector = document.getElementById('pdf-user-selector');
            if (this.value === 'usuario') {
                showElement('pdf-user-selector');
            } else {
                hideElement('pdf-user-selector');
            }
        });
    });
    
    // Radio buttons para período
    document.querySelectorAll('input[name="pdf-period-type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const monthsSelector = document.getElementById('pdf-months-selector');
            if (this.value === 'meses-especificos') {
                showElement('pdf-months-selector');
            } else {
                hideElement('pdf-months-selector');
            }
        });
    });
    
    // Botón cerrar
    document.getElementById('pdf-close-btn').addEventListener('click', cerrarModalPDF);
    document.getElementById('pdf-cancel-btn').addEventListener('click', cerrarModalPDF);
    
    // Botón generar
    document.getElementById('pdf-generate-btn').addEventListener('click', generarPDF);
    
    // Click fuera del modal
    document.getElementById('pdf-filters-modal').onclick = function(e) {
        if (e.target === this) {
            cerrarModalPDF();
        }
    };
}

// Cerrar modal PDF
function cerrarModalPDF() {
    hideElement('pdf-filters-modal');
    
    // Resetear formulario
    document.querySelector('input[name="pdf-filter-type"][value="todos"]').checked = true;
    document.querySelector('input[name="pdf-period-type"][value="todo-año"]').checked = true;
    
    // Resetear botones de usuario
    document.querySelectorAll('.pdf-user-btn').forEach(btn => {
        if (btn.dataset.selected === 'true') {
            btn.click(); // Deseleccionar todos
        }
    });
    
    document.querySelectorAll('.pdf-month-check').forEach(check => check.checked = false);
    hideElement('pdf-user-selector');
    hideElement('pdf-months-selector');
}

// Generar PDF con filtros aplicados
async function generarPDF() {
    try {
        showToast('Generando reporte PDF...', 'info');
        
        // Obtener filtros
        const tipoFiltro = document.querySelector('input[name="pdf-filter-type"]:checked').value;
        const tipoPeriodo = document.querySelector('input[name="pdf-period-type"]:checked').value;
        
        // Obtener usuarios seleccionados de los botones
        const usuariosSeleccionados = Array.from(document.querySelectorAll('.pdf-user-btn[data-selected="true"]'))
            .map(btn => btn.dataset.userId);
        
        let mesesSeleccionados = [];
        if (tipoPeriodo === 'meses-especificos') {
            mesesSeleccionados = Array.from(document.querySelectorAll('.pdf-month-check:checked'))
                .map(check => parseInt(check.value));
            
            if (mesesSeleccionados.length === 0) {
                showToast('Selecciona al menos un mes', 'error');
                return;
            }
        }
        
        if (tipoFiltro === 'usuario' && usuariosSeleccionados.length === 0) {
            showToast('Selecciona al menos un usuario', 'error');
            return;
        }
        
        // Obtener datos según filtros
        let query = supabaseClient
            .from('dinerosemana_pagos')
            .select(`
                *,
                usuario:dinerosemana_usuarios(nombre, orden)
            `)
            .order('fecha_asignada', { ascending: false });
        
        // Aplicar filtro de usuarios
        if (tipoFiltro === 'usuario') {
            query = query.in('usuario_id', usuariosSeleccionados);
        }
        
        // Aplicar filtro de año actual
        const añoActual = new Date().getFullYear();
        query = query.gte('fecha_asignada', `${añoActual}-01-01`).lte('fecha_asignada', `${añoActual}-12-31`);
        
        const { data: pagos, error } = await query;
        
        if (error) throw error;
        
        // Filtrar por meses si es necesario
        let pagosFiltrados = pagos;
        if (tipoPeriodo === 'meses-especificos') {
            pagosFiltrados = pagos.filter(pago => {
                const mes = new Date(pago.fecha_asignada).getMonth() + 1;
                return mesesSeleccionados.includes(mes);
            });
        }
        
        // Generar el PDF
        await crearPDF(pagosFiltrados, {
            tipoFiltro,
            tipoPeriodo,
            usuariosSeleccionados,
            mesesSeleccionados
        });
        
        cerrarModalPDF();
        showToast('✅ Reporte PDF generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        showToast('❌ Error al generar PDF', 'error');
    }
}

// Crear el PDF con los datos filtrados
async function crearPDF(pagos, filtros) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;
    
    // Header del documento
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE PAGOS', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema Dinero de la Semana', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;
    
    // Información del reporte
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-EC', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`, margin, currentY);
    currentY += 8;
    
    // Filtros aplicados
    const añoActual = new Date().getFullYear();
    let filtroTexto = '';
    if (filtros.tipoFiltro === 'todos') {
        filtroTexto = 'Todos los usuarios';
    } else {
        const usuariosBtns = document.querySelectorAll('.pdf-user-btn[data-selected="true"]');
        const nombresUsuarios = Array.from(usuariosBtns).map(btn => 
            btn.textContent.replace(/\s*(fas? fa-[\w-]+|\uf[\da-f]+)\s*/g, '').trim()
        );
        
        if (nombresUsuarios.length === 1) {
            filtroTexto = `Usuario: ${nombresUsuarios[0]}`;
        } else {
            filtroTexto = `Usuarios (${nombresUsuarios.length}): ${nombresUsuarios.join(', ')}`;
        }
    }
    
    if (filtros.tipoPeriodo === 'todo-año') {
        filtroTexto += ` | Período: Todo el año ${añoActual}`;
    } else {
        const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const mesesTexto = filtros.mesesSeleccionados.map(m => mesesNombres[m-1]).join(', ');
        filtroTexto += ` | Meses: ${mesesTexto}`;
    }
    
    doc.text(`Filtros: ${filtroTexto}`, margin, currentY);
    currentY += 8;
    
    doc.text(`Total de registros: ${pagos.length}`, margin, currentY);
    currentY += 15;
    
    // Headers de la tabla
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    // Determinar si mostrar columna Usuario
    const mostrarUsuario = filtros.tipoFiltro === 'todos' || 
                          (filtros.tipoFiltro === 'usuario' && filtros.usuariosSeleccionados.length > 1);
    
    const colWidths = mostrarUsuario ? [35, 25, 25, 35, 40] : [40, 35, 35, 50];
    const headers = mostrarUsuario 
        ? ['Usuario', 'Fecha', 'Monto', 'Estado', 'Fecha Pago']
        : ['Fecha Asignada', 'Monto', 'Estado', 'Fecha Pagado'];
    
    let currentX = margin;
    headers.forEach((header, i) => {
        doc.text(header, currentX, currentY);
        currentX += colWidths[i];
    });
    
    currentY += 5;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;
    
    // Datos de la tabla con colores alternos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    const rowHeight = 8;
    
    pagos.forEach((pago, index) => {
        // Verificar si necesitamos nueva página
        if (currentY > 270) {
            doc.addPage();
            currentY = margin;
            
            // Re-dibujar headers en la nueva página
            doc.setFont('helvetica', 'bold');
            currentX = margin;
            headers.forEach((header, i) => {
                doc.text(header, currentX, currentY);
                currentX += colWidths[i];
            });
            currentY += 5;
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 8;
            doc.setFont('helvetica', 'normal');
        }
        
        // Color de fondo alterno
        if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252); // bg-slate-50
            doc.rect(margin - 2, currentY - 5, pageWidth - 2 * margin + 4, rowHeight, 'F');
        }
        
        currentX = margin;
        
        const fechaAsignada = new Date(pago.fecha_asignada).toLocaleDateString('es-EC');
        const monto = formatMonto(pago.monto);
        const fechaPago = pago.fecha_pagada ? new Date(pago.fecha_pagada).toLocaleDateString('es-EC') : '-';
        
        // Color del texto según el estado
        const estado = pago.estado === 'PAGADO' ? 'PAGADO' : 'PENDIENTE';
        const colorEstado = pago.estado === 'PAGADO' ? [34, 197, 94] : [239, 68, 68];
        
        doc.setTextColor(0, 0, 0); // Negro por defecto
        
        if (mostrarUsuario) {
            // Con columna Usuario (todos o múltiples usuarios)
            const usuario = pago.usuario?.nombre || 'N/A';
            doc.text(usuario.substring(0, 20), currentX, currentY);
            currentX += colWidths[0];
            doc.text(fechaAsignada, currentX, currentY);
            currentX += colWidths[1];
            doc.text(monto, currentX, currentY);
            currentX += colWidths[2];
            doc.setTextColor(...colorEstado);
            doc.text(estado, currentX, currentY);
            currentX += colWidths[3];
            doc.setTextColor(0, 0, 0);
            doc.text(fechaPago, currentX, currentY);
        } else {
            // Sin columna Usuario (un solo usuario)
            doc.text(fechaAsignada, currentX, currentY);
            currentX += colWidths[0];
            doc.text(monto, currentX, currentY);
            currentX += colWidths[1];
            doc.setTextColor(...colorEstado);
            doc.text(estado, currentX, currentY);
            currentX += colWidths[2];
            doc.setTextColor(0, 0, 0);
            doc.text(fechaPago, currentX, currentY);
        }
        
        // Restablecer color de texto
        doc.setTextColor(0, 0, 0);
        currentY += rowHeight;
    });
    
    // Estadísticas al final
    currentY += 10;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ESTADÍSTICAS:', margin, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const totalPagos = pagos.length;
    const pagosPagados = pagos.filter(p => p.estado === 'PAGADO').length;
    const pagosPendientes = totalPagos - pagosPagados;
    const montoTotal = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);
    const montoPagado = pagos.filter(p => p.estado === 'PAGADO').reduce((sum, p) => sum + parseFloat(p.monto), 0);
    
    doc.text(`Total de pagos: ${totalPagos}`, margin, currentY);
    currentY += 6;
    doc.text(`Pagos completados: ${pagosPagados}`, margin, currentY);
    currentY += 6;
    doc.text(`Pagos pendientes: ${pagosPendientes}`, margin, currentY);
    currentY += 6;
    doc.text(`Monto total: ${formatMonto(montoTotal)}`, margin, currentY);
    currentY += 6;
    doc.text(`Monto pagado: ${formatMonto(montoPagado)}`, margin, currentY);
    currentY += 6;
    doc.text(`Monto pendiente: ${formatMonto(montoTotal - montoPagado)}`, margin, currentY);
    
    // Guardar PDF
    const fechaActual = new Date().toISOString().split('T')[0];
    let nombreArchivo = `reporte-pagos-${fechaActual}`;
    
    if (filtros.tipoFiltro === 'usuario') {
        const usuariosBtns = document.querySelectorAll('.pdf-user-btn[data-selected="true"]');
        const nombresUsuarios = Array.from(usuariosBtns).map(btn => 
            btn.textContent.replace(/\s*(fas? fa-[\w-]+|\uf[\da-f]+)\s*/g, '').trim()
        );
        
        if (nombresUsuarios.length === 1) {
            nombreArchivo = `reporte-${nombresUsuarios[0].replace(/\s+/g, '-')}-${fechaActual}`;
        } else {
            nombreArchivo = `reporte-${nombresUsuarios.length}-usuarios-${fechaActual}`;
        }
    }
    
    doc.save(`${nombreArchivo}.pdf`);
}

// FUNCIONES GLOBALES (accesibles desde HTML)

window.marcarComoPagado = marcarComoPagado;
window.desmarcarPago = desmarcarPago;
window.handlePagoClick = handlePagoClick;
window.handleNotificarPago = handleNotificarPago;
window.testWhatsAppConfig = testWhatsAppConfig;
