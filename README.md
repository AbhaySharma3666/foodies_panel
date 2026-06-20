# 🍔 Foodies - Food Delivery Platform

A customer-facing frontend for the **Foodies** online food delivery platform. Built with **React + Vite**, this app allows users to browse food items, manage their cart, place orders, and make payments via Razorpay.

## 🌐 Live Demo

| Service | URL |
| --- | --- |
| **Customer Panel** | [foodies-panel.vercel.app](https://foodies-panel.vercel.app) |
| **Admin Panel** | [foodies-adminpanel.vercel.app](https://foodies-adminpanel.vercel.app) |
| **Backend API** | [foodies-api-0d6g.onrender.com](https://foodies-api-0d6g.onrender.com/api/health) |

> [!NOTE]
> The backend is hosted on Render's free tier and may take 30–60 seconds to wake up on the first request.

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| [React 19](https://react.dev/) | UI framework |
| [Vite 7](https://vite.dev/) | Build tool & dev server |
| [Bootstrap 5](https://getbootstrap.com/) | CSS framework & components |
| [Axios](https://axios-http.com/) | HTTP client |
| [React Router v7](https://reactrouter.com/) | Client-side routing |
| [React Toastify](https://fkhadra.github.io/react-toastify/) | Toast notifications |

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- Backend API server running (default: `http://localhost:8080`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd foodies

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |
| `VITE_RAZORPAY_KEY` | Razorpay test/live key | — |
| `VITE_ENV` | Environment (`development` / `production`) | `development` |

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint checks |

## 🔗 Related Projects

- **[Foodies Admin Panel](https://foodies-adminpanel.vercel.app)** — Admin dashboard for managing food items and orders
- **[Foodies API](https://foodies-api-0d6g.onrender.com/api/health)** — Spring Boot backend REST API
