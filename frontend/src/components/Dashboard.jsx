import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUsers, faGraduationCap, faCalendarAlt, faUserCheck, faUserGraduate, faBars,faDashboard, faSignOut, faCalendarCheck, faCog } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { getEventsMetrics,getParentsMetrics, getStudentsMetrics, logout} from '../api';


const Dashboard = () => {
  // Retrieve user data from localStorage
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');

  // State for filters
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

// State for the metric data (fetched via API)
const [metrics, setMetrics] = useState({
  sentNotifications: 0,
  totalParents: '',
  registeredStudents: '',
  createdEvents: '',
  activeEvents: '',
  activeStudents: '',
});
// Helper function to get today's date in the format 'YYYY-MM-DD'
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Fetch all metrics from APIs
const fetchAllMetrics = async () => {
  try {
    let startDate = dateRange.start;
    let endDate = dateRange.end;

    // Logic to handle different filters
    if (filter === 'today') {
      startDate = endDate = getTodayDate();
    } else if (filter === 'lastweek') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      startDate = lastWeek.toISOString().split('T')[0];
      endDate = getTodayDate(); // Last week up to today
    } else if (filter === 'last3months') {
      const last3Months = new Date();
      last3Months.setMonth(last3Months.getMonth() - 3);
      startDate = last3Months.toISOString().split('T')[0];
      endDate = getTodayDate();
    } else if (filter === 'year') {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      startDate = lastYear.toISOString().split('T')[0];
      endDate = getTodayDate();
    }

    // Use the calculated startDate and endDate
    const [eventsMetrics, parentsMetrics, studentsMetrics] = await Promise.all([
      getEventsMetrics({ filter, startDate, endDate }),
      getParentsMetrics({ filter, startDate, endDate }),
      getStudentsMetrics({ filter, startDate, endDate }),
    ]);

    // Combine data into one metrics object
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      ...eventsMetrics,
      ...parentsMetrics,
      ...studentsMetrics,
    }));
   
  } catch (error) {
    console.error('Error fetching metrics:', error);
  }
};

// Fetch metrics on initial load or when filters change
useEffect(() => {
  fetchAllMetrics();
}, [filter, dateRange]); // Trigger fetch when filter or date range changes

// Apply filters
const applyFilters = () => {
  fetchAllMetrics(); // Re-fetch metrics with updated filters
};

// Clear filters
const clearFilters = () => {
  setFilter('');
  setDateRange({ start: '', end: '' });
  fetchAllMetrics(); // Re-fetch metrics without filters
};

  // Handle profile dropdown toggle
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Toggle side menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      // Redirect to the index page
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <div className="dashboard-wrapper">
     {/* Side Menu */}
<div className={`side-menu ${menuOpen ? 'open' : ''}`}>
  <button className="menu-toggle" onClick={toggleMenu}>
    <FontAwesomeIcon icon={faBars} />
  </button>
  {/* Menu Icons */}
  <div className="menu-icons">
  <ul>
        <li><Link to="/dashboard"><FontAwesomeIcon icon={faDashboard} className="Dashboard-icon" /> {menuOpen && <span>Dashboard</span>}</Link></li>
        <li><Link to="/students"><FontAwesomeIcon icon={faGraduationCap} className="Students-icon" /> {menuOpen && <span>Students</span>}</Link></li>
        <li><Link to="/events"><FontAwesomeIcon icon={faCalendarAlt} className="Events-icon" /> {menuOpen && <span>Events</span>}</Link></li>
        <li><Link to="/parents"><FontAwesomeIcon icon={faUsers} className="Parents-icon" /> {menuOpen && <span>Parents</span>}</Link></li>
        <li><Link to="/config"><FontAwesomeIcon icon={faCog} className="Config-icon" /> {menuOpen && <span>Configurations</span>}</Link></li>
        <li onClick={toggleProfileDropdown}><FontAwesomeIcon icon={faUserCheck} className="Profile-icon" style={{ color: 'white' }} />{menuOpen && <span>Profile</span>}</li>
        <li onClick={handleLogout}><FontAwesomeIcon icon={faSignOut} className="Register-icon" style={{ color: 'white' }} />{menuOpen && <span>Logout</span>}</li>
      </ul>
  </div>
