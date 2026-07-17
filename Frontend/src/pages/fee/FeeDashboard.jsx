import { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useFeeStore from '../../store/useFeeStore';
import useUserStore from '../../store/useUserStore';
import { 
  Calendar as CalendarIcon, 
  IndianRupee, 
  User, 
  Plus, 
  Trash2, 
  Edit2, 
  Settings, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X,
  FileText,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const FeeDashboard = () => {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();
  const { 
    overview, 
    payments, 
    configs, 
    isLoading, 
    fetchFeeOverview, 
    fetchPayments, 
    addPayment, 
    modifyPayment, 
    removePayment, 
    fetchConfigs, 
    changeConfig, 
    changeDefaultFee 
  } = useFeeStore();

  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'rates'
  
  // Date state for Calendar View
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Form states for Recording Payment
  const [selectedStudent, setSelectedStudent] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDateStr, setPaymentDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [paymentRemarks, setPaymentRemarks] = useState('');

  // Editing state for payment
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [editDateStr, setEditDateStr] = useState('');

  // Settings states
  const [defaultFee, setDefaultFee] = useState('');
  const [studentRates, setStudentRates] = useState({}); // studentId -> rate

  // Selected calendar day detail state
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  useEffect(() => {
    fetchProfile();
    const startStr = new Date(currentYear, currentMonth, 1).toISOString();
    const endStr = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).toISOString();
    
    // Fetch payments for this month's calendar
    fetchPayments({ startDate: startStr, endDate: endStr });
    
    // Fetch month overview
    const yearMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    fetchFeeOverview(yearMonthStr);

    if (user?.role === 'TEACHER') {
      fetchConfigs();
    }
  }, [currentDate, fetchPayments, fetchFeeOverview, fetchConfigs, fetchProfile, user?.role]);

  // Sync settings when loaded
  useEffect(() => {
    if (overview?.defaultMonthlyFee !== undefined) {
      setDefaultFee(overview.defaultMonthlyFee);
    }
    if (configs) {
      const rates = {};
      configs.forEach(c => {
        rates[c.studentId?._id || c.studentId] = c.monthlyAmount;
      });
      setStudentRates(rates);
    }
  }, [overview, configs]);

  // Generate calendar days
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDayOfWeek = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  // Month navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(1);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(1);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper: Get payments on a specific day of the current visible month
  const getPaymentsForDay = (day) => {
    return payments.filter(p => {
      const pDate = new Date(p.paymentDate);
      return pDate.getFullYear() === currentYear && 
             pDate.getMonth() === currentMonth && 
             pDate.getDate() === day;
    });
  };

  // Student specific rate selection helper
  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    if (user?.role === 'TEACHER' && overview?.students) {
      const studentObj = overview.students.find(s => s._id === studentId);
      if (studentObj) {
        setPaymentAmount(studentObj.configuredRate || defaultFee || 0);
      }
    }
  };

  // Submit recorded payment
  const handleLogPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return toast.error('Please select a student');
    if (!paymentAmount || Number(paymentAmount) <= 0) return toast.error('Please enter a valid amount');

    try {
      await addPayment({
        studentId: selectedStudent,
        amount: Number(paymentAmount),
        paymentDate: new Date(paymentDateStr).toISOString(),
        remarks: paymentRemarks
      });
      toast.success('Payment logged successfully');
      setPaymentRemarks('');
      setPaymentAmount(0);
      setSelectedStudent('');
    } catch (error) {
      toast.error(error.message || 'Failed to log payment');
    }
    // Force refresh data
    const yearMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    fetchFeeOverview(yearMonthStr);
  };

  // Update default fee
  const handleUpdateDefaultFee = async () => {
    if (defaultFee === '' || Number(defaultFee) < 0) return toast.error('Invalid default fee');
    try {
      await changeDefaultFee(Number(defaultFee));
      toast.success('Default monthly fee updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update default fee');
    }
  };

  // Update student custom fee
  const handleUpdateStudentRate = async (studentId, rateVal) => {
    if (rateVal === '' || Number(rateVal) < 0) return toast.error('Invalid rate');
    try {
      await changeConfig(studentId, Number(rateVal));
      toast.success('Student custom rate updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update custom rate');
    }
  };

  // Trigger payment edit Mode
  const startEditPayment = (payment) => {
    setEditingPaymentId(payment._id);
    setEditAmount(payment.amount);
    setEditRemarks(payment.remarks);
    setEditDateStr(new Date(payment.paymentDate).toISOString().slice(0, 10));
  };

  // Save edited payment
  const saveEditedPayment = async () => {
    if (!editAmount || Number(editAmount) <= 0) return toast.error('Please enter a valid amount');
    try {
      await modifyPayment(editingPaymentId, {
        amount: Number(editAmount),
        remarks: editRemarks,
        paymentDate: new Date(editDateStr).toISOString()
      });
      setEditingPaymentId(null);
      toast.success('Payment updated successfully');
      const yearMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      fetchFeeOverview(yearMonthStr);
    } catch (error) {
      toast.error(error.message || 'Failed to update payment');
    }
  };

  // Delete payment record
  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await removePayment(id);
      toast.success('Payment deleted successfully');
      const yearMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      fetchFeeOverview(yearMonthStr);
    } catch (error) {
      toast.error(error.message || 'Failed to delete payment');
    }
  };

  const selectedDayPayments = getPaymentsForDay(selectedDay);
  const selectedDayTotal = selectedDayPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fee-dashboard-container">
      <SEO 
        title="Fee Ledger & Calendar" 
        description="Monitor financial inflows, view payment dates, and manage student rates on the XMentor cash calendar." 
      />

      {isLoading && <LoadingOverlay message="Syncing Ledgers..." />}

      <header className="fee-header">
        <div className="header-text">
          <h1 className="glow-text">Tactical Ledger</h1>
          <p>Record, manage, and audit monthly student cash flows.</p>
        </div>
        {user?.role === 'TEACHER' && (
          <div className="tab-buttons glass-card">
            <button 
              className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              <CalendarIcon size={16} />
              <span>Calendar</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'rates' ? 'active' : ''}`}
              onClick={() => setActiveTab('rates')}
            >
              <Settings size={16} />
              <span>Configure Rates</span>
            </button>
          </div>
        )}
      </header>

      {user?.role === 'TEACHER' ? (
        /* ==================== TEACHER VIEW ==================== */
        <div className="fee-body">
          {activeTab === 'calendar' ? (
            <div className="calendar-grid-layout">
              {/* Calendar Block */}
              <div className="calendar-card glass-card">
                <div className="calendar-controls">
                  <h2>{monthNames[currentMonth]} {currentYear}</h2>
                  <div className="nav-arrows">
                    <button className="nav-arrow" onClick={prevMonth} aria-label="Previous Month">
                      <ChevronLeft size={20} />
                    </button>
                    <button className="nav-arrow" onClick={nextMonth} aria-label="Next Month">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="calendar-grid">
                  {/* Days of Week */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="grid-header-day">{d}</div>
                  ))}

                  {/* Previous Month Padding */}
                  {[...Array(startDayOfWeek)].map((_, i) => {
                    const dayNum = prevMonthDays - startDayOfWeek + i + 1;
                    return (
                      <div key={`prev-${i}`} className="grid-day empty-day">
                        <span className="day-number">{dayNum}</span>
                      </div>
                    );
                  })}

                  {/* Active Month Days */}
                  {[...Array(totalDays)].map((_, i) => {
                    const dayNum = i + 1;
                    const dayPayments = getPaymentsForDay(dayNum);
                    const daySum = dayPayments.reduce((sum, p) => sum + p.amount, 0);
                    const isSelected = selectedDay === dayNum;

                    return (
                      <div 
                        key={`day-${dayNum}`} 
                        className={`grid-day ${isSelected ? 'selected' : ''} ${daySum > 0 ? 'has-payments' : ''}`}
                        onClick={() => setSelectedDay(dayNum)}
                      >
                        <span className="day-number">{dayNum}</span>
                        {daySum > 0 && (
                          <div className="day-badge">
                            <span className="badge-currency">₹</span>{daySum}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day Details and Logging Panel */}
              <div className="ledger-details-sidebar">
                {/* selected day logs */}
                <div className="day-details-card glass-card">
                  <div className="card-header">
                    <h3>Day Ledger: {selectedDay} {monthNames[currentMonth]}</h3>
                    {selectedDayTotal > 0 && (
                      <span className="total-indicator success-glow">
                        Total: ₹{selectedDayTotal}
                      </span>
                    )}
                  </div>

                  <div className="payments-list">
                    {selectedDayPayments.length === 0 ? (
                      <div className="empty-payments">
                        <FileText size={32} />
                        <p>No cash logged on this date.</p>
                      </div>
                    ) : (
                      selectedDayPayments.map(p => {
                        const studentName = p.studentId?.name || 'Unknown Student';
                        const studentUsername = p.studentId?.username || '';
                        const avatar = p.studentId?.profilePic;

                        return (
                          <div key={p._id} className="payment-row glass-card">
                            {editingPaymentId === p._id ? (
                              /* Inline Edit Form */
                              <div className="inline-edit-form">
                                <div className="input-group">
                                  <label>Amount (₹)</label>
                                  <input 
                                    type="number" 
                                    value={editAmount} 
                                    onChange={(e) => setEditAmount(e.target.value)} 
                                  />
                                </div>
                                <div className="input-group">
                                  <label>Date</label>
                                  <input 
                                    type="date" 
                                    value={editDateStr} 
                                    onChange={(e) => setEditDateStr(e.target.value)} 
                                  />
                                </div>
                                <div className="input-group">
                                  <label>Remarks</label>
                                  <input 
                                    type="text" 
                                    value={editRemarks} 
                                    onChange={(e) => setEditRemarks(e.target.value)} 
                                  />
                                </div>
                                <div className="action-buttons">
                                  <button className="btn-small success" onClick={saveEditedPayment}>
                                    <Check size={14} /> Save
                                  </button>
                                  <button className="btn-small danger" onClick={() => setEditingPaymentId(null)}>
                                    <X size={14} /> Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Normal View */
                              <>
                                <div className="student-profile-mini">
                                  <div className="avatar">
                                    {avatar ? <img src={avatar} alt="" /> : studentName.charAt(0)}
                                  </div>
                                  <div className="details">
                                    <span className="name">{studentName}</span>
                                    <span className="username">@{studentUsername}</span>
                                  </div>
                                </div>
                                <div className="payment-amount-info">
                                  <span className="amount">₹{p.amount}</span>
                                  {p.remarks && <span className="remarks">{p.remarks}</span>}
                                </div>
                                <div className="payment-actions">
                                  <button 
                                    className="action-btn edit" 
                                    onClick={() => startEditPayment(p)}
                                    aria-label="Edit Payment"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    className="action-btn delete" 
                                    onClick={() => handleDeletePayment(p._id)}
                                    aria-label="Delete Payment"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Log Payment Form */}
                <div className="log-payment-card glass-card">
                  <h3>Log Cash Receipt</h3>
                  <form onSubmit={handleLogPayment}>
                    <div className="input-group">
                      <label htmlFor="student-select">Select Recruit</label>
                      <div className="select-wrapper">
                        <select 
                          id="student-select"
                          value={selectedStudent} 
                          onChange={(e) => handleStudentSelect(e.target.value)}
                        >
                          <option value="">-- Choose Student --</option>
                          {overview?.students?.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.name} (@{s.username})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="payment-amount">Amount (₹)</label>
                        <input 
                          id="payment-amount"
                          type="number" 
                          value={paymentAmount} 
                          onChange={(e) => setPaymentAmount(e.target.value)} 
                          placeholder="Rate"
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="payment-date">Date Received</label>
                        <input 
                          id="payment-date"
                          type="date" 
                          value={paymentDateStr} 
                          onChange={(e) => setPaymentDateStr(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="payment-remarks">Remarks (optional)</label>
                      <input 
                        id="payment-remarks"
                        type="text" 
                        value={paymentRemarks} 
                        onChange={(e) => setPaymentRemarks(e.target.value)} 
                        placeholder="e.g. For Month of July"
                      />
                    </div>

                    <button type="submit" className="btn-primary glow-button">
                      <Plus size={18} />
                      <span>Record Payment</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* Rate overrides tab */
            <div className="rates-configuration-layout">
              {/* Default fee setter */}
              <div className="default-fee-card glass-card">
                <h3>Global Rate Default</h3>
                <p>Set a default monthly fee rate for all recruits. This rate applies unless customized per student.</p>
                <div className="default-input-row">
                  <div className="input-with-symbol">
                    <IndianRupee size={18} />
                    <input 
                      type="number" 
                      value={defaultFee} 
                      onChange={(e) => setDefaultFee(e.target.value)} 
                      placeholder="e.g. 1000"
                    />
                  </div>
                  <button className="btn-primary" onClick={handleUpdateDefaultFee}>
                    Save Default
                  </button>
                </div>
              </div>

              {/* Roster list with overrides */}
              <div className="student-rates-list glass-card">
                <h3>Custom Student Fees</h3>
                <div className="student-rates-table">
                  <div className="table-header">
                    <span>Recruit Details</span>
                    <span>Configured Monthly Fee</span>
                    <span>Actions</span>
                  </div>
                  {overview?.students?.length === 0 ? (
                    <div className="empty-roster">
                      <Users size={32} />
                      <p>No students linked. Link students using the Add Student option in your profile.</p>
                    </div>
                  ) : (
                    overview?.students?.map(s => {
                      const isCustom = studentRates[s._id] !== undefined;
                      const rateVal = studentRates[s._id] !== undefined ? studentRates[s._id] : defaultFee;

                      return (
                        <div key={s._id} className="table-row">
                          <div className="student-profile-mini">
                            <div className="avatar">
                              {s.profilePic ? <img src={s.profilePic} alt="" /> : s.name.charAt(0)}
                            </div>
                            <div className="details">
                              <span className="name">{s.name}</span>
                              <span className="username">@{s.username}</span>
                            </div>
                          </div>

                          <div className="rate-input-field">
                            <div className="input-with-symbol">
                              <IndianRupee size={14} />
                              <input 
                                type="number" 
                                value={rateVal || ''} 
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setStudentRates(prev => ({
                                    ...prev,
                                    [s._id]: newVal
                                  }));
                                }}
                                placeholder="Fee"
                              />
                            </div>
                            {isCustom ? (
                              <span className="tag custom">Custom Override</span>
                            ) : (
                              <span className="tag default">Using Global Default</span>
                            )}
                          </div>

                          <div className="action-col">
                            <button 
                              className="btn-small glow-button"
                              onClick={() => handleUpdateStudentRate(s._id, studentRates[s._id])}
                            >
                              Apply Rate
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== STUDENT VIEW ==================== */
        <div className="fee-body student-view">
          <div className="student-grid-layout">
            {/* Overview cards */}
            <div className="teachers-overview-card glass-card">
              <h3>Monthly Rates & Status</h3>
              <p className="subtitle">All fee records are updated manually by your assigned teachers upon cash receipt.</p>
              
              <div className="teachers-list">
                {overview?.teachers?.length === 0 ? (
                  <div className="empty-state">
                    <Users size={32} />
                    <p>You are not linked to any teachers.</p>
                  </div>
                ) : (
                  overview?.teachers?.map(t => (
                    <div key={t._id} className="teacher-rate-row glass-card">
                      <div className="teacher-info">
                        <div className="avatar">
                          {t.profilePic ? <img src={t.profilePic} alt="" /> : t.name.charAt(0)}
                        </div>
                        <div className="details">
                          <span className="name">{t.name}</span>
                          <span className="username">@{t.username}</span>
                        </div>
                      </div>

                      <div className="rate-display">
                        <span className="label">Monthly Rate</span>
                        <span className="value">₹{t.rate}</span>
                      </div>

                      <div className="status-display">
                        <span className="label">This Month</span>
                        <span className={`status-badge ${t.status.toLowerCase()}`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Read-Only Calendar */}
            <div className="calendar-card glass-card">
              <div className="calendar-controls">
                <h2>My Payment Calendar ({monthNames[currentMonth]} {currentYear})</h2>
                <div className="nav-arrows">
                  <button className="nav-arrow" onClick={prevMonth} aria-label="Previous Month">
                    <ChevronLeft size={20} />
                  </button>
                  <button className="nav-arrow" onClick={nextMonth} aria-label="Next Month">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="grid-header-day">{d}</div>
                ))}

                {[...Array(startDayOfWeek)].map((_, i) => {
                  const dayNum = prevMonthDays - startDayOfWeek + i + 1;
                  return (
                    <div key={`prev-${i}`} className="grid-day empty-day">
                      <span className="day-number">{dayNum}</span>
                    </div>
                  );
                })}

                {[...Array(totalDays)].map((_, i) => {
                  const dayNum = i + 1;
                  const dayPayments = getPaymentsForDay(dayNum);
                  const daySum = dayPayments.reduce((sum, p) => sum + p.amount, 0);

                  return (
                    <div 
                      key={`day-${dayNum}`} 
                      className={`grid-day ${daySum > 0 ? 'paid-day' : ''}`}
                    >
                      <span className="day-number">{dayNum}</span>
                      {daySum > 0 && (
                        <div className="day-badge success">
                          PAID: ₹{daySum}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full Payments History list */}
          <div className="history-section-card glass-card">
            <h3>Full Transaction Ledger</h3>
            <div className="history-table">
              <div className="table-header">
                <span>Date</span>
                <span>Teacher</span>
                <span>Amount Paid</span>
                <span>Remarks</span>
              </div>
              {payments.length === 0 ? (
                <div className="empty-state-history">
                  <FileText size={32} />
                  <p>No transaction history logged.</p>
                </div>
              ) : (
                payments.map(p => (
                  <div key={p._id} className="table-row">
                    <span className="date-cell">
                      {new Date(p.paymentDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="teacher-cell">
                      {p.teacherId?.name || 'Unknown'}
                    </span>
                    <span className="amount-cell success-text">
                      ₹{p.amount}
                    </span>
                    <span className="remarks-cell">
                      {p.remarks || '-'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeDashboard;
