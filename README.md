<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=FitVIT&fontSize=80&fontAlignY=35&desc=Smart%20Mess%20%26%20Dining%20Optimization&descSize=20&descAlignY=55" alt="FitVIT Header" width="100%"/>
</div>

<div align="center">
  <a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=1000&color=2E7D32&center=true&vCenter=true&width=600&lines=Solving+Theme+3%3A+Mess+%26+Dining+Optimization;Solvathon+Problem+P07;Predictive+Waste+Reduction;Nutritional+Transparency" alt="Typing SVG" /></a>
</div>

<p align="center">
  <a href="#-the-problem"><img src="https://img.shields.io/badge/Problem-P07-FF5722?style=for-the-badge&logo=target&logoColor=white" alt="Problem"/></a>
  <a href="#-the-solution"><img src="https://img.shields.io/badge/Solution-FitVIT-4CAF50?style=for-the-badge&logo=check-circle&logoColor=white" alt="Solution"/></a>
  <a href="#%EF%B8%8F-tech-stack"><img src="https://img.shields.io/badge/Tech-React_Native_%7C_Supabase-000000?style=for-the-badge&logo=react&logoColor=61DAFB" alt="Tech Stack"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Status-Solvathon_Ready-blue?style=for-the-badge&logo=hackaday&logoColor=white" alt="Status"/></a>
</p>

---

## 🎯 The Core Problem

In hostel mess facilities, students rely on static notice boards. This lack of digitization leads to massive systemic inefficiencies:

| ❌ The Problems | 📉 The Impact |
| --- | --- |
| **Nutritional Blindness** | Students cannot track their Calorie, Protein, Carb, or Fat intake. |
| **Disconnected Preferences** | Management cooks blindly without knowing what students actually want to eat. |
| **High Food Wastage** | Bulk cooking of low-demand dishes results in massive daily food waste. |
| **Dietary Obscurity** | Students with specific dietary profiles (Veg/Non-Veg/Special) lack transparent choices. |

---

## ✨ Our Revolutionary Solution

**FitVIT** is an intelligent, dual-platform ecosystem designed to be effortlessly accessible for students and profoundly insightful for mess management.

### 📱 1. Student Experience App
*Empowering students with dietary transparency and a loud voice.*

- 🍽️ **Digital Daily Menus:** Beautiful UX displaying daily menus organized by exact dietary profiles.
- 🥗 **Nutritional Transparency:** Granular macro breakdowns (**Calories, Protein, Carbohydrates, Fats**) for every single dish.
- ⭐ **Actionable Feedback Loop:** Instant dish rating out of 5 stars + qualitative feedback driving quality control.
- 📅 **Advance Preference Mapping:** Students lock-in their choices for Regular and Feast Menus, preventing over-preparation.

### 💻 2. Admin Intelligence Dashboard
*Transforming guesswork into data-driven operations.*

- 🧠 **Predictive Demand Engine:** ML-driven analytics model predicting real-time demand down to the exact dish.
- ♻️ **Waste Management Triage:** Automated system flagging dishes as **`HIGH RISK`**, **`WATCH`**, or **`SAFE`** for wastage.
- 📊 **Dietary Vault Analytics:** Stunning visualizations mapping the entire demographic footprint of the student body.

---

## 🏗️ System Architecture

```mermaid
graph TD;
    A[Student App] -->|Advance Preferences| B(Supabase DB)
    A -->|Ratings & Feedback| B
    B --> C{Predictive Engine}
    C -->|Calculates Demand & Risk| D[Admin Dashboard]
    D -->|Adjusts Quantities| E[Hostel Kitchen Operations]
    E -->|Optimized Menu Flow| A
    
    style A fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style D fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:#fff
    style C fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style B fill:#1E1E1E,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🗂️ Branch Strategy (Monorepo)

| Branch | Description | Status |
|--------|-------------|--------|
| **[`main`](https://github.com/Sappy101/fitVIT/tree/main)** | Core documentation & Solvathon overview. | 🟢 **Active** |
| **[`app`](https://github.com/Sappy101/fitVIT/tree/app)** | Source code for the Student App & Admin Dashboard. | 🟢 **Active** |
| **[`website`](https://github.com/Sappy101/fitVIT/tree/website)** | Source code for the web portal. | 🟡 **In Dev** |

---

## 🛠️ Tech Stack & Magic Under the Hood

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,ts,tailwind,supabase,python&perline=5" alt="Tech Stack" />
</p>

* **Frontend:** React Native (Expo Router) paired with a custom *Living Greenhouse* UI System
* **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
* **Intelligence:** Python-based ML predictive engine
* **Analytics:** React Native Chart Kit for immersive data visualization

---
<div align="center">
  <p><i>Concepted, Designed, and Built with ❤️ for Solvathon Optimization</i></p>
</div>