'use strict'

const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "./db/db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    } else {
        console.log('Connected to the SQLite database')
        //createTables()
    }
})

const createTables = () => {
    let books_q = `CREATE TABLE IF NOT EXISTS books (
        book_id INTEGER PRIMARY KEY AUTOINCREMENT,
        author VARCHAR(255),
        title VARCHAR(255),
        loans INTEGER NOT NULL DEFAULT 0,
        published INTEGER);`

    let friends_q = `CREATE TABLE IF NOT EXISTS friends (
        friend_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255),
        contact VARCHAR(255));`

    let loans_q = `CREATE TABLE IF NOT EXISTS loans (
        book_id INTEGER UNIQUE,
        friend_id INTEGER,
        loan_date DATE,
        FOREIGN KEY (book_id) REFERENCES books,
        FOREIGN KEY (friend_id) REFERENCES friends);`

    db.serialize(function () {
        db.run('BEGIN TRANSACTION;')
        console.log('creating table books')
        db.run(books_q)
        console.log('creating table friends')
        db.run(friends_q)
        console.log('creating table loans')
        db.run(loans_q)
        db.run('COMMIT')

        //insertData()
    })

}

// Prepared Statements-------------------------------------
const q_insert_book = 'INSERT INTO books (author, title, published) VALUES (?,?,?)'
const q_insert_friend = 'INSERT INTO friends (name, contact) VALUES (?,?)'
const q_insert_loan = 'INSERT INTO loans (book_id, friend_id, loan_date) VALUES (?,?,?)'

const q_get_book = 'SELECT * FROM books WHERE book_id = ?'
const q_get_friend = 'SELECT * FROM friends WHERE friend_id = ?'
const q_get_champ_book = 'SELECT title, author, loans FROM books WHERE loans = ( SELECT MAX(loans) FROM books)'

const q_get_all_books = 'SELECT * FROM books'
const q_get_all_friends = 'SELECT * FROM friends'
const q_get_all_loans = `
    SELECT
        books.book_id,
        books.title,
        friends.name,
        friends.contact,
        loans.loan_date
    FROM loans
    INNER JOIN books ON books.book_id = loans.book_id
    INNER JOIN friends ON friends.friend_id = loans.friend_id`

const q_get_all = `
    SELECT DISTINCT
        books.book_id,
        books.author,
        books.title,
        books.loans,
        loans.loan_date
    FROM books
    LEFT OUTER JOIN loans ON books.book_id = loans.book_id`

const q_update_book_loans = 'UPDATE books SET loans = loans + 1 WHERE book_id = ?'
const q_delete_loan = 'DELETE FROM loans WHERE book_id = ?'
const q_find_book_in_loans ='SELECT EXISTS (SELECT 1 FROM loans WHERE book_id = ?)'
//----------------------------------------------------------

const insertData = () => {
    console.log('Inserting data')
    let book = {
        author:"Tolkien",
        title:"Hobbit", 
        published:1990
    }
    let friend = {
        name:"Tom",
        contact:"tel 012-22-3456"
    }
    let loan = {
        book_id:1,
        friend_id:1
    }

    db.createBook(book)
    db.createFriend(friend)
    db.createLoan(loan)
}

db.createBook = (data) => {
    console.log('Creating new book')
    //let q = 'INSERT INTO books (author, title, published) VALUES (?,?,?)'
    db.run(q_insert_book, [data.author,data.title,data.published])
}

db.createFriend = (data) => {
    console.log('Creating new friend')
    //let q = 'INSERT INTO friends (name, contact) VALUES (?,?)'
    db.run(q_insert_friend, [data.name,data.contact])
}

db.createLoan = (data, res) => {
    console.log('Creating new loan')
    //let loans_q = 'INSERT INTO Loans (book_id, friend_id, loan_date) VALUES (?,?,?)'
    //let books_q = 'UPDATE books SET loans = loans + 1 WHERE book_id = ?'
    let today = new Date().toISOString()
    db.serialize(function () {
        db.run('BEGIN TRANSACTION;')
        db.run(q_insert_loan, [data.book_id,data.friends,today])
        db.run(q_update_book_loans, [data.book_id])
        db.run('COMMIT')

        res.redirect('/')
    })
}

db.getLoan = (id, res) => {
    let book
    db.get(q_get_book, [id], (err, result) => {
        book = result
        db.all(q_get_all_friends, (err, rows) => {
            let locals = { friends: rows.map(
                friend => ({
                        id: friend.friend_id,
                        name: friend.name
                    })
                ),
                book: {
                    id: book.book_id,
                    title: book.title
                }}
            res.render('loans/new', {locals})
        })
    })
}

db.returnLoan = (id, res) => {
    console.log('Returning a loan')
    //let q = 'DELETE FROM loans WHERE book_id = ?'
    db.run(q_delete_loan, [id], (err, result) => {
        res.redirect('/')
    })
}

db.getBook = (id, res) => {
    //let q = 'SELECT * FROM books WHERE book_id = ?'
    db.get(q_get_book, [id], (err, row) => {
        if (err) {
            res.status(400).json({"error":err.message})
            return
        }
        // res.json({
        //     "message":"success",
        //     "data":row
        // })
        return row
    })
}

db.getFriend = (id, res) => {
    //let q = 'SELECT * FROM friends WHERE friend_id = ?'
    db.get(q_get_friend, [id], (err, row) => {
        if (err) {
            res.status(400).json({"error":err.message})
            return
        }
        // res.json({
        //     "message":"success",
        //     "data":row
        // })
        return row
    })
}

db.getAllBooks = (res) => {
    //let q = 'SELECT * FROM books'
    db.all(q_get_all_books, (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message})
            return
        }
        
        let locals = {books: rows.map(
            book => ({
                id: book.book_id,
                title: book.title,
                author: book.author,
                loans: book.loans
            })
        )}
        //console.log(locals)
        res.render('books', { locals })
    })
}

db.getAllFriends = (res) => {
    //let q = 'SELECT * FROM friends'
    db.all(q_get_all_friends, (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message})
            return
        }
        return rows
    })
}


db.getAllLoans = (res) => {
    // let q = `SELECT
    //     book.title,
    //     friend.name
    //     FROM loans
    //     INNER JOIN books ON books.book_id = loans.book_id
    //     INNER JOIN friends ON friends.friend_id = loans.friend_id`

    db.all(q_get_all_loans, (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message})
            return
        }

        let locals = {loans: rows.map(
            loan => ({
                id: loan.book_id,
                title: loan.title,
                name: loan.name,
                contact: loan.contact,
                loan_date: loan.loan_date
            })
        )}
        res.render('loans', {locals})
    })
}

db.isBookLoaned = (id) => {
    let loaned = false
    db.run(q_find_book_in_loans, [id], (err, result) => {
        if (result === true) {
            console.log('book already loaned')
            loaned = true
        }

        return loaned
    })
}

db.getBooksAndLoans = (res) => {
    let q_result
    db.all(q_get_all, (err, result) => {
        if (err) {
            es.status(400).json({"error":err.message})
            return
        }
        q_result = result

        db.get(q_get_champ_book, (err, result) => {
            let locals = {books: q_result.map(
                book => ({
                    id: book.book_id,
                    title: book.title,
                    author: book.author,
                    loans: book.loans,
                    isLoaned: book.loan_date
                })
                ),
                book_champ: {
                    title: result.title,
                    author: result.author
                }
            }

            res.render('books', { locals })
        })

    })

}

module.exports = db