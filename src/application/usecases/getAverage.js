const TipRepository = require('../../domain/repositories/TipRepository');

class GetAverage {
  async execute(intent, chatId) {
    try {
      if (!intent.period) {
        return '❌ Necesito el período para calcular el promedio (mes actual o específico).';
      }

      const totalTips = await TipRepository.getTotalTipsInPeriod(intent.period);
      const workedDays = await TipRepository.getWorkedDaysInPeriod(intent.period);

      const periodLabel = intent.period === 'current_month' ? 'este mes' : intent.period;
      
      let response = `📈 **Promedio de ${periodLabel}**\n\n`;

      if (workedDays === 0) {
        response += '❌ No hay días trabajados en este período';
        return response;
      }

      const dailyAverage = Math.round(totalTips.total / workedDays);
      const monthlyProjection = dailyAverage * 30;

      response += `💰 **Promedio diario:** $${dailyAverage}\n`;
      response += `👷 **Días trabajados:** ${workedDays}\n`;
      response += `📊 **Total acumulado:** $${totalTips.total}\n`;
      response += `🎯 **Proyección mensual:** $${monthlyProjection}\n\n`;
      
      response += `💡 *Basado en ${workedDays} días trabajados*`;

      return response;
    } catch (error) {
      console.error('GetAverage Error:', error);
      return '❌ Error al calcular el promedio. Intentalo de nuevo.';
    }
  }
}

module.exports = new GetAverage();
