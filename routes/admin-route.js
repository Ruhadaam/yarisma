const express = require('express');
const router = express.Router();
const session = require('express-session');
const db = require('../data/db');
const util = require('util');

const queryAsync = util.promisify(db.query).bind(db);

router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Örnek: Kullanıcı adı ve şifre kontrolü
    const user = await queryAsync('SELECT * FROM users WHERE kullanici_ad = ? AND kullanici_sifre = ?', [username, password]);

    if (user.length > 0) {
      // Login başarılı, session oluştur
      req.session.adminUser = user[0];
      res.redirect('/admin'); // İstediğiniz sayfaya yönlendirme
    } else {
      res.render('admin/login', { error: 'Kullanıcı adı veya şifre hatalı' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/admin/logout', (req, res) => {
  // Session'ı sıfırla
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).send('Internal Server Error');
    } else {

      res.redirect('/admin/login');
    }
  });
});

router.get('/admin/login', (req, res) => {
  res.render('admin/login');
});


const requireAdminLogin = (req, res, next) => {
  if (!req.session.adminUser) {
    res.redirect('/admin/login');
  } else {
    next();
  }
};



//ana sayfa
router.get('/admin', requireAdminLogin, async (req, res) => {
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
      kategoriList: kategoriList
    };


    res.render('admin/admin-index', data);
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).send("Sunucu hatası");
  }
});

//sorular sayfası
router.get('/admin/sorular', requireAdminLogin, requireAdminLogin, async (req, res) => {
  try {
    const sorular = await queryAsync(`SELECT * FROM sorular`);
    const data = {
      value: "admin-sorular",
      title: "Admin-Sorular",
      dataList: sorular
    };

    res.render('admin/admin-index', data);
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).send("Sunucu hatası");
  }
});

router.get('/admin/soru-duzenle/:soru_id', requireAdminLogin, (req, res) => {
  let soru_id = req.params.soru_id;
  db.query(`SELECT * FROM sorular WHERE soru_id = ?`, [soru_id], (err, sorular) => {

    const data = {
      value: "admin-soru-duzenle",
      title: "Admin-Soru-duzenle",
      dataList: sorular
    }
    res.render('admin/admin-index', data)
  });
});

router.post('/admin/soru-duzenle/:soru_id', requireAdminLogin, (req, res) => {
  let soru_id = req.params.soru_id;
  let test_id = req.body.test_id;
  let soru_metni = req.body.soru_metni;
  let soru_aciklama = req.body.soru_aciklama;
  let secenek_a = req.body.secenek_a;
  let secenek_b = req.body.secenek_b;
  let secenek_c = req.body.secenek_c;
  let secenek_d = req.body.secenek_d;
  let secenek_e = req.body.secenek_e;
  let dogru_cevap = req.body.dogru_cevap;


  const sql = `
UPDATE sorular
SET test_id = ?, soru_metni = ?, soru_aciklama = ?, secenek_a = ?, secenek_b = ?, secenek_c = ?, secenek_d = ?,secenek_e = ?, dogru_cevap = ?
WHERE soru_id = ?;
`;

  db.query(sql, [test_id, soru_metni, soru_aciklama, secenek_a, secenek_b, secenek_c, secenek_d, secenek_e, dogru_cevap, soru_id], (error, results) => {
    if (error) {
      console.error('Error updating record:', error);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/admin/sorular');
    }
  })

});


//test ekleme sayfası  
router.get('/admin/test-ekle', requireAdminLogin, (req, res) => {
  db.query('SELECT * FROM kategoriler', (err, sonuc) => {
    const data = {
      value: "admin-test",
      title: "Admin",
      dataList: sonuc

    };

    res.render('admin/admin-index', data);
  });


});


