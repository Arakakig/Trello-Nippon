/**
 * Utilitários para manipulação de datas
 * Resolve problemas de fuso horário entre frontend e backend
 */

/**
 * Converte uma string de data do frontend (formato YYYY-MM-DD) para Date no fuso horário local
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {Date|null} - Objeto Date no fuso horário local ou null se inválido
 */
const parseDateFromFrontend = (dateString) => {
  if (!dateString) return null;
  
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Se for formato YYYY-MM-DD, criar data no fuso local
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month é 0-indexed
  }
  
  // Para outros formatos, usar o construtor padrão
  return new Date(dateString);
};

/**
 * Converte uma string de data e hora do frontend para Date no fuso horário local
 * @param {string} dateTimeString - Data e hora no formato ISO ou YYYY-MM-DDTHH:mm:ss
 * @returns {Date|null} - Objeto Date no fuso horário local ou null se inválido
 */
const parseDateTimeFromFrontend = (dateTimeString) => {
  if (!dateTimeString) return null;
  
  if (typeof dateTimeString === 'string') {
    // Se for apenas data (YYYY-MM-DD), adicionar horário padrão
    if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateTimeString.split('-').map(Number);
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    
    // Se for data e hora, usar o construtor padrão
    return new Date(dateTimeString);
  }
  
  return new Date(dateTimeString);
};

/**
 * Formata uma data para o formato YYYY-MM-DD para envio ao frontend
 * @param {Date} date - Objeto Date
 * @returns {string} - Data formatada como YYYY-MM-DD
 */
const formatDateForFrontend = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formata uma data e hora para o formato ISO para envio ao frontend
 * @param {Date} date - Objeto Date
 * @returns {string} - Data e hora formatada como ISO string
 */
const formatDateTimeForFrontend = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

module.exports = {
  parseDateFromFrontend,
  parseDateTimeFromFrontend,
  formatDateForFrontend,
  formatDateTimeForFrontend
};
