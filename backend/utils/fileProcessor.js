const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');

/**
 * Processa um arquivo CSV e retorna os dados em formato de array
 */
async function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    console.log(`[DEBUG] Processando arquivo CSV: ${filePath}`);
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Log para datas no CSV
        Object.keys(data).forEach(key => {
          if (key.toLowerCase().includes('data') && data[key]) {
            console.log(`[DEBUG] CSV - Coluna "${key}": "${data[key]}" (tipo: ${typeof data[key]})`);
          }
        });
        results.push(data);
      })
      .on('end', () => {
        console.log(`[DEBUG] CSV processado: ${results.length} linhas`);
        resolve(results);
      })
      .on('error', (error) => reject(error));
  });
}

/**
 * Processa um arquivo Excel e retorna os dados em formato de array
 */
async function processExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Pega a primeira planilha
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`[DEBUG] Processando arquivo Excel: ${filePath}`);
    
    // Primeiro, vamos tentar sem configurações especiais
    let data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Retorna como array de arrays
      defval: '', // Valor padrão para células vazias
      raw: false, // Não retornar valores brutos (importante para datas)
      dateNF: 'dd/mm/yyyy' // Formato de data brasileiro
    });
    
    // Se temos dados, converter para formato de objeto
    if (data.length > 0) {
      const headers = data[0]; // Primeira linha são os cabeçalhos
      const rows = data.slice(1); // Resto são os dados
      
      // Converter para array de objetos
      const objectData = rows.map((row, rowIndex) => {
        const obj = {};
        headers.forEach((header, index) => {
          if (header && header.trim()) {
            const value = row[index] || '';
            obj[header.trim()] = value;
            
            // Log para datas
            if (header.toLowerCase().includes('data') && value) {
              console.log(`[DEBUG] Linha ${rowIndex + 2}, Coluna "${header.trim()}": "${value}" (tipo: ${typeof value})`);
            }
          }
        });
        return obj;
      });
      
      return objectData;
    }
    
    return [];
  } catch (error) {
    console.error('Erro detalhado no processamento Excel:', error);
    throw new Error('Erro ao processar arquivo Excel: ' + error.message);
  }
}

/**
 * Mapeia os dados do arquivo para o formato esperado do cliente
 */
