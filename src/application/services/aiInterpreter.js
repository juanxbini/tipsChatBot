/**
 * Servicio de Interpretación de Mensajes (Sin IA - REGEX)
 * Archivo: application/services/aiInterpreter.js
 * Descripción: Interpreta mensajes usando expresiones regulares y lógica de patrones
 * 
 * Este módulo reemplaza la interpretación por IA con un sistema basado en reglas
 * que es más rápido, predecible y sin costos de API
 */

class AIInterpreter {
  /**
   * Interpreta un mensaje de texto y retorna la intención estructurada
   * @param {string} message - Mensaje del usuario a interpretar
   * @returns {Promise<Object>} Objeto con la intención detectada
   */
  async interpretMessage(message) {
    try {
      const msg = message.toLowerCase().trim();
      console.log(`🧠 Interpretando con REGEX: "${message}"`);

      // HELP - Solicitud de ayuda
      if (this.isHelpRequest(msg)) {
        // Si es específicamente "chear" o "cheatsheet", mostrar versión corta
        if (/(chear|cheatsheet|tips|guía|guiar)/i.test(msg)) {
          return this.createIntent('CHEATSHEET');
        }
        return this.createIntent('HELP');
      }

      // GET_MONTH_SUMMARY - Consultar resumen del mes
      if (this.isSummaryQuery(msg)) {
        console.log(`✅ Resumen detectado, parseando período...`);
        const period = this.parseSummaryPeriod(msg);
        return this.createIntent('GET_MONTH_SUMMARY', { period });
      }

      // GET_AVERAGE - Consultar promedio
      if (this.isAverageQuery(msg)) {
        return this.createIntent('GET_AVERAGE', { period: 'current_month' });
      }

      // COMPARE_MONTHS - Comparar meses
      if (this.isCompareMonthsQuery(msg)) {
        console.log(`✅ Comparar meses detectado, extrayendo cantidad...`);
        const months = this.extractMonthsToCompare(msg);
        console.log(`📊 Meses a comparar: ${months}`);
        return this.createIntent('COMPARE_MONTHS', { months });
      }

      // WEEKLY_TREND - Tendencia semanal
      if (this.isWeeklyTrendQuery(msg)) {
        return this.createIntent('WEEKLY_TREND');
      }

      // BEST_DAY - Mejor día
      if (this.isBestDayQuery(msg)) {
        console.log(`✅ Mejor día detectado, extrayendo período...`);
        const period = this.extractBestDayPeriod(msg);
        return this.createIntent('BEST_DAY', { period });
      }

      // AVERAGE_BY_WEEKDAY - Promedio por día de semana
      if (this.isAverageByWeekdayQuery(msg)) {
        return this.createIntent('AVERAGE_BY_WEEKDAY');
      }

      // GET_NO_WORK_DAYS - Consultar días no trabajados
      if (this.isNotWorkedDaysQuery(msg)) {
        return this.createIntent('GET_NO_WORK_DAYS', { period: 'current_month' });
      }

      // GET_TODAY - Solo "hoy" sin números (consulta)
      if (this.isTodayQuery(msg)) {
        return this.createIntent('GET_TODAY');
      }

      // MARK_NO_WORK - Marcar día como no trabajado
      if (this.isNotWorkedMarking(msg)) {
        const date = this.parseDate(msg);
        return this.createIntent('MARK_NO_WORK', { date });
      }

      // UPDATE_TIP - Actualizar propina existente
      if (this.isUpdateRequest(msg)) {
        const amount = this.extractAmount(msg);
        const date = this.parseDate(msg);
        return this.createIntent('UPDATE_TIP', { date, amount });
      }

      // ADD_MULTIPLE_TIPS - Múltiples entradas
      if (this.isMultipleEntries(msg)) {
        const entries = this.parseMultipleEntries(msg);
        return this.createIntent('ADD_MULTIPLE_TIPS', { entries });
      }

      // ADD_TIP - Una sola entrada
      if (this.isSingleEntry(msg)) {
        const amount = this.extractAmount(msg);
        const date = this.parseDate(msg);
        return this.createIntent('ADD_TIP', { date, amount });
      }

      // UNKNOWN - No se pudo determinar la intención
      console.log('⚠️ Intención desconocida');
      return this.createIntent('UNKNOWN');

    } catch (error) {
      console.error('❌ Error interpretando mensaje:', error);
      return this.createIntent('UNKNOWN');
    }
  }

  // ==================== MÉTODOS DE DETECCIÓN ====================

