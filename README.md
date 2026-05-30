# 🌙 Sleep Clues — Frictionless Sleep Tracker

**Sleep Clues** is a mobile-first, premium dark-themed sleep logging MVP designed to help you identify sleep helpers and disruptors in under 30 seconds a day. 

Instead of trying to perfectly measure sleep cycles, it focuses on uncovering patterns (e.g., *"How does reading before bed or drinking alcohol affect my sleep quality?"*) through frictionless tracking.

---

## ✨ Features

- **Daily Log Form (`/`)**: Under-30-second logging. Choose date (with quick Today/Yesterday buttons), set bed/wake times, log wake interruptions, rate sleep quality from 1 to 5, toggle daily habit chips, and write brief notes.
- **Sleep History (`/history`)**: A vertical card-based timeline of all sleep logs. Automatically calculates your total sleep duration (handling midnight crossing) and displays habit tags, notes, and edit/delete actions.
- **Sleep Insights (`/insights`)**:
  - **Averages**: Total nights logged and overall average quality.
  - **Helpers vs. Disruptors**: Ranks habits most frequently associated with good sleep (quality $\ge$ 4) and bad sleep (quality $\le$ 3).
  - **Correlation Meter**: Compares average sleep quality when a tag is present versus when it is absent, showcasing the positive or negative impact with colored impact strength meters.
- **Self-Healing Setup**: If the database is not configured, the app displays a guided setup walkthrough instead of crashing.

---

## 🛠️ Tech Stack

- **Core**: [Next.js](https://nextjs.org/) (App Router, Server Actions, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Midnight-themed glassmorphism cards and custom gradients)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [Neon Postgres](https://neon.tech/) (Serverless Postgres)

---

## 🚀 Getting Started (Local Setup)

### 1. Prerequisites
Ensure you have **Node.js 20+** installed. You will also need a database connection string. We recommend creating a free serverless database on [Neon.tech](https://neon.tech).

### 2. Configure Environment
Clone this repository, then create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Open `.env.local` and add your database URL:
```env
DATABASE_URL="postgres://username:password@ep-host-name.region.neon.tech/neondb?sslmode=require"
```

### 3. Install & Run
Install dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> **Automatic Schema Migration**: You do not need to run manual SQL scripts! The app automatically initializes the database tables (`sleep_logs` and `sleep_log_tags`) the first time a query is executed.

---

## 🐳 Docker Deployment (Always-On)

This application is fully Dockerized using Next.js standalone builds to run efficiently on home servers or docker clusters (e.g., Portainer, Swarm, Kubernetes). Standalone mode reduces the final image size to ~120MB.

### Run with Docker Compose
To build and start the application in detached mode:
```bash
docker compose up -d --build
```
This binds to port `3000`. You can pass your `DATABASE_URL` as an environment variable or define it in a `.env` file on your host machine.

---

## 🚀 CI/CD & Automated Builds (GitHub Actions)

A GitHub Actions workflow is included at `.github/workflows/docker-publish.yml`. 

When you push code to `main` or `master` branches, GitHub will:
1. Automatically build a production-optimized container.
2. Publish the built image to **GitHub Container Registry (GHCR)** at `ghcr.io/your-github-username/sleep-tracker`.
3. Tag the image as `latest` and with the commit SHA for simple deployments and rollbacks.
