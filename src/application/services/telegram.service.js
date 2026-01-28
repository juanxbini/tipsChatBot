/**
 * Servicio de comunicación con Telegram
 * Archivo: application/services/telegram.service.js
 * Descripción: Gestiona la comunicación con la API de Telegram Bot
 * 
 * Este servicio proporciona una interfaz para interactuar con la API de Telegram,
 * incluyendo envío de mensajes, configuración de webhooks y validación de datos
 */

// Importar Axios para realizar peticiones HTTP a la API de Telegram
const axios = require('axios');

/**
 * Clase TelegramService - Gestiona la comunicación con Telegram
 * Responsabilidades:
 * - Enviar mensajes a usuarios de Telegram
 * - Configurar y gestionar webhooks del bot
 * - Validar y extraer datos de mensajes recibidos
 * - Manejar errores de la API de Telegram
 */
class TelegramService {
  /**
   * Constructor de la clase TelegramService
   * Inicializa las credenciales y URL base de la API
   */
  constructor() {
    // Token del bot desde variables de entorno
    this.botToken = process.env.BOT_TOKEN;
    // ID del chat autorizado desde variables de entorno
    this.chatId = process.env.CHAT_ID;
    // URL base de la API de Telegram Bot
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Envía un mensaje de texto a un chat de Telegram
   * @param {string} message - Mensaje a enviar (puede contener formato Markdown)
   * @param {string|null} chatId - ID del chat destino (opcional, usa el configurado por defecto)
   * @returns {Promise<Object>} Respuesta de la API de Telegram
   * @throws {Error} Si hay error en el envío del mensaje
   */
  async sendMessage(message, chatId = null) {
    try {
      // Usar el chatId proporcionado o el configurado por defecto
      const targetChatId = chatId || this.chatId;
      
      // Realizar petición POST a la API de Telegram
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: targetChatId,    // ID del chat destino
        text: message,             // Mensaje a enviar
        parse_mode: 'Markdown'    // Permitir formato Markdown en el mensaje
      });

      // Retornar los datos de la respuesta
      return response.data;
    } catch (error) {
      // Registrar error detallado de la API de Telegram
      console.error('Telegram Service Error:', error.response?.data || error.message);
      // Propagar error para manejo en capas superiores
      throw error;
    }
  }

  /**
   * Configura el webhook para recibir actualizaciones de Telegram
   * @param {string} webhookUrl - URL pública donde Telegram enviará las actualizaciones
   * @returns {Promise<Object>} Respuesta de la API de Telegram
   * @throws {Error} Si hay error en la configuración del webhook
   */
  async setWebhook(webhookUrl) {
    try {
      // Realizar petición POST para configurar el webhook
      const response = await axios.post(`${this.apiUrl}/setWebhook`, {
        url: webhookUrl  // URL donde se recibirán las actualizaciones
      });
      return response.data;
    } catch (error) {
      // Registrar error de configuración de webhook
      console.error('Webhook Setup Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Elimina la configuración del webhook actual
   * Vuelve el bot al modo de polling (recepción manual de actualizaciones)
   * @returns {Promise<Object>} Respuesta de la API de Telegram
   * @throws {Error} Si hay error en la eliminación del webhook
   */
  async deleteWebhook() {
    try {
      // Realizar petición POST para eliminar el webhook
      const response = await axios.post(`${this.apiUrl}/deleteWebhook`);
      return response.data;
    } catch (error) {
      // Registrar error de eliminación de webhook
      console.error('Webhook Delete Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtiene información detallada sobre la configuración actual del webhook
   * @returns {Promise<Object>} Información del webhook configurado
   * @throws {Error} Si hay error al obtener la información del webhook
   */
  async getWebhookInfo() {
    try {
      // Realizar petición GET para obtener información del webhook
      const response = await axios.get(`${this.apiUrl}/getWebhookInfo`);
      return response.data;
    } catch (error) {
      // Registrar error al consultar información del webhook
      console.error('Webhook Info Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Valida que una actualización de Telegram contenga un mensaje válido
   * @param {Object} message - Objeto de actualización recibido desde Telegram
   * @returns {boolean} True si el mensaje es válido, false en caso contrario
   */
  isValidMessage(message) {
    // Verificar que existan todas las propiedades necesarias en el mensaje
    return message && 
           message.message &&           // Debe tener un objeto message
           message.message.text &&      // Debe tener texto
           message.message.chat &&      // Debe tener información del chat
           message.message.chat.id;     // Debe tener ID del chat
  }

  /**
   * Extrae los datos relevantes de una actualización de mensaje
   * @param {Object} update - Objeto de actualización recibido desde Telegram
   * @returns {Object} Objeto con los datos extraídos del mensaje
   */
  extractMessageData(update) {
    return {
      text: update.message.text,                    // Texto del mensaje
      chatId: update.message.chat.id,               // ID del chat
      messageId: update.message.message_id,         // ID del mensaje
      user: update.message.from                     // Información del usuario que envió el mensaje
    };
  }
}

// Exportar una instancia única de TelegramService (patrón Singleton)
// Esto asegura que toda la aplicación use el mismo servicio de Telegram
module.exports = new TelegramService();