  /**
   * Detecta si el mensaje es una solicitud de ayuda
   */
  isHelpRequest(msg) {
    return /(ayuda|help|comandos|\?|qué puedo|que puedo|cómo usar|como usar|chear|cheatsheet|guía|guiar|tips)/i.test(msg);
  }

  /**
   * Detecta si el mensaje es una consulta de resumen
   */
  isSummaryQuery(msg) {
    console.log(`🔍 Verificando resumen en: "${msg}"`);
    const result = /(resumen|total|suma|cuánto llevo|cuanto llevo)/i.test(msg) && !/actualizar|cambiar/i.test(msg);
    console.log(`🎯 Resultado resumen: ${result}`);
    return result;
  }

  /**
   * Detecta si el mensaje es una consulta de promedio
   */
  isAverageQuery(msg) {
    return /(promedio|media|por día|por dia)/i.test(msg);
  }

  /**
   * Detecta si el mensaje es una consulta de comparación de meses
   */
  isCompareMonthsQuery(msg) {
    console.log(`🔍 Verificando comparar meses en: "${msg}"`);
    const result = /(comparar\s+\d+\s+meses|comparar\s+meses|compara\s+meses|comparación\s+meses)/i.test(msg);
    console.log(`🎯 Resultado comparar meses: ${result}`);
    return result;
  }

  /**
   * Detecta si el mensaje es una consulta de tendencia semanal
   */
  isWeeklyTrendQuery(msg) {
    return /(tendencia semanal|tendencia semana|evolución semanal)/i.test(msg);
  }

  /**
   * Detecta si el mensaje es una consulta del mejor día
   */
  isBestDayQuery(msg) {
    console.log(`🔍 Verificando mejor día en: "${msg}"`);
    const result = /(mejor día|mejor dia|día mejor|dia mejor)/i.test(msg);
    console.log(`🎯 Resultado mejor día: ${result}`);
    return result;
  }

  /**
   * Detecta si el mensaje es una consulta de promedio por día de semana
   */
  isAverageByWeekdayQuery(msg) {
    return /(promedio por día semana|promedio por dia semana|promedio lunes|promedio martes|promedio miércoles|promedio jueves|promedio viernes|promedio sábado|promedio domingo)/i.test(msg);
  }

  /**
   * Detecta si el mensaje consulta días no trabajados
   */
  isNotWorkedDaysQuery(msg) {
    return /(días no trabajados|dias no trabajados|cuándo no trabaj|cuando no trabaj|qué días|que dias)/i.test(msg);
  }

  /**
   * Detecta si el mensaje solo consulta "hoy"
   */
  isTodayQuery(msg) {
    return /^(hoy|today)$/i.test(msg);
  }

  /**
   * Detecta si el mensaje marca un día como no trabajado
   */
  isNotWorkedMarking(msg) {
    return /(no trabaj[eé]|no fui|descanso|franco|libre|día libre|dia libre)/i.test(msg);
  }

  /**
   * Detecta si el mensaje es una actualización de propina
   */
  isUpdateRequest(msg) {
    return /(actualizar|cambiar|modificar|corregir|editar)/i.test(msg) && /\d+/.test(msg);
  }

  /**
   * Detecta si el mensaje contiene múltiples entradas
   */
  isMultipleEntries(msg) {
    return msg.includes(',') && /\d+/.test(msg);
  }

  /**
   * Detecta si el mensaje es un registro de propina simple
   * Ahora es más estricto para evitar falsos positivos
   */
  isSingleEntry(msg) {
    // No debe contener palabras de comandos de estadísticas
    const statisticalKeywords = /(comparar|tendencia|mejor|promedio|resumen|meses|mes|día|dia|semana|año)/i;
    
    // No debe ser una pregunta
    const questionPatterns = /(¿|cuánto|cuanto|qué|que|cómo|como|dónde|donde|cuándo|cuando)/i;
    
    // No debe ser solo un número o comando
    const justNumber = /^\d+$/.test(msg.trim());
    
    // Debe tener un número pero no ser comando estadístico ni pregunta
    const hasNumber = /\d+/.test(msg);
    const hasStatistical = statisticalKeywords.test(msg);
    const hasQuestion = questionPatterns.test(msg);
    
    console.log(`🔍 Verificando single entry en: "${msg}"`);
    console.log(`  - Tiene número: ${hasNumber}`);
    console.log(`  - Tiene estadísticas: ${hasStatistical}`);
    console.log(`  - Tiene pregunta: ${hasQuestion}`);
    console.log(`  - Es solo número: ${justNumber}`);
    
    const result = hasNumber && !hasStatistical && !hasQuestion && !justNumber;
    console.log(`🎯 Resultado single entry: ${result}`);
    
    return result;
  }

