# 🔍 TrackMate - Smart Campus Lost & Found System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Python](https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white)

TrackMate is a web-based, AI-powered platform designed to digitalize and automate the process of reporting, matching, and recovering lost items within a university campus. It bridges the transparency gap and builds trust through semantic AI matching, secure OTP verifications, and a gamified trust score system.

## 🚀 Key Features

* **🧠 AI Semantic Matching:** Utilizes `MiniLM-L6-v2` NLP embeddings to detect similarity between lost and found item descriptions, automatically notifying potential owners even if wording differs.
* **🛡️ Secure Claim Verification:** Prevents fraudulent claims by hiding sensitive item details and enforcing face-to-face handover via secure SMTP-based OTP email codes.
* **📈 Gamified Trust Score System:** Promotes honesty by rewarding successful handovers (+15 pts) and penalizing rejected/fake claims (-5 pts). Accounts are automatically flagged after 3 rejected claims.
* **🔐 University-Exclusive Access:** Google OAuth 2.0 integration strictly limits access to verified `@uog.edu.pk` campus emails.
* **👑 Admin Oversight:** Dedicated admin dashboard for complete database visibility, flagged account management, and one-click user blocking.

## 🛠️ Technology Stack

* **Frontend:** React.js, Tailwind CSS, React Router
* **Backend:** FastAPI (Python), SQLAlchemy (ORM)
* **Database:** MySQL
* **AI/NLP Model:** Sentence-Transformers (MiniLM-L6-v2)
* **Authentication:** Google OAuth 2.0
* **Notifications:** FastAPI-Mail (SMTP)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16.x or higher)
* [Python](https://www.python.org/) (3.10 or higher)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) running locally
* Git

## 💻 Local Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/rabiaabid-it/trackmate.git

```

### 2. Backend Setup (FastAPI)

Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# For Windows:
venv\Scripts\activate
# For Mac/Linux:
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

```

**Environment Variables (.env)**
Create a `.env` file in the `backend` directory and add your credentials:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost/trackmate_db
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# SMTP Email Setup
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com

```

**Run the Backend Server**

```bash
uvicorn app.main:app --reload --port 8000

```

### 3. Frontend Setup (React.js)

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install

```

**Environment Variables (.env)**
Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id

```

**Run the Frontend Development Server**

```bash
npm run dev

```

## 🧑‍💻 Development Team

This project was developed as a Final Year Project for the **University of Gujrat**.

* **Rabia Abid** (24017156-035)
* **Ruhma Liaqat** (24017156-022)
* **Swaira Sundas** (24017156-010)

**Supervised By:** Mam Irum Shehzadi (Department of Information Technology)

## 📄 License

This project is restricted to academic evaluation and internal campus use.

