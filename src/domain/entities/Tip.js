/**
 * Entidad de dominio: Tip (Propina)
 * Archivo: domain/entities/Tip.js
 * Descripción: Define el modelo de datos para las propinas diarias registradas
 * 
 * Esta entidad representa una propina registrada para un día específico,
 * incluyendo información sobre si se trabajó ese día y el monto obtenido
 */

// Importar Mongoose para definir el esquema de la base de datos
const mongoose = require('mongoose');

/**
 * Esquema de la entidad Tip
 * Define la estructura de datos para almacenar información de propinas diarias
 */
const tipSchema = new mongoose.Schema({
  // Fecha del registro de propina (única por día)
  date: {
    type: Date,           // Tipo de dato: Fecha
    required: true,      // Campo obligatorio
    unique: true          // No puede haber dos registros para la misma fecha
  },
  // Monto de la propina obtenida (opcional, null si no se trabajó)
  amount: {
    type: Number,         // Tipo de dato: Numérico
    default: null         // Valor por defecto: null (sin propina)
  },
  // Indica si se trabajó ese día
  worked: {
    type: Boolean,        // Tipo de dato: Booleano
    required: true        // Campo obligatorio (true si trabajó, false si no)
  },
  // Fuente del registro (dónde se originó el dato)
  source: {
    type: String,         // Tipo de dato: Texto
    default: 'telegram'   // Valor por defecto: 'telegram' (la mayoría de registros vienen del bot)
  }
}, {
  timestamps: true       // Agrega automáticamente createdAt y updatedAt
});

/**
 * Middleware pre-save: Se ejecuta antes de guardar un documento
 * Asegura la consistencia de datos cuando no se trabajó un día
 */
tipSchema.pre('save', function(next) {
  // Si no se trabajó, el monto debe ser null para mantener consistencia
  if (this.worked === false) {
    this.amount = null;
  }
  next(); // Continuar con el proceso de guardado
});

/**
 * Índice para optimizar consultas por fecha
 * Mejora el rendimiento de búsquedas y ordenamientos por fecha
 */
tipSchema.index({ date: 1 });

// Exportar el modelo de Mongoose basado en el esquema definido
// Este modelo será usado para interactuar con la colección 'tips' en MongoDB
module.exports = mongoose.model('Tip', tipSchema);
