const express = require('express');
const cors = require('cors');
const stripe = require('stripe');
require('dotenv').config();

const app = express();

app.use(cors());
const stripeInstance = stripe(process.env.STRIPE_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/checkout', async (req, res) => {
  const { items } = req.body;

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.title,
      },
      unit_amount: item.product.price * 100,
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://tech-store-hazel.vercel.app/',
      cancel_url: 'https://tech-store-hazel.vercel.app/',
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create a checkout session' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
