const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: String,
    status: {
        type: String,
        default: "pending"
    },
    dueDate: Date,
    userId: String
});

module.exports = mongoose.model("Task", taskSchema);