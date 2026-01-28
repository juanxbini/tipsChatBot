/**
 * Módulo de manejo de webhooks de Telegram
 * Archivo: infrastructure/telegramWebhook.js
 * Descripción: Procesa las actualizaciones recibidas desde Telegram y gestiona la configuración del webhook
 * 
 * Este módulo actúa como puente entre la API de Telegram y la lógica de negocio de la aplicación,
 * coordinando la interpretación de mensajes y el enrutamiento de intenciones
 */

// Importar servicios necesarios para el procesamiento de mensajes
const aiInterpreter = require('../application/services/aiInterpreter');     // Servicio de IA para interpretar mensajes
const intentRouter = require('../application/intents/intentRouter');        // Router para enrutar intenciones
const telegramService = require('../application/services/telegram.service'); // Servicio de comunicación con Telegram

/**
 * Clase TelegramWebhook - Gestiona las actualizaciones de Telegram
 * Responsabilidades:
 * - Procesar actualizaciones recibidas desde el webhook de Telegram
 * - Validar y extraer datos de los mensajes
 * - Coordinar la interpretación de mensajes con IA
 * - Enrutar intenciones a los casos de uso correspondientes
 * - Gestionar la configuración del webhook de Telegram
 */
class TelegramWebhook {
  /**
   * Procesa una actualización recibida desde el webhook de Telegram
   * Orquesta el flujo completo de procesamiento de mensajes
   * @param {Object} update - Objeto de actualización recibido desde Telegram
   * @returns {Promise<Object>} Resultado del procesamiento con estado y detalles
   */
  async handleUpdate(update) {
    try {
      // Validar que la actualización contenga un mensaje válido
      if (!telegramService.isValidMessage(update)) {
        console.log('⚠️ Mensaje inválido o sin texto');
        return { status: 'ignored', reason: 'invalid_message' };
      }

      // Extraer datos relevantes del mensaje (texto, chatId, etc.)
      const messageData = telegramService.extractMessageData(update);
      console.log(`📩 Mensaje recibido: "${messageData.text}" de chat ${messageData.chatId}`);

      // Interpretar el mensaje usando IA para determinar la intención del usuario
      const intent = await aiInterpreter.interpretMessage(messageData.text);
      console.log('🧠 Intención detectada:', intent);

      // Validar que la intención detectada sea soportada por el sistema
      if (!intentRouter.validateIntent(intent)) {
        const errorMessage = '❌ No pude entender tu mensaje. Intentá con "ayuda" para ver los comandos disponibles.';
        await telegramService.sendMessage(errorMessage, messageData.chatId);
        return { status: 'error', reason: 'invalid_intent', intent };
      }

      // Enrutar la intención al caso de uso correspondiente y obtener respuesta
      const response = await intentRouter.route(intent, messageData.chatId);
      // Enviar la respuesta generada al usuario
      await telegramService.sendMessage(response, messageData.chatId);

      console.log('✅ Respuesta enviada:', response.substring(0, 50) + '...');
      
      // Retornar resultado exitoso con información del procesamiento
      return { 
        status: 'success', 
        intent: intent.intent,
        chatId: messageData.chatId 
      };

    } catch (error) {
      // Manejar errores durante el procesamiento del mensaje
      console.error('❌ Error procesando webhook:', error);
      
      try {
        // Intentar enviar un mensaje de error al usuario
        const errorMessage = '❌ Ocurrió un error inesperado. Intentalo de nuevo más tarde.';
        const chatId = update?.message?.chat?.id;
        if (chatId) {
          await telegramService.sendMessage(errorMessage, chatId);
        }
      } catch (sendError) {
        // Si incluso el envío del mensaje de error falla, registrar el error secundario
        console.error('❌ Error enviando mensaje de error:', sendError);
      }

      // Retornar resultado de error con información del problema
      return { 
        status: 'error', 
        error: error.message 
      };
    }
  }

  /**
   * Configura el webhook para recibir actualizaciones de Telegram
   * Establece la URL donde Telegram enviará las actualizaciones del bot
   * @param {string} webhookUrl - URL pública donde se recibirán los webhooks
   * @returns {Promise<Object>} Resultado de la configuración del webhook
   * @throws {Error} Si no se puede configurar el webhook
   */
  async setupWebhook(webhookUrl) {
    try {
      // Llamar al servicio de Telegram para configurar el webhook
      const result = await telegramService.setWebhook(webhookUrl);
      console.log('🪝 Webhook configurado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error configurando webhook:', error);
      throw error; // Propagar error para manejo en capas superiores
    }
  }

  /**
   * Elimina la configuración del webhook de Telegram
   * Desconecta el bot del webhook actual y vuelve al modo de polling
   * @returns {Promise<Object>} Resultado de la eliminación del webhook
   * @throws {Error} Si no se puede eliminar el webhook
   */
  async removeWebhook() {
    try {
      // Llamar al servicio de Telegram para eliminar el webhook
      const result = await telegramService.deleteWebhook();
      console.log('🗑️ Webhook eliminado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error eliminando webhook:', error);
      throw error; // Propagar error para manejo en capas superiores
    }
  }

  /**
   * Obtiene información detallada sobre la configuración actual del webhook
   * Consulta el estado y configuración del webhook en la API de Telegram
   * @returns {Promise<Object>} Información detallada del webhook
   * @throws {Error} Si no se puede obtener la información del webhook
   */
  async getWebhookInfo() {
    try {
      // Llamar al servicio de Telegram para obtener información del webhook
      const info = await telegramService.getWebhookInfo();
      console.log('ℹ️ Info webhook:', info);
      return info;
    } catch (error) {
      console.error('❌ Error obteniendo info webhook:', error);
      throw error; // Propagar error para manejo en capas superiores
    }
  }
}

// Exportar una instancia única de TelegramWebhook (patrón Singleton)
// Esto asegura que toda la aplicación use el mismo manejador de webhooks
module.exports = new TelegramWebhook();
