'use strict'

const express = require('express')
const db = require('../db/db.js')
const router = express.Router()

router.route('/')
    .get((req, res) => {
        db.getBooksAndLoans(res)
    })

router.route('/books')
    .get((req, res, next) => {
        db.getBooksAndLoans(res)
    })
router.route('/books/new')
    .get((req, res, next) => {
        res.render('books/new')
    })
    .post((req, res, next) => {
        db.createBook(req.body)
        res.redirect('..')
    })
router.route('/books/:id')
    .get((re, res, next) => {
        db.getBook(req.params.id)
    })

router.route('/friends')
    .get((req, res, next) => {
        db.getAllFriends(res)
    })
router.route('/friends/new')
    .get((req, res, next) => {
        res.render('friends/new')
    })
    .post((req, res, next) => {
        db.createFriend(req.body)
        res.redirect('..')
    })
router.route('/friends/:id')
    .get((req, res, next) => {
        db.getFriend(req.params.id)
    })

router.route('/loans')
    .get((req, res, next) => {
        db.getAllLoans(res)
    })
router.route('/loans/new/:id')
    .get((req, res, next) => {
        db.getLoan(req.params.id, res)
    })
    .post((req, res, next) => {
        db.createLoan(req.body, res)
    })
router.route('/loans/delete/:id')
    .get((req, res, next) => {
        db.returnLoan(req.params.id, res)
    })

router.route('/all')
    .get((req, res) => {
        db.getBooksAndLoans(res)
    })
module.exports = router