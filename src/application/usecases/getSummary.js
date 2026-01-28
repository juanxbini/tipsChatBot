const TipRepository = require('../../domain/repositories/TipRepository');

class GetSummary {
  async execute(intent, chatId) {
    try {
      if (!intent.period) {
        return '❌ Necesito el período para mostrar el resumen (mes actual o específico).';
      }

      const tips = await TipRepository.findByPeriod(intent.period);
      const workedDays = await TipRepository.getWorkedDaysInPeriod(intent.period);
      const totalTips = await TipRepository.getTotalTipsInPeriod(intent.period);

      const periodLabel = intent.period === 'current_month' ? 'este mes' : intent.period;
      
      let response = `📊 **Resumen de ${periodLabel}**\n\n`;
      
      if (tips.length === 0) {
        response += '❌ No hay registros en este período';
        return response;
      }

      response += `💰 **Total propinas:** $${totalTips.total}\n`;
      response += `📈 **Promedio diario:** $${Math.round(totalTips.total / totalTips.count)}\n`;
      response += `👷 **Días trabajados:** ${workedDays}\n`;
      response += `📅 **Total días:** ${tips.length}\n\n`;

      const lastTips = tips.slice(-5).reverse();
      response += `📋 **Últimos 5 registros:**\n`;
      
      lastTips.forEach(tip => {
        const dateStr = tip.date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        if (tip.worked === false) {
          response += `🚫 ${dateStr}: No trabajó\n`;
        } else {
          response += `💰 ${dateStr}: $${tip.amount}\n`;
        }
      });

      return response;
    } catch (error) {
      console.error('GetSummary Error:', error);
      return '❌ Error al obtener el resumen. Intentalo de nuevo.';
    }
  }
}

module.exports = new GetSummary();
