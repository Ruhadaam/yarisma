const express = require('express');
const router = express.Router();
const db = require('../data/db');
const util = require('util');
const queryAsync = util.promisify(db.query).bind(db);
//KULLANICI YÖNLENDİRMELERİ
router.get('/', (req, res) => {
  db.query("select * from kategoriler", function (err, response) {

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

  db.query('SELECT * FROM sorular WHERE test_id = ?', [test_id], function (err, sonuc) {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const data = {
      value: "pages/testing/",
      title: `${test_id}-Testler`,
      dataList: sonuc
    };


    res.render('index', data);
  });
});

router.get('/pages/test/:kategori_Id', (req, res) => {
  let kategori_Id = req.params.kategori_Id;
  db.query(`SELECT * FROM testler WHERE kategori_Id = ${kategori_Id}`, (err, sonuc) => {
    const data = {
      value: "pages/tests",
      title: "Testler",
      dataList: sonuc // Tüm kategorileri içeren dizi
    };

    res.render('index', data);

  });


});


//ADMİN YÖNLENDİRMELERİ
router.get('/admin', async (req, res) => {
  try {
    const kategoriResult = await queryAsync(`SELECT COUNT(*) AS kategori_sayisi FROM kategoriler`);
    const testResult = await queryAsync(`SELECT COUNT(*) AS test_sayisi FROM testler`);
    const soruResult = await queryAsync(`SELECT COUNT(*) AS soru_sayisi FROM sorular`);
    const kategoriList = await queryAsync(`SELECT kategori_id, kategori_ad,COUNT(*) AS test_sayisi FROM testler GROUP BY kategori_id, kategori_ad ORDER BY test_sayisi DESC LIMIT 5;`);
    const data = {
      value: "admin-content",
      title: "Admin",
      kategori_sayisi: kategoriResult[0].kategori_sayisi,
      test_sayisi: testResult[0].test_sayisi,
      soru_sayisi: soruResult[0].soru_sayisi,
      kategoriList:kategoriList
    };
    console.log(kategoriList);

    res.render('admin/admin-index', data);
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).send("Sunucu hatası");
  }
});


router.get('/admin/test-ekle', (req, res) => {
  db.query('SELECT * FROM kategoriler', (err, sonuc) => {
    const data = {
      value: "admin-test",
      title: "Admin",
      dataList: sonuc

    };

    res.render('admin/admin-index', data);
  });


});

router.post('/admin/test-ekle', (req, res) => {
  let test_id = req.body.test;
  let soru_metni = req.body.soru_metni;
  let soru_aciklama = req.body.soru_aciklama;
  let secenek_A = req.body.secenekA;
  let secenek_B = req.body.secenekB;
  let secenek_C = req.body.secenekC;
  let secenek_D = req.body.secenekD;
  let dogru_cevap = req.body.dogru_cevap;



  const query = `
  INSERT INTO sorular (test_id, soru_metni, soru_aciklama, secenek_a, secenek_b, secenek_c, secenek_d, dogru_cevap)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

  db.query(query, [test_id, soru_metni, soru_aciklama, secenek_A, secenek_B, secenek_C, secenek_D, dogru_cevap], (err, result) => {
    if (err) {
      console.error('Soru eklenirken hata oluştu:', err);
      // Hata durumunda bir şey yapabilirsiniz, örneğin istemciye bir hata mesajı gönderebilirsiniz.
    } else {
      console.log('Soru başarıyla eklendi.');

    }
  });

});


router.get('/admin/kategori-ekle', (req, res) => {
  db.query('SELECT * FROM kategoriler ORDER BY kategori_id DESC;', (err, sonuc) => {
    const data = {
      value: "admin-kategori",
      title: "Admin",
      dataList: sonuc

    };

    res.render('admin/admin-index', data);
  });


});

router.get('/admin/create-category/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;

  // Kategoriye ait testleri çek
  db.query('SELECT * FROM kategoriler WHERE kategori_id = ?', [categoryId], (err, tests) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(tests); // JSON formatında yanıt dön
    }
  });
});

router.post('/admin/kategori-ekle', (req, res) => {

  let baslik = req.body.baslik;
  let aciklama = req.body.aciklama;

  db.query(" INSERT INTO kategoriler(kategori_ad,kategori_aciklama) VALUES (?,?)", [baslik, aciklama]);
  res.redirect("/admin/kategori-ekle");


});

router.get('/admin/get-tests/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;

  // Kategoriye ait testleri çek
  db.query('SELECT * FROM testler WHERE kategori_id = ?', [categoryId], (err, tests) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(tests); // JSON formatında yanıt dön
    }
  });
});

router.get('/admin/create/:kategori_id/:kategori_ad/:kategori_aciklama', (req, res) => {
  const kategori_ad = req.params.kategori_ad;
  const kategori_id = req.params.kategori_id;
  const kategori_aciklama = req.params.kategori_aciklama;

  // Mevcut kategori_id'ye ait test sayısını al
  db.query("SELECT COUNT(*) as test_sayisi FROM testler WHERE kategori_id = ?", [kategori_id], (err, countResult) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const testSayisi = countResult[0].test_sayisi;



      // Yeni test adını belirle (örneğin, kategori_ad + test_sayisi)
      const yeni_test_ad = kategori_ad + "-" + (testSayisi + 1);

      // Yeni testi ekle
      db.query("INSERT INTO testler(kategori_id, kategori_ad, kategori_aciklama, test_ad) VALUES (?, ?, ?, ?)", [kategori_id, kategori_ad, kategori_aciklama, yeni_test_ad], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.json(result); // JSON formatında yanıt dön
        }
      });
    }
  });
});

router.get('/admin/get-test/:test_id', (req, res) => {
  let test_id = req.params.test_id;


  db.query("SELECT * FROM sorular WHERE test_id=?", [test_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {

      res.json(result); // JSON formatında yanıt dön
    }
  });

});

router.delete('/admin/delete-question/:soru_id', (req, res) => {
  const soru_id = req.params.soru_id;

  db.query('DELETE FROM sorular WHERE soru_id = ?', [soru_id], (err, result) => {
    if (err) {
      console.error('Soru silinirken hata oluştu:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json({ message: 'Soru başarıyla silindi.' });
    }
  });
});



module.exports = router;