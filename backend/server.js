const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/user");
const Task = require("./models/task");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/taskmanager")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


// ===== SIGNUP =====
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    const exist = await User.findOne({ username });
    if (exist) return res.json({ message: "User already exists" });

    await new User({ username, password }).save();
    res.json({ message: "Signup successful" });
});


// ===== LOGIN =====
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
        message: "Login success",
        userId: user._id,
        username: user.username
    });
});


// ===== ADD TASK =====
app.post("/add-task", async (req, res) => {
    await new Task(req.body).save();
    res.json({ message: "Task added" });
});


// ===== GET TASKS =====
app.get("/tasks/:userId", async (req, res) => {
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
});


// ===== COMPLETE TASK =====
app.put("/complete/:id", async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, { status: "done" });
    res.json({ message: "Task completed" });
});


// ===== DELETE TASK =====
app.delete("/delete/:id", async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
});


// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});