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
        return this.createIntent('GET_MONTH_SUMMARY', { period: 'current_month' });
      }

      // GET_AVERAGE - Consultar promedio
      if (this.isAverageQuery(msg)) {
        return this.createIntent('GET_AVERAGE', { period: 'current_month' });
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
    return /(resumen|total|suma|cuánto llevo|cuanto llevo|mes)/i.test(msg) && !/actualizar|cambiar/i.test(msg);
  }

  /**
   * Detecta si el mensaje es una consulta de promedio
   */
  isAverageQuery(msg) {
    return /(promedio|media|por día|por dia)/i.test(msg);
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
   */
  isSingleEntry(msg) {
    return /\d+/.test(msg);
  }

  // ==================== MÉTODOS DE EXTRACCIÓN ====================

  /**
   * Extrae el monto de propina del mensaje
   * @param {string} msg - Mensaje a analizar
   * @returns {number|null} Monto extraído o null
   */
  extractAmount(msg) {
    // Primero intentar encontrar el último número (para fechas como "26/1/2026 1")
    const allNumbers = msg.match(/\d+/g);
    if (allNumbers && allNumbers.length > 0) {
      // Si hay múltiples números, asumir que el último es el monto
      // y los primeros son parte de la fecha
      const lastNumber = allNumbers[allNumbers.length - 1];
      
      // Validar que sea un monto razonable (no un año)
      const amount = parseInt(lastNumber);
      if (amount < 10000) { // Montos razonables no deberían superar 9999
        return amount;
      }
    }
    
    // Fallback al método original
    const match = msg.match(/\d+/);
    return match ? parseInt(match[0]) : null;
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
      entries: params.entries || null
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
    // Obtener fecha actual normalizada a medianoche
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        return new Date(date);
    }
  }

  /**
   * Obtiene la fecha de hoy en formato ISO
   * @returns {string} Fecha de hoy YYYY-MM-DD
   */
  getTodayISO() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Obtiene la fecha de ayer en formato ISO
   * @returns {string} Fecha de ayer YYYY-MM-DD
   */
  getYesterdayISO() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
}

// Exportar instancia única (Singleton)
module.exports = new AIInterpreter();