</div>

      {/* Main Content */}
      <div className={`dashboard-container ${menuOpen ? 'blur' : ''}`}>
        {/* Header Section */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
        </header>
        {/* Profile Icon */}
        <div className="profile-container" onClick={toggleProfileDropdown}>
            <FontAwesomeIcon icon={faUserCheck} className="profile-icon" />
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <p><strong>UserName: {username}</strong></p>
                <p><strong>Email: {email}</strong></p>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        {/* Filters Section */}
<div className="dashboard-filters">
  <h2 className="filter-title">Filter By</h2>
  
  {/* Time Range Filter */}
  <div className="filter-group">
    <label className="filter-label">Time Range:</label>
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="filter-select"
    >
      <option value="">Select Range</option>
      <option value="today">Today</option>
      <option value="lastweek">Last Week</option>
      <option value="last3months">Last 3 Months</option>
      <option value="year">Year</option>
      <option value="all">All Time</option>
    </select>
  </div>

  {/* From Date */}
  <div className="filter-group">
    <label className="filter-label">From:</label>
    <input
      type="date"
      value={dateRange.start}
      onChange={(e) =>
        setDateRange((prev) => ({ ...prev, start: e.target.value }))
      }
      className="filter-date"
    />
  </div>

  {/* To Date */}
  <div className="filter-group">
    <label className="filter-label">To:</label>
    <input
      type="date"
      value={dateRange.end}
      onChange={(e) =>
        setDateRange((prev) => ({ ...prev, end: e.target.value }))
      }
      className="filter-date"
    />
  </div>

  {/* Action Buttons */}
  <div className="filter-buttons">
    <button className="clear-button" onClick={clearFilters}>Clear</button>
    <button className="apply-button" onClick={applyFilters}>Filter</button>
  </div>
</div>
        {/* Metrics Section */}
        <div className="metrics-container">
        <div className="metric-card">
  <FontAwesomeIcon icon={faBell} className="metric-icon" style={{ color: 'blue' }} />
  <h2 style={{ color: 'blue' }}>Sent Parent Notifications</h2>
  <p style={{ color: 'blue', fontSize: '2rem' }}>{metrics.sentNotifications}</p>
</div>
          <div className="metric-card">
            <FontAwesomeIcon icon={faUsers} className="metric-icon" style={{ color: 'green' }} />
            <h2 style={{ color: 'green' }}> Registered Parents</h2>
            <p style={{ color: 'green', fontSize: '2rem' }}>{metrics.totalParents}</p>
          </div>
          <div className="metric-card">
            <FontAwesomeIcon icon={faGraduationCap} className="metric-icon" style={{ color: 'purple' }} />
            <h2 style={{color: 'purple'}}>Registered Students</h2>
            <p style={{color: 'purple', fontSize: '2rem'}}>{metrics.totalStudents}</p>
          </div>
          <div className="metric-card">
            <FontAwesomeIcon icon={faCalendarAlt} className="metric-icon" style={{ color: 'orange' }} />
            <h2 style={{ color: 'orange' }}>Created Events</h2>
            <p style={{ color: 'orange', fontSize: '2rem' }}>{metrics.totalEvents}</p>
          </div>
          <div className="metric-card">
            <FontAwesomeIcon icon={faCalendarCheck} className="metric-icon" style={{ color: 'red' }} />
            <h2 style={{ color: 'red' }}>Active Events</h2>
            <p style={{ color: 'red', fontSize: '2rem' }}>{metrics.activeEvents}</p>
          </div>
          <div className="metric-card">
            <FontAwesomeIcon icon={faUserGraduate} className="metric-icon" style={{ color: 'brown' }} />
            <h2 style={{ color: 'brown' }}>Active Students</h2>
            <p style={{ color: 'brown', fontSize: '2rem' }}>{metrics.activeStudents}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