//test ekleme sayfası post
  router.post('/admin/test-ekle', requireAdminLogin, (req, res) => {
    console.log(req.body);
  let test_id = req.body.test_id;
  let soru_metni = req.body.soru_metni;
  let soru_aciklama = req.body.soru_aciklama;
  let secenek_A = req.body.secenekA;
  let secenek_B = req.body.secenekB;
  let secenek_C = req.body.secenekC;
  let secenek_D = req.body.secenekD;
  let secenek_E = req.body.secenekE;
  let dogru_cevap = req.body.dogru_cevap;
  

  
  const query = `
  INSERT INTO sorular (test_id, soru_metni, soru_aciklama, secenek_a, secenek_b, secenek_c, secenek_d, secenek_e, dogru_cevap)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

db.query(query, [test_id, soru_metni, soru_aciklama, secenek_A, secenek_B, secenek_C, secenek_D, secenek_E, dogru_cevap], (err, result) => {
  if (err) {
    console.error('Soru eklenirken hata oluştu:', err);
    res.status(500).send('Internal Server Error');
  } else {
    res.status(200).json({ message: 'Soru başarıyla eklendi..' });
  }
});

    
  });
  



router.get('/admin/edit-question/:soru_id', requireAdminLogin, (req, res) => {
  let soru_id = req.params.soru_id;
  console.log(soru_id);
  db.query(`SELECT * FROM sorular WHERE soru_id = ?`, [soru_id], (err, result) => {
    if (err) {
      console.error('Soru alınırken hata oluştu:', err.message);
      // Hatasını uygun bir şekilde işleyin, örneğin istemciye bir hata yanıtı gönderin.
      res.status(500).json({ hata: 'Soru alınırken hata oluştu' });
    } else {

      res.status(200).json(result[0]); // result bir dizi olduğundan, [0] ile ilk öğeyi alıyoruz.
    }
  });

})

//kategori ekleme sayfası
router.get('/admin/kategori-ekle', requireAdminLogin, (req, res) => {
  db.query('SELECT * FROM kategoriler ORDER BY kategori_id DESC;', (err, sonuc) => {
    const data = {
      value: "admin-kategori",
      title: "Admin",
      dataList: sonuc

    };

    res.render('admin/admin-index', data);
  });


});

router.get('/admin/kategori-duzenle/:kategori_id', requireAdminLogin, (req, res) => {
  let kategori_id = req.params.kategori_id;

  db.query('SELECT * FROM kategoriler WHERE kategori_id = ?', [kategori_id], (err, result) => {
    const data = {
      value: "admin-kategori-duzenle",
      title: "admin-kategori-duzenle",
      dataList: result
    }

    res.render('admin/admin-index', data);


  })

});

router.post('/admin/kategori-duzenle/:kategori_id', requireAdminLogin, (req, res) => {
  let kategori_id = req.params.kategori_id;
  let kategori_ad = req.body.kategori_ad;
  let kategori_aciklama = req.body.kategori_aciklama;
  const sql = `
  UPDATE kategoriler
  SET kategori_ad = ?, kategori_aciklama = ? WHERE kategori_id = ?;
`;

db.query(sql, [kategori_ad, kategori_aciklama, kategori_id], (err, result) => {
  if (err) {
      console.error('Error updating record:', error);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/admin/kategori-ekle');
    }

   


  })

});


//kategori seçme
router.get('/admin/create-category/:categoryId', requireAdminLogin, (req, res) => {
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

//kategori ekleme post
router.post('/admin/kategori-ekle', requireAdminLogin, (req, res) => {

  let baslik = req.body.baslik;
  let aciklama = req.body.aciklama;

  db.query(" INSERT INTO kategoriler(kategori_ad,kategori_aciklama) VALUES (?,?)", [baslik, aciklama]);
  res.redirect("/admin/kategori-ekle");


});

//Kategoriye ait testleri çek
router.get('/admin/get-tests/:categoryId', requireAdminLogin, (req, res) => {
  const categoryId = req.params.categoryId;


  db.query('SELECT * FROM testler WHERE kategori_id = ?', [categoryId], (err, tests) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(tests);
    }
  });
});
//testleri listeler
router.get('/admin/get-tests', requireAdminLogin, (req, res) => {
  db.query(`SELECT * FROM testler `, (err, results) => {
    res.send(results);

  })
});

router.get('/admin/get-category', requireAdminLogin, (req, res) => {
  db.query(`SELECT * FROM kategoriler `, (err, results) => {
    res.send(results);

  })
})



//Soru Ekleme sayfası
router.get('/admin/create/:kategori_id/:kategori_ad/:kategori_aciklama/:test_ad', requireAdminLogin, (req, res) => {
  const kategori_ad = req.params.kategori_ad;
  const kategori_id = req.params.kategori_id;
  const kategori_aciklama = req.params.kategori_aciklama;
  const test_ad = req.params.test_ad;
  console.log(req.params);

  // Yeni testi ekle
  db.query("INSERT INTO testler(kategori_id, kategori_ad, kategori_aciklama, test_ad) VALUES (?, ?, ?, ?)", [kategori_id, kategori_ad, kategori_aciklama, test_ad], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result); // JSON formatında yanıt dön
    }
  });

});

//testid ye ait soruları listeler
router.get('/admin/get-test/:test_id', requireAdminLogin, (req, res) => {
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
//soru silme sayfası
router.delete('/admin/delete-question/:soru_id', requireAdminLogin, (req, res) => {
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
//kategori silme sayfası
router.delete('/admin/delete-kategori/:kategori_id', requireAdminLogin, (req, res) => {
  const kategori_id = req.params.kategori_id;

  db.query('DELETE FROM kategoriler WHERE kategori_id = ?', [kategori_id], (err, result) => {
    if (err) {
      console.error('Kategori silinirken hata oluştu:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json({ message: 'Kategoriler başarıyla silindi.' });
    }
  });
});

router.get('/admin/test-duzenle/:test_id', requireAdminLogin, (req,res) => {
let test_id = req.params.test_id;

db.query('SELECT * FROM testler  WHERE test_id = ?',[test_id], (err,result) => {

  const data = {
    value: "admin-test-duzenle",
    title: "admin-test-duzenle",
    dataList: result
  }

  res.render('admin/admin-index', data);
})



});

//sorular sayfası




module.exports = router;