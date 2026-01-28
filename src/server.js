/**
 * Punto de entrada principal de la aplicación
 * Archivo: server.js
 * Descripción: Inicia la aplicación del bot de propinas para Telegram
 * 
 * Este archivo es responsable de:
 * 1. Importar la instancia de la aplicación configurada
 * 2. Iniciar el servidor y todos los servicios asociados
 * 3. Manejar errores críticos durante el inicio
 */

// Importar la instancia única de la aplicación
// La aplicación ya está configurada con Express, middleware, rutas y servicios
const app = require('./app');

/**
 * Iniciar la aplicación
 * Este método asíncrono:
 * - Conecta a la base de datos MongoDB
 * - Inicia el servidor HTTP en el puerto configurado
 * - Configura los servicios de recordatorios automáticos
 * - Establece los manejadores para cierre graceful
 */
app.start().catch(error => {
  // Manejar errores críticos durante el inicio de la aplicación
  // Estos errores impiden que el servidor funcione correctamente
  console.error('❌ Error crítico iniciando el servidor:', error);
  // Salir del proceso con código de error (1) para indicar fallo
  process.exit(1);
});
