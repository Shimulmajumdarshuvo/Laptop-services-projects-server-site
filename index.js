const express = require('express')
const cors = require('cors');
require('dotenv').config();



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const jwt = require("jsonwebtoken");
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());




//verify jwt / authentication
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECURE, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "forbidden access" });
        }
        req.decoded = decoded;
        next();
    });
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.morru.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);






async function run() {
    try {

        await client.connect();
        console.log('database connected');

        const serviceCollection = client.db('Laptop-services').collection('services');
        const ordersCollection = client.db('Laptop-services').collection('booking');
        const reviewsCollection = client.db('Laptop-services').collection("reviews");
        const usersCollection = client.db('Laptop-services').collection("users");




        //verify admin
        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await usersCollection.findOne({
                email: requester,
            });
            if (requesterAccount.role === "admin") {
                next();
            } else {
                res.status(403).send({ message: "forbidden" });
            }
        };


        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(filter)
            res.send(result);
        })

        app.post('/service', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.send(order);
        })



        // review section 

        //get reviews api
        app.get("/reviews", async (req, res) => {
            const reviews = await reviewsCollection.find().toArray();
            res.send(reviews);
        });

        //post review api
        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });




        app.get("/admin/:email", async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user.role === "admin";
            res.send({ admin: isAdmin });
        });


        app.put("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            const token = jwt.sign(
                { email: email },
                process.env.ACCESS_TOKEN_SECURE,
                {
                    expiresIn: "10d",
                }
            );
            res.send({ result, token });
        });



        //get all users
        app.get("/user", async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        });
        //make admin user api
        app.put("/user/admin/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: "admin" },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });
        // check the user is admin or not api
        app.get("/admin/:email", async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user.role === "admin";
            res.send({ admin: isAdmin });
        });








        //my order

        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;

            const filter = { email: email }
            const myOrder = await ordersCollection.find(filter).toArray()
            res.send(myOrder);
        })





        //order code 


        app.get("/orders", async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders);
        });
        app.post('/order', async (req, res) => {

            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })

        // app.patch('/orderPay/:id', async (req, res) => {
        //     const id = req.params.id
        //     const payment = req.body
        //     const filter = { _id: ObjectId(id) }
        //     const updateDoc = {

        //         $set: {
        //             paid: true,
        //             transactionId: payment.transactionId
        //         },
        //     };
        //     const updateOrder = await ordersCollection.updateOne(filter, updateDoc)
        //     const result = await paymentCollection.insertOne(payment)
        //     res.send(updateOrder)
        // })




















    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from Laptop services products.!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})