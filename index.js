const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};

// middle ware
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ssblxww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const jobsCollection = client.db("jobProviderDB").collection("jobs");
    const bidsCollection = client.db("jobProviderDB").collection("bids");

    //get a single job data from db using job id

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const quire = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(quire);
      res.send(result);
    });
    // get all data
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    //save a bid data in db
    app.post("/bid", async (req, res) => {
      const bidData = req.body;
      const result = await bidsCollection.insertOne(bidData);
      res.send(result);
    });

    // past a job

    app.post("/job", async (req, res) => {
      const item = req.body;
      const result = await jobsCollection.insertOne(item);
      res.send(result);
    });

    // get all jobs posted by a specific user

    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const quire = { "buyer.email": email };
      const result = await jobsCollection.find(quire).toArray();
      res.send(result);
    });

    // delete a job data

    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const quire = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(quire);
      res.send(result);
    });

    // update a job data
    app.put("/job/:id", async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const quire = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...jobData,
        },
      };
      const result = await jobsCollection.updateOne(quire, updateDoc, options);
      res.send(result);
    });

    // get al bide for a user by email
    app.get("/my-bids/:email", async (req, res) => {
      const email = req.params.email;
      const quire = { email: email };
      const result = await bidsCollection.find(quire).toArray();
      res.send(result);
    });

    // get al bide for a user by email
    app.get("/bid-requests/:email", async (req, res) => {
      const email = req.params.email;
      const quire = { buyerEmail: email };
      const result = await bidsCollection.find(quire).toArray();
      res.send(result);
    });
    // Send a ping to confirm a successful connection
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

app.get("/", (req, res) => {
  res.send("job provider is running");
});

app.listen(port, () => console.log(`job provider is running on port ${port}`));
