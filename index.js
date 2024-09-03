const express = require('express');
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://solosphere.web.app',
    'https://byteblog-da679.firebaseapp.com',
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4qgkjzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
const userCollection = client.db('byteBlogDB').collection('users')


    //add user to the db
        app.post('/users', async (req, res) => {
          try {
            const user = req.body;
            console.log(user);

            const result = await userCollection.insertOne(user);
            res.send(result);
          } catch (error) {
            console.log(error)
            
          }
        });





    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('ByteBlog server is running')
})

app.listen(port, () => {
  console.log('ByteBlog server is running');
  
})