-- ══════════════════════════════════════════════════════════════
--  লেখক ফোরাম — Full database schema
--  Run via:  node db/migrate.js
-- ══════════════════════════════════════════════════════════════

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  full_name     TEXT    NOT NULL,
  bio           TEXT,
  avatar_url    TEXT,
  gender        TEXT    DEFAULT 'male',
  institution   TEXT,
  district      TEXT,
  role          TEXT    DEFAULT 'user',      -- user | moderator | admin
  status        TEXT    DEFAULT 'active',    -- active | pending | banned
  last_login    DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Sessions (admin) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  username     TEXT    NOT NULL UNIQUE,
  password_hash TEXT   NOT NULL,
  email        TEXT,
  role         TEXT    DEFAULT 'editor',    -- editor | admin | superadmin
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Profile ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id       INTEGER PRIMARY KEY,
  cover_image   TEXT,
  website       TEXT,
  facebook      TEXT,
  twitter       TEXT,
  interests     TEXT,
  skills        TEXT,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Follows ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id   INTEGER NOT NULL,
  following_id  INTEGER NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Posts / Articles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id     INTEGER NOT NULL,
  type          TEXT    DEFAULT 'article',   -- article | question
  title         TEXT    NOT NULL,
  body          TEXT,
  excerpt       TEXT,
  cover_image   TEXT,
  tags          TEXT,
  mentions      TEXT,                        -- JSON: [{id, username}, ...]
  category      TEXT    DEFAULT 'general',
  status        TEXT    DEFAULT 'published', -- published | draft | archived
  featured      INTEGER DEFAULT 0,
  view_count    INTEGER DEFAULT 0,
  like_count    INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Comments / Answers ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER,
  parent_id  INTEGER,
  author_id  INTEGER NOT NULL,
  body       TEXT    NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id)   REFERENCES posts(id)    ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Likes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  user_id   INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  type      TEXT    NOT NULL,    -- post | comment
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, target_id, type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Bookmarks ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id   INTEGER NOT NULL,
  post_id   INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ── Notifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  type       TEXT    NOT NULL,   -- like | comment | mention | follow | message | system
  title      TEXT,
  body       TEXT,
  link       TEXT,
  is_read    INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Messages (messenger) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  sender_id       INTEGER NOT NULL,
  body            TEXT,
  file_url        TEXT,
  file_name       TEXT,
  is_read         INTEGER DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_a         INTEGER NOT NULL,
  user_b         INTEGER NOT NULL,
  last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_a) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_b) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Daily content ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_content (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type    TEXT    NOT NULL,   -- quiz | this_day | activity | epaper | best_writer
  title           TEXT,
  body            TEXT,
  image_url       TEXT,
  link_url        TEXT,
  file_url        TEXT,
  scheduled_date  TEXT,
  published       INTEGER DEFAULT 1,
  author_id       INTEGER,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Notices ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  content    TEXT,
  category   TEXT    DEFAULT 'notice',  -- notice | press | event
  date       TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Events ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT,
  date        TEXT,
  time        TEXT,
  location    TEXT,
  image_url   TEXT,
  status      TEXT    DEFAULT 'upcoming',  -- upcoming | ongoing | past
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Gallery ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url   TEXT    NOT NULL,
  caption     TEXT,
  category    TEXT    DEFAULT 'general',
  author_id   INTEGER,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Members (committee) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  role         TEXT    NOT NULL,
  institution  TEXT,
  image_url    TEXT,
  member_type  TEXT    DEFAULT 'central',  -- central | branch
  sort_order   INTEGER DEFAULT 0,
  bio          TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Complaints ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  submitted_by  INTEGER,
  against_user  INTEGER,
  subject       TEXT    NOT NULL,
  description   TEXT,
  status        TEXT    DEFAULT 'pending',  -- pending | reviewed | resolved | dismissed
  admin_notes   TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (against_user) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Moderator scopes ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS moderator_scopes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  scope      TEXT    NOT NULL,  -- daily | notices | events | complaints | articles
  granted_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Resources ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  file_url    TEXT,
  link_url    TEXT,
  file_type   TEXT    DEFAULT 'document',  -- document | video | link
  description TEXT,
  category    TEXT    DEFAULT 'general',
  tags        TEXT,
  author      TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Settings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- ── Achievements ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT    NOT NULL,
  recipient_name  TEXT,
  year            INTEGER,
  description     TEXT,
  image_url       TEXT,
  achievement_date TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Constitution ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS constitution (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  section_title  TEXT    NOT NULL,
  content        TEXT,
  sort_order     INTEGER DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Past leaders ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS past_leaders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT    NOT NULL,
  role           TEXT    NOT NULL,
  term_start     TEXT,
  term_end       TEXT,
  photo_url      TEXT,
  bio            TEXT,
  display_order  INTEGER DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
