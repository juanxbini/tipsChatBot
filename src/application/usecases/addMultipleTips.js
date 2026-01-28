const TipRepository = require('../../domain/repositories/TipRepository');
const aiInterpreter = require('../services/aiInterpreter');

class AddMultipleTips {
  async execute(intent, chatId) {
    try {
      if (!intent.entries || !Array.isArray(intent.entries) || intent.entries.length === 0) {
        return '❌ Necesito las fechas y montos para registrar múltiples propinas.';
      }

      const results = [];
      let successCount = 0;
      let conflictCount = 0;

      for (const entry of intent.entries) {
        try {
          const date = aiInterpreter.normalizeDate(entry.date);
          const existingTip = await TipRepository.findByDate(date);

          if (existingTip) {
            results.push(`⚠️ ${date.toLocaleDateString('es-AR')}: ya existe`);
            conflictCount++;
          } else {
            const tipData = {
              date: date,
              amount: entry.amount,
              worked: true,
              source: 'telegram'
            };

            await TipRepository.create(tipData);
            results.push(`✅ ${date.toLocaleDateString('es-AR')}: $${entry.amount}`);
            successCount++;
          }
        } catch (error) {
          results.push(`❌ Error en ${entry.date}`);
        }
      }

      let response = `📊 Resultado:\n${results.join('\n')}\n\n`;
      response += `✅ Exitosos: ${successCount} | ⚠️ Conflictos: ${conflictCount}`;
      
      if (conflictCount > 0) {
        response += '\n\n💡 Usá "actualizar" para modificar los existentes.';
      }

      return response;
    } catch (error) {
      console.error('AddMultipleTips Error:', error);
      return '❌ Error al registrar las propinas. Intentalo de nuevo.';
    }
  }
}

module.exports = new AddMultipleTips();
