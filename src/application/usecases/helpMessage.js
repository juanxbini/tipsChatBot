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

📈 **Consultas y Estadísticas:**
• "hoy" - Muestra registro de hoy
• "resumen" - Resumen del mes actual
• "resumen enero 2024" - Resumen de mes específico
• "promedio" - Muestra promedio diario
• "días no trabajados" - Lista días no trabajados

📊 **Estadísticas Avanzadas:**
• "comparar meses" - Compara últimos 3 meses
• "comparar meses 7" - Compara últimos 7 meses (máx 12)
• "tendencia semanal" - Muestra evolución semana a semana
• "mejor día" - Mejor día histórico
• "mejor día esta semana" - Mejor día de la semana actual
• "mejor día este mes" - Mejor día del mes actual
• "promedio por día semana" - Promedio por lunes, martes, etc.

🔄 **Actualizar:**
• "actualizar hoy 600" - Modifica propina de hoy

💡 **Ejemplos de uso:**
• "Hoy hice $350 en propinas"
• "Ayer no trabajé, estuve enfermo"
• "La semana pasada: lunes 200, martes 400, viernes 500"
• "¿Cuánto es el promedio este mes?"
• "Mostrame los días que no trabajé"
• "Comparame los últimos 6 meses"
• "¿Cuál es mi mejor día histórico?"
• "¿Cómo es mi tendencia semanal?"
• "¿Qué día de la semana soy más productivo?"

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
