const TipRepository = require('../../domain/repositories/TipRepository');

class GetNoWorkDays {
  async execute(intent, chatId) {
    try {
      if (!intent.period) {
        return '❌ Necesito el período para mostrar los días no trabajados (mes actual o específico).';
      }

      const noWorkDays = await TipRepository.getNoWorkDaysInPeriod(intent.period);
      const periodLabel = intent.period === 'current_month' ? 'este mes' : intent.period;

      let response = `🚫 **Días no trabajados de ${periodLabel}**\n\n`;

      if (noWorkDays.length === 0) {
        response += '✅ ¡No hay días no trabajados en este período!';
        return response;
      }

      response += `📅 **Total:** ${noWorkDays.length} días\n\n`;
      response += `📋 **Lista de días:**\n`;

      noWorkDays.forEach(day => {
        const dateStr = day.date.toLocaleDateString('es-AR', { 
          weekday: 'short', 
          day: '2-digit', 
          month: '2-digit' 
        });
        response += `🚫 ${dateStr}\n`;
      });

      return response;
    } catch (error) {
      console.error('GetNoWorkDays Error:', error);
      return '❌ Error al obtener los días no trabajados. Intentalo de nuevo.';
    }
  }
}

module.exports = new GetNoWorkDays();
