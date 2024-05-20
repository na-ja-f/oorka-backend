const asyncHandler = require('express-async-handler')
const Transactions = require('../models/transactionModel')
const User = require('../models/userModel')
const Stripe = require('stripe')

const stripe = new Stripe(
    "sk_test_51PDiEYSBGMY6u2sBFuvLI7e4pODLtafgLRipIs6urLqZTD6fNxbmo8SEFxZ5ng4uZA3Uo3w4sUJ3bQrM48WcmwY400nk9PQKa7"
);

const initialCheckout = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    console.log(userId + "checkout")

    try {
        const user = await User.findById(userId);

        if (user && user.isVerified === true) {
            res.json({
                success: false,
                message: "User is already subscribed to premium",
                user,
            });
        }

        const fare = "499";
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: "premium membership - 1Year",
                        },
                        unit_amount: parseInt(fare) * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `http://oorka.online/premium/payment-success`,
            cancel_url: `http://oorka.online/premium/payment-failed`,
            customer_email: user?.email,
            billing_address_collection: "required",
        });

        console.log("Stripe session created:", session);
        res.json({ success: true, id: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res
            .status(500)
            .json({ success: false, message: "Error creating checkout session" });
    }
})

const validatePayment = asyncHandler(async (req, res) => {
    console.log('payment validate');
    const { sessionId, userId } = req.body
    console.log('session', sessionId, 'user', userId);
    const amount = "499";
    try {
        const user = await User.findById(userId);

        if (user && user.isVerified === true) {
            res.json({
                success: false,
                message: "User is already subscribed to premium",
                user,
            });
        }

        const existingPremium = await Transactions.findOne({
            transactionId: sessionId,
        });
        if (existingPremium) {
            return res.status(400).json({ success: false, message: "Unauthorized access" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session && session.payment_status === "paid") {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 364);

            const newPremium = new Transactions({
                userId,
                amount,
                transactionId: sessionId,
                startDate: Date.now(),
                expiryDate,
            });

            await newPremium.save();

            await User.findByIdAndUpdate(userId, { isVerified: true, premiumExpiryDate: expiryDate });
            const updatedUser = await User.findById(userId, { password: 0 });

            return res.json({
                success: true,
                message: "Premium document created and user updated successfully",
                user: updatedUser,
            });
        } else {
            return res.json({ success: false, message: "Payment not successful" });
        }

    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ success: false, message: "Error creating checkout session" });
    }
})

const getPremiumUserData = asyncHandler(async (req, res) => {
    const { userId } = req.body
    try {
        const allPremiumUserData = await Transactions.find({ userId });
        const latestPremiumUser = await Transactions.findOne({ userId }).sort({
            startDate: -1,
        });

        res.status(200).json({ success: true, allPremiumUserData, latestPremiumUser });
    } catch (error) {
        console.error("Error fetching premium user data:", error);
        res
            .status(500)
            .json({ success: false, message: "Error fetching premium user data" });
    }
})

module.exports = {
    getPremiumUserData,
    initialCheckout,
    validatePayment
}