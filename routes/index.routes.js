const router = require("express").Router();
const User = require('../models/User.model');
const bcryptjs = require('bcryptjs');
const { isAuthenticated, isNotAuthenticated } = require('../middlewares/auth.middleware');
const axios = require("axios");
const Book = require("../models/Book.model");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/signup", (req, res, next) => {
  res.render("sign-up");
});

router.post("/signup", (req, res, next) => {

  //Add validation to see if 

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
          res.redirect('/home')
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
    console.log()
    let searchQuery = req.query.lookup;

    axios.get('https://www.googleapis.com/books/v1/volumes?q='+searchQuery)  
    .then(response => {
      res.render('book-search', {
        stuff: response.data.items})
    })
    .catch(err => {
      res.send(err)
    })
  } else {
      res.redirect('/')
  }
})

router.post('/book-search', isAuthenticated, (req,res,next) => {
  Book.create({
    title: req.body.title,
    author:req.body.author,
    listType: req.body.books,
    cover: req.body.imageURL
  })
  .then(newBook => {
    req.session.user.books.push(newBook._id);
    console.log(req.session.user.books,newBook._id)
    res.redirect('/home')
  }) 
  .catch(err => {
    res.send(err)
  })
})

router.get('/currently-reading', isAuthenticated, (req,res,next) => {
  if(req.session.user){
    User.findById(req.session.user._id)
      .populate('books')
      .then(userData => {
        res.send(req.session.user)
      })
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
