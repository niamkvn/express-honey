var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home Page' });
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login Page' });
});
router.get('/home', function(req, res, next) {
  res.render('home', { title: 'Home Page' });
});

router.post('/login', function(req, res, next) {
  const adminEmail = "admin@acompany.com";
  const adminPassword = "admin123";

  const { email, password } = req.body;
  if(email == adminEmail && password == adminPassword){
    return res.redirect("/home");
  }
  res.status(401).render('login', { title: 'Login Page', errorMessage: "Login failed, Invalid email or password." });
  // return res.status(401).json({ title: 'Login Page'});
});

module.exports = router;
