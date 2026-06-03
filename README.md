# 🎯 PlacementPrep — AI Mock Interview Platform

An AI-powered mock interview platform where students can practice interviews with Google Gemini AI and recruiters can view performance analytics and shortlist candidates.

🌐 **Live Demo:** [placement-prep-blond.vercel.app](https://placement-prep-blond.vercel.app)

---

## 📸 Features

### 👨‍🎓 For Students
- 🎤 **AI Mock Interviews** — Practice with Google Gemini AI as your interviewer
- 🏢 **Company Specific** — Google, Amazon, Microsoft, Meta, TCS, Infosys, and 20+ companies
- 🔄 **Multiple Rounds** — Technical, System Design, HR rounds
- 📊 **Instant Feedback** — Score, strengths, improvements after every interview
- 📈 **Interview History** — Track your progress over time

### 🏢 For Recruiters
- 👥 **View All Students** — See all registered students with performance scores
- 🔍 **Score Filter** — Filter students by minimum score (50+, 60+, 70+, 80+, 90+)
- ⭐ **Shortlist** — Save top candidates to your shortlist
- 📋 **Detailed Profiles** — View complete interview history of any student

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| AI Engine | Google Gemini API |
| Authentication | JWT (JSON Web Tokens) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google Gemini API key

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Manjeet-code/placement-prep.git
cd placement-prep
```

**2. Setup Backend**
```bash
cd server
npm install
```

Create `server/.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Start backend:
```bash
npm run dev
```

**3. Setup Frontend**
```bash
cd client
npm install
```

Create `client/.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

**4. Open in browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
placement-prep/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth & Theme context
│   │   ├── hooks/           # Custom hooks
│   │   └── pages/           # Login, Register, Dashboard, Interview, Recruiter
│   └── package.json
│
└── server/                  # Node.js Backend
    ├── controllers/         # Auth, Interview, Recruiter logic
    ├── middleware/          # JWT authentication
    ├── models/              # User, Interview, Shortlist schemas
    ├── routes/              # API routes
    ├── index.js             # Server entry point
    └── package.json
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/start` | Start new interview |
| POST | `/api/interview/message` | Send message to AI |
| POST | `/api/interview/end` | End interview & get feedback |
| GET | `/api/interview/my` | Get all my interviews |
| GET | `/api/interview/:id` | Get single interview |

### Recruiter
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recruiter/students` | Get all students with scores |
| GET | `/api/recruiter/students/:id` | Get student detail |
| POST | `/api/recruiter/shortlist/:id` | Shortlist/unshortlist student |
| GET | `/api/recruiter/shortlisted` | Get shortlisted students |

---

## 🌍 Deployment

### Backend — Render.com
1. Connect GitHub repo to Render
2. Set Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Add Environment Variables

### Frontend — Vercel
1. Connect GitHub repo to Vercel
2. Set Root Directory: `client`
3. Add Environment Variable: `REACT_APP_API_URL`

---

## 👨‍💻 Author

**Manjeet**
- GitHub: [@Manjeet-code](https://github.com/Manjeet-code)
- Live: [placement-prep-blond.vercel.app](https://placement-prep-blond.vercel.app)

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.

---

⭐ **If you found this helpful, please give it a star on GitHub!**
