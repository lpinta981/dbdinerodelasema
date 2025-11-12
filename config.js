// =====================================================
// DINERO DE LA SEMANA - Configuración de Supabase
// =====================================================

const SUPABASE_URL = 'https://lpsupabase.manasakilla.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.mKBTuXoyxw3lXRGl1VpSlGbSeiMnRardlIx1q5n-o0k';

// Variable global para el cliente
let supabaseClient = null;

// Función para inicializar Supabase
function initSupabase() {
    if (supabaseClient) {
        return supabaseClient; // Ya está inicializado
    }

    if (typeof window.supabase !== 'undefined') {
        const { createClient } = window.supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabaseClient;
    } else {
        console.error('❌ Error: Librería de Supabase no disponible');
        return null;
    }
}

// Función para obtener el cliente (con getter)
function getSupabaseClient() {
    if (!supabaseClient) {
        initSupabase();
    }
    return supabaseClient;
}

// Intentar inicializar inmediatamente
initSupabase();

// =====================================================
// FUNCIONES ESPECÍFICAS - DINERO DE LA SEMANA
// =====================================================

/**
 * Obtener todos los pagos con información del usuario
 */
async function obtenerPagos(filtros = {}) {
    const client = getSupabaseClient();
    let query = client
        .from('dinerosemana_pagos')
        .select(`
            *,
            usuario:dinerosemana_usuarios(*)
        `);
    
    // Aplicar filtros
    if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
    }
    if (filtros.usuario_id) {
        query = query.eq('usuario_id', filtros.usuario_id);
    }
    if (filtros.limite) {
        query = query.limit(filtros.limite);
    }
    
    query = query.order('fecha_asignada', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
        console.error('❌ Error obteniendo pagos:', error);
        throw error;
    }
    
    return data;
}

/**
 * Obtener el próximo pago (más reciente)
 */
async function obtenerProximoPago() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('dinerosemana_pagos')
        .select(`
            *,
            usuario:dinerosemana_usuarios(*)
        `)
        .order('fecha_asignada', { ascending: false })
        .limit(1)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error obteniendo próximo pago:', error);
        throw error;
    }
    
    return data;
}

/**
 * Generar el siguiente pago en la rotación (solo admin)
 */
async function generarSiguientePago() {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc('generar_siguiente_pago');
    
    if (error) {
        console.error('❌ Error generando pago:', error);
        throw error;
    }
    
    return data;
}

/**
 * Marcar un pago como completado (solo admin)
 */
async function marcarPagoCompletado(pagoId) {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc('marcar_pago_completado', {
        pago_id: pagoId
    });
    
    if (error) {
        console.error('❌ Error marcando pago:', error);
        throw error;
    }
    
    return data;
}

/**
 * Desmarcar un pago (volver a pendiente) (solo admin)
 */
async function desmarcarPago(pagoId) {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc('desmarcar_pago', {
        pago_id: pagoId
    });
    
    if (error) {
        console.error('❌ Error desmarcando pago:', error);
        throw error;
    }
    
    return data;
}

/**
 * Obtener resumen de pagos por usuario
 */
async function obtenerResumenPagos() {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc('obtener_resumen_pagos');
    
    if (error) {
        console.error('❌ Error obteniendo resumen:', error);
        throw error;
    }
    
    return data;
}

/**
 * Obtener todos los usuarios de dinero semanal
 */
async function obtenerUsuariosDinero() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('dinerosemana_usuarios')
        .select('*')
        .order('orden');
    
    if (error) {
        console.error('❌ Error obteniendo usuarios:', error);
        throw error;
    }
    
    return data;
}

/**
 * Verificar si el usuario actual es admin
 */
async function esUsuarioAdmin() {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    
    if (!user) return false;
    
    // Buscar primero por vinculación con usuarios_ferreteria
    let query = client
        .from('dinerosemana_usuarios')
        .select('rol')
        .eq('usuario_ferreteria_id', user.id)
        .single();
    
    let { data, error } = await query;
    
    // Si no está vinculado, buscar por email directo
    if (error || !data) {
        const result = await client
            .from('dinerosemana_usuarios')
            .select('rol')
            .eq('email', user.email)
            .single();
        data = result.data;
    }
    
    return data && data.rol === 'admin';
}
