'use strict';
require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const { get } = require('superagent');

const app = express();
const PORT = process.env.PORT;

app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {

    res.render('pages/index');
});

app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new')
});

app.get('/searches', (req, res) => {
    // console.log('Get request', req.query);
    if (req.query.search == 'author') {
        let mySearch = req.query.searchbox
        let url = `https://www.googleapis.com/books/v1/volumes?q=%20+inauthor:${mySearch}`
        superagent.get(url)
        .then(bookData => {
            let DataArr = bookData.body.items;
            // console.log(DataArr)
            let finalArr = DataArr.map(elem => {
                let newObj = new Book (elem);
                return newObj;
            })

            res.render('pages/searches/show',{renderArr : finalArr});

        })
    }
    else if (req.query.search == 'title') {
        let mySearch = req.query.searchbox
        let url = `https://www.googleapis.com/books/v1/volumes?q=%20+intitle:${mySearch}`
        superagent.get(url)
        .then(bookData => {
            let DataArr = bookData.body.items;
            // console.log(DataArr)
            let finalArr = DataArr.map(elem => {
                let newObj = new Book (elem);
                return newObj;
            })
            console.log(finalArr)

            res.render('pages/searches/show',{renderArr : finalArr});

        })
    }


    
});

function Book(book) {
    this.img_url = book.volumeInfo.imageLinks.thumbnail;
    this.title = book.volumeInfo.title;
    this.author = book.volumeInfo.authors;
    this.description = book.volumeInfo.description;
}

// app.get('/pages/searches/show',(req,res) => {
//     console.log(req.query)



// })    

app.get('*', (req, res) => {
    res.status(404).send(`This route doesn't exist`);
});

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
});