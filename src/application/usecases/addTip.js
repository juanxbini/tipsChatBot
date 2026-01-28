const TipRepository = require('../../domain/repositories/TipRepository');
const aiInterpreter = require('../services/aiInterpreter');

class AddTip {
  async execute(intent, chatId) {
    try {
      if (!intent.date || intent.amount === null) {
        return '❌ Necesito la fecha y el monto para registrar la propina.';
      }

      // Usar la fecha directamente sin normalizar dos veces
      const date = aiInterpreter.normalizeDate(intent.date);
      const existingTip = await TipRepository.findByDate(date);

      if (existingTip) {
        // Usar la fecha original para mostrar, no la convertida
        const displayDate = this.formatDisplayDate(intent.date);
        return `⚠️ Ya existe un registro para ${displayDate}. Usá "actualizar" para modificarlo.`;
      }

      const tipData = {
        date: date,
        amount: intent.amount,
        worked: true,
        source: 'telegram'
      };

      await TipRepository.create(tipData);
      
      // Usar la fecha original para mostrar, no la convertida
      const displayDate = this.formatDisplayDate(intent.date);
      return `✅ Propina de $${intent.amount} registrada para ${displayDate}`;
    } catch (error) {
      console.error('AddTip Error:', error);
      
      // Si es error de duplicado, dar mensaje más claro
      if (error.code === 11000) {
        const displayDate = this.formatDisplayDate(intent.date);
        return `⚠️ Ya existe un registro para ${displayDate}. Usá "actualizar" para modificarlo.`;
      }
      
      return '❌ Error al registrar la propina. Intentalo de nuevo.';
    }
  }

  /**
   * Formatea la fecha para mostrarla al usuario
   * @param {string} dateStr - Fecha en formato YYYY-MM-DD o relativa
   * @returns {string} Fecha formateada para mostrar
   */
  formatDisplayDate(dateStr) {
    if (dateStr === 'today') {
      return 'hoy';
    }
    if (dateStr === 'yesterday') {
      return 'ayer';
    }
    
    // Para fechas absolutas, convertirlas a DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      return `${parseInt(day)}/${parseInt(month)}/${year}`;
    }
    
    return dateStr;
  }
}

module.exports = new AddTip();
