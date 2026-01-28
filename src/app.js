// Cargar variables de entorno desde archivo .env
// Este módulo debe ser importado primero para que las variables estén disponibles
require('dotenv').config();

// Importar dependencias principales del framework y servicios
const express = require('express'); // Framework web para crear el servidor HTTP
const database = require('./infrastructure/db'); // Módulo de conexión a base de datos MongoDB
const telegramWebhook = require('./infrastructure/telegramWebhook'); // Manejador de webhooks de Telegram
const cronService = require('./application/services/cron.service'); // Servicio de tareas programadas

/**
 * Clase principal de la aplicación
 * Responsable de configurar e iniciar el servidor Express con todas sus rutas y middleware
 * Implementa el patrón Singleton para asegurar una única instancia de la aplicación
 */
class App {
  /**
   * Constructor de la clase App
   * Inicializa la aplicación Express, configura el puerto, middleware y rutas
   */
  constructor() {
    // Crear instancia de Express para manejar peticiones HTTP
    this.app = express();
    // Configurar puerto desde variables de entorno o usar puerto 3000 por defecto
    this.port = process.env.PORT || 3000;
    // Configurar middleware para procesar peticiones
    this.setupMiddleware();
    // Configurar rutas de la API
    this.setupRoutes();
  }

  /**
   * Configura el middleware necesario para el funcionamiento de la aplicación
   * Incluye parsers de JSON, logging de peticiones y otros middleware globales
   */
  setupMiddleware() {
    // Middleware para parsear bodies en formato JSON
    // Permite recibir datos JSON en las peticiones POST/PUT
    this.app.use(express.json());
    
    // Middleware para parsear datos de formularios URL-encoded
    // extended: true permite objetos anidados y arrays en los datos
    this.app.use(express.urlencoded({ extended: true }));
    
    // Middleware personalizado para logging de todas las peticiones HTTP
    // Registra timestamp, método HTTP y ruta de cada petición
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next(); // Continuar al siguiente middleware o ruta
    });
  }

  /**
   * Configura todas las rutas de la API REST
   * Incluye endpoints de health check, webhook de Telegram y administración
   */
  setupRoutes() {
    // Ruta raíz - Endpoint de bienvenida y estado básico del servicio
    // Útil para verificar que el servidor está funcionando correctamente
    this.app.get('/', (req, res) => {
      res.json({
        status: 'ok', // Indica que el servicio está operativo
        service: 'Propinas Bot v2.0', // Nombre y versión del servicio
        timestamp: new Date().toISOString() // Timestamp actual en formato ISO
      });
    });

    // Endpoint de health check detallado
    // Verifica el estado de todos los componentes críticos del sistema
    this.app.get('/health', async (req, res) => {
      try {
        // Verificar conexión a base de datos MongoDB
        const dbHealth = await database.healthCheck();
        // Obtener estado del servicio de tareas programadas (cron)
        const cronStatus = cronService.getStatus();
        
        // Responder con estado saludable y detalles de cada componente
        res.json({
          status: 'healthy', // Indica que todos los componentes funcionan correctamente
          database: dbHealth, // Estado de la conexión a base de datos
          cron: cronStatus, // Estado del servicio de programación de tareas
          timestamp: new Date().toISOString() // Timestamp actual
        });
      } catch (error) {
        // Si algún componente falla, responder con estado no saludable
        res.status(500).json({
          status: 'unhealthy', // Indica que hay problemas en el sistema
          error: error.message, // Mensaje de error específico
          timestamp: new Date().toISOString() // Timestamp del error
        });
      }
    });

    // Endpoint principal del webhook de Telegram
    // Recibe todas las actualizaciones (mensajes, comandos) enviados por el bot de Telegram
    this.app.post('/webhook/telegram', async (req, res) => {
      try {
        // Procesar la actualización recibida de Telegram usando el servicio especializado
        const result = await telegramWebhook.handleUpdate(req.body);
        // Responder con éxito y el resultado del procesamiento
        res.status(200).json(result);
      } catch (error) {
        // Registrar error en consola para debugging
        console.error('Webhook error:', error);
        // Responder con error genérico (no exponer detalles del error por seguridad)
        res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error' 
        });
      }
    });

    // Endpoint administrativo para configurar el webhook de Telegram
    // Permite establecer la URL donde Telegram enviará las actualizaciones del bot
    this.app.post('/admin/webhook/setup', async (req, res) => {
      try {
        // Extraer la URL del webhook del cuerpo de la petición
        const { webhookUrl } = req.body;
        // Validar que se proporcionó una URL
        if (!webhookUrl) {
          return res.status(400).json({ 
            error: 'webhookUrl is required' // Mensaje de error específico
          });
        }

        // Llamar al servicio para configurar el webhook en Telegram
        const result = await telegramWebhook.setupWebhook(webhookUrl);
        // Responder con el resultado de la configuración
        res.json(result);
      } catch (error) {
        // Manejar errores de configuración del webhook
        res.status(500).json({ 
          error: error.message // Mensaje específico del error
        });
      }
    });

    // Endpoint administrativo para eliminar el webhook de Telegram
    // Desconecta el bot del webhook actual y vuelve al modo de polling
    this.app.post('/admin/webhook/remove', async (req, res) => {
      try {
        // Llamar al servicio para eliminar la configuración del webhook
        const result = await telegramWebhook.removeWebhook();
        // Responder con el resultado de la eliminación
        res.json(result);
      } catch (error) {
        // Manejar errores durante la eliminación del webhook
        res.status(500).json({ 
          error: error.message // Mensaje específico del error
        });
      }
    });

    // Endpoint administrativo para obtener información del webhook
    // Consulta la configuración actual del webhook en la API de Telegram
    this.app.get('/admin/webhook/info', async (req, res) => {
      try {
        // Obtener información detallada del webhook configurado
        const info = await telegramWebhook.getWebhookInfo();
        // Responder con la información completa del webhook
        res.json(info);
      } catch (error) {
        // Manejar errores al consultar información del webhook
        res.status(500).json({ 
          error: error.message // Mensaje específico del error
        });
      }
    });

    // Middleware para manejar rutas no encontradas (404)
    // Se ejecuta cuando ninguna ruta anterior coincide con la petición
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found', // Mensaje de error estándar
        path: req.originalUrl // Ruta que no fue encontrada
      });
    });

    // Middleware global de manejo de errores
    // Captura todos los errores no manejados en las rutas anteriores
    this.app.use((error, req, res, next) => {
      // Registrar el error completo en consola para debugging
      console.error('Unhandled error:', error);
      
      // Responder con error 500 (Internal Server Error)
      res.status(500).json({
        error: 'Internal Server Error', // Mensaje genérico de error
        // En desarrollo, incluir el mensaje específico del error
        // En producción, no exponer detalles del error por seguridad
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
  }

  /**
   * Inicia la aplicación y todos sus servicios
   * Conecta a la base de datos, inicia el servidor HTTP y los servicios auxiliares
   */
  async start() {
    try {
      // Establecer conexión con la base de datos MongoDB
      await database.connect();
      
      // Iniciar el servidor HTTP en el puerto configurado
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 Servidor iniciado en puerto ${this.port}`);
        console.log(`🌐 Webhook URL: https://your-domain.com/webhook/telegram`);
      });

      // Iniciar el servicio de tareas programadas (recordatorios automáticos)
      cronService.start();

      // Configurar manejadores para cierre graceful de la aplicación
      // SIGTERM: Señal enviada por sistemas para terminar procesos
      process.on('SIGTERM', () => this.gracefulShutdown());
      // SIGINT: Señal enviada por Ctrl+C en terminal
      process.on('SIGINT', () => this.gracefulShutdown());

    } catch (error) {
      // Si hay error crítico al iniciar, mostrar error y salir
      console.error('❌ Error iniciando aplicación:', error);
      process.exit(1); // Salir con código de error
    }
  }

  /**
   * Realiza un cierre graceful de la aplicación
   * Detiene todos los servicios de forma ordenada para evitar pérdida de datos
   */
  async gracefulShutdown() {
    console.log('🛑 Iniciando shutdown graceful...');
    
    try {
      // Detener el servicio de tareas programadas
      cronService.stop();
      // Cerrar conexión con la base de datos
      await database.disconnect();
      
      // Si el servidor HTTP está activo, cerrarlo
      if (this.server) {
        this.server.close(() => {
          console.log('✅ Servidor detenido');
          process.exit(0); // Salir con código de éxito
        });
      } else {
        // Si no hay servidor activo, salir inmediatamente
        process.exit(0);
      }
    } catch (error) {
      // Si hay error durante el shutdown, registrar y salir con error
      console.error('❌ Error en shutdown:', error);
      process.exit(1);
    }
  }
}

// Exportar una instancia única de la aplicación (patrón Singleton)
// Esto asegura que toda la aplicación use la misma instancia
module.exports = new App();
