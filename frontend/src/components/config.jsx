import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUsers, faGraduationCap, faCalendarAlt, faUserCheck, faUserGraduate, faBars, faUserGroup, faUserPlus, faUserPen, faUser, fa6, faSchool, faMagic, faDashboard, faSignOut, faCalendarCheck, faCog } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './config.css';
import { getTerms, updateTerm } from '../api';

const Config = () => {
     // Retrieve user data from localStorage
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');

  const [terms, setTerms] = useState([]);
  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);


  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const fetchedTerms = await getTerms();
        setTerms(fetchedTerms);
      } catch (error) {
        console.error('Error fetching terms:', error);
      }
    };

    fetchTerms();
  }, []);

  const handleUpdateTerm = async (id, updatedData) => {
    try {
      const updatedTerm = await updateTerm(id, updatedData);
      setTerms((prev) =>
        prev.map((term) => (term.id === id ? updatedTerm : term))
      );
    } catch (error) {
      console.error('Error updating term:', error);
    }
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
    <div className="config-wrapper">
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
<div className={`config-container ${menuOpen ? 'blur' : ''}`}>
        {/* Header Section */}
        <header className="config-header">
          <h1 className="config-title">Configurations</h1>
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
    <div className="config-content">
      <h1>Term Configuration</h1>

      <div className="terms-list">
        <h2>Set Term Dates</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term) => (
              <tr key={term.id}>
                <td>{term.name}</td>
                <td>
                  <input
                    type="date"
                    value={term.startDate ? term.startDate.split('T')[0] : ''}
                    onChange={(e) =>
                      handleUpdateTerm(term.id, { startDate: e.target.value })
                    }
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={term.endDate ? term.endDate.split('T')[0] : ''}
                    onChange={(e) =>
                      handleUpdateTerm(term.id, { endDate: e.target.value })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Config;