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

      // Formatear etiqueta del período para mostrar
      let periodLabel;
      if (intent.period === 'current_month') {
        periodLabel = 'este mes';
      } else if (intent.period.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = intent.period.split('-');
        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        periodLabel = `${monthNames[parseInt(month) - 1]} ${year}`;
      } else {
        periodLabel = intent.period;
      }
      
      let response = `📊 **Resumen de ${periodLabel}**\n\n`;
      
      if (tips.length === 0) {
        response += '❌ No hay registros en este período';
        return response;
      }

      response += `💰 **Total propinas:** $${totalTips.total}\n`;
      response += `📈 **Promedio diario:** $${Math.round(totalTips.total / totalTips.count)}\n`;
      response += `👷 **Días trabajados:** ${workedDays}\n`;
      response += `📅 **Total días:** ${tips.length}\n`;
      
      // Agregar días no trabajados si hay
      const noWorkDays = tips.length - workedDays;
      if (noWorkDays > 0) {
        response += `🚫 **Días no trabajados:** ${noWorkDays}\n`;
      }
      
      response += '\n';

      // Mostrar últimos registros (limitar a 5 para no saturar)
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

      // Agregar sugerencia si hay muchos registros
      if (tips.length > 5) {
        response += `\n💡 *Mostrando los últimos 5 de ${tips.length} registros totales*`;
      }

      return response;
    } catch (error) {
      console.error('GetSummary Error:', error);
      return '❌ Error al obtener el resumen. Intentalo de nuevo.';
    }
  }
}

module.exports = new GetSummary();
