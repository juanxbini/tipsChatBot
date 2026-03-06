const addTip = require('../usecases/addTip');
const updateTip = require('../usecases/updateTip');
const addMultipleTips = require('../usecases/addMultipleTips');
const markNoWork = require('../usecases/markNoWork');
const getToday = require('../usecases/getToday');
const getSummary = require('../usecases/getSummary');
const getAverage = require('../usecases/getAverage');
const getNoWorkDays = require('../usecases/getNoWorkDays');
const getCompareMonths = require('../usecases/getCompareMonths');
const getWeeklyTrend = require('../usecases/getWeeklyTrend');
const getBestDay = require('../usecases/getBestDay');
const getAverageByWeekday = require('../usecases/getAverageByWeekday');
const helpMessage = require('../usecases/helpMessage');
const cheatsheetMessage = require('../usecases/cheatsheetMessage');

class IntentRouter {
  async route(intent, chatId) {
    try {
      switch (intent.intent) {
        case 'ADD_TIP':
          return await addTip.execute(intent, chatId);
        
        case 'UPDATE_TIP':
          return await updateTip.execute(intent, chatId);
        
        case 'ADD_MULTIPLE_TIPS':
          return await addMultipleTips.execute(intent, chatId);
        
        case 'MARK_NO_WORK':
          return await markNoWork.execute(intent, chatId);
        
        case 'GET_TODAY':
          return await getToday.execute(intent, chatId);
        
        case 'GET_MONTH_SUMMARY':
          return await getSummary.execute(intent, chatId);
        
        case 'GET_AVERAGE':
          return await getAverage.execute(intent, chatId);
        
        case 'GET_NO_WORK_DAYS':
          return await getNoWorkDays.execute(intent, chatId);
        
        case 'COMPARE_MONTHS':
          return await getCompareMonths.execute(intent, chatId);
        
        case 'WEEKLY_TREND':
          return await getWeeklyTrend.execute(intent, chatId);
        
        case 'BEST_DAY':
          return await getBestDay.execute(intent, chatId);
        
        case 'AVERAGE_BY_WEEKDAY':
          return await getAverageByWeekday.execute(intent, chatId);
        
        case 'HELP':
          return await helpMessage.execute(intent, chatId);
        
        case 'CHEATSHEET':
          return await cheatsheetMessage.execute(intent, chatId);
        
        case 'UNKNOWN':
        default:
          return '❌ No entendí lo que querés decir. Intentá con "ayuda" para ver los comandos disponibles.';
      }
    } catch (error) {
      console.error('Intent Router Error:', error);
      return '❌ Ocurrió un error al procesar tu solicitud. Intentalo de nuevo.';
    }
  }

  validateIntent(intent) {
    if (!intent || !intent.intent) {
      return false;
    }

    switch (intent.intent) {
      case 'ADD_TIP':
        return intent.date && intent.amount !== null;
      
      case 'UPDATE_TIP':
        return intent.date && intent.amount !== null;
      
      case 'ADD_MULTIPLE_TIPS':
        return intent.entries && Array.isArray(intent.entries) && intent.entries.length > 0;
      
      case 'MARK_NO_WORK':
        return intent.date !== null;
      
      case 'GET_TODAY':
        return true;
      
      case 'GET_MONTH_SUMMARY':
        return intent.period !== null;
      
      case 'GET_AVERAGE':
        return intent.period !== null;
      
      case 'GET_NO_WORK_DAYS':
        return intent.period !== null;
      
      case 'COMPARE_MONTHS':
        return intent.months !== null && intent.months > 0;
      
      case 'WEEKLY_TREND':
        return true;
      
      case 'BEST_DAY':
        return intent.period !== null;
      
      case 'AVERAGE_BY_WEEKDAY':
        return true;
      
      case 'HELP':
        return true;
      
      case 'CHEATSHEET':
        return true;
      
      case 'UNKNOWN':
      default:
        return false;
    }
  }
}

module.exports = new IntentRouter();
