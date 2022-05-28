const express = require('express')
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.morru.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);



async function run() {
    try {

        await client.connect();
        console.log('database connected');

        const serviceCollection = client.db('Laptop-services').collection('services');
        const ordersCollection = client.db('Laptop-services').collection('booking');

        const paymentCollection = client.db('Laptop-services').collection('payment');



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