# লেখক ফোরাম — Full-Stack Web Application

A complete content management system for **লেখক ফোরাম** (Lekhok Forum), combining Bengali-first design with a powerful admin panel for managing notices, events, members, gallery, and resources.

## ✨ Features

- **9 frontend pages** rendered server-side: home, about, committee, events, notices, gallery, resources, team, contact
- **Full admin panel** at `/admin` with session-based authentication
- **CRUD management** for notices, events, committee members, gallery images, and resources
- **Bengali-first typography** (SolaimanLipi from CDN)
- **Mobile-responsive** with sidebar drawer
- **Animated stats counter** with Bengali numerals
- **Lightbox gallery** with vanilla JS
- **Contact form** that saves submissions to database
- **SQLite** — no separate database server required
- **Single `npm start`** to run the whole stack

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Templating | EJS |
| Database | SQLite (better-sqlite3) |
| Auth | bcrypt + express-session |
| Styling | Custom CSS (no framework) |
| Animations | Vanilla JavaScript |

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd lekhok-forum
npm install

# 2. Start the server
npm start

# 3. Visit the site
open http://localhost:8080
```

On first start, the database is auto-initialized with sample data.

## 🔐 Admin Panel

URL: **http://localhost:8080/admin**

Default credentials (change these immediately in production):
- Username: `admin`
- Password: `admin123`

The admin can manage:
- 📋 বিজ্ঞপ্তি (Notices)
- 📅 ইভেন্ট (Events)
- 👥 কমিটি সদস্য (Committee Members)
- 🖼️ গ্যালারি (Gallery Images)
- 📚 রিসোর্স (Resources/Articles)
- ✉️ যোগাযোগ বার্তা (Contact form messages)
- ⚙️ সেটিংস (Site settings)

## 📁 Project Structure

```
lekhok-forum/
├── server.js              # Express entry point
├── db.js                  # SQLite setup + seed data
├── package.json
├── lekhok.db             # SQLite database (auto-created)
├── admin/
│   ├── routes.js         # Admin auth + CRUD routes
│   └── views/            # Admin EJS templates
├── routes/
│   ├── pages.js          # Frontend page rendering
│   └── api.js            # REST API
├── views/                # Frontend EJS templates
│   ├── layout.ejs        # Master layout (header + footer)
│   ├── lekhok-home.ejs
│   ├── lekhok-about.ejs
│   ├── lekhok-committee.ejs
│   ├── lekhok-events.ejs
│   ├── lekhok-notices.ejs
│   ├── lekhok-gallery.ejs
│   ├── lekhok-resources.ejs
│   ├── lekhok-team.ejs
│   ├── lekhok-contact.ejs
│   └── 404.ejs
└── public/
    └── assets/
        ├── css/
        │   ├── style.css
        │   └── admin.css
        └── js/
            └── main.js
```

## 🌐 REST API

All API endpoints are public read, admin-only write.

```
GET    /api/notices?category=&page=&limit=
GET    /api/events?upcoming=true|false
GET    /api/members?type=central|branch
GET    /api/gallery
GET    /api/resources?category=
POST   /api/contact
```

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--brand` | `#0a1f44` | Navy — headers, footer, primary |
| `--accent` | `#C5A059` | Gold — CTAs, highlights |
| `--bg-main` | `#0B1121` | Deep navy — hero overlays |
| Font | `SolaimanLipi` | Bengali body text |

## ☁️ Deployment

### Option 1: Azure App Service (Linux)

```bash
# Use the python-appservice-deploy skill or az CLI
az webapp create --resource-group mygroup --plan myplan --name lekhok-forum --runtime "NODE:18-lts"
az webapp config appsettings set --name lekhok-forum --resource-group mygroup --settings SESSION_SECRET="<your-secret>"
az webapp up --name lekhok-forum --resource-group mygroup
```

Azure will run `npm start` automatically if you set the startup command in the portal.

### Option 2: Railway / Render / Fly.io

Just push to GitHub and connect the repo. The default `npm start` will work.

### Option 3: VPS (Ubuntu)

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone and run
git clone https://github.com/rafsancuac/Lekhok-Forum.git
cd Lekhok-Forum/lekhok-forum
npm install
NODE_ENV=production SESSION_SECRET=$(openssl rand -hex 32) npm start
```

Use a process manager like `pm2`:
```bash
npm install -g pm2
pm2 start server.js --name lekhok-forum
pm2 startup && pm2 save
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP port |
| `SESSION_SECRET` | `lekhok-forum-secret-key-change-in-production` | Cookie signing secret — **change in production** |

## 📜 License

Open source under MIT.

---

Built with ❤️ for the Bangladeshi student-writer community.
