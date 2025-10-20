# Roll-Out 🎲

A social activity finder app that helps you discover, roll for, and complete local events — blending **social media + exploration**.

## 🚀 Tech Stack
- **Expo (React Native)** — cross-platform app framework  
- **Supabase** — authentication, database, and storage  
- **React Navigation** — navigation stack + bottom tabs  
- **React Native Paper** — UI components  
- **Eventbrite API (planned)** — activity sourcing  

## 💡 Features (In Progress)
- Email/password authentication  
- Profiles linked to Supabase Auth  
- Home feed (posts from users)  
- Roll for local events (via Eventbrite API)  
- Camera integration to post proof photos  
- User streaks, rolls, and stats  

## 🧱 Project Setup
```bash
git clone https://github.com/JordanKulzer/rollout.git
cd rollout
npm install
npm start


Create a .env file:

EXPO_PUBLIC_SUPABASE_URL=your-url-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here


Then run on your device or emulator:

npx expo start

📸 Screens (Coming Soon)

Home Feed

Camera Roll

Profile & Stats

Explore Events

Author: Jordan Kulzer
Built with ❤️ using Expo + Supabase


You can add that file locally, then commit & push:

```bash
echo "# Roll-Out 🎲 ..." > README.md
git add README.md
git commit -m "Add project README"
git push
