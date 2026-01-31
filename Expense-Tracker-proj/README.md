# MERN Expense Tracker – Personal Finance Manager

This is a full-stack expense tracking application built using the MERN stack (MongoDB, Express, React, Node.js). The goal of the project is to help users manage and analyze their daily expenses through a clean and responsive interface.

The application includes secure authentication, expense tracking, and analytics to give users a clear overview of their spending.

---

## Features

| Feature | Description |
|---------|-------------|
| Financial Dashboard | Overview of income, expenses, and balance |
| Secure Authentication | JWT-based login and registration with encrypted passwords |
| Expense Analytics | Charts and insights showing spending patterns |
| Expense Management | Add, update, and delete expenses easily |
| Responsive UI | Works smoothly on desktop and mobile devices |

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Chart.js
- Axios
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt Password Hashing

---

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Git

---

### 1. Clone Repository
```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
2. Backend Setup
cd backend
npm install
cp .env.example .env
Update .env with:

MONGO_URI=your_database_uri
JWT_SECRET=your_secret_key
Start backend server:

npm run dev
3. Frontend Setup
Open another terminal:

cd frontend
npm install
npm run dev
4. Run Application
Backend runs on:

http://localhost:5000
Frontend runs on:

http://localhost:3000