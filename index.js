const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const port = process.env.PORT || 5000;

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
    const userCollection = client.db('byteBlogDB').collection('users');
    const postCollection = client.db('byteBlogDB').collection('posts');
    const commentCollection = client.db('byteBlogDB').collection('comments');
    

    //add user to the db
    app.post('/users', async (req, res) => {
      try {
        const user = req.body;
        console.log(user);

        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // get all the post based on query
    app.get('/all-posts', async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page);
      const filter = req.query.filter;
      const sort = req.query.sort;
      const search = req.query.search;

      let query = {
        post_title: { $regex: search, $options: 'i' },
      };

      if (filter) query.category = filter;

      let options = {};

      if (sort) options = { sort: { createdAt: sort === 'asc' ? 1 : -1 } };

      const result = await postCollection
        .find(query, options)
        .skip((page - 1) * size)
        .limit(size)
        .toArray();

      res.send(result);
    });

    // get the post count
    app.get('/postCount', async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;

      let query = {
        post_title: { $regex: search, $options: 'i' },
      };

      if (filter) query.category = filter;

      try {
        const count = await postCollection.countDocuments(query);

        res.send({ count });
      } catch (error) {
        console.error('Error fetching post count:', error);
        res.status(500).send({ error: 'Failed to fetch job count' });
      }
    });

    // getting recent blog posts
    app.get('/recent-posts', async (req, res) => {
      const sortedData = await postCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();

      res.send(sortedData);
    });

    // getting a blog data by id
        app.get('/posts/:id', async (req, res) => {
          const id = req.params.id;

          const query = { _id: new ObjectId(id) };

          const result = await postCollection.findOne(query);
          res.send(result);
        });

    // creating a new blog
    app.post('/posts', async (req, res) => {
      const postData = req.body;

      console.log(postData);

      const result = await postCollection.insertOne(postData);

      res.send(result);
    });

    // comment related api

    // getting all comment by blog id
    app.get('/comments/:id', async (req, res) => {
      const id = req.params.id;    

 const query = { blog_id: id };

      const result = await commentCollection.find(query).toArray();

      res.send(result)
})

    // creating a new comment
    app.post('/comments', async (req, res) => {
      const comment = req.body;

      const result = await commentCollection.insertOne(comment);

      res.send(result);
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
  res.send('ByteBlog server is running');
});

app.listen(port, () => {
  console.log('ByteBlog server is running');
});
