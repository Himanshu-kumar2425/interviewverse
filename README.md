# InterviewVerse

A dual-mode mock interview platform for engineering students — practice with an adaptive AI interviewer or join a live peer session over video.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (7-day tokens) |
| Real-time | Socket.IO |
| Video | WebRTC via PeerJS |
| AI | Google Gemini API (`@google/generative-ai`) |
| Speech | Web Speech API (browser-native) |
| Charts | Recharts |
| File uploads | Cloudinary (PDF resumes) |

---

## Project Structure

```
interviewverse/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── cloudinary.js      # Cloudinary + multer config
│   │   └── gemini.js          # Gemini SDK instance
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── resume.controller.js
│   │   ├── interview.controller.js
│   │   ├── report.controller.js
│   │   └── peer.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT protect()
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js  # asyncHandler
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Resume.model.js
│   │   ├── InterviewSession.model.js
│   │   ├── Question.model.js
│   │   ├── Answer.model.js
│   │   ├── Transcript.model.js
│   │   └── Report.model.js
│   ├── prompts/
│   │   ├── index.js
│   │   ├── interviewer.prompt.js   # Gemini interviewer system prompt
│   │   └── evaluator.prompt.js     # Gemini evaluator system prompt
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── resume.routes.js
│   │   ├── interview.routes.js
│   │   ├── report.routes.js
│   │   └── peer.routes.js
│   ├── sockets/
│   │   ├── index.js               # Socket.IO entry point
│   │   ├── peer.socket.js         # WebRTC signaling + room events
│   │   └── transcript.socket.js   # Live transcript persistence
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── geminiHelpers.js       # getNextQuestion, evaluateTranscript, parseResumeWithGemini
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js           # Axios instance + interceptors
    │   │   ├── auth.api.js
    │   │   ├── resume.api.js
    │   │   ├── interview.api.js
    │   │   ├── report.api.js
    │   │   └── peer.api.js
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── PageLayout.jsx
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   ├── PublicRoute.jsx
    │   │   │   ├── Spinner.jsx
    │   │   │   └── Toast.jsx
    │   │   ├── interview/
    │   │   │   ├── VoiceInput.jsx       # Web Speech API mic component
    │   │   │   └── TranscriptPanel.jsx  # Chat-style transcript display
    │   │   ├── peer/
    │   │   │   └── LiveCaptions.jsx     # AI Observer + real-time captions
    │   │   └── report/
    │   │       ├── ScoreGauge.jsx       # SVG circular score gauge
    │   │       └── QuestionCard.jsx     # Collapsible per-question feedback
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── InterviewContext.jsx
    │   ├── lib/
    │   │   └── socket.js          # Singleton Socket.IO client
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ResumeUpload.jsx
    │   │   ├── AIInterview.jsx
    │   │   ├── PeerInterview.jsx
    │   │   ├── PeerJoin.jsx       # Interviewer join page (shareable link)
    │   │   ├── Reports.jsx
    │   │   ├── ReportDetail.jsx
    │   │   ├── Profile.jsx
    │   │   └── NotFound.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- A [Google AI Studio](https://aistudio.google.com/) Gemini API key
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

---

## Setup

### 1. Clone / open the project

```bash
cd interviewverse
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in every value:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/interviewverse
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

Start the dev server:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The Vite dev proxy forwards all `/api` and `/socket.io` traffic to port 5000, so no extra CORS setup is needed locally.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Get current user |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | ✓ | Get profile |
| PUT | `/api/users/profile` | ✓ | Update profile |
| GET | `/api/users/stats` | ✓ | Get interview stats |

### Resumes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/resumes/upload` | ✓ | Upload PDF (multipart, field: `resume`) |
| GET | `/api/resumes/active` | ✓ | Get active parsed resume |
| GET | `/api/resumes` | ✓ | Get all resumes |
| DELETE | `/api/resumes/:id` | ✓ | Delete a resume |

### Interviews (AI mode)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/interviews/start` | ✓ | Start session, returns first question |
| POST | `/api/interviews/:id/answer` | ✓ | Submit answer, returns next question |
| POST | `/api/interviews/:id/end` | ✓ | End session, triggers report generation |
| GET | `/api/interviews` | ✓ | List all sessions |
| GET | `/api/interviews/:id` | ✓ | Session + questions + answers |

### Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports` | ✓ | List all reports |
| GET | `/api/reports/:sessionId` | ✓ | Report for a session |
| POST | `/api/reports/:sessionId/human-feedback` | ✓ | Interviewer submits rating + notes |

