const TipRepository = require('../../domain/repositories/TipRepository');
const Tip = require('../../domain/entities/Tip');

class GetAverageByWeekday {
  async execute(intent, chatId) {
    try {
      let response = `📊 **Promedio de Propinas por Día de Semana**\n\n`;
      
      // Obtener promedios por día de la semana usando aggregation
      const weekdayAverages = await this.getWeekdayAverages();
      
      if (weekdayAverages.length === 0) {
        response += '❌ No hay suficientes datos para calcular promedios por día.';
        return response;
      }
      
      // Ordenar por promedio descendente
      weekdayAverages.sort((a, b) => b.average - a.average);
      
      // Encontrar mejor y peor día
      const bestDay = weekdayAverages[0];
      const worstDay = weekdayAverages[weekdayAverages.length - 1];
      
      // Mostrar lista de promedios (mejor formato para Telegram)
      weekdayAverages.forEach(day => {
        const emoji = day.weekday === bestDay.weekday ? '🏆' : 
                     day.weekday === worstDay.weekday ? '📉' : '📊';
        response += `${emoji} **${day.weekday}**\n`;
        response += `   💰 Promedio: $${day.average}\n`;
        response += `   💸 Total: $${day.total}\n`;
        response += `   👷 Días trabajados: ${day.count}\n\n`;
      });
      
      // Estadísticas adicionales
      const overallAverage = Math.round(
        weekdayAverages.reduce((sum, day) => sum + day.total, 0) / 
        weekdayAverages.reduce((sum, day) => sum + day.count, 0)
      );
      
      response += `\n📈 **Análisis Detallado:**\n`;
      response += `🏆 **Mejor día:** ${bestDay.weekday} con $${bestDay.average} de promedio\n`;
      response += `📉 **Peor día:** ${worstDay.weekday} con $${worstDay.average} de promedio\n`;
      response += `💰 **Promedio general:** $${overallAverage}\n`;
      
      // Diferencia porcentual
      const difference = bestDay.average - worstDay.average;
      const percentDifference = ((difference / worstDay.average) * 100).toFixed(1);
      response += `📊 **Diferencia:** ${bestDay.weekday} es ${percentDifference}% mejor que ${worstDay.weekday}\n`;
      
      // Recomendaciones
      response += `\n💡 **Insights y Recomendaciones:**\n`;
      
      if (bestDay.average > overallAverage * 1.2) {
        response += `🎯 **${bestDay.weekday}** es excepcionalmente bueno (${Math.round((bestDay.average / overallAverage - 1) * 100)}% sobre el promedio)\n`;
      }
      
      if (worstDay.average < overallAverage * 0.8) {
        response += `⚠️ **${worstDay.weekday}** está significativamente bajo (${Math.round((1 - worstDay.average / overallAverage) * 100)}% bajo el promedio)\n`;
      }
      
      // Patrones semanales
      const weekdays = weekdayAverages.filter(d => 
        ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'].includes(d.weekday.toLowerCase())
      );
      const weekends = weekdayAverages.filter(d => 
        ['sábado', 'domingo'].includes(d.weekday.toLowerCase())
      );
      
      if (weekdays.length > 0 && weekends.length > 0) {
        const weekdayAvg = Math.round(
          weekdays.reduce((sum, d) => sum + d.total, 0) / 
          weekdays.reduce((sum, d) => sum + d.count, 0)
        );
        const weekendAvg = Math.round(
          weekends.reduce((sum, d) => sum + d.total, 0) / 
          weekends.reduce((sum, d) => sum + d.count, 0)
        );
        
        response += `📅 **Días de semana:** $${weekdayAvg} de promedio\n`;
        response += `🎉 **Fines de semana:** $${weekendAvg} de promedio\n`;
        
        if (weekendAvg > weekdayAvg) {
          response += `🌟 **Los fines de semana son más rentables** (+${Math.round((weekendAvg / weekdayAvg - 1) * 100)}%)\n`;
        } else {
          response += `💼 **Los días de semana son más consistentes** (+${Math.round((weekdayAvg / weekendAvg - 1) * 100)}%)\n`;
        }
      }
      
      // Consistencia (coeficiente de variación)
      const variance = weekdayAverages.reduce((sum, day) => {
        return sum + Math.pow(day.average - overallAverage, 2) * day.count;
      }, 0) / weekdayAverages.reduce((sum, day) => sum + day.count, 0);
      
      const stdDeviation = Math.sqrt(variance);
      const coefficientOfVariation = (stdDeviation / overallAverage) * 100;
      
      if (coefficientOfVariation < 20) {
        response += `📊 **Patrón muy consistente** (variación del ${coefficientOfVariation.toFixed(1)}%)\n`;
      } else if (coefficientOfVariation < 40) {
        response += `📊 **Patrón moderadamente consistente** (variación del ${coefficientOfVariation.toFixed(1)}%)\n`;
      } else {
        response += `📊 **Patrón muy variable** (variación del ${coefficientOfVariation.toFixed(1)}%)\n`;
      }
      
      return response;
    } catch (error) {
      console.error('GetAverageByWeekday Error:', error);
      return '❌ Error al obtener promedios por día de semana. Intentalo de nuevo.';
    }
  }
  
  /**
   * Obtiene los promedios de propinas por día de la semana
   * @returns {Promise<Array>} Array con estadísticas por día
   */
  async getWeekdayAverages() {
    // Usar aggregation para calcular estadísticas por día de semana
    const result = await Tip.aggregate([
      {
        $match: {
          worked: true,
          amount: { $ne: null, $gt: 0 }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Mapear números de día a nombres y formatear
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    
    return result.map(item => ({
      weekday: dayNames[item._id - 1] || 'desconocido',
      total: Math.round(item.total),
      count: item.count,
      average: Math.round(item.average)
    }));
  }
}

module.exports = new GetAverageByWeekday();
