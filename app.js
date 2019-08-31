'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const exphbs = require('express-handlebars')
const routes = require('./server/server.js')



const app = express()
const port = process.env.PORT || 3000

// Parse application/x-www-form-urlencoded.
app.use(bodyParser.urlencoded({ extended: true }))
// Parse json
app.use(bodyParser.json())



// Configure rendering engine, with change extension to .hbs
app.use(express.static(__dirname + '/public'))
app.engine('hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    partialsLayout: 'partials'
}))

// Setup view engine.
app.set('view engine', 'hbs')


// Define routes and API.
app.use('/', routes)


// catch 404
app.use((req, res, next) => {
    res.status(404)
})

// Start listening.
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})