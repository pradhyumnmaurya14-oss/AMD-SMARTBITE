# 🍎 SmartBite — Smart Nutrition Assistant

**SmartBite** is a lightweight, futuristic nutrition companion designed specifically for college students and young professionals. It helps users make smarter, healthier eating decisions by providing instant nutrition analysis, context-aware meal suggestions, and behavioral insights—all within a single-page, performance-optimized interface.

---

## 🎯 Project Overview

### Chosen Vertical & Persona
- **Persona**: College students and busy young professionals.
- **Problem Statement**: This demographic often struggles with "decision fatigue" when it comes to healthy eating. Limited time, stress, and lack of immediate nutritional feedback lead to poor dietary choices (e.g., high-calorie late-night snacks or low-protein convenience meals).

### Approach & Logic
SmartBite uses a **Rule-Based Intelligence Engine** to provide context-aware guidance. Instead of just showing numbers, it analyzes the user's current state:
- **Time of Day**: Suggests lighter meals at night and energizing meals in the morning.
- **Goals**: Prioritizes protein for muscle gain and fiber/low-calories for weight loss.
- **Mood**: Offers comforting but healthy swaps for stress or quick snacks for active periods.

---

## 🚀 Key Features

### 1. Smart Meal Analyzer
- **Instant Search**: Autocomplete-powered search across a curated `data.json` database.
- **Visual Nutrition Cards**: High-impact visualization of Calories, Protein, Carbs, and Fats.
- **Health Score (0–100)**: A proprietary scoring algorithm that evaluates food quality based on nutrient density.

### 2. Context-Aware AI Assistant
- **Optimization Engine**: Takes user context (Time, Goal, Mood) to recommend the "Best Swap."
- **Reasoning Text**: Explains *why* a suggestion was made (e.g., "Switching to Salmon provides the Omega-3s your brain needs during high-stress study sessions").

### 3. Behavior & Insight Tracking
- **Meal History**: Locally persisted timeline of your last 10+ meals using `localStorage`.
- **Pattern Recognition**: Automatically identifies trends like "High-carb night intake" or "Consistent high-protein choices."
- **Daily Dashboard**: A lightweight macro-distribution chart (CSS-based) for quick daily snapshots.

### 4. Ambient User Experience
- **Futuristic UI**: A deep-space dark theme with neon cyan accents.
- **Subtle Micro-interactions**: Responsive hover states, smooth value counters, and a lightweight constellation background animation.

---

## 🛠️ Technology Stack

- **Core**: Vanilla HTML5, CSS3 (Glassmorphism 2.0), and Modern JavaScript (ES6+).
- **Data**: Static `data.json` for lightning-fast, offline-capable search.
- **Storage**: `localStorage` for privacy-first, client-side behavior tracking.
- **Google Services**:
  - **Google Fonts**: Utilizing the 'Inter' family for premium, highly-readable typography.
  - **Google Services Integration**: Built to be extensible for further Google Cloud Vision or Fit API integrations.

---

## 🔒 Security & Accessibility

### Security Considerations
- **Input Sanitization**: All user search queries and inputs are sanitized before rendering.
- **Safe DOM Updates**: Uses `textContent` and `innerText` to prevent XSS vulnerabilities.
- **Data Validation**: Robust handling for empty states, unknown food items, and missing JSON fields.

### Accessibility Considerations
- **Semantic Structure**: Proper use of `<main>`, `<header>`, `<nav>`, and `<section>` tags.
- **ARIA Implementation**: Includes `aria-live` regions for dynamic assistant feedback and descriptive labels for all interactive elements.
- **Keyboard Friendly**: Full tab-navigation support and keyboard-optimized autocomplete dropdowns.
- **Contrast & Motion**: High-contrast ratios for readability and support for `prefers-reduced-motion` to disable animations.

---

## 📂 File Structure

```text
/
├── index.html   # Main application structure & semantic layout
├── style.css    # Premium CSS with Glassmorphism & Animations
├── script.js   # Rule-based logic, tracking, & UI orchestration
├── data.json    # Curated nutritional database
└── README.md    # Project documentation & technical details
```

---

## 🏃 How to Run Locally

1. Clone this repository.
2. Open `index.html` in any modern web browser.
3. **Note**: For the best experience (and to allow `fetch` for `data.json`), run using a local server:
   - **VS Code**: Use the "Live Server" extension.
   - **Terminal**: Run `npx serve .` or `python -m http.server 3000`.

---

## 📝 Assumptions & Edge-Case Handling
- **LocalStorage**: If unavailable (e.g., Private Browsing), the app gracefully defaults to a session-only state.
- **Unknown Food**: The analyzer provides a "Food Not Found" state with helpful tips on how to search.
- **Data Integrity**: Default values (0) are used if specific macro fields are missing from the dataset.