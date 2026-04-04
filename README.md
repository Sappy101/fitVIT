<div align="center">
  <h1>🍽️ FitVIT</h1>
  <p><b>Smart Mess Management & Predictive Analytics for VIT University</b></p>

  <p>
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://python.org/"><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
  </p>
</div>

<br />

> **FitVIT** is a next-generation mess management platform designed for VIT University. It bridges the gap between student dining preferences and administrative logistics using **Predictive Machine Learning** and **Real-time Analytics** to reduce food waste and enhance the dining experience.

## ✨ Ecosystem

FitVIT operates across two primary interfaces, backed by a robust cloud infrastructure:

### 🎓 Student Experience (Mobile App - v3 & v4)
- **Personalized Menu:** View daily menus tailored to dietary preferences (Veg, Non-Veg, Special).
- **Nutritional Tracking:** Track daily caloric intake and macro distribution (Protein, Carbs, Fats).
- **Real-time Feedback:** Rate meals, report issues, and provide actionable feedback on food quality.
- **Automated Preferences:** Smart tracking of student eating habits.

### 📊 Admin Intelligence (Dashboard)
- **Predictive Demand Engine:** ML-driven analytics to predict top-demanded items and potential food waste risks.
- **Waste Management:** Categorize waste risks (HIGH, MEDIUM, SAFE) to optimize cooking quantities.
- **Live Metrics:** Monitor total ratings, average satisfaction, and dietary demographics in real-time.
- **Dietary Vault:** Visual demographic breakdowns of student preferences.

## 🗂️ Branch Architecture

This repository is meticulously organized into a branch-based monorepo:

| Branch | Description | Status |
|--------|-------------|--------|
| **[`main`](https://github.com/Sappy101/fitVIT/tree/main)** | Core documentation and project entry point. | 🟢 Active |
| **[`app`](https://github.com/Sappy101/fitVIT/tree/app)** | Source code for the Expo React Native mobile applications (`v3` and `v4`). | 🟢 Active |
| **[`website`](https://github.com/Sappy101/fitVIT/tree/website)** | Source code for the FitVIT web portal and landing page. | 🟡 In Development |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli`)
- Python 3.9+ (for Predictive Engine)
- Supabase CLI

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sappy101/fitVIT.git
   ```

2. **Switch to the desired branch:**
   ```bash
   # For Mobile App development
   git checkout app

   # For Website development
   git checkout website
   ```

3. **Install dependencies (Example for App):**
   ```bash
   cd FitVITv4/frontend
   npm install
   ```

4. **Run the development server:**
   ```bash
   npx expo start
   ```

## 🧠 Tech Stack

- **Frontend:** React Native, Expo Router, React Native Chart Kit
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions), Python FastAPI
- **Predictive Engine:** Scikit-Learn, Pandas, NumPy
- **Design:** Custom *Living Greenhouse* UI System (Glassmorphism, Vibrant Colors, Dark Mode)

---
<div align="center">
  <p>Built with ❤️ by the <b>FitVIT Team</b> at VIT University</p>
</div>