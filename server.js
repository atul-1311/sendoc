const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const mainRouter = require('./routes/index');

app.use(express.json());

const connectDB = require('./config/db');
connectDB();

// Template Engine

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));



// Routes
app.get('/', mainRouter);
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
})