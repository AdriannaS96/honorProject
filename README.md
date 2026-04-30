# honorProject

`honorProject` is a full-stack web application for rental listings, designed around two user roles: **landlord** and **tenant**.  
The platform supports listing management, account management, and direct messaging between users.

The project was built with Node.js + Express and server-rendered Mustache templates. Data is stored locally using NeDB, which makes the app lightweight and easy to run in a student/research environment.

---

## Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Core Features](#2-core-features)
- [3. Technology Stack](#3-technology-stack)
- [4. System Architecture](#4-system-architecture)
- [5. Repository Structure](#5-repository-structure)
- [6. Getting Started](#6-getting-started)
- [7. User Roles and Permissions](#7-user-roles-and-permissions)
- [8. Data Storage Model](#8-data-storage-model)
- [9. Main Views](#9-main-views)
- [10. Known Limitations](#10-known-limitations)
- [11. Suggested Future Work](#11-suggested-future-work)

---

## 1. Project Overview

The main objective of this application is to provide a clear rental workflow:
1. **Landlords** publish and maintain property listings.
2. **Tenants** browse, filter, and save listings.
3. Both sides can communicate through an internal messaging system.

The current implementation is suitable for academic demonstration, prototyping, and further extension toward production-grade architecture.

---

## 2. Core Features

### Authentication and Session Management
- User registration and login.
- Role assignment (`landlord` / `tenant`).
- Session-based authentication using `express-session` and cookies.

### Listings Module
- Create, edit, and delete listings (landlord side).
- Upload listing photos.
- Public listing feed and listing detail pages.
- Listing search with filters:
  - location
  - area/district
  - postcode
  - minimum and maximum price

### Tenant Utilities
- Save and unsave listings.
- Browse landlord offers and inspect details.

### Messaging Module
- Conversation list per user.
- Direct messages between tenant and landlord.
- Unread message counting and read-state updates.

### Account Module
- Update account email.
- Update account password.
- Delete account.

---

## 3. Technology Stack

- **Runtime:** Node.js
- **Backend Framework:** Express
- **Templating Engine:** Mustache (`mustache-express`)
- **Auth/State:** `express-session`, `cookie-parser`
- **File Uploads:** `multer`
- **Data Layer:** `gray-nedb` (file-based NoSQL datastore)
- **Password Security:** `bcrypt`
- **Frontend Assets:** vanilla JS + CSS

---

## 4. System Architecture

The project follows a classic MVC-like separation:

- **Routes (`routes/`)** map HTTP endpoints to controller actions.
- **Controllers (`Controller/`)** handle request logic and response rendering.
- **Models (`models/`)** encapsulate persistence operations (users, listings, messages).
- **Views (`public/views/`)** provide server-rendered HTML with Mustache templates.
- **Public assets (`public/css`, `public/js`, `public/uploads`)** contain styling, browser scripts, and uploaded listing images.

This architecture keeps concerns relatively separated and makes the codebase easy to navigate for team projects.

---

## 5. Repository Structure

```text
honorProject/
├── auth/                  # authentication and upload middleware
├── Controller/            # application controllers
├── models/                # persistence layer (NeDB wrappers)
├── routes/                # route definitions
├── public/
│   ├── css/               # stylesheets
│   ├── js/                # frontend scripts
│   ├── uploads/listings/  # uploaded listing images
│   └── views/             # Mustache templates
├── index.js               # application entry point
└── package.json
```

---

## 6. Getting Started

### Requirements
- Node.js (recommended **v18+**)
- npm

### Installation

```bash
git clone https://github.com/AdriannaS96/honorProject.git
cd honorProject
npm install
```

### Run the app

```bash
node index.js
```

Then open:

```text
http://localhost:3000
```

---

## 7. User Roles and Permissions

### Landlord
- Add, edit, and remove own listings.
- Upload listing images.
- Receive and send messages.
- Manage account settings.

### Tenant
- Search and browse listings.
- Save preferred offers.
- Contact landlords via built-in messaging.
- Manage account settings.

---

## 8. Data Storage Model

The project uses local NeDB files that are auto-created on runtime:

- `user.db` — user accounts, role data, saved listings.
- `listing.db` — listing metadata and creation timestamps.
- `messages.db` — message history and read/unread status.

Because storage is local and file-based, setup is simple and does not require an external database server.

---

## 9. Main Views

- Home page
- Listings page
- Listing details page
- Login / Registration pages
- Landlord dashboard
- Tenant dashboard
- Messages and conversation views
- Account settings page

---

## 10. Known Limitations

- No production-oriented environment configuration (e.g., secrets in env variables).
- Limited input validation and error handling in some flows.
- No automated test suite at this stage.
- Current persistence layer is suitable for small-scale use, not high concurrency production workloads.

---

## 11. Suggested Future Work

For a stronger engineering version (e.g., thesis/final-year project), consider:

1. Migrating to PostgreSQL or MongoDB with an ORM/ODM layer.
2. Adding robust request validation (e.g., `zod` / `joi`).
3. Introducing automated testing (unit + integration + e2e).
4. Implementing role-based route guards more formally.
5. Replacing polling-style messaging with WebSocket real-time events.
6. Containerizing with Docker and adding CI pipelines.
7. Improving security practices (CSRF, rate-limiting, secure session config).

---

## Author

GitHub: [AdriannaS96](https://github.com/AdriannaS96)
