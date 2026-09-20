🩺 CareTrack: Care Starts Here
🚀 Live Demo: https://caretrack-main.vercel.app/
💻 GitHub: https://github.com/sadafsattar176-source/caretrack.main

Your appointments, your medicines, and a safe AI health guide, all in one place.

CareTrack is a healthcare companion app that helps patients keep track of doctor appointments and daily medicines, sends in-app reminders, and includes an AI Health Assistant that answers general health questions in English, Urdu, and Roman Urdu.

❗ The Problem

Managing personal health sounds simple, but in daily life it often goes wrong:

🕒 Missed appointments: patients forget doctor visits because dates and times live in scattered notes, chats, or memory.
💊 Missed or confused medicines: people on multiple medicines with different timings struggle to remember what to take and when, and whether they already took it.
🔍 Unreliable health information: searching symptoms online mixes trustworthy advice with misinformation, and can cause unnecessary fear or wrong self-treatment.
🌐 Language barrier: most health tools are English-only, while many people are more comfortable in Urdu or Roman Urdu.
📱 Too many tools: reminders, notes, and health questions usually need three different apps.
💡 Our Solution

CareTrack brings everything a patient needs into one simple, mobile-friendly app:

Problem	How CareTrack helps
Forgetting appointments	Store every appointment and get reminders before the visit
Forgetting medicines	Set multiple daily dose times and get an alert at each one
Not knowing if a dose was taken	Mark each medicine as taken, skipped, or stopped and see today's schedule at a glance
Unreliable online advice	A healthcare-only AI assistant with safety rules and a medical disclaimer on every answer
Language barrier	The assistant replies in English, Urdu, or Roman Urdu
Too many apps	Appointments, medicines, reminders, and health Q&A in one dashboard
✨ Features
📊 Dashboard: a daily overview of today's appointments and medicine schedule, with quick-add actions.
📅 Appointment manager: add, edit, and delete appointments with doctor name, specialty, date, time, location, and notes. Mark them as upcoming or completed.
⏰ Appointment reminders: choose 10 minutes, 30 minutes, 1 hour, or 1 day before.
💊 Medicine tracker: store name, dosage, and multiple daily dose times. Mark each as taken, skipped, or stopped.
🔔 Medicine reminders: an alert appears in the notification bell at each scheduled dose time.
🤖 AI Health Assistant: a Google Gemini chatbot that answers only healthcare questions, in English, Urdu, or Roman Urdu.
📨 Notification center: bell icon with unread badge, mark as read, and clear all.
👤 Profile and settings: set your display name and email, and sign out.
📱 Responsive design: sidebar on desktop, bottom navigation on mobile.
🛡️ AI Assistant Safety

The assistant is deliberately limited to healthcare:

🚫 Prompt-injection filter: messages like "ignore previous instructions" or "reveal your system prompt" are refused before reaching the model.
🎯 Off-topic filter: obviously unrelated requests (coding, crypto, sports, politics, games, and similar) are refused before reaching the model.
📋 Strict system prompt: refuses non-health topics, never gives a definitive diagnosis, never prescribes or changes medication, never gives personalized dosages, and tells users to seek emergency care for severe symptoms.
⚠️ Mandatory disclaimer: every answer is followed by a standard "not a medical diagnosis" notice.
🔐 Key protection: the Gemini API key stays on the server and is redacted from error messages.

⚕️ CareTrack is an educational tool. It is not a substitute for professional medical advice, diagnosis, or treatment.

🧰 Tech Stack
Layer	Technology
Frontend	React 19, TypeScript, Vite 6
Styling	Tailwind CSS 4, Motion (animations), Lucide React (icons)
Backend	Node.js, Express
AI	Google Gemini via @google/genai
Database (optional)	Supabase (PostgreSQL)
Deployment	Vercel
📁 Project Structure
caretrack/
├── api/
│   └── health-chat.ts        # AI chat handler
├── src/
│   ├── components/           # Navbar, Sidebar, BottomNav, SplashScreen
│   ├── context/              # Data, Notification, and Toast providers
│   ├── lib/supabase.ts       # Supabase client setup
│   ├── pages/                # Dashboard, Appointments, Medicines, AI Assistant, Settings
│   ├── types.ts              # Shared TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── server.ts                 # Express server
├── vite.config.ts
└── package.json
🚀 Run Locally
bash
git clone https://github.com/sadafsattar176-source/caretrack.main.git
cd caretrack.main
npm install
npm run dev

Then open http://localhost:3000. To enable the AI assistant, add your Gemini API key as GEMINI_API_KEY in a .env file.

📖 How to Use
👤 Open the app and set your name under Settings.
📅 Go to Appointments and add a visit, choosing a reminder time.
💊 Go to Medicines and add a medicine with one or more daily dose times.
📊 Check the Dashboard each day to mark medicines as taken and appointments as completed.
🤖 Open AI Assistant and ask a health question, for example:
"What are the common symptoms of dehydration?"
"Paracetamol kis liye use hoti hai?"
⚠️ Known Limitations
Reminders are in-app only and are checked every 30 seconds while the app is open in a browser tab. There are no push, SMS, or email notifications yet.
The "1 day before" reminder option confirms the schedule when you save, but does not fire a separate alert on the day before.
Authentication is not implemented. Records are tied to a random patient ID stored in the browser, so clearing browser data removes local records.
🗺️ Roadmap
📲 Push, SMS, and email reminders
🔐 User accounts with secure sign-in and per-user data
📈 Medicine adherence history and reports
🗓️ Appointment calendar view
🌍 Better Urdu-script (right-to-left) support in the chat
## 👥 Team

- **Sadaf Sattar** – Team Lead
- **Ayesha Jamil** – Team Member
- **Husnain** – Team Member
- **Ahsan** – Team Member
