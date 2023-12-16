const express = require('express');
const path = require('path');
const session = require('express-session');
const app = new express();
const router = require('./routes/route');
const adminRoute = require('./routes/admin-route');


// express-session middleware'ini kullanın
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));
  
  // Diğer middleware'leri ve ayarları ekleyin
  
  app.use('/', router);
  app.use('/admin', adminRoute);

app.set('view engine', 'ejs');
app.use('/css', express.static(path.join(__dirname, 'views', 'assets', 'css')));
app.use('/flowbite', express.static(path.join(__dirname, 'node_modules', 'flowbite', 'dist')));
app.use('/aos', express.static(path.join(__dirname, 'node_modules', 'aos', 'dist')));

app.use(express.urlencoded({ extended: false}))


app.use(router);
app.use(adminRoute);



app.listen(3000, () => {

    console.log('This serve is using 3000 port');
})