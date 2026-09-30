# 🛒 ShopCart

Modern full-stack e-commerce application built with Next.js, React,
TypeScript, Redux Toolkit, Node.js, Express.js and MongoDB.

## 🚀 Live Demo

Frontend: https://e-commerce-web-alpha-peach.vercel.app/products
Backend API: https://shopcart-backend-lixr.onrender.com/api/health

## ✨ Features

### Frontend
- Product listing
- Product details
- Search
- Search suggestions
- Filtering and sorting
- Pagination
- Shopping cart
- Quantity management
- Wishlist
- Authentication
- Responsive UI
- Loading/shimmer states
- Error handling

### Backend
- RESTful APIs
- Authentication
- Product APIs
- Search APIs
- Cart/order functionality
- MongoDB persistence
- Input validation
- CORS configuration

## 🏗️ Architecture

Vercel
  ↓
Next.js / React / TypeScript
  ↓
Render
  ↓
Node.js / Express.js
  ↓
MongoDB Atlas

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Redux Toolkit
- RTK Query
- Material UI
- CSS / CSS Modules
- Jest
- React Testing Library

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### DevOps / Deployment
- Git
- GitHub
- Docker
- Render
- Vercel
- MongoDB Atlas

## 🧪 Testing

- Unit Testing
- Integration Testing
- Jest
- React Testing Library

Current frontend test status:

29 tests passing

## 🔐 Environment Variables

### Frontend

NEXT_PUBLIC_API_URL=https://your-backend-url/api

### Backend

PORT=5000
MONGO_URI=your-mongodb-uri
FRONTEND_URL=your-frontend-url
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

Never commit `.env` files or production secrets.

## 💻 Local Development

### Clone

git clone https://github.com/sachin-maker/E-commerce-Web.git

cd E-commerce-Web

### Frontend

cd shopcart
npm install
npm run dev

### Backend

cd backend
npm install
npm run dev

## 🚢 Deployment

Frontend:
Vercel

Backend:
Render

Database:
MongoDB Atlas

## 📁 Project Structure

E-commerce-Web/
├── backend/
│   ├── src/
│   ├── scripts/
│   ├── Dockerfile
│   └── package.json
│
├── shopcart/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md

## 📌 Future Improvements

- Advanced product search
- Payment integration
- Order tracking
- Advanced analytics
- Performance monitoring
- Additional automated tests

## 👨‍💻 Author

Sachin Deshpande
