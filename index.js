const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://e-selling-227e0.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// custom middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  console.log("tokenVerify", token);
  if (!token) {
    res.send({ message: "Unauthorized" });
  }

  next();
};

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("e-selling");
    const collectionBrand = database.collection("brandCollection");
    const productCollection = database.collection("products");
    const cartCollection = database.collection("cart");

    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("Token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
      // console.log("TOken is:", token);
    });

    // get all brands
    app.get("/brands", async (req, res) => {
      const cursor = collectionBrand.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get all product
    app.get("/allProducts", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // read single product
    app.get("/allProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await productCollection.findOne(query);
      // const result = await cursor.toArray();
      res.send(result);
    });

    // get my cart items
    app.get("/myCart", async (req, res) => {
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // read single cart item
    app.get("/myCart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await cartCollection.findOne(query);
      // const result = await cursor.toArray();
      res.send(result);
      // console.log(result);
    });
    // app.get("/allProducts/:products", async (req, res) => {
    //   const products = req.params.brandName;
    //   // console.log(brandName);
    //   const query = { brandName: products };
    //   const cursor = productCollection.find(query);
    //   const result = await cursor.toArray();
    //   console.log(query);
    //   console.log(result);
    //   res.send(result);
    // });
    // create product
    app.post("/addProduct", verifyToken, async (req, res) => {
      const addedProducts = req.body;
      const result = await productCollection.insertOne(addedProducts);
      res.send(result);
    });

    //create cart items
    app.post("/myCart", async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);
      res.send(result);
    });

    // delete from myCart

    app.delete("/myCart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      // console.log(id);
      res.send(result);
    });

    // update item
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const item = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateItem = {
        $set: {
          productName: item.productName,
          description: item.description,

          brandName: item.brandName,
          image: item.image,

          price: item.image,
          price: item.price,
          rating: item.rating,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateItem,
        options
      );
      res.send(result);
      console.log(result);
    });
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Selling.........");
});
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
