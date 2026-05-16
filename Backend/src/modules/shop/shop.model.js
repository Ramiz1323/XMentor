import mongoose from 'mongoose';

const shopItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  itemType: { type: String, enum: ['THEME', 'PERK'], required: true },
  previewColor: { type: String },      // CSS hex for preview swatch
  previewGlow: { type: String },       // CSS hex for glow effect
  icon: { type: String },              // Icon name string for frontend
  isAvailable: { type: Boolean, default: true },
});

const ShopItem = mongoose.model('ShopItem', shopItemSchema);

// Seed shop items on startup if empty
export const seedShopItems = async () => {
  const count = await ShopItem.countDocuments();
  if (count > 0) return;

  await ShopItem.insertMany([
    // ─── PREMIUM THEMES ───
    {
      itemId: 'theme_cyberpunk',
      name: 'Cyberpunk Override',
      description: 'Neon green on deep black. Looks like you\'re inside the Matrix. Elite HUD experience.',
      price: 200,
      itemType: 'THEME',
      previewColor: '#00ff88',
      previewGlow: 'rgba(0,255,136,0.5)',
      icon: 'zap',
    },
    {
      itemId: 'theme_gold',
      name: 'Gold Commander',
      description: 'Burnished gold interface reserved for the highest-performing tacticians. You\'ve earned it.',
      price: 300,
      itemType: 'THEME',
      previewColor: '#ffd700',
      previewGlow: 'rgba(255,215,0,0.5)',
      icon: 'crown',
    },
    {
      itemId: 'theme_neon_pink',
      name: 'Neon Sigma',
      description: 'Vivid neon pink. Stand out in the leaderboard. Rare and flashy.',
      price: 250,
      itemType: 'THEME',
      previewColor: '#ff00cc',
      previewGlow: 'rgba(255,0,204,0.5)',
      icon: 'sparkles',
    },
    // ─── TACTICAL PERKS ───
    {
      itemId: 'perk_deadline_extend',
      name: 'Deadline Extend (+1 Day)',
      description: 'Extends the deadline of any active MCQ or Subjective test by 24 hours. One-time use.',
      price: 200,
      itemType: 'PERK',
      previewColor: '#22d3ee',
      previewGlow: 'rgba(34,211,238,0.4)',
      icon: 'clock',
    },
    {
      itemId: 'perk_extra_pause',
      name: 'Emergency Pause Token',
      description: 'Grants one extra pause on any MCQ test, even if you\'ve hit the pause limit. Strategic advantage.',
      price: 300,
      itemType: 'PERK',
      previewColor: '#f59e0b',
      previewGlow: 'rgba(245,158,11,0.4)',
      icon: 'pause',
    },
  ]);

  console.log('[Shop] Seeded 5 tactical shop items.');
};

export default ShopItem;
