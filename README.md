# Careervo — AI Career Guidance Platform

> An AI-powered career guidance platform that helps students discover suitable careers, courses, and colleges based on their academic background, interests, and responses to personalized questions.

## 🚀 Overview

Careervo is a career exploration platform designed for students who are unsure about which career path, course, or college best matches their interests and strengths.

The platform collects a student's academic background and interests, asks personalized questions, analyzes their responses, and generates career, course, and college recommendations.

### Core Flow

```text
Landing Page
     ↓
Google Login
     ↓
Profile / Academic Background
     ↓
Interest Selection
     ↓
Personalized Questions
     ↓
Career Analysis
     ↓
Course Recommendations
     ↓
College Recommendations
     ↓
Career Report
```

## ✨ Features

* 🔐 Google authentication using Firebase
* 👤 Student profile collection
* 🎓 Academic background selection
* ❤️ Multi-interest selection
* 🧠 Personalized career questions
* 📊 Personality and career analysis
* 🎯 Interest- and answer-based course recommendations
* 🏫 Kerala and India college recommendations
* 📄 Career analysis report generation
* 🌐 Malayalam language support
* 📱 Responsive mobile interface
* ☁️ Firebase Firestore data storage

## 🧠 Recommendation System

Recommendations are designed to use multiple signals instead of simply showing the same courses to every student.

The system considers:

* Academic background
* Selected interests
* Question responses
* Personality/skill scores
* Career preferences
* Course-industry relationships

For example:

```text
Technology + AI interests
        +
Analytical/technical answers
        ↓
AI / Data Science / Cybersecurity
        ↓
Relevant courses
        ↓
Colleges offering those courses
```

## 🏫 College & Course Data

The platform uses structured course and college datasets to connect recommendations with relevant educational opportunities.

The recommendation system is designed to ensure that:

* Recommended courses match the student's interests
* Recommended colleges actually offer relevant courses
* Different student profiles can receive different recommendations
* College recommendations are connected to the selected career/course pathway

## 🔥 Firebase

Firebase is used for authentication and data persistence.

### Firebase services

* Firebase Authentication
* Google Sign-In
* Cloud Firestore

Student information can include:

```text
User ID
Name
Email
Academic background
Interests
Question responses
Personality scores
Recommended careers
Recommended courses
Recommended colleges
Created date
```

### Important

Never commit Firebase private credentials, API secrets, service-account files, or environment variables containing sensitive credentials to GitHub.

Use environment variables for production configuration.

## 🛠️ Tech Stack

### Frontend

* React
* JavaScript
* HTML
* CSS

### Backend / Services

* Firebase Authentication
* Firebase Firestore

### Deployment

* Vercel / Firebase Hosting

### Development

* Git
* GitHub
* AI-assisted development

## 📁 Project Structure

A typical structure:

```text
src/
├── components/
├── pages/
├── data/
│   ├── questions/
│   ├── courses/
│   └── colleges/
├── context/
├── services/
├── utils/
├── lib/
│   └── firebase.js
└── App.jsx
```

## ⚙️ Local Development

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Enter the project:

```bash
cd YOUR_PROJECT_NAME
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The development website will normally be available at:

```text
http://localhost:5173
```

## 🔑 Environment Variables

Create a `.env` file locally and add the required Firebase configuration.

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Do not commit `.env` to GitHub.

Add this to `.gitignore`:

```text
.env
.env.local
.env.*.local
```

## 🔐 Authentication Flow

The current authentication flow uses Google Sign-In.

```text
User
 ↓
Continue with Google
 ↓
Firebase Authentication
 ↓
Authenticated User
 ↓
Profile Collection
 ↓
Career Analysis
```

## 🗄️ Firestore Data

Student records are stored using the authenticated Firebase user ID.

Example conceptual structure:

```text
users/
    {uid}

responses/
    {uid}

recommendations/
    {uid}

analytics/
    {uid}
```

This prevents different students from overwriting each other's records.

## 🌍 Language Support

The platform supports English and Malayalam.

When Malayalam is selected, the interface and dynamically displayed career-analysis content should use Malayalam where translations are available.

## 📱 Responsive Design

The platform is designed for:

* Mobile phones
* Tablets
* Laptops
* Desktop screens

The mobile experience prioritizes readable questions, accessible controls, and properly arranged recommendation cards.

## 🚧 Current Development Status

This project is currently an MVP / early-stage product.

### Completed / In Progress

* [x] Core career guidance concept
* [x] Academic background flow
* [x] Interest selection
* [x] Question-based analysis
* [x] Course recommendation engine
* [x] College recommendation engine
* [x] Google authentication integration
* [x] Firebase integration
* [x] Firestore data storage
* [x] Responsive interface
* [x] Report generation
* [ ] Production-scale data validation
* [ ] Advanced analytics dashboard
* [ ] Large-scale user testing

## ⚠️ Disclaimer

Career, course, salary, and college recommendations are intended for educational and exploratory purposes.

Students should independently verify:

* Current admission requirements
* Eligibility
* Fees
* Course availability
* Placement information
* Entrance examinations
* Official college information

with the respective institution before making an educational decision.

## 🎯 Future Roadmap

Planned improvements include:

* Advanced psychometric analysis
* More comprehensive course database
* More verified college data
* Student analytics dashboard
* Career roadmap generation
* Personalized skill recommendations
* College comparison
* Course comparison
* Counselor integration
* Improved multilingual support

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

If you find a bug:

1. Open an issue
2. Describe the problem
3. Include steps to reproduce it
4. Include relevant screenshots or console errors

## 📄 License

This project is currently maintained as a private/early-stage product.

License information will be added when the project is publicly licensed.

---

### Built with the goal of helping students make better-informed career decisions.

**Careervo — Explore. Understand. Choose.**



