

# Requirements:

[node.js](https://nodejs.org/en/)

[git](https://git-scm.com/downloads)


# Running application locally

- install `node` and `git`
- run `git clone https://github.com/oc777/MyBooks-CRUD.git` OR download source code directly from GitHub
- from terminal/console `cd` into directory with the project
- run `npm install` and `npm start`
- navigate to `localhost:3000` in your browser


# Report

## 1. Idea

This application is created for personal use to track the books from private library that were lent out to friends.

The main features of the application:
- adding books to library list
- creating contact information for friends that borrow your books
- regestering when a book was loaned out and whom to
- removing a book from loaned list when it is returned
- viewing the list of all current loans
- getting statistics for most popular book ever loaned



## 2. Logical model

E/R diagram

![My Books E/R Diagram](https://raw.githubusercontent.com/oc777/2DV503/master/er_diagram.jpg)

The design includes two entity sets: Book and Friend that are connected together through a relationship 'currently loaned' with its attribute 'date when the book was loaned/borrowed'. Onece the Book is returned, the relation is severed.

Since a Book can be borrowed many times and we want to have Contact information of a Friend directly in the app for convenience, we can't put these two enteties (Books and Friends) in one, since it would create redundance.

Each Book can be borrowed by only one Friend at a time, but each Friend can have multiple loans simultaneously, hence the relation 'many-to-one'.



## 3. Design in SQL

The E/R design can be translated to SQLcollections in SQL as follows:

```
CREATE TABLE IF NOT EXISTS books (
    book_id INTEGER PRIMARY KEY AUTOINCREMENT,
    author VARCHAR(255),
    title VARCHAR(255),
    loans INTEGER NOT NULL DEFAULT 0,
    published INTEGER);
```


```CREATE TABLE IF NOT EXISTS friends (
    friend_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    contact VARCHAR(255));
```

```
CREATE TABLE IF NOT EXISTS loans (
    book_id INTEGER UNIQUE,
    friend_id INTEGER,
    loan_date DATE,
    FOREIGN KEY (book_id) REFERENCES books,
    FOREIGN KEY (friend_id) REFERENCES friends);
```

The primary keys in Books and Friends tables are their IDs, that autoincrement for each new record.

A Book record is created with a default number of loans set to zero, so we can keep track of number of times the book was borrowed and which book is the most popular among the Friends.

The contact information of a Friend is defined as a `VARCHAR` since we can add anything we want there: an email, a phone number or both. If the application was more sophisticated with additional features like sending emails or calling directly from app, it would be more wise to have the contact information separated into several rows. But for the scope of this application, it is sufficient store them all in one field.

The table that represents the Loans has two foreign keys - `book_id` from Books table and `friend_id` from Friends table. I have set a `UNIQUE` constraint on the `book_id`, since the book cannot be borrowed to several people at the same time. If the table was designed to keep both the date of the loan, and the date of the return, then the constraint would not be needed. However, this requirement is not essential and out of the scope of current implamentation. Thus the record is removed once the book is returned.

## 4. SQL queries

Query to list all books with their loan status:
```
SELECT DISTINCT
    books.book_id,
    books.author,
    books.title,
    books.loans,
    loans.loan_date
FROM books
LEFT OUTER JOIN loans ON books.book_id = loans.book_id`
```

Query to list all active loans:
```
SELECT
    books.book_id,
    books.title,
    friends.name,
    friends.contact,
    loans.loan_date
FROM loans
INNER JOIN books ON books.book_id = loans.book_id
INNER JOIN friends ON friends.friend_id = loans.friend_id`

```


Query to find the book with highest loan count:
```
SELECT 
    title, author, loans 
FROM books 
WHERE loans = (SELECT MAX(loans) FROM books)
```



## Video

[YouTube](https://youtu.be/zSPf3wrIDSE)