  // ==================== MÉTODOS DE EXTRACCIÓN ====================

  /**
   * Extrae el monto de propina del mensaje
   * @param {string} msg - Mensaje a analizar
   * @returns {number|null} Monto extraído o null
   */
  extractAmount(msg) {
    // Para comandos de actualización, buscar patrones específicos primero
    if (/(actualizar|cambiar|modificar|corregir|editar)/i.test(msg)) {
      // Patrones para actualizar: "actualizar 2/3/26 500" o "actualizar 500 2/3/26"
      const updatePatterns = [
        // actualizar fecha monto
        /(\d{1,2}\/\d{1,2}(?:\/\d{4})?)\s+(\d+)/,
        // actualizar monto fecha  
        /(\d+)\s+(\d{1,2}\/\d{1,2}(?:\/\d{4})?)/
      ];
      
      for (const pattern of updatePatterns) {
        const match = msg.match(pattern);
        if (match) {
          // Determinar cuál es el monto (siempre el que no parece fecha)
          const candidate1 = parseInt(match[1]);
          const candidate2 = parseInt(match[2]);
          
          // El monto razonable no debería superar 9999 ni ser un año válido
          if (candidate1 < 10000 && candidate1 > 0) {
            return candidate1;
          }
          if (candidate2 < 10000 && candidate2 > 0) {
            return candidate2;
          }
        }
      }
    }
    
    // Método general: buscar todos los números
    const allNumbers = msg.match(/\d+/g);
    if (allNumbers && allNumbers.length > 0) {
      // Si hay múltiples números, intentar identificar cuál es el monto
      const amounts = allNumbers.map(n => parseInt(n)).filter(n => n > 0 && n < 10000);
      
      if (amounts.length > 0) {
        // Devolver el último monto válido encontrado
        return amounts[amounts.length - 1];
      }
    }
    
    // Fallback: buscar cualquier número razonable
    const match = msg.match(/\d+/);
    if (match) {
      const amount = parseInt(match[0]);
      return (amount > 0 && amount < 10000) ? amount : null;
    }
    
    return null;
  }

  /**
   * Parsea múltiples entradas separadas por comas
   * @param {string} msg - Mensaje con múltiples entradas
   * @returns {Array<Object>} Array de objetos {date, amount}
   */
  parseMultipleEntries(msg) {
    const parts = msg.split(',').map(p => p.trim());
    
    return parts
      .map(part => {
        const amount = this.extractAmount(part);
        if (!amount) return null;
        
        const date = this.parseDate(part);
        return { date, amount };
      })
      .filter(entry => entry !== null); // Filtrar entradas inválidas
  }

  /**
   * Extrae la cantidad de meses a comparar
   * @param {string} msg - Mensaje a analizar
   * @returns {number} Cantidad de meses (3 por defecto, máximo 12)
   */
  extractMonthsToCompare(msg) {
    // Buscar patrón: "comparar 2 meses", "comparar meses 7" o "comparar meses 12"
    const match = msg.match(/comparar\s+(\d+)\s+meses|comparar meses\s+(\d+)/i);
    if (match) {
      // El número puede estar en match[1] o match[2] dependiendo del patrón
      const months = parseInt(match[1] || match[2]);
      // Limitar entre 1 y 12 meses
      return Math.min(Math.max(months, 1), 12);
    }
    return 3; // Por defecto: 3 meses
  }

  /**
   * Extrae el período para "mejor día"
   * @param {string} msg - Mensaje a analizar
   * @returns {string} Período: 'all', 'this_week', 'this_month'
   */
  extractBestDayPeriod(msg) {
    const lowerMsg = msg.toLowerCase();
    
    if (/(esta semana|semana actual)/i.test(msg)) {
      return 'this_week';
    }
    if (/(este mes|mes actual)/i.test(msg)) {
      return 'this_month';
    }
    
    return 'all'; // Por defecto: histórico
  }

