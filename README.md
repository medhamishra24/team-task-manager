# Team Task Manager

A modern full-stack team task manager app with:
- Node.js + Express backend
- MongoDB + JWT authentication
- Role-based admin/member access
- Responsive dark SaaS dashboard UI
- Clean API routes, validation, error handling
- In-memory MongoDB fallback for local startup

## File structure
- `backend/`
  - `server.js` - Express server entrypoint with auth and task routes
  - `routes/` - API route modules
  - `models/` - Mongoose schemas for User and Task
  - `middleware/` - auth and error handling middleware
  - `.env` - environment variables (MongoDB connection, optional JWT secret)
- `frontend/`
  - `index.html` - modern dashboard and auth UI
  - `styles.css` - dashboard styling
  - `app.js` - frontend app logic, session persistence, toasts, modals

## Run locally
### Backend
1. Open a terminal in `backend/`
2. Run `npm install`
3. Start the server with `npm start`
4. The backend will run on `http://localhost:5000`

### Frontend
1. Open `frontend/index.html` in your browser
2. Or serve the folder with a static server (recommended)

## Notes
- The backend uses `process.env.MONGO_URI` / `process.env.MONGO_URL` first.
- If Atlas/local MongoDB fails, it will fall back to an in-memory MongoDB instance.
- JWT auth protects the API and enables session persistence in the browser.

## Deployment
### Railway
1. Connect your GitHub repo and deploy the `backend/` folder.
2. Set environment variables in Railway:
   - `MONGO_URI` or `MONGO_URL`
   - `JWT_SECRET`
3. Use the Railway URL for frontend API requests in production.

### Vercel
1. Deploy the `frontend/` folder as a static site.
2. Deploy the backend separately on Railway, Heroku, or another Node host.
3. Update `API_BASE` in `frontend/app.js` to your backend URL.
4. Set `JWT_SECRET` and Mongo env vars on the backend host.

## How to use
- Sign up to create the first admin account.
- Login to access the dashboard.
- Admins can create and delete tasks.
- Members can update task status and filter tasks.
- Tasks include priority, due date, status badges, search, and activity.

