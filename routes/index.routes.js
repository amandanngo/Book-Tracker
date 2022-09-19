const router = require("express").Router();
const User = require('../models/User.model');
const bcryptjs = require('bcryptjs');
const { isAuthenticated, isNotAuthenticated } = require('../middlewares/auth.middleware');


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/signup", isNotAuthenticated, (req, res, next) => {
  res.render("sign-up");
});

router.post("/signup", (req, res, next) => {
  const myName = req.body.name;
  const myUsername = req.body.username;
  const myPassword = req.body.password;

  const myHashedPass = bcryptjs.hashSync(myPassword);

  User.create({
      name: myName,
      username: myUsername,
      password: myHashedPass
  })
      .then(savedUser => {
          res.send(savedUser)
      })
      .catch(err => {
          res.send(err)
      })
});

router.post('/login', (req,res,next) => {
  console.log(req.body)

  const myUsername = req.body.username;
  const myPassword = req.body.password;


  if(myUsername == '' && myPassword ==''){
    res.redirect('/');
  }else{
    User.findOne({
      username: myUsername
    })
    .then(foundUser => {
      console.log(foundUser);

      if(!foundUser){
        res.send('no user matching this username')
      }

      const isValidPassword = bcryptjs.compareSync(myPassword,foundUser.password)

      if(!isValidPassword){
        res.send('incorrect password')
      }
      req.session.user = foundUser;

        res.redirect('/home');
    })
    .catch(err => res.send(err))
  }

})

router.post('/logout', (req,res,next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect('/');
  });
  
})

router.get('/home', isAuthenticated, (req,res,next) => {
  if(req.session.user){
    res.render('home')
  } else {
      res.redirect('/')
  }
})

router.get('/book-search', isAuthenticated, (req,res,next) => {
  if(req.session.user){
    res.render('book-search')
  } else {
      res.redirect('/')
  }
})

router.get('/currently-reading', isAuthenticated, (req,res,next) => {
  if(req.session.user){
    res.render('currently-reading')
  } else {
      res.redirect('/')
  }
})

router.get('/want-to-read', isAuthenticated, (req,res,next) => {
  if(req.session.user){
    res.render('want-to-read')
  } else {
      res.redirect('/')
  }
})

router.get('/already-read', isAuthenticated, (req,res,next) => {
  if(req.session.user){
    res.render('already-read')
  } else {
      res.redirect('/')
  }
})


module.exports = router;
