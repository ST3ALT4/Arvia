# ARVIA - AI Financial Dashboard & Forecasting Platform

A modern, OLED-themed financial analytics web dashboard powered by React, Vite, Chart.js, and a FastAPI machine learning inference backend.

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js**: v18 or higher & `npm`
- **Python**: 3.10+ (for running the backend model server)

---

### 1. Frontend Web Application

To start the React frontend web application in development mode:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` (or the local URL printed in your terminal).

#### Additional Frontend Commands:
- **Build for Production**: `npm run build`
- **Preview Production Build**: `npm run preview`
- **Lint Codebase**: `npm run lint`

---

### 2. Backend Model Inference Server (Optional)

The backend is built with FastAPI to serve predictions from machine learning model checkpoints.

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *(Note: The server hot-reloads model checkpoints placed inside `server/checkpoints/`)*

4. Access interactive API documentation at `http://localhost:8000/docs`.

---

## 📦 Features & Tools Included
- **Plain-English Metric Decoder**: Decodes financial metrics into intuitive jargon-free explanations.
- **Truth Detector**: Scans financial tips and advice to flag scams or hype.
- **Panic Circuit Breaker**: Behavioral safety guards during market volatility.
- **Goal Simulator**: Visualizes progress toward financial milestones.
- **Pocket Leak Hunter**: Pinpoints subscription leaks and wasteful spend.
- **Yahoo Finance Live Data Integration**: Interactive stock search & market trends.
