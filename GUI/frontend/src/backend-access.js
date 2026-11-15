import axios from "axios";

// Use relative /api; Vite dev server proxies to backend (localhost:8081)
export default axios.create({
  baseURL: "/api",
  headers: {
    "Content-type": "application/json"
  }
});
