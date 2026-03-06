class GetServerDate {
  async execute(intent, chatId) {
    try {
      // Obtener fecha y hora actual del servidor
      const serverDate = new Date();
      
      // Obtener información de zona horaria
      const timezoneOffset = serverDate.getTimezoneOffset(); // Offset en minutos
      const timezoneHours = Math.abs(timezoneOffset) / 60;
      const timezoneSign = timezoneOffset > 0 ? '-' : '+';
      
      // Formatear fecha y hora local del servidor
      const localDate = new Date(serverDate.getTime() - (timezoneOffset * 60 * 1000));
      
      // Fecha y hora en diferentes formatos
      const fechaLocal = localDate.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const horaLocal = localDate.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      const fechaISO = localDate.toISOString().split('T')[0];
      const horaISO = localDate.toTimeString().split(' ')[0];
      
      // Fecha y hora UTC
      const fechaUTC = serverDate.toISOString().split('T')[0];
      const horaUTC = serverDate.toTimeString().split(' ')[0];
      
      // Información de zona horaria de Argentina
      const argentinaDate = new Date(serverDate.getTime() - (3 * 60 * 60 * 1000));
      const fechaArgentina = argentinaDate.toLocaleDateString('es-AR');
      const horaArgentina = argentinaDate.toLocaleTimeString('es-AR');
      
      let response = `🕐 **Fecha y Hora del Servidor**\n\n`;
      
      response += `📍 **Configuración Local del Servidor:**\n`;
      response += `📅 Fecha: ${fechaLocal}\n`;
      response += `⏰ Hora: ${horaLocal}\n`;
      response += `🌐 Zona horaria: UTC${timezoneSign}${timezoneHours.toFixed(0)}\n\n`;
      
      response += `🌍 **Formatos Técnicos:**\n`;
      response += `📆 ISO Fecha: ${fechaISO}\n`;
      response += `⏱️ ISO Hora: ${horaISO}\n`;
      response += `🕐 UTC Fecha: ${fechaUTC}\n`;
      response += `🌏 UTC Hora: ${horaUTC}\n\n`;
      
      response += `🇦🇷 **Referencia Argentina (UTC-3):**\n`;
      response += `📅 Fecha AR: ${fechaArgentina}\n`;
      response += `⏰ Hora AR: ${horaArgentina}\n\n`;
      
      response += `💡 **Información para el Bot:**\n`;
      response += `• El bot usa zona horaria de Argentina (UTC-3)\n`;
      response += `• Los registros se guardan con fecha ajustada\n`;
      response += `• Los recordatorios usan hora de Argentina\n`;
      
      return response;
    } catch (error) {
      console.error('GetServerDate Error:', error);
      return '❌ Error al obtener fecha del servidor. Intentalo de nuevo.';
    }
  }
}

module.exports = new GetServerDate();
