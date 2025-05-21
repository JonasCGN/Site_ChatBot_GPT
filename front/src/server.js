const express = require('express')

const server = express()
const port = process.env.PORT || 3000

console.log(`Frontend rodando na porta ${port}`)

server.use(express.static("public"))
server.use(express.urlencoded({extended: true}))

const nunjucks = require('nunjucks')
nunjucks.configure(
  "src/views",{
    express: server,
    noCache: true,
    autoescape: true
  }
)

server.get('/', async (req,res) => {
    return res.render('./pages/page_1.htm')
})

server.listen(port)