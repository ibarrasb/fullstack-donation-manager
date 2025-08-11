# 🏠 Shelter Donation Manager

A simple **full-stack web app** for managing a local shelter’s donation inventory.  
Built with **Vite + React (SWC)** frontend, **Express + MongoDB (Mongoose)** backend, and styled with vanilla CSS.

---

## 🌐 Live Demo
**[Check it out here](https://fullstack-donation-manager-51ec65920601.herokuapp.com/)**

---

## 📋 Features
- Record new donations with:
  - Donor's name
  - Donation type (money, food, clothing, supplies, other)
  - Amount or quantity
  - Date donated
- List all recorded donations
- Edit or delete donations
- All data persisted in MongoDB Atlas
- Backend validation using Zod
- Single-page frontend with a form + table

---

## 🛠 Tech Stack
**Frontend**
- Vite + React (with `@vitejs/plugin-react-swc` for speed)
- Fetch API for backend communication

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Zod (data validation)
- Morgan (HTTP logging)
- CORS (enabled in dev)

---