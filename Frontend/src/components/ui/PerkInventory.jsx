/**
 * PerkInventory — Inline banner shown in MCQ Hub & Tactical Shop.
 * Displays owned Pause Tokens and Deadline Extensions with counts.
 * Students only. Returns null when inventory is empty.
 */
import { Pause, Clock, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const PERK_META = {
  perk_extra_pause: {
    label: 'Pause Token',
    Icon: Pause,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.35)',
    tip: 'Usable inside any MCQ test — grants 1 emergency pause',
  },
  perk_pause_token: {
    label: 'Pause Token',
    Icon: Pause,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.35)',
    tip: 'Usable inside any MCQ test — grants 1 emergency pause',
  },
  perk_deadline_extend: {
    label: 'Deadline +1D',
    Icon: Clock,
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.35)',
    tip: 'Usable in MCQ Hub — extends an expired test deadline by 24h',
  },
};

const PerkInventory = () => {
  const { user } = useAuthStore();

  if (!user || user.role !== 'STUDENT') return null;

  const perks = (user.inventory || []).filter(i => i.itemType === 'PERK');

  // Group by itemId with counts
  const grouped = perks.reduce((acc, perk) => {
    acc[perk.itemId] = (acc[perk.itemId] || 0) + 1;
    return acc;
  }, {});

  const ownedIds = Object.keys(grouped).filter(id => PERK_META[id]);

  if (ownedIds.length === 0) return null;

  return (
    <div className="perk-inventory-banner">
      <span className="perk-banner__label">⚡ Active Perks</span>

      <div className="perk-banner__chips">
        {ownedIds.map(itemId => {
          const meta = PERK_META[itemId];
          const count = grouped[itemId];
          const Icon = meta.Icon;

          return (
            <div
              key={itemId}
              className="perk-banner__chip"
              style={{ '--perk-color': meta.color, '--perk-glow': meta.glow }}
              title={meta.tip}
            >
              <Icon size={13} />
              <span>{meta.label}</span>
              <span className="perk-banner__count">×{count}</span>
            </div>
          );
        })}
      </div>

      <Link to="/shop" className="perk-banner__link">
        <ShoppingBag size={12} /> Get more
      </Link>
    </div>
  );
};

export default PerkInventory;
