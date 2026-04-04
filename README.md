<div align="center">
  <h1>🍽️ FitVIT</h1>
  <p><b>Smart Mess Menu & Nutrition Information System</b></p>
  <p><i>Theme 3: Mess & Dining Optimization | P07</i></p>

  <p>
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://python.org/"><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
  </p>
</div>

<br />

> **FitVIT** is our comprehensive solution to **Solvathon Problem P07**. We are bridging the gap between student dining and hostel mess management by digitizing menus, tracking nutritional intake, mapping preferences, and utilizing data to drastically reduce food waste.

## 🎯 The Problem We Are Solving

In traditional hostel mess facilities, students rely on physical notice boards for daily menus, lacking crucial details like nutritional values. This leads to several systemic issues:
1. **Blind Consumption:** Students cannot track their daily nutritional intake (Calories, Protein, Carbs, Fats).
2. **Disconnected Preferences:** Mess management has no proactive way to understand what students actually want to eat.
3. **High Food Wastage:** Dishes are cooked in bulk often resulting in massive waste due to unforeseen low demand.
4. **Dietary Restrictions:** Students with specific dietary needs (Veg/Non-Veg/Special) lack transparency.

## ✨ Our Smart Solution

FitVIT is built to be simple, accessible for students, and highly practical for hostel mess operations. It features two interconnected modules:

### 🎓 1. The Student Portal (Mobile App)
- **Digital Daily Menus:** Beautiful, accessible UI displaying the daily mess menu categorized by meals and dietary types.
- **Nutritional Transparency:** Detailed macro breakdowns (Calories, Protein, Carbohydrates, Fats) for every dish to help students track their intake.
- **Real-Time Ratings & Feedback:** A seamless interface allowing students to rate dishes out of 5 stars and provide immediate, actionable feedback to the kitchen.
- **Advance Preference Selection:** Students can indicate their preferred food choices in advance for both Regular Menus and Special Feast Menus, preventing over-preparation.

### 📊 2. The Mess Management Dashboard
- **Demand Analysis Engine:** A smart dashboard that aggregates student preferences to predict real-time demand for specific dishes.
- **Wastage Reduction:** By analyzing advance choices and historical ratings, the system flags "High Waste Risk" dishes, allowing management to adjust cooking quantities practically.
- **Dietary Vault Analytics:** Visual demographic breakdowns of what the student body prefers, optimizing future menu planning.

## 🗂️ Branch Architecture

This repository is organized into a branch-based monorepo:

| Branch | Description | Status |
|--------|-------------|--------|
| **[`main`](https://github.com/Sappy101/fitVIT/tree/main)** | Core documentation and Solvathon overview. | 🟢 Active |
| **[`app`](https://github.com/Sappy101/fitVIT/tree/app)** | Source code for the Student Mobile App & Admin Dashboard (`v3` & `v4`). | 🟢 Active |
| **[`website`](https://github.com/Sappy101/fitVIT/tree/website)** | Source code for the web portal/landing page. | 🟡 In Development |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli`)

### Running the App
1. Clone the repository: `git clone https://github.com/Sappy101/fitVIT.git`
2. Switch to the app branch: `git checkout app`
3. Navigate to the frontend directory (`cd FitVITv4/frontend`)
4. Install dependencies: `npm install`
5. Run the server: `npx expo start`

---
<div align="center">
  <p>Built with ❤️ to optimize the mess experience at VIT</p>
</div>