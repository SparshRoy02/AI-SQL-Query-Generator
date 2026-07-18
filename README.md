#  AI SQL Query Generator

> Convert plain English into SQL queries — instantly. Powered by **Llama 3** running locally via **Ollama**, with a **React** frontend, **Express** backend, and **MongoDB** for query history.

---

##  Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [How It Works (Architecture)](#-how-it-works-architecture)
5. [Prerequisites](#-prerequisites)
6. [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
   - [Step 1 — Install Ollama & Pull Llama 3](#step-1--install-ollama--pull-llama-3)
   - [Step 2 — Install & Start MongoDB](#step-2--install--start-mongodb)
   - [Step 3 — Clone the Repository](#step-3--clone-the-repository)
   - [Step 4 — Set Up the Backend](#step-4--set-up-the-backend)
   - [Step 5 — Configure Environment Variables](#step-5--configure-environment-variables)
   - [Step 6 — Start the Backend Server](#step-6--start-the-backend-server)
   - [Step 7 — Set Up the Frontend](#step-7--set-up-the-frontend)
   - [Step 8 — Start the Frontend Dev Server](#step-8--start-the-frontend-dev-server)
   - [Step 9 — Use the Application](#step-9--use-the-application)
7. [API Reference](#-api-reference)
8. [Code Walkthrough](#-code-walkthrough)
9. [Troubleshooting](#-troubleshooting)

---

##  Project Overview

The **AI SQL Query Generator** is a full-stack web application that lets you describe what data you want in plain English and instantly generates a valid SQL query using a locally running AI model (**Llama 3** via Ollama). Every query you generate is automatically saved to a **MongoDB** database so you can track your history.

**Example:**

| Your plain English prompt | Generated SQL |
|---|---|
| `Find all users who signed up last month and ordered more than 3 items` | `SELECT u.* FROM users u JOIN orders o ON u.id = o.user_id WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) GROUP BY u.id HAVING COUNT(o.id) > 3;` |

---

##  Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **AI Model** | Llama 3 (via Ollama) | Generates SQL from natural language |
| **Frontend** | React 19 + Vite | Interactive UI |
| **Styling** | Vanilla CSS (glassmorphism) | Dark, premium UI with animations |
| **Backend** | Node.js + Express 5 | REST API server |
| **Database** | MongoDB + Mongoose | Stores query history |
| **AI Bridge** | node-fetch | Backend calls Ollama's local HTTP API |
| **Icons** | lucide-react | UI icons (Sparkles, Database, Copy, etc.) |

---

##  Project Structure

```
AI SQL Query/
├── backend/                    # Express API server
│   ├── controllers/
│   │   └── queryController.js  # Business logic: calls Ollama, saves to DB
│   ├── models/
│   │   └── Query.js            # Mongoose schema for query history
│   ├── routes/
│   │   └── queryRoutes.js      # API route definitions
│   ├── .env                    # Environment variables (PORT, MONGO_URI, OLLAMA_URL)
│   ├── package.json            # Backend dependencies
│   └── server.js               # Express app entry point
│
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── App.jsx             # Main React component (UI + state + API calls)
│   │   ├── App.css             # Component-level styles
│   │   ├── index.css           # Global CSS variables & body styles
│   │   └── main.jsx            # React DOM entry point
│   ├── index.html              # HTML shell
│   ├── vite.config.js          # Vite build configuration
│   └── package.json            # Frontend dependencies
│
├── .gitignore
└── README.md
```

---

##  How It Works (Architecture)

Below is the complete data flow, from the moment you type a prompt to receiving a SQL query:

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (React)                       │
│  User types prompt → clicks "Generate SQL" button            │
│  POST http://localhost:5000/api/generate  { prompt: "..." }  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP Request
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + Node.js)               │
│  server.js → queryRoutes.js → queryController.js             │
│                                                              │
│  1. Validates that prompt is not empty                        │
│  2. Sends prompt to Ollama with a strict SQL-only system     │
│     instruction via POST http://localhost:11434/api/generate  │
│  3. Receives the raw SQL string back from Llama 3            │
│  4. Saves { prompt, sqlQuery, createdAt } to MongoDB         │
│  5. Returns { sql, id } to the browser                       │
└──────────────┬────────────────────────────┬─────────────────┘
               │                            │
               ▼                            ▼
┌──────────────────────┐     ┌──────────────────────────────┐
│  OLLAMA (Local AI)   │     │  MONGODB (Local Database)    │
│  Model: llama3       │     │  DB: ai-sql-generator        │
│  Port: 11434         │     │  Collection: queries         │
│  Runs 100% offline   │     │  Stores prompt + SQL history │
└──────────────────────┘     └──────────────────────────────┘
```

---

##  Prerequisites

Make sure the following are installed on your machine before beginning:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v18 or higher | https://nodejs.org |
| **npm** | v9 or higher | Comes with Node.js |
| **MongoDB** | v6 or higher | https://www.mongodb.com/try/download/community |
| **Ollama** | Latest | https://ollama.com/download |
| **Git** | Any | https://git-scm.com |

---

##  Step-by-Step Setup Guide

### Step 1 — Install Ollama & Pull Llama 3

Ollama is a tool that lets you run large language models locally on your machine. The backend calls it over HTTP — no internet or API keys needed.

**1a. Download and install Ollama** from https://ollama.com/download

**1b. Open a terminal and pull the Llama 3 model** (this downloads ~4.7 GB the first time):

```bash
ollama pull llama3
```

**1c. Verify Ollama is running:**

```bash
ollama list
```

You should see `llama3` listed. Ollama automatically starts a local HTTP server at `http://localhost:11434`. You can confirm by visiting that URL in your browser.

> **Why Llama 3?**
> The controller sends a carefully crafted system prompt telling Llama 3 to act as an SQL expert and return *only* the raw SQL with no explanations or markdown — keeping the output clean and ready to use.

---

### Step 2 — Install & Start MongoDB

MongoDB stores every SQL query you generate so you can revisit your history.

**2a. Install MongoDB Community Edition** from https://www.mongodb.com/try/download/community

**2b. Start the MongoDB service:**

- **Windows:** MongoDB runs as a Windows Service automatically after installation. You can also start it manually:
  ```bash
  net start MongoDB
  ```

- **macOS (with Homebrew):**
  ```bash
  brew services start mongodb-community
  ```

- **Linux:**
  ```bash
  sudo systemctl start mongod
  ```

**2c. Confirm MongoDB is running** by connecting to it:

```bash
mongosh
```

You should see the MongoDB shell prompt. Type `exit` to leave.

> The application will automatically create a database named **`ai-sql-generator`** and a collection named **`queries`** the first time a query is saved. You don't need to create anything manually.

---

### Step 3 — Clone the Repository

```bash
git clone https://github.com/your-username/ai-sql-query-generator.git
cd "AI SQL Query"
```

> If you already have the project folder on your machine, skip this step and navigate into the project directory.

---

### Step 4 — Set Up the Backend

The backend is an **Express.js** REST API that acts as the bridge between the React frontend, the Ollama AI, and MongoDB.

**4a. Navigate into the backend folder:**

```bash
cd backend
```

**4b. Install dependencies:**

```bash
npm install
```

This installs the following packages (defined in `package.json`):

| Package | Role |
|---|---|
| `express` | Web framework for creating the REST API |
| `cors` | Allows the React frontend (port 5173) to talk to the backend (port 5000) |
| `mongoose` | ODM library to connect to and interact with MongoDB |
| `dotenv` | Loads environment variables from the `.env` file |
| `node-fetch` | Lets Node.js make HTTP requests to the Ollama API |

---

### Step 5 — Configure Environment Variables

The backend reads its configuration from the `.env` file located at `backend/.env`.

**Open `backend/.env`** and confirm the values match your local setup:

```env
PORT=5000
OLLAMA_URL=http://localhost:11434
MONGO_URI=mongodb://localhost:27017/ai-sql-generator
```

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | The port the Express server will listen on |
| `OLLAMA_URL` | `http://localhost:11434` | The base URL of your local Ollama server |
| `MONGO_URI` | `mongodb://localhost:27017/ai-sql-generator` | MongoDB connection string. Change this if using MongoDB Atlas or a different local port |

> **Security Note:** The `.env` file is listed in `.gitignore` and will **not** be committed to Git. Never commit API keys or database credentials.

---

### Step 6 — Start the Backend Server

From inside the `backend/` folder, run:

```bash
node server.js
```

You should see two success messages in the terminal:

```
Server is running on port 5000
MongoDB connected successfully
```

**What happens when the server starts (`server.js`)?**

1. Express is initialized with `cors()` middleware (so the browser can call it) and `express.json()` (so it can read JSON request bodies).
2. All routes are registered under the `/api` prefix.
3. Mongoose connects to MongoDB using the `MONGO_URI` from `.env`.
4. The server starts listening on port `5000`.

> **Tip:** You can add a `start` script to `backend/package.json` so you can use `npm start` instead:
> ```json
> "scripts": { "start": "node server.js" }
> ```

---

### Step 7 — Set Up the Frontend

The frontend is a **React 19** single-page app built with **Vite** for fast development.

**7a. Open a new terminal** (keep the backend terminal running) and navigate to the frontend:

```bash
cd frontend
```

**7b. Install dependencies:**

```bash
npm install
```

This installs:

| Package | Role |
|---|---|
| `react` & `react-dom` | Core React library |
| `lucide-react` | Beautiful SVG icon components used in the UI |
| `vite` | Fast dev server and build tool |
| `@vitejs/plugin-react` | Enables React JSX transform for Vite |

---

### Step 8 — Start the Frontend Dev Server

```bash
npm run dev
```

Vite will start the development server. You'll see output like:

```
  VITE v8.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open **http://localhost:5173** in your browser. You should see the AI SQL Query Generator UI.

---

### Step 9 — Use the Application

Now that all three services are running (Ollama on port 11434, Backend on port 5000, Frontend on port 5173), you can use the app:

1. **Type a plain English description** of the data you want in the textarea.
   - Example: *"Get all products with a price greater than 100 that were added in the last 7 days"*

2. **Click "Generate SQL"** — the button shows a spinning loader while the request is being processed.

3. **The generated SQL query appears** in the result box below, displayed in a monospace font with syntax highlighting.

4. **Click the copy button** (top-right of the result box) to copy the SQL to your clipboard. The icon briefly turns green to confirm.

5. **Every query is automatically saved** to MongoDB, so your history is always preserved.

---

##  API Reference

The backend exposes two REST endpoints under `/api`:

### `POST /api/generate`

Generates a SQL query from a natural language prompt.

**Request Body:**
```json
{
  "prompt": "Find all users who have made more than 5 purchases"
}
```

**Success Response `200`:**
```json
{
  "sql": "SELECT user_id, COUNT(*) as purchase_count FROM purchases GROUP BY user_id HAVING COUNT(*) > 5;",
  "id": "64f3a1b2c9e77f001a8b45e1"
}
```

**Error Response `400`** (missing prompt):
```json
{ "error": "Prompt is required" }
```

**Error Response `500`** (Ollama not running):
```json
{ "error": "Failed to generate SQL query. Make sure Ollama is running locally." }
```

---

### `GET /api/history`

Returns the 20 most recent saved queries, sorted newest first.

**Success Response `200`:**
```json
[
  {
    "_id": "64f3a1b2c9e77f001a8b45e1",
    "prompt": "Find all users who have made more than 5 purchases",
    "sqlQuery": "SELECT user_id ...",
    "createdAt": "2026-07-18T05:00:00.000Z"
  }
]
```

---

##  Code Walkthrough

### Backend — `queryController.js`

This is the core brain of the backend. The `generateQuery` function:

```js
// 1. Extract the plain-English prompt from the request body
const { prompt } = req.body;

// 2. Call Ollama's local API with a strict system instruction
const response = await fetch(`${ollamaUrl}/api/generate`, {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama3',
    prompt: `You are an expert SQL developer. Generate ONLY a valid SQL query...
             \n\nRequest: ${prompt}`,
    stream: false,       // Wait for the full response, not a stream
  }),
});

// 3. Extract the clean SQL text from Ollama's response
const sqlQuery = data.response.trim();

// 4. Save the prompt + SQL pair to MongoDB via Mongoose
const newQuery = new Query({ prompt, sqlQuery });
await newQuery.save();

// 5. Send the result back to the browser
res.json({ sql: sqlQuery, id: newQuery._id });
```

> The `stream: false` flag is critical — it tells Ollama to return the entire completed response as a single JSON object instead of a streaming response, which keeps the code simple.

---

### Backend — `Query.js` (Mongoose Model)

```js
const querySchema = new mongoose.Schema({
  prompt:    { type: String, required: true },   // The user's natural language input
  sqlQuery:  { type: String, required: true },   // The AI-generated SQL
  createdAt: { type: Date, default: Date.now },  // Auto-set timestamp
});
```

This schema defines the shape of every document saved to the `queries` collection in MongoDB.

---

### Frontend — `App.jsx`

The React component manages five pieces of state:

| State | Type | Purpose |
|---|---|---|
| `prompt` | `string` | Tracks what the user types in the textarea |
| `sql` | `string` | Holds the generated SQL to display |
| `loading` | `boolean` | Shows the spinner while awaiting the API response |
| `error` | `string` | Displays any error messages |
| `copied` | `boolean` | Briefly flips to `true` to show the copy confirmation icon |

The `generateSql` function calls the backend:
```js
const response = await fetch('http://localhost:5000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt }),
});
const data = await response.json();
setSql(data.sql);  // Triggers the result box to appear
```

---

##  Troubleshooting

### "Failed to generate SQL query. Make sure Ollama is running locally."

- **Cause:** The backend cannot reach Ollama at `http://localhost:11434`.
- **Fix:** Open a terminal and run `ollama serve`. Also verify the model exists with `ollama list`.

---

### "MongoDB connection error" in the backend terminal

- **Cause:** MongoDB is not running.
- **Fix:**
  - Windows: `net start MongoDB`
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`

---

### CORS error in the browser console

- **Cause:** The backend is not running, or is on a different port than `5000`.
- **Fix:** Confirm the backend is running with `node server.js` and that `PORT=5000` is set in `.env`. The `cors()` middleware in `server.js` already allows all origins for development.

---

### `ollama pull llama3` is slow

- **Expected:** Llama 3 is a ~4.7 GB model. The download only happens once. Subsequent runs use the cached model.

---

### The "Generate SQL" button stays disabled

- **Cause:** The textarea is empty or contains only whitespace.
- **Fix:** The button is intentionally disabled when `!prompt.trim()` is true. Type something in the box.

---

##  Running All Services (Quick Reference)

Open **three separate terminals** and run:

```bash
# Terminal 1 — AI Model
ollama serve

# Terminal 2 — Backend API
cd backend
node server.js

# Terminal 3 — Frontend
cd frontend
npm run dev
```

Then visit **http://localhost:5173** in your browser.

---
##  Conclusion

The **AI SQL Query Generator** demonstrates how powerful locally-run AI models can be integrated into a practical, full-stack web application — without relying on paid APIs or sending your data to the cloud.

Here's a recap of what this project achieves:

-  **Natural language → SQL** — Describe what you want in plain English; Llama 3 handles the rest.
-  **100% local AI** — Ollama runs the model on your own machine. No API keys, no rate limits, no cost.
-  **Full-stack architecture** — A clean separation between a React frontend, Express backend, and MongoDB database.
-  **Persistent history** — Every query is saved to MongoDB so you never lose a generated result.
-  **Developer-friendly** — The codebase is intentionally minimal and easy to extend.

###  Ideas for Future Improvements

If you'd like to take this project further, here are some directions to explore:

| Feature | Description |
|---|---|
| **Query History UI** | Add a sidebar or modal in React to browse saved queries using `GET /api/history` |
| **Syntax Highlighting** | Integrate a library like `highlight.js` or `react-syntax-highlighter` for color-coded SQL |
| **Multiple AI Models** | Let the user switch between `llama3`, `codellama`, or `mistral` from a dropdown |
| **Schema-Aware Queries** | Allow users to paste their table schema so the AI generates more accurate queries |
| **Export Options** | Add buttons to download the SQL as a `.sql` file |
| **Dark/Light Theme Toggle** | Extend the CSS variables system to support a light mode |
| **Authentication** | Add user accounts so each person has their own private query history |

###  Acknowledgements

This project is built on top of outstanding open-source tools:

- [**Ollama**](https://ollama.com) — For making local LLM inference simple and accessible.
- [**Meta Llama 3**](https://llama.meta.com) — The AI model powering the SQL generation.
- [**React**](https://react.dev) & [**Vite**](https://vite.dev) — For the fast, modern frontend experience.
- [**Express**](https://expressjs.com) — The minimal and flexible Node.js web framework.
- [**MongoDB**](https://www.mongodb.com) & [**Mongoose**](https://mongoosejs.com) — For effortless data persistence.
- [**Lucide**](https://lucide.dev) — For the clean, consistent icon set.

---
