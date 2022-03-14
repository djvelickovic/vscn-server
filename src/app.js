const express = require('express')
const conn = require('./db/conn')

const scanRouter = require('./routes/scanner')
const cveRouter = require('./routes/cve')

const app = express()
const port = parseInt(process.env.PORT || '3000')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/scan', scanRouter)
app.use('/cve', cveRouter)

app.use((req, res, next) => {
  res.status(404).send('Sorry, requested path does not exist')
})

conn.connectToServer()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is listening on the port ${port}`)
    })
  })
  .catch(error => {
    console.error(error)
    process.exit()
  })