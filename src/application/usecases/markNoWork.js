const TipRepository = require('../../domain/repositories/TipRepository');
const aiInterpreter = require('../services/aiInterpreter');

class MarkNoWork {
  async execute(intent, chatId) {
    try {
      if (!intent.date) {
        return '❌ Necesito la fecha para marcar que no trabajaste.';
      }

      const date = aiInterpreter.normalizeDate(intent.date);
      const existingTip = await TipRepository.findByDate(date);

      if (existingTip) {
        if (existingTip.worked === false) {
          return `ℹ️ Ya estaba marcado como no trabajado para ${date.toLocaleDateString('es-AR')}`;
        }

        const updateData = {
          worked: false,
          amount: null
        };

        await TipRepository.updateByDate(date, updateData);
        return `✅ Actualizado: no trabajaste el ${date.toLocaleDateString('es-AR')}`;
      }

      const tipData = {
        date: date,
        amount: null,
        worked: false,
        source: 'telegram'
      };

      await TipRepository.create(tipData);
      
      return `✅ Marcado como no trabajado: ${date.toLocaleDateString('es-AR')}`;
    } catch (error) {
      console.error('MarkNoWork Error:', error);
      return '❌ Error al marcar el día. Intentalo de nuevo.';
    }
  }
}

module.exports = new MarkNoWork();
