const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

var apiRouter = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use('/api', apiRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));