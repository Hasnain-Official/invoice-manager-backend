const Utils = require('../utils');

const getEmptyVendors = (data = []) => {
  const invoiceNumber = data.filter((item, index) => (!item['Vendor Code'] || !item['Vendor name'] || !item['Vendor type']) ? true : false).map(item=> item['Invoice Numbers']);
  return invoiceNumber;
};

const getInvalidInvoiceNumbers = (data = [], key = 'Invoice Numbers') => {
  const invoiceNumbers = data.map(item => item[key]);
  const invalidInvoiceNumbers = invoiceNumbers.filter(item => item === 0);
  return [...new Set(invalidInvoiceNumbers)];
}
const getDuplicatesData = (data = [], key = 'Invoice Numbers') => {
  const invoiceNumbers = data.map(item => item[key]).sort((a, b) => a - b);
  const duplicteInvoices = invoiceNumbers.filter((item, index) => invoiceNumbers.indexOf(item, index + 1) !== -1);
  return [...new Set(duplicteInvoices)];
};

const getFutureDates = (data = [], postingDateKey = 'Pstng Date', dueDateKey = 'Net due dt') => {
  const expireInvoices = data.filter(item => {
    const postingTimestamp = new Date(item[postingDateKey]).getTime();
    const dueTimestamp = new Date(item[dueDateKey]).getTime();
    return postingTimestamp > dueTimestamp ? true : false;
  }).map(item => item['Invoice Numbers']);
  return [...new Set(expireInvoices)];
};

const validateInvoices = (data = []) => {
  
  const emptyVendors = getEmptyVendors(data);
  if (emptyVendors.length) {
    return {
      error: `There are no vendor details for invoice number(s) ${emptyVendors.join(', ')}. Please fill and re-upload.`
    }
  }
  
  if (!data.length) {
    return {
      error: 'There is no data in the file.'
    }
  }

  const duplicateResults = getDuplicatesData(data);
  const expireInvoices = getFutureDates(data);
  const invalidInvoiceNumbers = getInvalidInvoiceNumbers(data);

  const invalidInvoices = data.filter(item => 
    [...new Set([
    ...duplicateResults,
   ...expireInvoices,
   ...invalidInvoiceNumbers
 ])].includes(item['Invoice Numbers']));

  const validInvoices = data.filter(invoice => !invalidInvoices.some(item => item['Invoice Numbers'] === invoice['Invoice Numbers']));

  const totalAmount = validInvoices.reduce((acc, item) => acc += typeof item['Amt in loc.cur.'] === 'number' ? item['Amt in loc.cur.'] : 0, 0);
  const validVendors = [...new Set(validInvoices.map(item => item['Vendor Code']))];

  return {
    data: {
      total_invoices: data.length,
      number_of_invalid_invoices: invalidInvoices.length,
      number_of_vendors: validVendors.length,
      total_amount: totalAmount,
    },
  };
};

exports.processInvoice = (req, res) => {
  const file = req.body && req.body.file;
  const fileData = Utils.readExcelAsJson(file) || [];
  const result = validateInvoices(fileData);
  return res.status(200).json({ ...result });
};
