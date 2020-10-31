const XLSX = require('xlsx');

exports.readExcelAsJson = file => {
	try {
		const workbook = XLSX.read(file, { type: 'base64', cellDates: true });
		const sheetName = workbook.SheetNames[0];
		return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
	} catch (err) {
		return null;
	}
};