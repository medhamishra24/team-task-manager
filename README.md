# Team Task Manager

A full-stack team task management application with role-based access, real-time task tracking, and a modern dashboard interface.

**Live Demo:** https://team-task-manager-1-pm2n.onrender.com

## Features

- 🔐 **Authentication** — Secure signup/login with JWT-based authentication
- 👥 **Role-Based Access** — Separate views and permissions for Admins and Team Members
- ✅ **Task Management** — Create, update, delete, and track tasks with priority levels
- 📊 **Dashboard** — Live stats on total, completed, pending, and overdue tasks
- 🔍 **Search & Filter** — Quickly find tasks by status or keyword
- 👤 **Task Assignment** — Admins can assign tasks to specific team members
- 🌓 **Toggle Mode** — Switch between light and dark themes
- 📱 **Responsive UI** — Clean, modern interface built with vanilla JS

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose (hosted on MongoDB Atlas)
- JWT for authentication
- bcrypt for password hashing

**Frontend**
- HTML5, CSS3, Vanilla JavaScript
- Fetch API for backend communication

**Deployment**
- Backend: Render (Web Service)
- Frontend: Render (Static Site)

## Project Structure

team-task-manager/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── README.md

## Getting Started (Local Setup)

### Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
```bash
cd backend
npm install

Create a .env file in the backend folder:
MONGO_URI=your_mongodb_connection_string
PORT=5000

Run the server:node server.js

Frontend Setup

Open frontend/index.html using a live server (e.g., VS Code Live Server extension).

Update the API_BASE constant in frontend/app.js to point to your backend URL.

API Endpoints

Method	Endpoint	Description
POST	/api/auth/signup	Register a new user
POST	/api/auth/login	Login existing user
GET	/api/tasks	Get all tasks
GET	/api/tasks/stats	Get task statistics
POST	/api/tasks	Create a new task
PUT	/api/tasks/:id	Update a task
DELETE	/api/tasks/:id	Delete a task

Author

Medha Mishra