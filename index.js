const express = require('express');
const app = express()
const port = process.env.PORT || 5000


app.use(express.json())


app.get('/', (req, res) => {
  res.send('ByteBlog server is running')
})

app.listen(port, () => {
  console.log('ByteBlog server is running');
  
})