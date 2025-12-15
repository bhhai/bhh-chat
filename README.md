<div align="center">

# 💬 BHH Chat Application

![BHH Chat Logo](./client/src/assets/logo_icon.png)

A modern, real-time chat application built with the **MERN** stack (MongoDB, Express.js, React, Node.js) and **Socket.IO** for instant messaging. Features include message reactions, custom chat backgrounds, infinite scroll, and a beautiful responsive UI.

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-black.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.10-38bdf8.svg)](https://tailwindcss.com/)

</div>

---

## ✨ Features

### 🔐 Authentication & User Management

- **JWT-based authentication** with secure password hashing
- **User profile management** with profile pictures
- **Online/Offline status** tracking with "last active" timestamps
- **Real-time user presence** updates via Socket.IO

### 💬 Messaging Features

- **Real-time messaging** with Socket.IO
- **One-on-one conversations** with instant message delivery
- **Message reactions** with emoji picker (👍 ❤️ 😂 😮 😢 🙏)
- **Image sharing** with Cloudinary integration
- **Message deletion** with confirmation modal
- **Message details** modal showing full message information
- **Seen/Unseen indicators** for message status
- **Infinite scroll** for loading message history
- **Pagination** support for efficient data loading

### 🎨 UI/UX Features

- **Custom chat backgrounds** per conversation
  - Preset gradient themes
  - Custom image uploads
  - Per-conversation theme storage
- **Responsive design** for mobile, tablet, and desktop
- **Smooth animations** with Framer Motion
- **Dark/Light mode** ready (Tailwind CSS)
- **Scroll to bottom** button when scrolled up
- **Loading indicators** for better UX
- **Toast notifications** for user feedback

### 🏗️ Architecture

- **Clean code structure** with separation of concerns
- **Custom React hooks** for reusable logic
- **Component-based architecture** for maintainability
- **Service/Controller pattern** on backend
- **TanStack Query** for efficient data fetching and caching

---

## 🛠️ Tech Stack

### Frontend

- **React 19.1.0** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS 4.1.10** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications

### Backend

- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.15.0** - MongoDB object modeling
- **Socket.IO 4.8.1** - Real-time bidirectional communication
- **JSON Web Tokens (JWT)** - Authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Image storage and CDN
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

---

## 📦 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary account** (for image uploads)

### Clone the repository

```bash
git clone https://github.com/yourusername/bhh-chatapp.git
cd bhh-chatapp
```

### Install Server Dependencies

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Install Client Dependencies

```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` folder (if needed):

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Running the Application

### Start the Backend Server

```bash
cd server
npm run server
# or
npm start
```

The server will run on `http://localhost:5000`

### Start the Frontend Client

```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173`

---

## 📂 Project Structure

```
bhh-chatapp/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── assets/           # Images, icons, logos
│   │   ├── components/       # React components
│   │   │   ├── chat/        # Chat-related components
│   │   │   │   ├── ChatHeader.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   ├── MessageList.jsx
│   │   │   │   ├── MessageItem.jsx
│   │   │   │   ├── ReactionPicker.jsx
│   │   │   │   ├── ReactionList.jsx
│   │   │   │   ├── ScrollToBottomButton.jsx
│   │   │   │   ├── MessageDetailModal.jsx
│   │   │   │   ├── DeleteMessageModal.jsx
│   │   │   │   └── MobileMenu.jsx
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── RightSidebar.jsx
│   │   ├── context/          # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ChatContext.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useMessages.js
│   │   │   ├── useChatBackground.js
│   │   │   ├── useScrollToBottom.js
│   │   │   ├── useMessageReactions.js
│   │   │   └── useMessageActions.js
│   │   ├── lib/              # Utility functions
│   │   │   └── utils.js
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Backend Express application
│   ├── controllers/           # Request handlers
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── services/              # Business logic
│   │   ├── messageService.js
│   │   └── userService.js
│   ├── models/                # Mongoose models
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/                # API routes
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/            # Express middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── lib/                   # Utility libraries
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   └── utils.js
│   ├── server.js              # Entry point
│   └── package.json
│
└── README.md
```

---

## 📡 API Endpoints

### Authentication

- `POST /api/user/register` - Register a new user
- `POST /api/user/login` - Login user
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/users` - Get all users

### Messages

- `GET /api/messages/:userId` - Get messages with pagination
  - Query params: `page`, `limit`
- `GET /api/messages/detail/:id` - Get message details
- `POST /api/messages/send/:userId` - Send a message
- `POST /api/messages/reaction/:id` - Toggle message reaction
- `PUT /api/messages/mark/:id` - Mark message as seen
- `DELETE /api/messages/:id` - Delete a message

---

## 🎯 Key Features Explained

### Infinite Scroll

Messages are loaded progressively as you scroll to the top, using TanStack Query's `useInfiniteQuery` for efficient pagination.

### Message Reactions

Click on any message to add emoji reactions. Hover over reactions to see who reacted.

### Custom Chat Backgrounds

Each conversation can have its own background theme - choose from presets or upload your own image.

### Real-time Updates

All messages, reactions, and user status updates are synchronized in real-time using Socket.IO.

---

## 🔒 Security Features

- **JWT authentication** for secure API access
- **Password hashing** with bcrypt
- **Protected routes** on both frontend and backend
- **Input validation** and sanitization
- **CORS** configuration for secure cross-origin requests

---

## 📱 Responsive Design

The application is fully responsive and optimized for:

- 📱 **Mobile** (< 640px)
- 📱 **Tablet** (640px - 1024px)
- 💻 **Desktop** (> 1024px)

---

## 🧪 Development

### Code Structure

- **Separation of concerns**: Controllers handle requests, Services contain business logic
- **Custom hooks**: Reusable logic extracted into hooks
- **Component composition**: Small, focused components for maintainability
- **TypeScript ready**: Easy to migrate to TypeScript if needed

### Best Practices

- ✅ Clean code principles
- ✅ DRY (Don't Repeat Yourself)
- ✅ SOLID principles
- ✅ Component reusability
- ✅ Error handling
- ✅ Loading states

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**BHH Team**

Built with ❤️ using React, Node.js, and Socket.IO

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI library
- [Socket.IO](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Cloudinary](https://cloudinary.com/) - Image storage

---

<div align="center">

**⭐ Star this repo if you find it helpful! ⭐**

</div>
