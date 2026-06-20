# MERN Alumni Management System - Complete Platform

A comprehensive, full-stack Alumni Management Platform built with the MERN stack (MongoDB, Express, React, Node.js) featuring modern UI/UX, dark mode, and extensive functionality.

THESE IS THE LINK OF PRODCUTION READY PROJECT : https://studentnetwork-mrak.onrender.com
NOTE: The live demo is hosted on a free-tier cloud service and may enter a sleep state during periods of inactivity. If the application does not load on the first attempt, please allow a few moments for the server to restart and refresh the page.

## ✨ Features

### Core Features
- **Authentication**: JWT-based auth with Role-Based Access Control (Admin, Alumni, Student, TPO)
- **User Profiles**: Comprehensive alumni and student profile management
- **Events Management**: Create, browse, and RSVP to alumni events
- **Job Board**: Post and discover career opportunities
- **Donations**: Track and manage donations to the institution
- **Mentorship Program**: Connect students with alumni mentors
- **Alumni Directory**: Searchable directory of all alumni
- **Announcements**: Broadcast important messages to the network

### New Features
- **Real-time Messaging**: Chat system for direct communication between users
- **Photo Gallery**: Organized photo albums from events and campus life
- **News & Blog**: Articles, announcements, and alumni spotlights
- **Success Stories**: Testimonials and achievements from alumni
- **Career Resources**: Resume templates, interview guides, and career development materials
- **Dark Mode**: Full dark mode support with theme persistence
- **Modern UI/UX**: Beautiful gradients, animations, and responsive design
- **Toast Notifications**: Real-time feedback for user actions

### Pages
**Public Pages:**
- Home - Modern landing page with hero section and features
- About Us - Mission, vision, and timeline
- Contact - Contact form and information
- FAQ - Searchable frequently asked questions
- Gallery - Photo albums and image viewer
- News - Articles and updates
- Success Stories - Alumni testimonials

**Protected Pages:**
- Dashboard (role-specific)
- Profile Management
- Messaging
- Alumni Directory
- Events
- Jobs
- Mentorship
- Donations
- Announcements
- Career Resources

## 🚀 Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Express Validator
- Helmet for security
- Morgan for logging
- Multer for file uploads

**Frontend:**
- React 18
- Vite
- React Router v6
- Tailwind CSS
- Lucide React (icons)
- Axios
- date-fns
- Context API for state management

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas)
- npm or yarn

## 🛠️ Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install

# The .env file should already exist with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# PORT=5000
# CORS_ORIGIN=http://localhost:5173

npm run dev
```

The backend will run on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install

# The .env file should exist with:
# VITE_API_URL=http://localhost:5000

npm run dev
```

The frontend will run on `http://localhost:5173`.

### 3. Seed Database (Optional)

```bash
cd backend
npm run seed
```

## 📁 Project Structure

```
studentnetwork/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & validation middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── context/     # React Context providers
    │   ├── pages/       # Page components
    │   ├── utils/       # Helper functions
    │   ├── App.jsx      # Main app component
    │   └── index.css    # Global styles & design system
    └── public/          # Static assets
```

## 🎨 Design System

The platform features a comprehensive design system with:
- CSS custom properties for theming
- Dark mode support
- Gradient backgrounds
- Smooth animations and transitions
- Responsive typography
- Reusable utility classes
- Glassmorphism effects

## 🔐 User Roles

- **Admin**: Full access to all modules, user management
- **Alumni**: Post jobs, create events, mentor students, update profile
- **Student**: View jobs/events, request mentorship, access resources
- **TPO**: Manage placements, create announcements, post jobs

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Alumni & Students
- `GET /api/alumni` - Get all alumni profiles
- `POST /api/alumni` - Create alumni profile
- `GET /api/students` - Get all student profiles
- `POST /api/students` - Create student profile

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Post job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Make donation

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement

### Mentorship
- `GET /api/mentorships` - Get mentorship requests
- `POST /api/mentorships` - Create mentorship request
- `PUT /api/mentorships/:id/status` - Update status

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/:userId` - Get conversation with user
- `POST /api/messages` - Send message

### Gallery
- `GET /api/gallery` - Get all galleries
- `POST /api/gallery` - Create gallery
- `PUT /api/gallery/:id` - Update gallery

### News
- `GET /api/news` - Get all news articles
- `GET /api/news/featured` - Get featured articles
- `POST /api/news` - Create article

### Testimonials
- `GET /api/testimonials` - Get all testimonials
- `GET /api/testimonials/featured` - Get featured testimonials
- `POST /api/testimonials` - Submit testimonial
- `PUT /api/testimonials/:id/approve` - Approve testimonial (Admin)

## 🎯 Key Components

- **Button** - Reusable button with variants (primary, secondary, outline, ghost)
- **Card** - Card component with hover effects
- **Modal** - Reusable modal/dialog
- **LoadingSpinner** - Loading states and skeleton loaders
- **SearchBar** - Advanced search with filters
- **Toast** - Notification system

## 🌙 Dark Mode

The platform includes full dark mode support:
- Toggle in navbar
- Persistent theme preference
- Smooth transitions
- Optimized for both light and dark themes

## 📱 Responsive Design

Fully responsive design that works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Protected routes
- Role-based access control
- Helmet for HTTP headers security
- Input validation
- CORS configuration

## 🚧 Future Enhancements

- Real-time notifications with Socket.io
- Email integration for notifications
- Advanced analytics dashboard
- PDF generation for reports
- Social media integration
- Mobile app (React Native)
- Payment gateway integration
- Video conferencing for mentorship

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

Built with ❤️ by the Alumni Network Team

