const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Paste your ACTUAL keys inside the quotes below
const razorpay = new Razorpay({
    key_id: "rzp_test_TZDUKoDeiDIslM", 
    key_secret: "TQV42W3Jcy8dg7bEQogt3NC0",
});

app.post('/create-razorpay-order', async (req, res) => {
    try {
        const items = req.body.items;
        
        let totalAmount = 0;
        items.forEach(item => {
            totalAmount += (item.price * (item.quantity || 1)) * 100;
        });

        // FIX: Force the total into a clean integer to prevent Razorpay crashes
        totalAmount = Math.round(totalAmount);

        const options = {
            amount: totalAmount, 
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7)
        };

        const order = await razorpay.orders.create(options);
        res.json({ orderId: order.id, amount: totalAmount });
        
    } catch (e) {
        // FIX: Log the exact error to your VS Code terminal
        console.error("Razorpay Error:", e);
        const errorMessage = e.error ? e.error.description : "Failed to create order.";
        res.status(500).json({ error: errorMessage });
    }
});

app.listen(3000, () => {
    console.log("Tulsi Traders Server running on port 3000");
});