const TipRepository = require('../../domain/repositories/TipRepository');
const aiInterpreter = require('../services/aiInterpreter');

class GetToday {
  async execute(intent, chatId) {
    try {
      const today = aiInterpreter.normalizeDate('today');
      const tip = await TipRepository.findByDate(today);

      if (!tip) {
        return `📅 Hoy ${today.toLocaleDateString('es-AR')}:\n❌ No hay registro todavía`;
      }

      if (tip.worked === false) {
        return `📅 Hoy ${today.toLocaleDateString('es-AR')}:\n🚫 No trabajaste`;
      }

      return `📅 Hoy ${today.toLocaleDateString('es-AR')}:\n💰 Propina: $${tip.amount}`;
    } catch (error) {
      console.error('GetToday Error:', error);
      return '❌ Error al consultar el día de hoy. Intentalo de nuevo.';
    }
  }
}

module.exports = new GetToday();
