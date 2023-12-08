const express = require('express');
const path = require('path');
const app = new express();
const router = require('./routes/route');



app.set('view engine', 'ejs');
app.use('/css', express.static(path.join(__dirname, 'views', 'assets', 'css')));
app.use('/flowbite', express.static(path.join(__dirname, 'node_modules', 'flowbite', 'dist')));

app.use(express.urlencoded({ extended: false}))


app.use(router);



app.listen(3000, () => {

    console.log('This serve is using 3000 port');
})