function mapClientData(row, columnMapping, vendors = []) {
  const clientData = {};
  
  // Mapear cada campo baseado na configuração
  Object.keys(columnMapping).forEach(field => {
    const columnName = columnMapping[field];
    if (columnName && row[columnName] !== undefined) {
      let value = row[columnName];
      
      // Processar valores específicos
      switch (field) {
        case 'adhesionValue':
          // Converter para número (formato brasileiro R$ 46,60)
          if (value) {
            let numStr = value.toString().trim();
            // Remover R$ e espaços
            numStr = numStr.replace(/R\$\s*/g, '').replace(/\s/g, '');
            // Substituir vírgula por ponto para parseFloat
            numStr = numStr.replace(',', '.');
            // Remover caracteres não numéricos exceto ponto
            numStr = numStr.replace(/[^\d.-]/g, '');
            value = parseFloat(numStr) || 0;
          } else {
            value = 0;
          }
          break;
        case 'adhesionDate':
        case 'contractDate':
        case 'dueDate':
          // Converter datas (suporte a formato brasileiro DD/MM/YYYY e Excel)
          if (value && value.toString().trim() !== '') {
            let date;
            const dateStr = value.toString().trim();
            console.log(`[DEBUG] Processando data para campo ${field}: "${dateStr}"`);
            
            // Verificar se é um número (pode ser serial number do Excel)
            if (!isNaN(dateStr) && (dateStr.includes('.') || !dateStr.includes('/'))) {
              // Pode ser um serial number do Excel
              const excelDate = parseFloat(dateStr);
              console.log(`[DEBUG] Detectado número do Excel: ${excelDate}`);
              
              if (excelDate > 25569) { // Data válida do Excel (após 1970)
                // Converter serial number do Excel para data
                const excelEpoch = new Date(1900, 0, 1);
                const days = excelDate - 2; // Excel tem bug do ano 1900
                date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
                if (!isNaN(date.getTime())) {
                  value = date.toISOString().split('T')[0];
                  console.log(`[DEBUG] Data do Excel convertida: ${value}`);
                } else {
                  console.warn(`[DEBUG] Data inválida do Excel: ${dateStr}`);
                  value = '';
                }
              } else {
                console.warn(`[DEBUG] Serial number muito baixo: ${dateStr}`);
                value = '';
              }
            }
            // Verificar se é formato ISO (YYYY-MM-DD)
            else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              console.log(`[DEBUG] Detectado formato ISO: ${dateStr}`);
              date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                value = date.toISOString().split('T')[0];
                console.log(`[DEBUG] Data ISO processada: ${value}`);
              } else {
                console.warn(`[DEBUG] Data ISO inválida: ${dateStr}`);
                value = '';
              }
            }
            // Verificar se é formato americano MM/DD/YYYY
            else if (dateStr.includes('/') && dateStr.split('/').length === 3) {
              const parts = dateStr.split('/');
              console.log(`[DEBUG] Detectado formato com /: partes = [${parts.join(', ')}]`);
              
              if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                // Tentar primeiro formato brasileiro DD/MM/YYYY
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
                const year = parseInt(parts[2], 10);
                
                console.log(`[DEBUG] Tentando DD/MM/YYYY: day=${day}, month=${month}, year=${year}`);
                
                // Validar se os valores são válidos para formato brasileiro
                if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
                  date = new Date(year, month, day);
                  
                  // Verificar se a data criada é válida (evita 31/02 que vira 03/03)
                  if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
                    value = date.toISOString().split('T')[0];
                    console.log(`[DEBUG] Data processada com formato DD/MM/YYYY: ${value}`);
                  } else {
                    // Tentar formato americano MM/DD/YYYY
                    const monthUS = parseInt(parts[0], 10) - 1;
                    const dayUS = parseInt(parts[1], 10);
                    const yearUS = parseInt(parts[2], 10);
                    
                    console.log(`[DEBUG] Tentando MM/DD/YYYY: month=${monthUS}, day=${dayUS}, year=${yearUS}`);
                    
                    if (monthUS >= 0 && monthUS <= 11 && dayUS >= 1 && dayUS <= 31 && yearUS >= 1900 && yearUS <= 2100) {
                      date = new Date(yearUS, monthUS, dayUS);
                      
                      if (date.getDate() === dayUS && date.getMonth() === monthUS && date.getFullYear() === yearUS) {
                        value = date.toISOString().split('T')[0];
                        console.log(`[DEBUG] Data processada com formato MM/DD/YYYY: ${value}`);
                      } else {
                        console.warn(`[DEBUG] Data inválida em ambos os formatos: ${dateStr}`);
                        value = '';
                      }
                    } else {
                      console.warn(`[DEBUG] Valores de data inválidos: ${dateStr}`);
                      value = '';
                    }
                  }
                } else {
                  console.warn(`[DEBUG] Valores de data inválidos: ${dateStr}`);
                  value = '';
                }
              } else {
                console.log(`[DEBUG] Formato não reconhecido, tentando formato padrão: ${dateStr}`);
                // Tentar formato padrão
                date = new Date(value);
                if (!isNaN(date.getTime())) {
                  value = date.toISOString().split('T')[0];
                  console.log(`[DEBUG] Data processada com formato padrão: ${value}`);
                } else {
                  console.warn(`[DEBUG] Data inválida no formato padrão: ${dateStr}`);
                  value = '';
                }
              }
            } else {
              // Verificar se já é um objeto Date
              if (value instanceof Date) {
                if (!isNaN(value.getTime())) {
                  value = value.toISOString().split('T')[0];
                  console.log(`[DEBUG] Data já é objeto Date: ${value}`);
                } else {
                  console.warn(`[DEBUG] Objeto Date inválido: ${value}`);
                  value = '';
                }
              } else {
                // Tentar formato padrão
                date = new Date(value);
                if (!isNaN(date.getTime())) {
                  value = date.toISOString().split('T')[0];
                  console.log(`[DEBUG] Data processada com formato padrão: ${value}`);
                } else {
                  console.warn(`[DEBUG] Data inválida no formato padrão: ${dateStr}`);
                  value = '';
                }
              }
            }
          } else {
            value = '';
          }
          break;
        case 'homeVisit':
          // Converter para boolean (suporte a "FALSO", "VERDADEIRO", etc.)
          if (value) {
            const boolStr = value.toString().toLowerCase().trim();
            value = boolStr === 'sim' || boolStr === 'true' || boolStr === 'verdadeiro' || boolStr === '1' || boolStr === 'yes';
          } else {
            value = false;
          }
          break;
        case 'paid':
          // Converter para boolean (suporte a "PAGO", "SIM", etc.)
          if (value) {
            const boolStr = value.toString().toLowerCase().trim();
            value = boolStr === 'sim' || boolStr === 'true' || boolStr === 'verdadeiro' || boolStr === '1' || boolStr === 'yes' || boolStr === 'pago' || boolStr === 'paid';
          } else {
            value = false;
          }
          break;
        case 'vendor':
          // Buscar vendedor pelo nome
          if (value && value.toString().trim()) {
            const vendorName = value.toString().trim();
            const vendor = vendors.find(v => v.name.toLowerCase() === vendorName.toLowerCase());
            value = vendor ? vendor._id : null;
          } else {
            value = null;
          }
          break;
        case 'listMonth':
          // Converter para formato padrão
          if (value && value.toString().trim()) {
            const month = value.toString().trim().toLowerCase();
            const monthMap = {
              'jan': 'janeiro', 'january': 'janeiro', '01': 'janeiro',
              'fev': 'fevereiro', 'feb': 'fevereiro', 'february': 'fevereiro', '02': 'fevereiro',
              'mar': 'março', 'march': 'março', '03': 'março',
              'abr': 'abril', 'apr': 'abril', 'april': 'abril', '04': 'abril',
              'mai': 'maio', 'may': 'maio', '05': 'maio',
              'jun': 'junho', 'june': 'junho', '06': 'junho',
              'jul': 'julho', 'july': 'julho', '07': 'julho',
              'ago': 'agosto', 'aug': 'agosto', 'august': 'agosto', '08': 'agosto',
              'set': 'setembro', 'sep': 'setembro', 'september': 'setembro', '09': 'setembro',
              'out': 'outubro', 'oct': 'outubro', 'october': 'outubro', '10': 'outubro',
              'nov': 'novembro', 'november': 'novembro', '11': 'novembro',
              'dez': 'dezembro', 'dec': 'dezembro', 'december': 'dezembro', '12': 'dezembro'
            };
            value = monthMap[month] || month;
          } else {
            value = new Date().toLocaleDateString('pt-BR', { month: 'long' });
          }
          break;
        case 'listYear':
          // Converter para número
          if (value && value.toString().trim()) {
            const year = parseInt(value.toString().trim());
            value = isNaN(year) ? new Date().getFullYear() : year;
          } else {
            value = new Date().getFullYear();
          }
          break;
        default:
          // Manter como string, removendo espaços extras
          value = value ? value.toString().trim() : '';
      }
      
      clientData[field] = value;
    }
  });
  
  return clientData;
}

