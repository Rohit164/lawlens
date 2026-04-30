# LawLens - AI-Powered Legal Assistant

India's first comprehensive AI system for judges, lawyers, and legal professionals.

## 🚀 Quick Start

### 1. Start Streamlit App
```cmd
cd Realistic_LJP-main
python -m streamlit run simple_language_app.py --server.port 8501
```

### 2. Start Backend
```cmd
cd backend
python app.py
```

### 3. Start Frontend
```cmd
cd frontend
npm run dev
```

### 4. Access
- **Frontend**: http://localhost:5173
- **Streamlit**: http://localhost:8501 (embedded in frontend)
- **API**: http://localhost:8000

## 📦 Installation

### Backend
```cmd
cd backend
pip install -r requirements.txt
```

### Frontend
```cmd
cd frontend
npm install
```

### Streamlit
```cmd
cd Realistic_LJP-main
pip install -r requirements.txt
```

## 🎯 Features

### For Judges (5 Tools)
- Bench Memo Generator
- Hearing Preparation
- Judgment Drafting Aid
- Multi-Bench Consensus
- Cause List Optimizer

### For Lawyers (5 Tools)
- Adversarial Simulator
- Litigation Forecasting
- Judge Analytics
- Real-Time Assistant
- Compliance Scanner

### For Analytics (4 Tools)
- Litigation Forecasting
- Compliance Scanner
- Counterfactual Analysis
- Precedent Impact Tracker

### Document Upload (Streamlit)
- Upload PDF, DOCX, TXT
- Multi-language support (10+ Indian languages)
- AI predictions with InLegalBERT
- Simple language explanations
- Visual analytics

## 🗄️ Database

Using Neon PostgreSQL. Configure in `backend/.env`:
```env
DATABASE_URL=your_neon_connection_string
```

Run migration:
```cmd
cd backend
python migrate_database.py
```

## 🤖 AI Models

- **InLegalBERT**: Legal judgment prediction (Indian corpus)
- **LJP Model**: From Realistic_LJP-main folder
- **Multi-language**: Google Translate integration

## 📁 Project Structure

```
lawlens/
├── backend/              # FastAPI backend
├── frontend/             # React frontend
├── Realistic_LJP-main/   # Streamlit app with LJP model
└── README.md            # This file
```

## 🔧 Configuration

### Streamlit Config
Located at `Realistic_LJP-main/.streamlit/config.toml`

### Environment Variables
- `backend/.env` - Database and API keys
- `frontend/.env.local` - Clerk authentication

## 📊 Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: PostgreSQL (Neon)
- **AI**: Transformers, PyTorch, InLegalBERT
- **UI**: Streamlit (embedded in React)
- **Auth**: Clerk

## 🎨 How It Works

1. User clicks "Upload Document" on homepage
2. Navigates to `/upload-document` (stays on same domain)
3. Streamlit app embedded via iframe
4. User uploads document
5. AI analyzes with InLegalBERT
6. Results displayed with multi-language support

## ⚠️ Troubleshooting

### Memory Error (Paging file too small)
Increase Windows virtual memory:
1. System Properties → Advanced → Performance Settings
2. Advanced → Virtual Memory → Change
3. Set Initial: 8192 MB, Maximum: 16384 MB
4. Restart computer

### Port Already in Use
```cmd
# Kill process on port
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Models Not Loading
Models download on first use (~2GB). Ensure:
- Internet connection
- Sufficient disk space
- Sufficient RAM (8GB+ recommended)

## 📝 License

See LICENSE file for details.

## 🙏 Credits

- **LJP Model**: Realistic_LJP-main (NLLP@EMNLP 2024)
- **InLegalBERT**: law-ai/InLegalBERT
- **UI Components**: shadcn/ui

---

**Built for the Indian Judicial System** ⚖️
