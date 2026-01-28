/**
 * Módulo de conexión a base de datos MongoDB
 * Archivo: infrastructure/db.js
 * Descripción: Gestiona la conexión, desconexión y estado de la base de datos MongoDB
 * 
 * Este módulo implementa el patrón Singleton para asegurar una única conexión
 * y proporciona métodos para gestionar el ciclo de vida de la base de datos
 */

// Importar Mongoose - ODM (Object Data Modeling) para MongoDB
const mongoose = require('mongoose');

/**
 * Clase Database - Gestiona la conexión con MongoDB
 * Responsabilidades:
 * - Establecer y mantener la conexión con MongoDB
 * - Manejar eventos de conexión, desconexión y reconexión
 * - Proporcionar métodos para verificar el estado de la conexión
 * - Facilitar el cierre graceful de la conexión
 */
class Database {
  /**
   * Constructor de la clase Database
   * Inicializa las propiedades para gestionar la conexión
   */
  constructor() {
    // Almacenar la instancia de conexión de Mongoose
    this.connection = null;
    // URI de conexión desde variables de entorno o valor por defecto
    // Formato: mongodb://host:puerto/nombre_base_datos
    this.mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/propinas';
  }

  /**
   * Establece la conexión con MongoDB
   * Configura los eventos de conexión y maneja errores iniciales
   * @returns {Promise<Object>} Instancia de conexión de Mongoose
   * @throws {Error} Si no se puede establecer la conexión
   */
  async connect() {
    try {
      // Establecer conexión usando Mongoose con opciones recomendadas
      this.connection = await mongoose.connect(this.mongoUri, {
        useNewUrlParser: true,    // Usar el nuevo parser de URL de MongoDB
        useUnifiedTopology: true, // Usar el nuevo motor de monitoreo de servidor
      });

      // Confirmar conexión exitosa
      console.log('✅ Conectado a MongoDB');
      console.log(`📊 Base de datos: ${this.connection.connection.name}`);
      
      // Configurar manejadores de eventos para la conexión
      this.setupConnectionEvents();

      return this.connection;
    } catch (error) {
      // Si hay error crítico de conexión, registrar y salir de la aplicación
      console.error('❌ Error conectando a MongoDB:', error);
      process.exit(1); // Salir ya que la aplicación no puede funcionar sin BD
    }
  }

  /**
   * Configura los manejadores de eventos para la conexión de MongoDB
   * Monitorea cambios en el estado de la conexión
   */
  setupConnectionEvents() {
    // Manejar errores de conexión durante la operación normal
    mongoose.connection.on('error', (error) => {
      console.error('❌ Error en conexión MongoDB:', error);
    });

    // Manejar evento de desconexión
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Desconectado de MongoDB');
    });

    // Manejar evento de reconexión automática
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Reconectado a MongoDB');
    });
  }

  /**
   * Cierra la conexión con MongoDB de forma graceful
   * Debe llamarse durante el shutdown de la aplicación
   */
  async disconnect() {
    try {
      // Verificar si existe una conexión activa antes de desconectar
      if (this.connection) {
        await mongoose.disconnect();
        console.log('✅ Desconectado de MongoDB');
      }
    } catch (error) {
      // Registrar error pero no lanzar excepción para no interrumpir el shutdown
      console.error('❌ Error desconectando de MongoDB:', error);
    }
  }

  /**
   * Obtiene la instancia de conexión activa
   * @returns {Object|null} Instancia de conexión de Mongoose o null si no está conectado
   */
  getConnection() {
    return this.connection;
  }

  /**
   * Verifica si la conexión está activa y establecida
   * @returns {boolean} True si está conectado, false en caso contrario
   */
  isConnected() {
    // readyState 1 significa 'connected' en Mongoose
    return mongoose.connection.readyState === 1;
  }

  /**
   * Realiza un health check de la conexión a MongoDB
   * Proporciona información detallada sobre el estado de la conexión
   * @returns {Promise<Object>} Objeto con información del estado de la conexión
   */
  async healthCheck() {
    try {
      // Obtener el estado numérico de la conexión
      const state = mongoose.connection.readyState;
      // Mapeo de códigos de estado a descripciones legibles
      const states = {
        0: 'disconnected',  // No conectado
        1: 'connected',     // Conectado y listo
        2: 'connecting',    // En proceso de conexión
        3: 'disconnecting'  // En proceso de desconexión
      };

      // Retornar información detallada del estado
      return {
        status: states[state] || 'unknown', // Estado actual
        database: this.connection?.connection?.name || 'unknown', // Nombre de la BD
        host: this.connection?.connection?.host || 'unknown',     // Host del servidor
        port: this.connection?.connection?.port || 'unknown'      // Puerto del servidor
      };
    } catch (error) {
      // Si hay error al verificar el estado, retornar información del error
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

// Exportar una instancia única de Database (patrón Singleton)
// Esto asegura que toda la aplicación use la misma conexión a la base de datos
module.exports = new Database();
