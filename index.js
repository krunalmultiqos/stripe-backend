const express = require('express')
const app = express()

require('dotenv').config()

const stripe = require('stripe')(`${process.env.SECRET_KEY}`)
const port = 8000
var cors = require('cors')

app.use(cors());
app.use(express.json());

//create payment intent api

app.post('/create-payment-intent', async (req, res) =>{
    try{
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.send(paymentIntent)
    }catch(error) {
        console.log('error', error)
    }
})

//publishable key
app.get('/config', async (req, res) => {
    try {
        res.send({key: `${process.env.PUBLISHABLE_KEY}`});
    } catch(error) {
        console.log('error', error)
    }
   });

//create customer api
app.post('/create-customer', async (req, res) => {
    try {
        const customer = await stripe.customers.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone
          });
        res.send({data: customer.id, message: 'customer added successfully'});
    } catch(error) {
        console.log('error', error)
    }
   });

// Create session api
app.post('/create-checkout-session', async (req, res) => {
    try {
        const price = await stripe.prices.create({
            currency: 'usd',
            unit_amount: req.body.price,
            product_data: {
                name: 'product'
            }
        })
        console.log('price', price)
        const session = await stripe.checkout.sessions.create({
            success_url: `${process.env.SUCCESS_URL}`,
            line_items: [
                {
                    price: price.id,
                    quantity:1
                },
            ],
            customer: req.body.customer,
            mode: 'payment',
            payment_method_types: ['card'],
        });
        console.log(session);
        res.send(session.url);
    } catch(error) {
        console.log('error', error)
    }
   });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})