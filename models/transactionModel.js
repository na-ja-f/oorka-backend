let mongoose = require('mongoose')

const transactionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: Date.now
    },
    
})

module.exports = mongoose.model("Transactions",transactionSchema)