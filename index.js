const express = require("express");
require("dotenv").config();

const cors = require("cors");
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// I4LKBa5CVXlSp7W4

const { MongoClient, ServerApiVersion, Collection } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6rml2ff.mongodb.net/?retryWrites=true&w=majority`;

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
    // Send a ping to confirm a successful connection

    const database = client.db("e-selling");
    const collectionBrand = database.collection("brandCollection");
    const productCollection = database.collection("products");

    app.get("/brands", async (req, res) => {
      const cursor = collectionBrand.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addProduct", async (req, res) => {
      const addedProducts = req.body;
      const result = await productCollection.insertOne(addedProducts);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Selling.........");
});
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