  /**
   * Parsea el período para resúmenes desde el mensaje
   * Soporta: "resumen", "resumen enero", "resumen enero 2024", "resumen 1/2024", "resumen diciembre 2023"
   * @param {string} msg - Mensaje a analizar
   * @returns {string} Período en formato 'current_month' o 'YYYY-MM'
   */
  parseSummaryPeriod(msg) {
    // Por defecto: mes actual
    let period = 'current_month';
    
    // Mapeo de meses en español a números
    const monthMap = {
      'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
      'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
      'septiembre': '09', 'setiembre': '09', 'octubre': '10', 
      'noviembre': '11', 'diciembre': '12'
    };
    
    // Buscar patrones de mes específico
    const lowerMsg = msg.toLowerCase();
    
    // Patrón: "resumen enero 2024" o "resumen enero"
    for (const [monthName, monthNum] of Object.entries(monthMap)) {
      // Buscar el nombre del mes con o sin año después
      const monthPattern = new RegExp(`\\b${monthName}\\b(\\s+(\\d{4}))?`, 'i');
      const match = lowerMsg.match(monthPattern);
      if (match) {
        const year = match[2] || new Date().getFullYear();
        period = `${year}-${monthNum}`;
        console.log(`📅 Mes detectado: ${monthName} ${year} → ${period}`);
        break;
      }
    }
    
    // Patrón: "resumen 1/2024" o "resumen 12/2023"
    const monthYearPattern = /(\d{1,2})\/(\d{4})/;
    const monthYearMatch = lowerMsg.match(monthYearPattern);
    if (monthYearMatch) {
      const month = monthYearMatch[1].padStart(2, '0');
      const year = monthYearMatch[2];
      period = `${year}-${month}`;
    }
    
    // Patrón: "resumen 2024" (todo el año - usar enero)
    const yearPattern = /resumen\s+(\d{4})/;
    const yearMatch = lowerMsg.match(yearPattern);
    if (yearMatch && period === 'current_month') {
      const year = yearMatch[1];
      period = `${year}-01`; // Enero del año especificado
    }
    
    console.log(`📅 Período detectado: ${period}`);
    return period;
  }

  /**
   * Parsea la fecha del mensaje
   * Soporta: "hoy", "ayer", días de la semana, fechas ISO (YYYY-MM-DD), fechas DD/MM/YYYY
   * @param {string} msg - Mensaje a analizar
   * @returns {string} Fecha en formato relativo o YYYY-MM-DD
   */
  parseDate(msg) {
    // Fecha específica: 2024-01-15 (formato ISO)
    const isoDateMatch = msg.match(/\d{4}-\d{2}-\d{2}/);
    if (isoDateMatch) {
      return isoDateMatch[0];
    }

    // Fecha específica: 26/1/2026 (formato DD/MM/YYYY)
    const dmyDateMatch = msg.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmyDateMatch) {
      const [, day, month, year] = dmyDateMatch;
      // Convertir a formato YYYY-MM-DD
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }

    // Fecha específica: 26/1 (formato DD/MM - asume año actual)
    const dmMatch = msg.match(/(\d{1,2})\/(\d{1,2})(?!\/)/);
    if (dmMatch) {
      const [, day, month] = dmMatch;
      const currentYear = new Date().getFullYear();
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      return `${currentYear}-${paddedMonth}-${paddedDay}`;
    }

    // Hoy
    if (/(hoy|today)/i.test(msg)) {
      return 'today';
    }
    
    // Ayer
    if (/(ayer|yesterday)/i.test(msg)) {
      return 'yesterday';
    }

    // Días de la semana (asume última ocurrencia)
    const dayMap = {
      'lunes': 'two_days_ago',
      'martes': 'yesterday',
      'miércoles': 'today',
      'miercoles': 'today',
      'jueves': 'today',
      'viernes': 'today',
      'sábado': 'today',
      'sabado': 'today',
      'domingo': 'today'
    };

    for (const [day, relativeDate] of Object.entries(dayMap)) {
      if (msg.includes(day)) {
        return relativeDate;
      }
    }

