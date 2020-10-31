const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/InvoiceController');

router.post('/', InvoiceController.processInvoice);

module.exports = router;