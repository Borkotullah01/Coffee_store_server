const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT  || 5000;
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json())

// mongodb work
const uri = `mongodb+srv://${process.env.DB_userName}:${process.env.DB_password}@cluster0.elpbg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const CoffeesDB = client.db("CoffeesDB");
    const CoffeeColl = CoffeesDB.collection("CoffeeColl");
    const UserColl = CoffeesDB.collection("UserColl");

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    // database route 
    app.get("/coffees", async(req, res)=>{
      const cursor = CoffeeColl.find({});
      const coffees = await cursor.toArray();
      res.send(coffees);
    })

    app.get("/coffees/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const coffee = await CoffeeColl.findOne(query);
      res.send(coffee);
    })

    app.post("/coffees", async(req, res)=>{
      const coffee = req.body;
      const result = await CoffeeColl.insertOne(coffee);
      res.send(result);
    })

    app.delete("/coffees/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await CoffeeColl.deleteOne(query);
      res.send(result);
    })

    app.put("/coffees/:id", async(req, res)=>{
      const coffee = req.body;
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const newCoffee = {
        $set: {
          name: coffee.name,
          chef: coffee.chef,
          price: coffee.price, 
          supplier: coffee.supplier, 
          category: coffee.category, 
          details: coffee.details, 
          photo: coffee.photo
        }
      }
      const result = await CoffeeColl.updateOne(filter, newCoffee, options);
      res.send(result);
    })

    app.get("/users", async(req, res)=>{
      const cursor = UserColl.find({});
      const Users = await cursor.toArray();
      res.send(Users);
    })
    
    app.post("/users", async(req, res)=>{
      const user = req.body;
      const result = await UserColl.insertOne(user);
      res.send(result);
    })

    app.delete("/users/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await UserColl.deleteOne(query);
      res.send(result);
    })

    app.patch("/users", async(req, res)=>{
      const user = req.body;
      const email = user.email;
      const filter = {email}
      const options = {upsert: true}
      const newUser = {
        $set: {
          lastSignInTime: req.body.lastSignInTime
        }
      }
      const result = await UserColl.updateOne(filter, newUser, options);
      res.send(result);
    })

    app.get('/', (req, res) => {
      res.send('Hello World! Welcome to Coffee store espresso emporium!!')
    })

    app.listen(port, () => {
        console.log(`your coffee store server is running on http://localhost:${port}`)
    })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
