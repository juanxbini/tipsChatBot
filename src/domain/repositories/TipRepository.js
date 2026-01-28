/**
 * Repositorio de dominio: TipRepository
 * Archivo: domain/repositories/TipRepository.js
 * Descripción: Proporciona operaciones de base de datos para la entidad Tip
 * 
 * Este repositorio implementa el patrón Repository para abstraer las operaciones
 * de base de datos y proporcionar una interfaz limpia para el acceso a datos
 */

// Importar la entidad Tip para interactuar con la base de datos
const Tip = require('../entities/Tip');

/**
 * Clase TipRepository - Gestiona el acceso a datos de propinas
 * Responsabilidades:
 * - Crear, leer, actualizar y eliminar registros de propinas
 * - Realizar consultas complejas por períodos de tiempo
 * - Calcular estadísticas y totales
 * - Normalizar y gestionar fechas
 */
class TipRepository {
  /**
   * Crea un nuevo registro de propina en la base de datos
   * @param {Object} tipData - Datos de la propina a crear
   * @param {Date} tipData.date - Fecha del registro
   * @param {number} tipData.amount - Monto de la propina (opcional)
   * @param {boolean} tipData.worked - Indica si se trabajó ese día
   * @param {string} tipData.source - Fuente del registro (opcional)
   * @returns {Promise<Object>} Documento de propina creado
   */
  async create(tipData) {
    // Crear nueva instancia del modelo Tip con los datos proporcionados
    const tip = new Tip(tipData);
    // Guardar el documento en la base de datos
    return await tip.save();
  }

  /**
   * Busca un registro de propina por fecha específica
   * @param {Date|string} date - Fecha a buscar (puede ser Date o string)
   * @returns {Promise<Object|null>} Documento de propina encontrado o null
   */
  async findByDate(date) {
    // Si ya es un Date normalizado, usarlo directamente
    // Si es string, normalizarlo
    const searchDate = date instanceof Date ? date : this.normalizeDate(date);
    return await Tip.findOne({ date: searchDate });
  }

  /**
   * Actualiza un registro de propina por fecha
   * Crea el registro si no existe (upsert)
   * @param {Date|string} date - Fecha del registro a actualizar
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Documento actualizado o creado
   */
  async updateByDate(date, updateData) {
    return await Tip.findOneAndUpdate(
      { date: this.normalizeDate(date) },      // Filtro por fecha
      updateData,                               // Datos a actualizar
      { new: true, upsert: true }              // Opciones: retornar doc actualizado, crear si no existe
    );
  }

  /**
   * Busca todos los registros de propinas en un período específico
   * @param {string} period - Período de búsqueda ('current_month' o 'YYYY-MM')
   * @returns {Promise<Array>} Array de documentos de propinas ordenados por fecha
   */
  async findByPeriod(period) {
    const { startDate, endDate } = this.getPeriodDates(period);
    return await Tip.find({
      date: { $gte: startDate, $lte: endDate }  // Rango de fechas
    }).sort({ date: 1 });                        // Ordenar por fecha ascendente
  }

  /**
   * Cuenta los días trabajados en un período específico
   * @param {string} period - Período de conteo ('current_month' o 'YYYY-MM')
   * @returns {Promise<number>} Número de días trabajados
   */
  async getWorkedDaysInPeriod(period) {
    const { startDate, endDate } = this.getPeriodDates(period);
    return await Tip.countDocuments({
      date: { $gte: startDate, $lte: endDate },  // Rango de fechas
      worked: true                               // Solo días trabajados
    });
  }

  /**
   * Obtiene los días no trabajados en un período específico
   * @param {string} period - Período de búsqueda ('current_month' o 'YYYY-MM')
   * @returns {Promise<Array>} Array de documentos de días no trabajados ordenados por fecha
   */
  async getNoWorkDaysInPeriod(period) {
    const { startDate, endDate } = this.getPeriodDates(period);
    return await Tip.find({
      date: { $gte: startDate, $lte: endDate },  // Rango de fechas
      worked: false                              // Solo días no trabajados
    }).sort({ date: 1 });                        // Ordenar por fecha ascendente
  }

  /**
   * Calcula el total y cantidad de propinas en un período específico
   * Usa aggregation pipeline de MongoDB para cálculos eficientes
   * @param {string} period - Período de cálculo ('current_month' o 'YYYY-MM')
   * @returns {Promise<Object>} Objeto con total y cantidad de propinas
   */
  async getTotalTipsInPeriod(period) {
    const { startDate, endDate } = this.getPeriodDates(period);
    
    // Pipeline de aggregation para calcular totales
    const result = await Tip.aggregate([
      {
        // Filtro: solo registros en el rango de fechas, trabajados y con monto
        $match: {
          date: { $gte: startDate, $lte: endDate },
          worked: true,
          amount: { $ne: null }  // Excluir montos nulos
        }
      },
      {
        // Agrupar todos los registros filtrados
        $group: {
          _id: null,              // Agrupar todo en un solo grupo
          total: { $sum: '$amount' },  // Sumar todos los montos
          count: { $sum: 1 }           // Contar número de registros
        }
      }
    ]);
    
    // Retornar resultado o valores por defecto si no hay registros
    return result[0] || { total: 0, count: 0 };
  }

  /**
   * Normaliza una fecha eliminando la hora, minutos, segundos y milisegundos
   * Útil para comparaciones consistentes de fechas
   * @param {Date|string} date - Fecha a normalizar
   * @returns {Date} Fecha normalizada con hora 00:00:00.000
   */
  normalizeDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);  // Establecer hora a medianoche
    return d;
  }

  /**
   * Calcula las fechas de inicio y fin para un período específico
   * Soporta períodos predefinidos y formatos personalizados
   * @param {string} period - Período ('current_month' o 'YYYY-MM')
   * @returns {Object} Objeto con startDate y endDate normalizadas
   * @throws {Error} Si el formato del período no es válido
   */
  getPeriodDates(period) {
    const now = new Date();
    let startDate, endDate;

    // Manejar período del mes actual
    if (period === 'current_month') {
      // Primer día del mes actual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      // Último día del mes actual
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } 
    // Manejar período en formato YYYY-MM (mes específico)
    else if (period && period.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = period.split('-').map(Number);
      // Primer día del mes especificado
      startDate = new Date(year, month - 1, 1);
      // Último día del mes especificado
      endDate = new Date(year, month, 0);
    } else {
      throw new Error('Invalid period format');
    }

    // Retornar fechas normalizadas
    return {
      startDate: this.normalizeDate(startDate),
      endDate: this.normalizeDate(endDate)
    };
  }
}

// Exportar una instancia única de TipRepository (patrón Singleton)
// Esto asegura que toda la aplicación use el mismo repositorio
module.exports = new TipRepository();
