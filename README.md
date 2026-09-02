# লেখক ফোরাম — Lekhok Forum

A clean, responsive Bengali-language website for the **লেখক ফোরাম** (বাংলাদেশ তরুণ কলাম লেখক ফোরাম).

> Inspired by the design language of [bycwf.org](https://bycwf.org) and the modern Bengali web aesthetic of *Rafsan Daily*.

## ✨ Features

- **Fully responsive** (mobile, tablet, desktop)
- **Bengali-first typography** using [SolaimanLipi](https://github.com/maateen/font-solaimanlipi)
- **Sticky navigation** with mobile sidebar drawer
- **Animated counter** for statistics (Bengali numerals)
- **Pages included**:
  - Home (hero, mission, leaders, recent notices)
  - পরিচিতি (About)
  - সংগঠন (Committee)
  - বিজ্ঞপ্তি (Notices)
  - যোগাযোগ (Contact + emergency hotlines)
- **No build step** — pure HTML, CSS, vanilla JS
- **Fast** — single CSS file, single JS file, CDN assets

## 📁 Structure

```
lekhok-forum/
├── index.html          # Home page
├── about.html          # About / পরিচিতি
├── committee.html      # Committee / সংগঠন
├── notices.html        # Notices / বিজ্ঞপ্তি
├── contact.html        # Contact / যোগাযোগ
└── assets/
    ├── css/style.css   # All styles
    └── js/main.js      # Counter + mobile menu
```

## 🚀 Quick Start

1. Clone the repo:
   ```bash
   git clone https://github.com/rafsancuac/Lekhok-Forum.git
   cd Lekhok-Forum
   ```
2. Open `index.html` in any browser — that's it!

## 🛠 Customization

Before deploying, replace these placeholders across all HTML files:

| Placeholder | Replace with |
|-------------|--------------|
| `আপনার ক্যাম্পাস ঠিকানা` | Your campus address |
| `info@your-branch.org` | Your branch email |
| `০১XXXXXXXXX` | Your contact number |
| Committee names in `committee.html` | Real committee members |

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | `#0a1f44` | Deep navy — headers, footer |
| `--accent` | `#C5A059` | Gold — CTAs, highlights |
| `--bg` | `#f8fafc` | Page background |
| Font | `SolaimanLipi` | Bengali body text |

## 📜 License

Open source under MIT. Free to use, modify, and distribute.

---

Built with ❤️ for the Bangladeshi student-writer community.
