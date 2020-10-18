const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        required: true
    },
    loans: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Loan",
		},
	],
    
}, {
    timestamps: true
});






const User = mongoose.model('User', userSchema);

module.exports = User;