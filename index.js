const express = require('express');
const cors = require('cors');
const app = express();
// const cookieParser = require("cookie-parser")
// const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
// app.use(cors({
//   origin: ["http://localhost:5173"],
//   credentials:true
// }));
app.use(cors());
app.use(express.json())
// app.use(cookieParser())


const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.xotjp9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middlewares
// const logger = async(req,res,next)=>{
//   console.log("called", req.host , req.originalUrl);
//   next()
// }

// const verifyToken = async(req,res,next)=>{
//   const token = req.cookies?.token;
//   console.log("token from verify middleware", token);
//   if(!token){
//     return res.status(401).send( {message :"Unauthorized"})
//   }
//   jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET, (err,decoded)=>{
//     // error
//        if(err){
//         console.log(err)
//         return res.status(401).send({message:"unAuthorized"})
//        }

//     // if token is valid then it would be decoded
//       console.log("value of the token", decoded);
//       req.user = decoded;
//       next()
//   })

// }

async function run() {

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const serviceCollection = client.db("carDoctor").collection("services");
    const bookingCollection = client.db("carDoctor").collection("booking")
    //  verification related api

  // app.post("/jwt", async(req,res)=>{
  //   const user = req.body;
  //   console.log(user);
  //   const token = jwt.sign(user, process.env.ACCESS_TOCKEN_SECRET, {expiresIn: "1hr"})
  //   // res.send(token)
  //   res
  //   .cookie("token", token, {
  //     httpOnly: true,
  //     secure: false,
  //     sameSite:"none"
  //   })
  //   .send({succeed : true})
  // })

  // app.post("/jwt",  async(req,res)=>{
  //   const user = req.body;
  //   console.log(user);
  //   const token = jwt.sign(user, process.env.ACCESS_TOCKEN_SECRET, {expiresIn: "1hr"})
  //   // res.send(token)
  //   res
  //   .cookie("token", token, {
  //     httpOnly: true,
  //     secure:false,
  //     sameSite: "none"
  //   })
  //   .send({success:true})
  // })


    // services related api
    app.get("/services", async(req,res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get("/services/:id", async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: { service_id: 1, title: 1 , price :1 , img:1 },
          };
          const result = await serviceCollection.findOne(query,options)
          res.send(result)

    })

    //  bookings

    app.get("/bookings", async(req,res)=>{
        console.log(req.query.email);
        // console.log('tok tok token', req.cookies.token)
        // console.log(req.user)
        
        let query = {};
        // if(req.query.email !== req.user.email){
        //   return res.status(403).send({message:"forbidden"})
        // }
        if(req.query.email){
            query = {email : req.query.email}
        }
        const cursor = bookingCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post("/bookings", async(req,res)=>{
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result)
        

    })

    app.patch("/bookings/:id", async(req,res)=>{
      const id = req.params.id;
      // console.log(updated)
      const filter = {_id : new ObjectId(id) }
      const updatedBooking = req.body;
      console.log(updatedBooking)
      const updateDoc = {
        $set: {
          status : updatedBooking.status
        },
      };
      const result = await bookingCollection.updateOne(filter,updateDoc);
      res.send(result)
    })

    app.delete("/bookings/:id", async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req,res)=>{
    res.send(`car doctor server is running from ${port}`)
})

app.listen(port, ()=>{
    console.log(`server is running from port ${port}`)
})