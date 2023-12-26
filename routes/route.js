const express = require('express');
const router = express.Router();
const db = require('../data/db');
const util = require('util');
const queryAsync = util.promisify(db.query).bind(db);
//KULLANICI YÖNLENDİRMELERİ
router.get('/', (req, res) => {
  db.query("SELECT * FROM kategoriler ORDER BY kategori_id DESC;", function (err, response) {

    const data = {
      value: "template/content",
      title: "Ana Sayfa",
      dataList: response
    };

    res.render('index', data);
  });
}

);



router.get('/pages/testing/:test_id', (req, res) => {
  let test_id = req.params.test_id;

  // İlk olarak test_id'yi kullanarak testler tablosundan kategori_ad'ı alalım
  db.query('SELECT test_ad FROM testler WHERE test_id = ? ORDER BY test_id ASC', [test_id], function (err, testResult) {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Ardından test_id'yi kullanarak sorular tablosundan soruları alalım
    db.query('SELECT * FROM sorular WHERE test_id = ? ORDER BY soru_id ASC', [test_id], function (err, questionResult) {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
        return;
      }
    
      const data = {
        value: "pages/testing/",
        title: `${test_id}-Testler`,
        test_ad: (testResult.length > 0) ? testResult[0].test_ad : "", // İlk sıradaki kategori_ad'ı alır
        dataList: questionResult
      };
    
      res.render('index', data);
    });
    
    });
  });




router.get('/iletisim', (req,res) => {

  const data = {
    value: "template/contact",
    title: "İletişim"
  };

  res.render('index', data);
});


router.get('/pages/test/:kategori_Id', (req, res) => {
  let kategori_Id = req.params.kategori_Id;
  db.query(`SELECT * FROM testler WHERE kategori_Id = ${kategori_Id} ORDER BY kategori_id DESC`, (err, sonuc) => {
    const data = {
      value: "pages/tests",
      title: "Testler",
      dataList: sonuc // Tüm kategorileri içeren dizi
    };

    res.render('index', data);

  });


});

module.exports = router;