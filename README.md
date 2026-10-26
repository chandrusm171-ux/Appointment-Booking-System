# Luma Studio --- Appointment Booking System

A full-stack appointment scheduling platform for service-based
businesses. Luma Studio lets customers explore available services, check
appointment slots, and submit booking requests. Administrators can
manage bookings, services, business availability, and booking history
through a protected dashboard.

**Live Demo:** https://appointment-booking-system-six-mu.vercel.app/

**GitHub Repository:**
https://github.com/chandrusm171-ux/Appointment-Booking-System

------------------------------------------------------------------------

## Table of Contents

-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Project Structure](#project-structure)
-   [Quick Start](#quick-start)
-   [Environment Variables](#environment-variables)
-   [Demo Admin](#demo-admin)
-   [API Endpoints](#api-endpoints)
-   [Availability Logic](#availability-logic)
-   [Deployment](#deployment)
-   [Security Notes](#security-notes)

------------------------------------------------------------------------

## Features

### Customer Experience

-   Landing page introducing the appointment service
-   Service listing page
-   Appointment booking form
-   Live available-slot lookup through the backend API
-   Booking submission to the server
-   Responsive layouts for desktop, tablet, and mobile
-   Error boundary and not-found page handling

### Admin Dashboard

-   Admin login and protected routes
-   Dashboard overview
-   Booking list and booking status management
-   Booking history
-   Service management: create, edit, list, and delete services
-   Business availability settings, including opening hours and breaks
-   Admin session verification and logout

### Appointment Availability

The server calculates available appointment slots using service
duration, business opening and closing times, break periods, and
existing bookings. Past dates and past times on the current day are
excluded. Cancelled bookings do not block a slot.

### API and Security

-   REST API built with Express
-   MongoDB persistence through Mongoose
-   JWT-based admin authentication
-   Password hashing with bcryptjs
-   Helmet security headers
-   CORS origin allow-list
-   API rate limiting and separate admin-login rate limiting
-   Request body size limit and centralized error handling

------------------------------------------------------------------------

## Tech Stack

  Technology             Purpose
  ---------------------- -----------------------------------------
  React 19               Frontend UI
  Vite                   Development server and production build
  Tailwind CSS 4         Styling and responsive layouts
  React Router DOM       Frontend routing
  Axios                  HTTP requests to the backend API
  Node.js                Backend runtime
  Express 5              REST API and middleware
  MongoDB                Persistent application data
  Mongoose               MongoDB models and data access
  JSON Web Token (JWT)   Admin authentication
  bcryptjs               Password hashing
  Helmet                 HTTP security headers
  express-rate-limit     API and login rate limiting
  dotenv                 Environment configuration
  Git and GitHub         Version control and source hosting
  Vercel                 Frontend deployment

------------------------------------------------------------------------

## Project Structure

``` text
Appointment-Booking-System/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── CustomerHeader.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminBookings.jsx
│   │   │   ├── AdminHistory.jsx
│   │   │   ├── AdminServices.jsx
│   │   │   ├── AdminAvailability.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   └── bookingUtils.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   │   ├── availability.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── availabilityController.js
│   │   ├── bookingController.js
│   │   └── serviceController.js
│   ├── middleware/
│   │   └── adminAuth.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Availability.js
│   │   ├── Booking.js
│   │   ├── Provider.js
│   │   └── Service.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── availabilityRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── serviceRoutes.js
│   ├── services/
│   │   └── availabilityService.js
│   ├── utils/
│   ├── seed.js
│   ├── seedAdmin.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

------------------------------------------------------------------------

## Quick Start

### Prerequisites

-   Node.js and npm
-   MongoDB Atlas account or a local MongoDB instance
-   Git (if cloning the repository)

### 1. Clone the repository

``` bash
git clone https://github.com/chandrusm171-ux/Appointment-Booking-System.git
cd Appointment-Booking-System
```

### 2. Configure the backend

``` bash
cd server
npm install
```

Create a `.env` file by copying `.env.example`.

**Windows PowerShell:**

``` powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

``` bash
cp .env.example .env
```

Fill in the environment variables as described below. Make sure
`JWT_SECRET` is at least 32 characters long.

### 3. Seed initial data

From the `server` directory, run:

``` bash
npm run seed
```

This runs the project's seed script to initialize the application's
sample data. Review `seed.js` before running it against any database
containing important data.

### 4. Start the backend

``` bash
npm run dev
```

The API runs on `http://localhost:5000` unless `PORT` is changed.

Health check:

``` text
GET http://localhost:5000/api/health
```

### 5. Configure and start the frontend

Open a second terminal:

``` bash
cd client
npm install
```

Create a `client/.env` file based on `.env.example`:

``` env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

``` bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

------------------------------------------------------------------------

## Environment Variables

### Backend --- `server/.env`

``` env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=admin@lumastudio.com
ADMIN_PASSWORD=replace_with_a_strong_local_admin_password
```

  -----------------------------------------------------------------------
  Variable                            Description
  ----------------------------------- -----------------------------------
  `PORT`                              Port for the Express server

  `CLIENT_URL`                        Allowed frontend origin; multiple
                                      origins can be comma-separated

  `MONGODB_URI`                       MongoDB connection string

  `JWT_SECRET`                        Secret used to sign authentication
                                      tokens; use a strong random value
                                      of at least 32 characters

  `JWT_EXPIRES_IN`                    JWT expiration duration

  `ADMIN_EMAIL`                       Initial admin email used by the
                                      seed setup

  `ADMIN_PASSWORD`                    Initial admin password used by the
                                      seed setup
  -----------------------------------------------------------------------

### Frontend --- `client/.env`

``` env
VITE_API_URL=http://localhost:5000/api
```

`VITE_API_URL` should point to the backend API base URL, including
`/api`.

Never commit real `.env` files, database credentials, or JWT secrets to
GitHub.

------------------------------------------------------------------------

## Demo Admin

The repository README documents these local demo credentials:

``` text
Email: admin@lumastudio.com
Password: Admin@123
```

The actual initial admin setup may depend on your environment variables
and seed scripts. Configure the admin credentials in `server/.env` and
inspect `seedAdmin.js` before using them. Change any demo password
before production use.

------------------------------------------------------------------------

## API Endpoints

Base URL for local development: `http://localhost:5000/api`

### Health

  Method   Endpoint    Description
  -------- ----------- ------------------
  GET      `/health`   Check API status

### Services

  Method   Endpoint                Access   Description
  -------- ----------------------- -------- ----------------------
  GET      `/services`             Public   List active services
  GET      `/services/admin/all`   Admin    List all services
  POST     `/services`             Admin    Create a service
  PUT      `/services/:id`         Admin    Update a service
  DELETE   `/services/:id`         Admin    Delete a service

### Availability

  -----------------------------------------------------------------------------
  Method            Endpoint                Access            Description
  ----------------- ----------------------- ----------------- -----------------
  GET               `/availability/slots`   Public            Get available
                                                              appointment slots

  GET               `/admin/availability`   Admin             Read business
                                                              availability

  PUT               `/admin/availability`   Admin             Update business
                                                              availability
  -----------------------------------------------------------------------------

### Bookings

  Method   Endpoint                Access                   Description
  -------- ----------------------- ------------------------ ------------------------------
  POST     `/bookings`             Public                   Create a booking request
  GET      `/admin/bookings`       Admin                    List bookings
  PUT      `/admin/bookings/:id`   Admin                    Update a booking
  GET      `/admin/dashboard`      Admin                    Get dashboard data
  GET      `/admin/login`          N/A                      Login uses `POST`, not `GET`
  POST     `/admin/login`          Public with rate limit   Admin login
  GET      `/admin/me`             Admin                    Verify current admin session
  POST     `/admin/logout`         Admin                    Logout

Admin endpoints require the authentication mechanism implemented by the
application. Consult the frontend API service and server middleware for
the exact request headers and payload schemas.

------------------------------------------------------------------------

## Frontend Routes

  Page                  Route
  --------------------- -----------------------
  Home                  `/`
  Services              `/services`
  Booking               `/booking`
  Admin Login           `/admin/login`
  Admin Dashboard       `/admin/dashboard`
  Admin Bookings        `/admin/bookings`
  Booking History       `/admin/history`
  Manage Services       `/admin/services`
  Manage Availability   `/admin/availability`

Admin dashboard routes are wrapped in a protected route component.

------------------------------------------------------------------------

## Availability Logic

The availability system uses the business's `Availability` record in
MongoDB as the source of truth. The slot engine considers:

-   Service duration
-   Business opening and closing times
-   Break periods
-   Existing pending and confirmed bookings
-   Past dates
-   Past times on the current date
-   Cancelled bookings, which no longer block a slot

This approach helps prevent customers from selecting appointment slots
that are outside business hours or conflict with existing bookings.

------------------------------------------------------------------------

## Available Scripts

### Backend (`server/`)

  Command          Description
  ---------------- -------------------------------
  `npm run dev`    Start the server with Nodemon
  `npm start`      Start the server with Node.js
  `npm run seed`   Run the data seed script

### Frontend (`client/`)

  Command             Description
  ------------------- --------------------------------------
  `npm run dev`       Start the Vite development server
  `npm run build`     Create a production build
  `npm run preview`   Preview the production build locally
  `npm run lint`      Run ESLint checks

------------------------------------------------------------------------

## Deployment

### Frontend --- Vercel

1.  Push the latest code to GitHub.
2.  Import the repository into [Vercel](https://vercel.com/).
3.  Set the project root directory to `client`.
4.  Set the build command to `npm run build`.
5.  Set the output directory to `dist`.
6.  Add `VITE_API_URL` pointing to the deployed backend API, for example
    `https://your-backend.example.com/api`.
7.  Deploy and verify the customer pages and API requests.

### Backend --- Render

1.  Create a Web Service in [Render](https://render.com/).
2.  Connect the repository and set the root directory to `server`.
3.  Use `npm install` as the build command.
4.  Use `npm start` as the start command.
5.  Add the required environment variables from `server/.env.example`.
6.  Set `CLIENT_URL` to the deployed Vercel frontend origin.
7.  Deploy and check `/api/health`.

### Database --- MongoDB Atlas

1.  Create a MongoDB Atlas database.
2.  Configure network access for the backend host.
3.  Add the connection string as `MONGODB_URI` in the backend
    environment.
4.  Run the seed script only when appropriate for the target database.

The frontend and backend must use matching deployment URLs and CORS
settings.

------------------------------------------------------------------------

## Security Notes

-   Use a strong, unique `JWT_SECRET` of at least 32 characters.
-   Change demo admin credentials before production use.
-   Keep `.env` files out of version control.
-   Restrict production CORS to trusted frontend origins.
-   Configure database network access and credentials carefully.
-   Test admin authentication, booking validation, and availability
    conflicts before accepting real appointments.

------------------------------------------------------------------------

## Links

-   **Live Demo:** https://appointment-booking-system-six-mu.vercel.app/

-   **GitHub Repository:**
    https://github.com/chandrusm171-ux/Appointment-Booking-System
