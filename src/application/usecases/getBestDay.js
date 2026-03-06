const TipRepository = require('../../domain/repositories/TipRepository');
const Tip = require('../../domain/entities/Tip');

class GetBestDay {
  async execute(intent, chatId) {
    try {
      const period = intent.period || 'all';
      
      let response;
      let bestDayData;
      
      switch (period) {
        case 'this_week':
          bestDayData = await this.getBestDayThisWeek();
          response = `🏆 **Mejor Día de Esta Semana**\n\n`;
          break;
        case 'this_month':
          bestDayData = await this.getBestDayThisMonth();
          response = `🏆 **Mejor Día de Este Mes**\n\n`;
          break;
        default: // 'all'
          bestDayData = await this.getBestDayAllTime();
          response = `🏆 **Mejor Día Histórico**\n\n`;
          break;
      }
      
      if (!bestDayData) {
        response += '❌ No hay registros de propinas para analizar.';
        return response;
      }
      
      // Formatear la fecha del mejor día
      const dateStr = bestDayData.date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      response += `📅 **Fecha:** ${dateStr}\n`;
      response += `💰 **Propinas:** $${bestDayData.amount}\n`;
      
      // Contexto adicional
      if (period === 'all') {
        // Cuánto tiempo hace
        const daysAgo = Math.floor((new Date() - bestDayData.date) / (1000 * 60 * 60 * 24));
        if (daysAgo === 0) {
          response += `🎯 **¡Hoy es tu mejor día!**\n`;
        } else if (daysAgo === 1) {
          response += `⏰ **¡Ayer fue tu mejor día!**\n`;
        } else if (daysAgo <= 7) {
          response += `⏰ **Hace ${daysAgo} días**\n`;
        } else if (daysAgo <= 30) {
          response += `⏰ **Hace ${Math.floor(daysAgo / 7)} semanas**\n`;
        } else if (daysAgo <= 365) {
          response += `⏰ **Hace ${Math.floor(daysAgo / 30)} meses**\n`;
        } else {
          response += `⏰ **Hace ${Math.floor(daysAgo / 365)} años**\n`;
        }
        
        // Comparación con promedio
        const overallAverage = await this.getOverallAverage();
        if (overallAverage > 0) {
          const difference = bestDayData.amount - overallAverage;
          const percentAbove = ((difference / overallAverage) * 100).toFixed(1);
          response += `📈 **${percentAbove}% por encima del promedio** ($${overallAverage})\n`;
        }
      }
      
      // Información adicional según el período
      if (period === 'this_week') {
        const weeklyTotal = await this.getWeeklyTotal();
        const percentage = ((bestDayData.amount / weeklyTotal) * 100).toFixed(1);
        response += `📊 **Representa el ${percentage}% del total semanal**\n`;
      } else if (period === 'this_month') {
        const monthlyTotal = await this.getMonthlyTotal();
        const percentage = ((bestDayData.amount / monthlyTotal) * 100).toFixed(1);
        response += `📊 **Representa el ${percentage}% del total mensual**\n`;
      }
      
      // Día de la semana
      const weekday = bestDayData.date.toLocaleDateString('es-AR', { weekday: 'long' });
      const weekdayEmoji = this.getWeekdayEmoji(weekday);
      response += `${weekdayEmoji} **Día de la semana:** ${weekday}\n`;
      
      return response;
    } catch (error) {
      console.error('GetBestDay Error:', error);
      return '❌ Error al obtener el mejor día. Intentalo de nuevo.';
    }
  }
  
  /**
   * Obtiene el mejor día histórico
   */
  async getBestDayAllTime() {
    // Usar aggregation para encontrar el día con mayor propina
    const result = await Tip.aggregate([
      {
        $match: {
          worked: true,
          amount: { $ne: null, $gt: 0 }
        }
      },
      {
        $sort: { amount: -1 }
      },
      {
        $limit: 1
      }
    ]);
    
    return result[0] || null;
  }
  
  /**
   * Obtiene el mejor día de la semana actual
   */
  async getBestDayThisWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const result = await Tip.aggregate([
      {
        $match: {
          date: { $gte: weekStart, $lte: weekEnd },
          worked: true,
          amount: { $ne: null, $gt: 0 }
        }
      },
      {
        $sort: { amount: -1 }
      },
      {
        $limit: 1
      }
    ]);
    
    return result[0] || null;
  }
  
  /**
   * Obtiene el mejor día del mes actual
   */
  async getBestDayThisMonth() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const result = await Tip.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
          worked: true,
          amount: { $ne: null, $gt: 0 }
        }
      },
      {
        $sort: { amount: -1 }
      },
      {
        $limit: 1
      }
    ]);
    
    return result[0] || null;
  }
  
  /**
   * Obtiene el promedio general de todas las propinas
   */
  async getOverallAverage() {
    const result = await Tip.aggregate([
      {
        $match: {
          worked: true,
          amount: { $ne: null, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$amount' }
        }
      }
    ]);
    
    return result[0] ? Math.round(result[0].average) : 0;
  }
  
  /**
   * Obtiene el total semanal actual
   */
  async getWeeklyTotal() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    
    const result = await Tip.aggregate([
      {
        $match: {
          date: { $gte: weekStart },
          worked: true,
          amount: { $ne: null, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    return result[0] ? result[0].total : 0;
  }
  
  /**
   * Obtiene el total mensual actual
   */
  async getMonthlyTotal() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const result = await Tip.aggregate([
      {
        $match: {
          date: { $gte: monthStart },
          worked: true,
          amount: { $ne: null, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    return result[0] ? result[0].total : 0;
  }
  
  /**
   * Obtiene emoji para el día de la semana
   */
  getWeekdayEmoji(weekday) {
    const emojis = {
      'lunes': '📅',
      'martes': '📅',
      'miércoles': '📅',
      'jueves': '📅',
      'viernes': '🎉',
      'sábado': '🎊',
      'domingo': '🌟'
    };
    return emojis[weekday.toLowerCase()] || '📅';
  }
}

module.exports = new GetBestDay();
