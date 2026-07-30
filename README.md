# Irma Iryani — Portfolio

Portfolio pribadi Irma Iryani, S1 Pendidikan Kimia Universitas Sriwijaya.

Built with **Next.js 16**, **Tailwind CSS v4**, and **Framer Motion**.

## Stack

- [Next.js](https://nextjs.org) — React framework (App Router)
- [Tailwind CSS v4](https://tailwindcss.com) — utility-first styling
- [Framer Motion](https://www.framer.com/motion/) — animations
- [EmailJS](https://www.emailjs.com) — contact form without a backend
- [Lucide React](https://lucide.dev) — icons

## Features

- Dark / light mode toggle
- Indonesian / English language toggle
- Smooth scroll navigation (mobile-friendly)
- Accessible animations (respects `prefers-reduced-motion`)
- Contact form with EmailJS integration
- Responsive across all screen sizes
- Scroll-to-top on every page load/refresh

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/portfolio-irma.git
cd portfolio-irma
npm install
```

### 2. Setup environment variables

Copy the example file and fill in your EmailJS credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxxxx
```

> If left empty, the contact form falls back to opening the default mail app.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
4. Deploy — done

## Project Structure

```
portfolio-irma/
├── app/
│   ├── globals.css       # Tailwind v4 theme tokens + base styles
│   ├── layout.tsx        # Root layout with scroll-to-top script
│   └── page.tsx          # Main page (assembles all sections)
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Education.tsx
│   ├── Experience.tsx
│   ├── Skills.tsx
│   ├── Certificates.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── context/
│   └── ThemeLanguageContext.tsx
├── lib/
│   └── motion.ts         # Centralized Framer Motion variants
└── public/
    ├── profile.jpg
    ├── cv.pdf
    └── certificates/
```

## EmailJS Template

Template variables used (configure in EmailJS dashboard):

| Variable         | Description                           |
| ---------------- | ------------------------------------- |
| `{{from_name}}`  | Sender's name                         |
| `{{from_email}}` | Sender's email                        |
| `{{message}}`    | Message body                          |
| `{{to_name}}`    | Recipient name (set to "Irma Iryani") |
