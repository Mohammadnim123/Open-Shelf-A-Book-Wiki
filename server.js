'use strict';
require('dotenv').config();
const pg = require('pg');
const methodOverride = require('method-override');
const express = require('express');
const superagent = require('superagent');
const { get, post } = require('superagent');

const app = express();
const PORT = process.env.PORT;

app.use(express.static('./public'));
app.use(methodOverride('_method'));
const client = new pg.Client(process.env.DATABASE_URL);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    let SQL = 'SELECT * FROM books;';
    client.query(SQL)
        .then(results => {
            //   console.log(results)
            res.render('pages/index', { results: results.rows });
        })

});

app.get('/books/:id', (req, res) => {
    let SQL = `SELECT * FROM books WHERE id=$1;`;
    let values = [req.params.id];
    // console.log(req.params);
    client.query(SQL, values)
        .then(results => {
            //   console.log(results.rows);
            res.render('pages/books/detail', { singleBook: results.rows[0] });
        })
});

app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new')
});

app.get('/searches', (req, res) => {
    // console.log('Get request', req.query);
    let url;
    let mySearch = req.query.searchbox;
    if (req.query.search == 'author') { url = `https://www.googleapis.com/books/v1/volumes?q=%20+inauthor:${mySearch}` }
    else if (req.query.search == 'title') { url = `https://www.googleapis.com/books/v1/volumes?q=%20+intitle:${mySearch}` }


    superagent.get(url)
        .then(bookData => {
            let DataArr = bookData.body.items;
            // console.log(DataArr)
            let finalArr = DataArr.map(elem => {
                let newObj = new Book(elem);
                return newObj;
            })
            // console.log(finalArr)

            res.render('pages/searches/show', { renderArr: finalArr });

        })
});

function Book(book) {
    if (book.volumeInfo.imageLinks.thumbnail) {
        this.image_url = book.volumeInfo.imageLinks.thumbnail;
    } else { this.image_url = `https://i.imgur.com/J5LVHEL.jpg`; }

    if (book.volumeInfo.title) {
        this.title = book.volumeInfo.title;
    } else { this.title = `not available`; }

    if (book.volumeInfo.authors) {
        this.author = book.volumeInfo.authors;
    } else { this.author = `not available`; }

    if (book.volumeInfo.description) {
        this.description = book.volumeInfo.description;
    } else { this.description = `not available`; }

    if (book.volumeInfo.industryIdentifiers[0].identifier) {
        this.isbn = book.volumeInfo.industryIdentifiers[0].identifier;
    } else { this.isbn = `not available`; }

}


app.post('/books', (req, res) => {

    let { author, title, isbn, image_url, description, bookshelf } = req.body;
    let SQL = `INSERT INTO books (author, title, isbn, image_url, description, bookshelf) VALUES ($1,$2,$3,$4,$5,$6);`;
    let values = [author, title, isbn, image_url, description, bookshelf];
    // console.log(values);
    client.query(SQL, values)
        .then(() => {
            //   let SQL2 = `SELECT * FROM books WHERE isbn=${req.body.isbn};`;
            let SQL2 = `SELECT * FROM books;`;
            client.query(SQL2)
                .then(resalts => {
                    let myIndex = resalts.rows.length - 1

                    res.redirect(`/books/${resalts.rows[myIndex].id}`)
                })
        })
});

app.put('/updatebook/:book_id', (req, res) => {
    let { author, title, isbn, image_url, description, bookshelf } = req.body;
    let SQL = `UPDATE books SET author=$1, title=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7;`;
    let id = req.params.book_id;
    let values = [author, title, isbn, image_url, description, bookshelf, id];

    client.query(SQL, values)
        .then(() => {
            res.redirect(`/books/${id}`)
        })
})

app.delete('/deletebook/:book_id', (req, res) => {
    let SQL = `DELETE FROM books WHERE id=$1;`;
    let values = [req.params.book_id];
    client.query(SQL,values)
    .then (()=>{
      res.redirect('/');
    })
});


app.get('*', (req, res) => {
    res.status(404).render('pages/error');
});

client.connect()
    .then(() => {
        app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
    })
