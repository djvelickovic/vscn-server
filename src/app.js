const express = require('express')
const path = require('path')

const scanRouter = require('./routes/scanner')

const app = express()
const port = parseInt(process.env.PORT || '3000')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/scan', scanRouter)

app.use((req, res, next) => {
  res.status(404).send('Sorry, requested path does not exist')
})

app.listen(port, () => {
  console.log(`App is listening on the port ${port}`)
})
