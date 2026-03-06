const TipRepository = require('../../domain/repositories/TipRepository');
const Tip = require('../../domain/entities/Tip');

class GetWeeklyTrend {
  async execute(intent, chatId) {
    try {
      // Obtener últimas 4 semanas completas
      const weeks = this.generateLastWeeks(4);
      
      let response = `📈 **Tendencia Semanal - Últimas 4 Semanas**\n\n`;
      
      const weekData = [];
      
      for (const week of weeks) {
        // Consultar directamente por rango de fechas en lugar de período mensual
        const tips = await this.getTipsByDateRange(week.startDate, week.endDate);
        const totalTips = this.calculateTotalTips(tips);
        
        weekData.push({
          label: week.label,
          total: totalTips.total,
          workedDays: totalTips.count,
          startDate: week.startDate,
          endDate: week.endDate
        });
      }
      
      // Mostrar lista de tendencia (mejor formato para Telegram)
      weekData.forEach((week, index) => {
        const average = week.workedDays > 0 ? Math.round(week.total / week.workedDays) : 0;
        const emoji = this.getTrendEmoji(index, weekData);
        response += `${index + 1}. ${emoji} **${week.label}**\n`;
        response += `   💰 Total: $${week.total}\n`;
        response += `   📈 Promedio: $${average}\n`;
        response += `   👷 Días trabajados: ${week.workedDays}\n\n`;
      });
      
      // Análisis de tendencia
      response += `\n📊 **Análisis de Tendencia:**\n`;
      
      if (weekData.length >= 2) {
        const firstWeek = weekData[0];
        const lastWeek = weekData[weekData.length - 1];
        const totalChange = lastWeek.total - firstWeek.total;
        const percentChange = firstWeek.total > 0 ? 
          ((totalChange / firstWeek.total) * 100).toFixed(1) : 0;
        
        if (percentChange > 10) {
          response += `🚀 **Tendencia:** Fuertemente alcista (+${percentChange}%)\n`;
        } else if (percentChange > 0) {
          response += `📈 **Tendencia:** Alcista (+${percentChange}%)\n`;
        } else if (percentChange < -10) {
          response += `📉 **Tendencia:** Fuertemente bajista (${percentChange}%)\n`;
        } else if (percentChange < 0) {
          response += `📉 **Tendencia:** Bajista (${percentChange}%)\n`;
        } else {
          response += `➡️ **Tendencia:** Estable (0%)\n`;
        }
        
        // Mejor y peor semana
        const bestWeek = weekData.reduce((best, current) => 
          current.total > best.total ? current : best
        );
        const worstWeek = weekData.reduce((worst, current) => 
          current.total < worst.total ? current : worst
        );
        
        response += `🏆 **Mejor semana:** ${bestWeek.label} con $${bestWeek.total}\n`;
        response += `📉 **Peor semana:** ${worstWeek.label} con $${worstWeek.total}\n`;
        
        // Promedio semanal
        const weeklyAverage = Math.round(
          weekData.reduce((sum, w) => sum + w.total, 0) / weekData.length
        );
        response += `💰 **Promedio semanal:** $${weeklyAverage}\n`;
      }
      
      // Proyección mensual basada en tendencia semanal
      const lastWeekTotal = weekData[weekData.length - 1]?.total || 0;
      const monthlyProjection = lastWeekTotal * 4.33; // 52 semanas / 12 meses
      response += `🎯 **Proyección mensual:** $${Math.round(monthlyProjection)}\n`;
      
      return response;
    } catch (error) {
      console.error('GetWeeklyTrend Error:', error);
      return '❌ Error al obtener tendencia semanal. Intentalo de nuevo.';
    }
  }
  
  /**
   * Genera los períodos de las últimas N semanas
   * @param {number} weeksCount - Cantidad de semanas a generar
   * @returns {Array<Object>} Array de información de semanas
   */
  generateLastWeeks(weeksCount) {
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Encontrar el domingo más reciente (fin de semana)
    const lastSunday = new Date(today);
    const dayOfWeek = today.getDay();
    lastSunday.setDate(today.getDate() - dayOfWeek);
    
    for (let i = 0; i < weeksCount; i++) {
      const weekStart = new Date(lastSunday);
      weekStart.setDate(lastSunday.getDate() - (i * 7) - 6); // Lunes de esa semana
      
      const weekEnd = new Date(lastSunday);
      weekEnd.setDate(lastSunday.getDate() - (i * 7)); // Domingo de esa semana
      
      weeks.push({
        label: `Semana ${weeksCount - i}`,
        period: this.formatDateRange(weekStart, weekEnd),
        startDate: weekStart,
        endDate: weekEnd
      });
    }
    
    return weeks.reverse();
  }
  
  /**
   * Formatea un rango de fechas para consulta
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @returns {string} Período formateado para consulta
   */
  formatDateRange(startDate, endDate) {
    // Devolver rango de fechas en formato YYYY-MM-DD para consulta específica
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return `${start}_${end}`;
  }
  
  /**
   * Obtiene emoji de tendencia para una semana
   * @param {number} index - Índice de la semana actual
   * @param {Array} weekData - Datos de todas las semanas
   * @returns {string} Emoji de tendencia
   */
  getTrendEmoji(index, weekData) {
    if (index === 0) return '📊'; // Primera semana
    
    const currentWeek = weekData[index];
    const previousWeek = weekData[index - 1];
    
    if (currentWeek.total > previousWeek.total) {
      return '📈';
    } else if (currentWeek.total < previousWeek.total) {
      return '📉';
    } else {
      return '➡️';
    }
  }

  /**
   * Obtiene tips por rango de fechas específico
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @returns {Promise<Array>} Array de tips en el rango
   */
  async getTipsByDateRange(startDate, endDate) {
    return await Tip.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
  }

  /**
   * Calcula total y cantidad de tips
   * @param {Array} tips - Array de tips
   * @returns {Object} Objeto con total y count
   */
  calculateTotalTips(tips) {
    const workedTips = tips.filter(tip => tip.worked && tip.amount !== null);
    const total = workedTips.reduce((sum, tip) => sum + tip.amount, 0);
    return {
      total,
      count: workedTips.length
    };
  }
}

module.exports = new GetWeeklyTrend();
