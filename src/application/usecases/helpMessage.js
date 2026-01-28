class HelpMessage {
  async execute(intent, chatId) {
    const helpText = `🤖 **Bot de Propinas - Ayuda**

💬 **Comandos disponibles:**

📝 **Registrar propinas:**
• "hoy hice 500" - Registra propina de hoy
• "ayer 300" - Registra propina de ayer  
• "2024-01-15 450" - Registra propina de fecha específica

📊 **Múltiples días:**
• "lunes 300, martes 450, miércoles 200" - Registra varios días

🚫 **Marcar no trabajado:**
• "hoy no trabajé" - Marca hoy como no trabajado
• "ayer no trabajé" - Marca ayer como no trabajado

📈 **Consultas:**
• "hoy" - Muestra registro de hoy
• "resumen" o "resumen del mes" - Muestra resumen mensual
• "promedio" - Muestra promedio diario
• "días no trabajados" - Lista días no trabajados

🔄 **Actualizar:**
• "actualizar hoy 600" - Modifica propina de hoy

💡 **Ejemplos de uso:**
• "Hoy hice $350 en propinas"
• "Ayer no trabajé, estuve enfermo"
• "La semana pasada: lunes 200, martes 400, viernes 500"
• "¿Cuánto es el promedio este mes?"
• "Mostrame los días que no trabajé"

🎯 **Tips:**
• Podés escribir en lenguaje natural
• El bot entiende fechas relativas (hoy, ayer, etc.)
• Usá pesos ($) o números, da igual
• El recordatorio diario llega a las 23hs

❓ ¿Necesitás más ayuda? Escribí "ayuda" o "chear" nuevamente.`;

    return helpText;
  }
}

module.exports = new HelpMessage();
