const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/task");
const { asyncHandler, verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { search, status } = req.query;
    const filter = {};

    if (req.user.role === "member") {
      filter.assignedTo = req.user._id.toString();
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1, updatedAt: -1 });
    res.json(tasks);
  })
);

router.get(
  "/stats",
  verifyToken,
  asyncHandler(async (req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const baseFilter = req.user.role === "member" ? { assignedTo: req.user._id.toString() } : {};

    const total = await Task.countDocuments(baseFilter);
    const completed = await Task.countDocuments({ ...baseFilter, status: "done" });
    const pending = await Task.countDocuments({ ...baseFilter, status: "pending" });
    const overdue = await Task.countDocuments({
      ...baseFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: "done" },
    });
    const todayTasks = await Task.countDocuments({
      ...baseFilter,
      dueDate: { $gte: startOfDay, $lt: endOfDay },
    });
    const recent = await Task.find(baseFilter).sort({ updatedAt: -1 }).limit(6);

    res.json({ total, completed, pending, overdue, today: todayTasks, recent });
  })
);

router.post(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { title, description, dueDate, priority, project, assignedTo } = req.body;
    if (!title || !title.trim()) {
      res.status(400);
      throw new Error("Task title is required.");
    }

    const task = await Task.create({
      title: title.trim(),
      description: (description || "").trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "medium",
      status: "pending",
      project: (project || "General").trim(),
      assignedTo: req.user.role === "admin" ? assignedTo?.trim() || req.user._id.toString() : req.user._id.toString(),
      createdBy: req.user._id.toString(),
    });

    res.status(201).json(task);
  })
);

router.put(
  "/:id/status",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status || !["pending", "in-progress", "done"].includes(status)) {
      res.status(400);
      throw new Error("Valid status is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid task ID.");
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found.");
    }

    if (req.user.role === "member" && task.assignedTo !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You are not authorized to update this task.");
    }

    task.status = status;
    await task.save();
    res.json(task);
  })
);

router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid task ID.");
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found.");
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully." });
  })
);

module.exports = router;
