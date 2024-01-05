const express = require('express');
const path = require('path');
const session = require('express-session');
const app = new express();
const router = require('./routes/route');
const adminRoute = require('./routes/admin-route');
const bodyParser = require('body-parser');
if (process.env.NODE_ENV == "production") {
  require('./production');
}





app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);
app.use('/admin', adminRoute);

app.set('view engine', 'ejs');
app.use('/css', express.static(path.join(__dirname, 'views', 'assets', 'css')));
app.use('/flowbite', express.static(path.join(__dirname, 'node_modules', 'flowbite', 'dist')));
app.use('/aos', express.static(path.join(__dirname, 'node_modules', 'aos', 'dist')));

app.use(express.urlencoded({ extended: false }))


app.use(router);
app.use(adminRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {

  console.log(`This serve is using ${port} port`);
})