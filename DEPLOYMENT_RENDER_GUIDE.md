# 🚀 Render Deployment Guide (A to Z) - AI Education Platform

Yeh guide aapko poora step-by-step batati hai ki is project ko **Render.com** par kaise deploy karna hai, kaun-kaun si API keys chahiye, aur unhe Render par kaise configure karna hai.

---

## 🏗️ Architecture Samjhein (Sabse Simple & Free Method)

Aapka project ek **Single Full-Stack Web Service** ke roop me deploy hota hai:
- **Build Step** (`npm run build`): Vite aapke React frontend ko compile karke `dist/` folder me daal deta hai.
- **Start Step** (`npm start`): Express server chalta hai jo:
  1. Frontend ke saare static files (`dist/`) serve karta hai.
  2. Saare AI Backend APIs (`/api/assist`, `/api/gemini-explain`, `/api/analyze-resume`) handle karta hai.
  3. Isse **CORS ka koi jhanjhat nahi rehta** aur **Render ke ek hi free service me poori app live ho jaati hai!**

---

## 🔑 Step 1: Zaroori API Keys Collect Karein

Deploy karne se pehle ye keys ready rakhein:

### 1. Gemini API Key (`GEMINI_API_KEY`) - **MANDATORY**
- **Kahan use hoti hai:** AI Assistant doubt solver, Hinglish explanation, step-by-step CBSE solutions ke liye.
- **Kaise generate karein:**
  1. [Google AI Studio](https://aistudio.google.com/app/apikey) par jayein.
  2. Apne Google account se sign in karein.
  3. **"Create API key"** par click karein.
  4. Key copy karke safe jagah save kar lein (format: `AIzaSy...`).

### 2. Groq API Key (`GROQ_API_KEY`) - **RECOMMENDED (Ultra-fast & Free Fallback)**
- **Kahan use hoti hai:** Agar Gemini rate-limit ya busy ho jaye to Groq par instant fallback hota hai.
- **Kaise generate karein:**
  1. [Groq Console](https://console.groq.com/keys) par jayein.
  2. Free account banayein ya sign in karein.
  3. **"Create API Key"** click karein.
  4. Key copy kar lein (format: `gsk_...`).

---

## 📤 Step 2: Code GitHub Par Push Karein

Aapke local changes ko GitHub par push karna zaroori hai:

Terminal / PowerShell me run karein:
```powershell
git add .
git commit -m "chore: ready for render deployment"
git push origin main
```

---

## 🌐 Step 3: Render.com Par Web Service Banayein

1. **Render par Sign In karein:**
   - [Render.com](https://render.com/) par jayein.
   - Apne **GitHub** account se log in karein (taki repositories automatically connect ho sakein).

2. **New Web Service create karein:**
   - Dashboard par top-right me **"New +"** button click karein.
   - Dropdown se **"Web Service"** select karein.
   - **"Build and deploy from a Git repository"** option choose karke **Next** karein.

3. **Repository connect karein:**
   - Apni repository (`ai_education` ya jo bhi aapka repo name hai) search karke **"Connect"** click karein.

4. **Service Settings Configure karein:**
   Form me ye exact settings bharein:

   | Setting Field | Value jo enter karni hai |
   | :--- | :--- |
   | **Name** | `ai-education` *(ya koi bhi unique naam, jaise `ai-edu-app`)* |
   | **Language / Runtime** | `Node` |
   | **Region** | `Singapore` ya `Frankfurt` *(India users ke liye sabse fast)* |
   | **Branch** | `main` |
   | **Root Directory** | *(Isko khali / blank chhod dein)* |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` ($0/month) |

---

## 🔐 Step 4: Environment Variables (Keys) Daalna

Isi page par neeche scroll karein aur **"Environment Variables"** section open karein (ya **"Add Environment Variable"** button click karein).

Aapko ye key-value pairs add karne hain:

| Key (Name) | Value (Value field me kya daalna hai) | Zaroori Hai? |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Aapki Google AI Studio key (`AIzaSy...`) | **Haan (Mandatory)** |
| `GROQ_API_KEY` | Aapki Groq key (`gsk_...`) | **Recommended** |
| `NODE_ENV` | `production` | **Haan** |

> 💡 **Note on `PORT`:** Render automatically `PORT` environment variable inject karta hai (e.g. 10000), aur aapka code (`server/index.ts`) usko automatically detect kar leta hai. Isko alag se add karne ki zaroorat nahi hai.

---

## 🚀 Step 5: Deploy & Monitor

1. Page ke bottom par **"Create Web Service"** button click karein.
2. Render deployment start kar dega.
3. Aap live logs dekh sakte hain:
   - `npm install` chalega.
   - `npm run build` se Vite bundle create hoga (`dist/`).
   - `npm start` se server start hoga:
     ```
     🚀 Minimal Express AI Service listening on http://localhost:10000
     ```
4. Jab deployment complete ho jayegi, top-left me **Live** ka green badge aayega aur aapka live public URL dikhega (e.g., `https://ai-education-xxxx.onrender.com`).

---

## ✅ Step 6: Verify & Test

Aapke live URL ko open karein:
1. **Frontend Load:** Check karein ki saari tracks (School / College) aur modules sahi se load ho rahe hain.
2. **AI Doubt Solver / Explain:** Kisi bhi question ya concept par jaakar **"Explain"** ya **"Hinglish"** click karein aur check karein ki Gemini/Groq response stream ho raha hai.
3. **Resume Analyzer:** Resume upload karke analysis test karein.

---

## 🛠️ Troubleshooting & Common Questions

### 1. Free Tier Spindown (Cold Start)
- Render ke Free tier services agar 15 minute tak inactive rahein to sleep mode me chale jaate hain.
- Pehla request aane par 30-50 seconds lag sakte hain wake-up hone me. Uske baad normal fast response milta hai.
- *(Agar zero-downtime chahiye to Render par $7/month starter plan le sakte hain ya [Cron-job.org](https://cron-job.org) se har 10 minute ka ping laga sakte hain).*

### 2. Redeployment (Auto-Deploy)
- Jab bhi aap local me code change karke `git push origin main` karenge, Render automatically naya code pull karke rebuild aur redeploy kar dega!
