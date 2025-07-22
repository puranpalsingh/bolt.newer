# Bolt Project Monorepo

**Overview:**

This project is a web application that allows users to build websites using Claude AI. User prompts are sent to Claude, and the AI's responses are displayed directly on the screen. The application runs in a WebContainer environment, enabling a seamless, in-browser development and preview experience.

## Project Structure

- `frontend/` – React + TypeScript + Vite application
- `backend/` – Express.js + TypeScript API server

---

## Frontend

- **Stack:** React, TypeScript, Vite, Tailwind CSS
- **Location:** [`frontend/`](./frontend)
- **Development:**
  1. `cd frontend`
  2. `npm install`
  3. `npm run dev`
- See [`frontend/README.md`](./frontend/README.md) for more details.

---

## Backend

- **Stack:** Node.js, Express, TypeScript
- **Location:** [`backend/`](./backend)
- **Development:**
  1. `cd backend`
  2. `npm install`
  3. `npm run dev`
- The backend server runs on port 3000 by default.

---

## Getting Started

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Start each service as described above

---

## Environment Variables

- The backend expects a `.env` file with the following variable:
  - `CLAUDE_API_KEY` – API key for Anthropic Claude

---

## License

This project is licensed under the ISC License. 