/**
 * Valida os dados do cliente
 */
function validateClientData(clientData) {
  const errors = [];
  
  // Apenas validações de formato, sem campos obrigatórios
  // (os campos obrigatórios são filtrados na rota de importação)
  
  // Validações específicas
  if (clientData.adhesionValue && (isNaN(clientData.adhesionValue) || clientData.adhesionValue < 0)) {
    errors.push('Valor da adesão deve ser um número positivo');
  }
  
  if (clientData.adhesionDate && clientData.adhesionDate !== '' && isNaN(new Date(clientData.adhesionDate).getTime())) {
    errors.push('Data da adesão inválida');
  }
  
  if (clientData.contractDate && clientData.contractDate !== '' && isNaN(new Date(clientData.contractDate).getTime())) {
    errors.push('Data do contrato inválida');
  }
  
  if (clientData.dueDate && clientData.dueDate !== '' && isNaN(new Date(clientData.dueDate).getTime())) {
    errors.push('Data de vencimento inválida');
  }
  
  return errors;
}

/**
 * Processa um arquivo (CSV ou Excel) e retorna os dados mapeados
 */
async function processFile(filePath, columnMapping, vendors = []) {
  const fileExtension = path.extname(filePath).toLowerCase();
  let rawData;
  
  try {
    if (fileExtension === '.csv') {
      rawData = await processCSV(filePath);
    } else if (['.xls', '.xlsx'].includes(fileExtension)) {
      rawData = await processExcel(filePath);
    } else {
      throw new Error('Formato de arquivo não suportado');
    }
    
    // Mapear e validar os dados
    const processedData = [];
    const errors = [];
    
    rawData.forEach((row, index) => {
      try {
        const clientData = mapClientData(row, columnMapping, vendors);
        const validationErrors = validateClientData(clientData);
        
        if (validationErrors.length > 0) {
          errors.push({
            row: index + 2, // +2 porque começa na linha 2 (linha 1 é cabeçalho)
            errors: validationErrors
          });
        } else {
          processedData.push(clientData);
        }
      } catch (error) {
        console.error(`Erro ao processar linha ${index + 2}:`, error);
        errors.push({
          row: index + 2,
          errors: [`Erro ao processar linha: ${error.message}`]
        });
      }
    });
    
    // Extrair colunas disponíveis do primeiro registro
    const columns = rawData.length > 0 ? Object.keys(rawData[0]) : [];
    
    return {
      success: true,
      data: processedData,
      errors: errors,
      totalRows: rawData.length,
      validRows: processedData.length,
      invalidRows: errors.length,
      columns: columns
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: [],
      errors: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      columns: []
    };
  }
}

/**
 * Remove arquivo temporário
 */
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Erro ao remover arquivo temporário:', error);
  }
}

module.exports = {
  processFile,
  cleanupFile,
  mapClientData,
  validateClientData
};

