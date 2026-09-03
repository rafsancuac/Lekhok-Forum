const express = require('express');
const router = express.Router();
const db = require('../db');

// Serve a default SVG avatar based on user gender
router.get('/:userId', async (req, res) => {
  const user = await db.prepare('SELECT gender, avatar_url FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.redirect('/assets/avatars/neutral.svg');
  if (user.avatar_url) return res.redirect(user.avatar_url);
  const gender = user.gender || 'other';
  if (gender === 'male') return res.redirect('/assets/avatars/male.svg');
  if (gender === 'female') return res.redirect('/assets/avatars/female.svg');
  return res.redirect('/assets/avatars/neutral.svg');
});

module.exports = router;
