const TipRepository = require('../../domain/repositories/TipRepository');

class GetCompareMonths {
  async execute(intent, chatId) {
    try {
      const monthsToCompare = intent.months || 3;
      
      // Generar períodos para los últimos N meses
      const periods = this.generateMonthPeriods(monthsToCompare);
      
      let response = `📊 **Comparación de Últimos ${monthsToCompare} Meses**\n\n`;
      
      const monthComparisons = [];
      
      for (const period of periods) {
        const tips = await TipRepository.findByPeriod(period);
        const workedDays = await TipRepository.getWorkedDaysInPeriod(period);
        const totalTips = await TipRepository.getTotalTipsInPeriod(period);
        
        // Formatear nombre del mes
        const [year, month] = period.split('-');
        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const monthName = monthNames[parseInt(month) - 1];
        
        monthComparisons.push({
          period: `${monthName} ${year}`,
          total: totalTips.total,
          workedDays,
          totalDays: tips.length,
          average: totalTips.count > 0 ? Math.round(totalTips.total / totalTips.count) : 0
        });
      }
      
      // Ordenar del más antiguo al más reciente
      monthComparisons.reverse();
      
      // Encontrar mejor y peor mes
      const bestMonth = monthComparisons.reduce((best, current) => 
        current.total > best.total ? current : best
      );
      const worstMonth = monthComparisons.reduce((worst, current) => 
        current.total < worst.total ? current : worst
      );
      
      // Mostrar lista comparativa (mejor formato para Telegram)
      monthComparisons.forEach((month, index) => {
        const emoji = month.period === bestMonth.period ? '🏆' : 
                     month.period === worstMonth.period ? '📉' : '📊';
        response += `${index + 1}. ${emoji} **${month.period}**\n`;
        response += `   💰 Total: $${month.total}\n`;
        response += `   📈 Promedio: $${month.average}\n`;
        response += `   👷 Días trabajados: ${month.workedDays}\n\n`;
      });
      
      // Estadísticas adicionales
      const totalAllMonths = monthComparisons.reduce((sum, m) => sum + m.total, 0);
      const overallAverage = Math.round(totalAllMonths / monthsToCompare);
      
      response += `\n📈 **Estadísticas Adicionales:**\n`;
      response += `🏆 **Mejor mes:** ${bestMonth.period} con $${bestMonth.total}\n`;
      response += `📉 **Peor mes:** ${worstMonth.period} con $${worstMonth.total}\n`;
      response += `💰 **Promedio mensual:** $${overallAverage}\n`;
      response += `📊 **Total acumulado:** $${totalAllMonths}\n`;
      
      // Tendencia
      if (monthComparisons.length >= 2) {
        const lastMonth = monthComparisons[monthComparisons.length - 1];
        const previousMonth = monthComparisons[monthComparisons.length - 2];
        const change = ((lastMonth.total - previousMonth.total) / previousMonth.total * 100).toFixed(1);
        const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        response += `${trend} **Variación vs mes anterior:** ${change > 0 ? '+' : ''}${change}%\n`;
      }
      
      return response;
    } catch (error) {
      console.error('GetCompareMonths Error:', error);
      return '❌ Error al comparar meses. Intentalo de nuevo.';
    }
  }
  
  /**
   * Genera los períodos de los últimos N meses en formato YYYY-MM
   * @param {number} months - Cantidad de meses a generar
   * @returns {Array<string>} Array de períodos
   */
  generateMonthPeriods(months) {
    const periods = [];
    const currentDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      periods.push(`${year}-${month}`);
    }
    
    return periods;
  }
}

module.exports = new GetCompareMonths();
