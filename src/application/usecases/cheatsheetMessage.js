class CheatsheetMessage {
  async execute(intent, chatId) {
    const cheatsheetText = `🚀 **CHEATSHEET - Bot de Propinas**

⚡ **COMANDOS RÁPIDOS:**

💰 **REGISTRAR:**
• hoy 500
• ayer 300  
• lunes 200, martes 400

🗑️ **ELIMINAR:**
• hoy no trabajé
• ayer no trabajé

✏️ **ACTUALIZAR:**
• actualizar hoy 600
• cambiar hoy 600

📊 **CONSULTAR:**
• hoy
• resumen
• promedio
• días no trabajados

❓ **AYUDA:**
• ayuda
• chear
• tips

---
💡 *Usá "chear" para ver esta guía rápida*`;

    return cheatsheetText;
  }
}

module.exports = new CheatsheetMessage();