### Peer Sessions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/peer/create` | ✓ | Create room, returns roomId + join link |
| POST | `/api/peer/join/:roomId` | ✓ | Interviewer joins room |
| GET | `/api/peer/:roomId` | ✓ | Room info by roomId |
| POST | `/api/peer/:sessionId/end` | ✓ | End peer session |

### Socket.IO Events

| Event (client → server) | Payload | Description |
|---|---|---|
| `join-room` | `{ roomId, userId, role }` | Join a peer room |
| `leave-room` | `{ roomId, userId }` | Leave a peer room |
| `signal` | `{ to, signal }` | WebRTC signal relay |
| `transcript-turn` | `{ sessionId, role, text }` | Persist a speech turn |

| Event (server → client) | Payload | Description |
|---|---|---|
| `user-joined` | `{ userId, role, socketId }` | Another participant joined |
| `user-left` | `{ userId, socketId }` | Participant disconnected |
| `transcript-update` | `{ role, text, timestamp }` | Live caption broadcast |

---

## Gemini Prompt Design

### Interviewer prompt (`prompts/interviewer.prompt.js`)

- Accepts `topic` and optional `resumeData`
- Rules enforced: one question per turn, contextual follow-ups, no hints or feedback during the session, 8–10 questions, ends with a specific closing phrase
- Topic-specific instructions for DSA, HR, Resume, Full Stack, General modes

### Evaluator prompt (`prompts/evaluator.prompt.js`)

- Takes the full session transcript
- Returns strict JSON — no markdown, no preamble
- Schema: `overallScore`, `perQuestionFeedback[]` (with `score`, `feedback`, `sampleAnswer`), `strengths[]`, `weaknesses[]`, `suggestedImprovements[]`
- Used by both AI mode and the Peer AI Observer

---

## How AI Interview Works (end-to-end)

```
User selects topic
      ↓
POST /api/interviews/start
      ↓
Backend: create InterviewSession + Transcript
      ↓
Gemini (gemini-1.5-flash) → first question
      ↓
User reads question, types or speaks answer
      ↓
POST /api/interviews/:id/answer
      ↓
Answer saved → transcript updated → Gemini generates follow-up
      ↓
Repeat until 10 questions or Gemini signals closing
      ↓
POST /api/interviews/:id/end
      ↓
Gemini (gemini-1.5-pro) evaluates full transcript → JSON report
      ↓
Report saved to DB + user stats updated
      ↓
Frontend polls /api/reports/:sessionId until available
```

## How Peer Interview Works (end-to-end)

```
Candidate: POST /api/peer/create → gets roomId + shareable link
      ↓
Candidate joins Socket.IO room + initialises PeerJS
      ↓
Interviewer opens link → POST /api/peer/join/:roomId
      ↓
Interviewer joins Socket.IO room → server emits "user-joined" to candidate
      ↓
Candidate calls interviewer via PeerJS (WebRTC)
      ↓
Both see each other's video
      ↓
Candidate enables AI Observer → Web Speech API transcribes speech
      → socket.emit("transcript-turn") → saved to DB + broadcast as captions
      ↓
Either party: POST /api/peer/:id/end
      ↓
Same Gemini evaluator → report generated from transcript
      ↓
Interviewer submits human rating + notes via report page
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Random string for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `CLIENT_URL` | No | Frontend origin for CORS (default: http://localhost:5173) |

---

## Key Implementation Notes

**Resume parsing is async.** The upload endpoint responds immediately with a `resumeId`. The frontend polls `GET /api/resumes/active` every 3 seconds until `isParsed: true`. This keeps the upload fast even if Gemini takes a few seconds.

**Report generation is fire-and-forget.** `POST /api/interviews/:id/end` responds immediately. The Gemini evaluation runs in the background. The frontend polls the report endpoint with retries (up to 30 seconds).

**PeerJS uses the public cloud by default.** For production, self-host a [PeerJS server](https://github.com/peers/peerjs-server) and update the `host`, `port`, and `secure` values in `PeerInterview.jsx` and `PeerJoin.jsx`.

**Web Speech API is Chrome/Edge only.** Safari does not support it. Voice input degrades gracefully to text-only with a warning.

**Socket.IO auto-connect is disabled.** The socket in `lib/socket.js` only connects when `socket.connect()` is explicitly called (in peer pages). This avoids unnecessary persistent connections on non-peer pages.

---

## What's Not Built Yet (V3 backlog)

- Admin panel
- Notifications
- Leaderboard
- PDF report export
- Screen sharing
- In-call chat
- JWT refresh tokens
- Mock placement drive mode
