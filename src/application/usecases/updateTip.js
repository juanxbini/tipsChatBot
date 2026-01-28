const TipRepository = require('../../domain/repositories/TipRepository');
const aiInterpreter = require('../services/aiInterpreter');

class UpdateTip {
  async execute(intent, chatId) {
    try {
      if (!intent.date || intent.amount === null) {
        return '❌ Necesito la fecha y el monto para actualizar la propina.';
      }

      const date = aiInterpreter.normalizeDate(intent.date);
      const existingTip = await TipRepository.findByDate(date);

      if (!existingTip) {
        return `❌ No hay registro para ${date.toLocaleDateString('es-AR')}. Usá "agregar" para crear uno nuevo.`;
      }

      const updateData = {
        amount: intent.amount,
        worked: true
      };

      await TipRepository.updateByDate(date, updateData);
      
      return `✅ Propina actualizada a $${intent.amount} para ${date.toLocaleDateString('es-AR')}`;
    } catch (error) {
      console.error('UpdateTip Error:', error);
      return '❌ Error al actualizar la propina. Intentalo de nuevo.';
    }
  }
}

module.exports = new UpdateTip();
