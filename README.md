## Admin
**email**:ajaybabu@gmail.com
**password**:12345678

## Overview
Vite + React + Tailwind client for the LMS with:
- Student and tutor dashboards
- Tutor search, booking, profile
- Stripe Checkout (Card )
- Jitsi as a Service (JaaS) join via JWT (no lobby)
- Cloudinary recordings (student watch, tutor upload)


## Usage
- **Login/Register** as student or tutor.
- **Search** for tutors and **book** a lesson.
- **Pay** for a lesson: “Pay now (Card )” opens Stripe Checkout.
- After returning from Stripe, the **Lessons** page reconciles payment via `/api/payments/confirm` if needed.
- **Join meeting**: each lesson shows a **Join meeting** button that calls `/api/meet/token` and opens a JaaS URL (tutor is moderator automatically).
- **Recordings**:
  - Students: `Recordings` page lists & plays your lesson recordings from Cloudinary.
  - Tutors: `Tutor → Recordings` to generate meeting links and upload recordings (video).

## Pages to know
- `src/pages/Lessons.jsx` — uses `<JoinMeetingButton />` and Stripe payment flow
- `src/pages/Recordings.jsx` — student recordings list
- `src/pages/tutor/Recordings.jsx` — tutor uploads to Cloudinary and can generate meeting link