    // Default: hoy
    return 'today';
  }

  /**
   * Crea un objeto de intención estructurado compatible con el proyecto
   * @param {string} intent - Tipo de intención
   * @param {Object} params - Parámetros adicionales (date, amount, entries, period)
   * @returns {Object} Objeto de intención
   */
  createIntent(intent, params = {}) {
    const result = {
      intent,
      date: params.date || null,
      amount: params.amount || null,
      period: params.period || null,
      entries: params.entries || null,
      months: params.months || null
    };

    console.log('✅ Intención creada:', result);
    return result;
  }

  // ==================== MÉTODOS DE VALIDACIÓN (Mantener compatibilidad) ====================

  /**
   * Valida y normaliza una intención detectada
   * Asegura que todos los campos cumplan con los formatos esperados
   * @param {Object} intent - Intención a validar
   * @returns {Object} Intención validada y normalizada
   */
  validateIntent(intent) {
    // Lista de intenciones válidas permitidas por el sistema
    const validIntents = [
      "ADD_TIP", "UPDATE_TIP", "ADD_MULTIPLE_TIPS", "MARK_NO_WORK", 
      "GET_TODAY", "GET_MONTH_SUMMARY", "GET_AVERAGE", "GET_NO_WORK_DAYS", 
      "COMPARE_MONTHS", "WEEKLY_TREND", "BEST_DAY", "AVERAGE_BY_WEEKDAY",
      "HELP", "CHEATSHEET", "UNKNOWN"
    ];

    // Validar que la intención sea una de las permitidas
    if (!validIntents.includes(intent.intent)) {
      intent.intent = "UNKNOWN";
    }

    // Validar formato de la fecha si está presente
    if (intent.date && !this.isValidDate(intent.date)) {
      intent.date = null;
    }

    // Validar que el monto sea un número positivo
    if (intent.amount && (typeof intent.amount !== 'number' || intent.amount < 0)) {
      intent.amount = null;
    }

    // Validar formato del período si está presente
    if (intent.period && !this.isValidPeriod(intent.period)) {
      intent.period = null;
    }

    // Validar y filtrar entradas múltiples si existen
    if (intent.entries && Array.isArray(intent.entries)) {
      intent.entries = intent.entries.filter(entry => 
        entry.date && this.isValidDate(entry.date) && 
        entry.amount && typeof entry.amount === 'number' && entry.amount >= 0
      );
    }

    return intent;
  }

  /**
   * Valida el formato de una fecha
   * @param {string} date - Fecha a validar
   * @returns {boolean} True si la fecha es válida, false en caso contrario
   */
  isValidDate(date) {
    // Fechas relativas permitidas
    if (date === "today" || date === "yesterday" || date === "two_days_ago") {
      return true;
    }
    // Formato de fecha absoluta YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }

  /**
   * Valida el formato de un período
   * @param {string} period - Período a validar
   * @returns {boolean} True si el período es válido, false en caso contrario
   */
  isValidPeriod(period) {
    // Período actual o formato YYYY-MM
    return period === "current_month" || /^\d{4}-\d{2}$/.test(period);
  }

  /**
   * Convierte fechas relativas a objetos Date absolutos
   * @param {string} date - Fecha relativa o absoluta
   * @returns {Date} Objeto Date correspondiente
   */
  normalizeDate(date) {
    // Obtener fecha actual normalizada a medianoche en zona horaria de Argentina
    const today = new Date();
    // Ajustar a zona horaria de Argentina (UTC-3)
    const argentinaOffset = -3;
    const localOffset = today.getTimezoneOffset() / 60;
    const offsetDiff = localOffset - argentinaOffset;
    
    today.setHours(0, 0, 0, 0);
    today.setHours(today.getHours() + offsetDiff);

    // Convertir fechas relativas a absolutas
    switch (date) {
      case "today":
        return today;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      case "two_days_ago":
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        return twoDaysAgo;
      default:
        // Para fechas en formato YYYY-MM-DD, crear objeto Date directamente
        // y ajustar a zona horaria de Argentina
        const absoluteDate = new Date(date);
        absoluteDate.setHours(absoluteDate.getHours() + offsetDiff);
        return absoluteDate;
    }
  }

  /**
   * Obtiene la fecha de hoy en formato ISO (ajustada a zona horaria de Argentina)
   * @returns {string} Fecha de hoy YYYY-MM-DD
   */
  getTodayISO() {
    const today = new Date();
    // Ajustar a zona horaria de Argentina (UTC-3)
    const argentinaOffset = -3;
    const localOffset = today.getTimezoneOffset() / 60;
    const offsetDiff = localOffset - argentinaOffset;
    
    today.setHours(today.getHours() + offsetDiff);
    return today.toISOString().split('T')[0];
  }

  /**
   * Obtiene la fecha de ayer en formato ISO (ajustada a zona horaria de Argentina)
   * @returns {string} Fecha de ayer YYYY-MM-DD
   */
  getYesterdayISO() {
    const yesterday = new Date();
    // Ajustar a zona horaria de Argentina (UTC-3)
    const argentinaOffset = -3;
    const localOffset = yesterday.getTimezoneOffset() / 60;
    const offsetDiff = localOffset - argentinaOffset;
    
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(yesterday.getHours() + offsetDiff);
    return yesterday.toISOString().split('T')[0];
  }
}

// Exportar instancia única (Singleton)
module.exports = new AIInterpreter();
