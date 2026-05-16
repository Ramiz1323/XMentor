import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Crown, Sparkles, Clock, Pause, ShoppingBag,
  CheckCircle, Star, ArrowLeft, Coins, Gift, Lock
} from 'lucide-react';
import useShopStore from '../../store/useShopStore';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import PerkInventory from '../../components/ui/PerkInventory';

// Icon map from backend icon strings
const ICON_MAP = {
  zap: Zap,
  crown: Crown,
  sparkles: Sparkles,
  clock: Clock,
  pause: Pause,
};

const TABS = ['ALL', 'THEME', 'PERK'];

const TacticalShop = () => {
  const { user } = useAuthStore();
  const { items, isLoading, isBuying, isClaimingDaily, fetchItems, buyItem, claimDailyLogin } = useShopStore();
  const [activeTab, setActiveTab] = useState('ALL');
  const [purchasedFlash, setPurchasedFlash] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Can user claim daily bonus? ──
  const canClaimDaily = () => {
    if (!user?.lastDailyLogin) return true;
    const last = new Date(user.lastDailyLogin);
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const lastUTC = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
    return lastUTC < todayUTC;
  };

  const handleClaimDaily = async () => {
    try {
      const res = await claimDailyLogin();
      toast.success(res.message, { icon: '⚡' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBuy = async (item) => {
    try {
      const res = await buyItem(item.itemId);
      setPurchasedFlash(item.itemId);
      setTimeout(() => setPurchasedFlash(null), 1500);
      toast.success(res.message, { icon: '🎖️' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isOwned = (itemId) => user?.inventory?.some(i => i.itemId === itemId);
  const canAfford = (price) => (user?.points ?? 0) >= price;

  const filteredItems = activeTab === 'ALL'
    ? items
    : items.filter(i => i.itemType === activeTab);

  return (
    <div className="shop-page">
      <Helmet>
        <title>Tactical Shop — XMentor</title>
        <meta name="description" content="Spend your earned Pts on premium themes and tactical perks." />
      </Helmet>

      {/* ── HEADER ── */}
      <div className="shop-header">
        <div className="shop-title-group">
          <div className="shop-title-icon"><ShoppingBag size={28} /></div>
          <div>
            <h1 className="shop-title glow-text">Tactical Shop</h1>
            <p className="shop-subtitle">Spend your earned Pts on premium upgrades</p>
          </div>
        </div>
        <div className="shop-balance">
          <div className="balance-orb" />
          <Zap size={18} className="balance-icon" />
          <span className="balance-value">{user?.points ?? 150}</span>
          <span className="balance-label">PTS</span>
        </div>
      </div>

      {/* ── DAILY BONUS CARD ── */}
      <div className={`daily-bonus-card ${canClaimDaily() ? 'claimable' : 'claimed'}`}>
        <div className="daily-bonus-glow" />
        <div className="daily-bonus-content">
          <div className="daily-icon-wrapper">
            <Gift size={28} />
          </div>
          <div className="daily-text">
            <h3>Daily Login Bonus</h3>
            <p>
              {canClaimDaily()
                ? '+10 Pts available now — claim your daily uplink bonus!'
                : 'Already claimed today. Come back tomorrow for +10 Pts.'}
            </p>
          </div>
          <button
            className={`daily-claim-btn ${!canClaimDaily() ? 'already-claimed' : ''}`}
            onClick={handleClaimDaily}
            disabled={!canClaimDaily() || isClaimingDaily}
          >
            {isClaimingDaily ? (
              <span className="btn-spinner" />
            ) : canClaimDaily() ? (
              <><Zap size={16} /> Claim +10 Pts</>
            ) : (
              <><CheckCircle size={16} /> Claimed</>
            )}
          </button>
        </div>
        <div className="daily-hint">
          <Star size={12} />
          <span>Earn +0.5 Pts per correct MCQ answer (≥ 2 correct = 1 Pt)</span>
        </div>
      </div>

      {/* ── ACTIVE PERKS BANNER ── */}
      <PerkInventory />

      {/* ── TAB FILTER ── */}
      <div className="shop-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shop-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'ALL' && 'All Items'}
            {tab === 'THEME' && '🎨 Themes'}
            {tab === 'PERK' && '⚡ Perks'}
          </button>
        ))}
      </div>

      {/* ── ITEMS GRID ── */}
      {isLoading ? (
        <div className="shop-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shop-item-card skeleton-card">
              <div className="skeleton-swatch skeleton" />
              <div className="skeleton rect shop-skeleton-title" />
              <div className="skeleton rect shop-skeleton-desc" />
              <div className="skeleton rect shop-skeleton-btn" />
            </div>
          ))}
        </div>
      ) : (
        <div className="shop-grid">
          {filteredItems.map((item) => {
            const owned = isOwned(item.itemId);
            const affordable = canAfford(item.price);
            const IconComp = ICON_MAP[item.icon] || Zap;
            const isFlashing = purchasedFlash === item.itemId;

            return (
              <div
                key={item.itemId}
                className={`shop-item-card ${owned ? 'owned' : ''} ${!affordable && !owned ? 'unaffordable' : ''} ${isFlashing ? 'purchase-flash' : ''}`}
                // CSS custom properties are data-driven — must stay inline
                style={{ '--item-color': item.previewColor, '--item-glow': item.previewGlow }}
              >
                {owned && (
                  <div className="owned-badge">
                    <CheckCircle size={12} /> OWNED
                  </div>
                )}

                <div className="item-swatch">
                  <div className="swatch-bg" />
                  <div className="swatch-icon">
                    <IconComp size={32} />
                  </div>
                  {item.itemType === 'THEME' && (
                    <div className="swatch-dots">
                      {/* dynamic per-item colours — must stay inline */}
                      <span style={{ background: item.previewColor }} />
                      <span className="swatch-dot--mid" />
                      <span style={{ background: item.previewColor, opacity: 0.6 }} />
                    </div>
                  )}
                </div>

                <div className="item-meta">
                  <div className="item-type-badge">
                    {item.itemType === 'THEME' ? '🎨 THEME' : '⚡ PERK'}
                  </div>
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-desc">{item.description}</p>
                </div>

                <div className="item-footer">
                  <div className="item-price">
                    <Zap size={14} className="price-icon" />
                    <span>{item.price}</span>
                    <span className="pts-label">PTS</span>
                  </div>

                  {owned ? (
                    <button className="item-buy-btn owned-btn" disabled>
                      <CheckCircle size={14} /> Owned
                    </button>
                  ) : (
                    <button
                      className={`item-buy-btn ${!affordable ? 'locked-btn' : ''}`}
                      onClick={() => !isBuying && affordable && handleBuy(item)}
                      disabled={!!isBuying || !affordable}
                    >
                      {isBuying === item.itemId ? (
                        <span className="btn-spinner" />
                      ) : !affordable ? (
                        <><Lock size={14} /> Need {item.price - (user?.points ?? 0)} more</>
                      ) : (
                        <><ShoppingBag size={14} /> Buy Now</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── HOW TO EARN PTS SECTION ── */}
      <div className="earn-guide">
        <h3 className="earn-title">
          <Coins size={18} />
          How to Earn Pts
        </h3>
        <div className="earn-grid">
          {[
            { action: 'Daily Login', pts: '+10 Pts', icon: '📅', detail: 'Claim once per calendar day' },
            { action: 'MCQ Correct Answer', pts: '+0.5 Pts', icon: '✅', detail: '≥ 2 correct answers = 1 Pt minimum' },
            { action: 'Complete MCQ (10 correct)', pts: '+5 Pts', icon: '🎯', detail: 'Score big on tactical assessments' },
          ].map((e, i) => (
            <div key={i} className="earn-card glass-card">
              <div className="earn-emoji">{e.icon}</div>
              <div className="earn-info">
                <p className="earn-action">{e.action}</p>
                <p className="earn-detail">{e.detail}</p>
              </div>
              <div className="earn-pts">{e.pts}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TacticalShop;
