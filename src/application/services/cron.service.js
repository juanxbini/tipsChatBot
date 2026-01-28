/**
 * Servicio de Tareas Programadas (Cron)
 * Archivo: application/services/cron.service.js
 * Descripción: Gestiona tareas programadas para recordatorios automáticos
 * 
 * Este servicio utiliza node-cron para ejecutar tareas en horarios específicos,
 * principalmente para enviar recordatorios diarios de registro de propinas
 */

// Importar node-cron para la programación de tareas
const cron = require('node-cron');
// Importar servicio de Telegram para enviar mensajes
const telegramService = require('./telegram.service');

/**
 * Clase CronService - Gestiona tareas programadas
 * Responsabilidades:
 * - Programar recordatorios diarios
 * - Iniciar, detener y reiniciar tareas programadas
 * - Proporcionar estado del servicio de cron
 * - Manejar errores en la ejecución de tareas
 */
class CronService {
  /**
   * Constructor de la clase CronService
   * Inicializa las propiedades para gestionar tareas programadas
   */
  constructor() {
    // Almacenar la tarea programada de recordatorio diario
    this.dailyReminderJob = null;
    // Hora del recordatorio desde variables de entorno o 22:00 por defecto
    this.cronHour = process.env.CRON_HOUR || '22';
  }

  /**
   * Inicia el servicio de tareas programadas
   * Programa el recordatorio diario y muestra estado inicial
   */
  start() {
    // Programar el recordatorio diario
    this.scheduleDailyReminder();
    console.log(`⏰ Cron service iniciado. Recordatorio diario a las ${this.cronHour}:00`);
  }

  /**
   * Programa el recordatorio diario de registro de propinas
   * Configura una tarea que se ejecuta todos los días a la hora especificada
   */
  scheduleDailyReminder() {
    // Expresión cron: minuto hora día-mes mes día-semana
    // Formato: "0 22 * * *" = todos los días a las 22:00
    const cronExpression = `0 ${this.cronHour} * * *`;
    
    // Crear la tarea programada
    this.dailyReminderJob = cron.schedule(cronExpression, async () => {
      try {
        // Mensaje de recordatorio para el usuario
        const reminderMessage = `💰 ¿Cuánta propina hiciste hoy?

Si no trabajaste, respondé "no trabajé".
También podés pedir "resumen".`;

        // Enviar el mensaje de recordatorio a través del servicio de Telegram
        await telegramService.sendMessage(reminderMessage);
        console.log('✅ Recordatorio diario enviado');
      } catch (error) {
        // Manejar errores en el envío del recordatorio
        console.error('❌ Error enviando recordatorio diario:', error);
      }
    }, {
      scheduled: false,                              // No iniciar automáticamente
      timezone: 'America/Argentina/Buenos_Aires'     // Zona horaria de Argentina
    });

    // Iniciar la tarea programada
    this.dailyReminderJob.start();
  }

  /**
   * Detiene todas las tareas programadas
   * Limpia los recursos y marca el servicio como detenido
   */
  stop() {
    if (this.dailyReminderJob) {
      // Detener la tarea programada
      this.dailyReminderJob.stop();
      // Limpiar la referencia
      this.dailyReminderJob = null;
      console.log('⏹️ Cron service detenido');
    }
  }

  /**
   * Reinicia el servicio de tareas programadas
   * Detiene todas las tareas actuales y las vuelve a programar
   */
  restart() {
    this.stop();  // Detener tareas actuales
    this.start(); // Iniciar nuevamente
  }

  /**
   * Obtiene el estado actual del servicio de cron
   * @returns {Object} Objeto con información del estado del servicio
   */
  getStatus() {
    return {
      running: this.dailyReminderJob ? this.dailyReminderJob.running : false,  // Estado de ejecución
      nextRun: this.dailyReminderJob ? this.dailyReminderJob.nextDates().toString() : null, // Próxima ejecución
      hour: this.cronHour  // Hora configurada para el recordatorio
    };
  }
}

// Exportar una instancia única de CronService (patrón Singleton)
// Esto asegura que toda la aplicación use el mismo servicio de cron
module.exports = new CronService();
