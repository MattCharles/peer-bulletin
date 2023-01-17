const v1 = require('./v1')
const express = require('express')
const app = express()
const port = 3000

app.use('/', v1)
app.use('/v1/', v1)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})