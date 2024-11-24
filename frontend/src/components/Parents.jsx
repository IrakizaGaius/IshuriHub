import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faBell, faUsers, faGraduationCap, faCalendarAlt, faUserCheck, faBars, faDashboard, faSignOut, faCog } from '@fortawesome/free-solid-svg-icons';
import './Parents.css';
import { Link } from 'react-router-dom';
import { addParent, getParentsMetrics, getParents, deleteParent, updateParent, logout} from '../api';


// Retrieve user data from localStorage
const username = localStorage.getItem('username');
const email = localStorage.getItem('email');

const ParentsPage = () => {
  // State for storing parents data
  const [parents, setParents] = useState([]);
  const sortedParents = [...parents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const [filteredParents, setFilteredParents] = useState([]);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeForm, setActiveForm]= useState('');
  const [filterApplied, setFilterApplied] = useState(false);
// State for form inputs
 const [parentData, setParentData] = useState({ name: '', phoneNumber: '', email: '' });
// State for the notification
const [notification, setNotification] = useState({ message: '', type: '' });

  // Form handling functions
  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setParentData({ ...parentData, [name]: value });
  };

  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);


// Separate disclaimer states for each form
const [ParentCreationDisclaimer, setParentCreationDisclaimer] = useState('');
const [parentEditDisclaimer, setParentEditDisclaimer] = useState('');

  const openForm = (form) => {
    setActiveForm(form);
  };

  const closeForm = () => {
    setActiveForm('');
    setParentCreationDisclaimer('');
    setParentData({ name: '', phoneNumber: '', email: '' });
  };

  // Handle profile dropdown toggle
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Toggle side menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
    const [selectedParent, setSelectedParent] = useState(null);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
  
    // Open View Modal
    const openViewModal = (parent) => {
      setSelectedParent(parent);
      setViewModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (parent) => {
      setSelectedParent(parent);
      setEditModalOpen(true);
    };
  
    // Open Delete Modal
    const openDeleteModal = (parent) => {
      setSelectedParent(parent);
      setDeleteModalOpen(true);
    };
  

const confirmDelete = async () => {
  try {

    await deleteParent(selectedParent.id);
    setNotification({
      message: 'Parent deleted successfully!',
      type: 'success',
    });

    setParents((prevParents) =>
      prevParents.filter((parent) => parent.id !== selectedParent.id)
    );
    setMetrics((prevMetrics) => ({
      ...prevMetrics,
      totalParents: prevMetrics.totalParents - 1,
      activeParents: prevMetrics.activeParents - 1,
    }));

    setDeleteModalOpen(false);
  } catch (error) {
    console.error('Error deleting parent:', error);

    // Show an error notification
    setNotification({
      message: `⚠️ Error deleting parent: ${error.message}`,
      type: 'error',
    });
  }
};

  
    // Close View Modal
    const closeViewModal = () => {
      setSelectedParent(null);
      setViewModalOpen(false);
      setEditModalOpen(false);
    };
    // Notification close handler
    const closeNotification = () => {
      setNotification({ message: '', type: '' });
    };
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentParents = parents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(parents.length / itemsPerPage);
 // Metrics state
 const [metrics, setMetrics] = useState({
  totalParents: '',
  activeParents: '',
});
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);}

  // Fetch parents list on component mount
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const parents = await getParents();
        setParents(parents);
        setFilteredParents(parents);
      } catch (error) {
        console.error('Error fetching parents:', error);
      }
    };

    fetchParents();
  }, []);

// Export functionality
const handleExport = () => {

  const header = "Name,Phone Number,Status,Date Added";
  const csvContent = parents.map(parent => 
    `${parent.name},${parent.phoneNumber},${parent.status},${parent.email},${formatDate(parent.createdAt)}`).join("\n");
  const csvData = `${header}\n${csvContent}`;
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'parents_data.csv');
  a.click();
};

// Fetch user information and metrics from API on component mount
  useEffect(() => {

    const fetchMetrics = async () => {
      try {
        const data = await getParentsMetrics();
        setMetrics(data); // Set metrics based on API response
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    
    
    fetchMetrics();

  }, []);

  // Parent Creation
  const handleParentSubmit = async (e) => {
    e.preventDefault();
    const { name, phoneNumber, email } = parentData;
    // Validate form fields
    if (!name || !phoneNumber) {
      setParentCreationDisclaimer('⚠️ Please fill in all fields.');
      return;
    }

    try {
      const result = await addParent({ name: name, phoneNumber: phoneNumber, email: email });
      setActiveForm('');
      setNotification({ message: 'Parent created successfully!', type: 'success' }); 
      // Clear form fields
      setParentData({ name: '', phoneNumber: '', email: '' });
      // Update the parents list using the previous state
      setParents((prevParents) => [...prevParents, result]);
      setMetrics((prevMetrics) => ({
        ...prevMetrics,
        totalParents: prevMetrics.totalParents + 1,
        activeParents: prevMetrics.activeParents + 1,
      }));
  
    } catch (error) {
      console.error('Error during Parent Creation:', error);
      setParentCreationDisclaimer(`⚠️ Parent Creation failed: ${error.message}`);
    }
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
  
// Apply filters
const applyFilters = () => {
  let filtered = [...parents];
  const now = new Date();
  
  // Time-based filters
  if (filter === 'today') {
    filtered = filtered.filter(parent => new Date(parent.createdAt).toDateString() === now.toDateString());
  } else if (filter === 'lastweek') {
    const lastWeek = new Date(now.setDate(now.getDate() - 7));
    filtered = filtered.filter(parent => new Date(parent.createdAt) >= lastWeek);
  } else if (filter === 'last3months') {
    const last3Months = new Date(now.setMonth(now.getMonth() - 3));
    filtered = filtered.filter(parent => new Date(parent.createdAt) >= last3Months);
  } else if (filter === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    filtered = filtered.filter(parent => new Date(parent.createdAt) >= startOfYear);
  } else if (filter === 'all') {
    filtered = parents;
  }

  // Date range filters
  if (dateRange.start) {
    filtered = filtered.filter(parent => new Date(parent.createdAt) >= new Date(dateRange.start));
  }
  if (dateRange.end) {
    filtered = filtered.filter(parent => new Date(parent.createdAt) <= new Date(dateRange.end));
  }

  setFilteredParents(filtered); // Update state with filtered results
  setFilterApplied(true);
};

// Clear filters
const clearFilters = () => {
  setFilter('');
  setDateRange({ start: '', end: '' });
  setFilteredParents(parents); // Reset to original data
  setFilterApplied(false);
};

  return (
    <div className="parents-wrapper">
      <div className={`parents-side-menu ${menuOpen ? 'open' : ''}`}>
  <button className="parents-menu-toggle" onClick={toggleMenu}>
    <FontAwesomeIcon icon={faBars} />
  </button>
  {/* Menu Icons */}
  <div className="parents-menu-icons">
  <ul>
        <li><Link to="/dashboard"><FontAwesomeIcon icon={faDashboard} className="Dashboard-icon" /> {menuOpen && <span>Dashboard</span>}</Link></li>
        <li><Link to="/notifications"><FontAwesomeIcon icon={faBell} className="Notifications-icon" /> {menuOpen && <span>Notifications</span>}</Link></li>
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
      <div className={`parents-container ${menuOpen ? 'blur' : ''}`}>
        {/* Notification */}
      {notification.message && (
        <div className={`notification ${notification.type}`} style={{ top: notification.message ? '100px' : '-60px' }}>
          {notification.message}
        </div>
      )}

      {/* Close Notification after 3 seconds */}
      {notification.message && setTimeout(closeNotification, 3000)}

        {/* Header Section */}
        <header className="parents-header">
          <h1 className="parents-title">Parents</h1>
        </header>
        {/* Profile Icon */}
        <div className="parents-profile-container" onClick={toggleProfileDropdown}>
            <FontAwesomeIcon icon={faUserCheck} className="parents-profile-icon" />
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="parents-profile-dropdown">
                <p><strong>UserName: {username}</strong></p>
                <p><strong>Email: {email}</strong></p>
                <button className="parents-logout-button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
      {/* Metric Cards */}
      <div className="parents-metrics-container">
        <div className="parents-metric-card">
        <FontAwesomeIcon icon={faUsers} className="parent-metric-icon" style={{ color: 'green' }} />
            <h2 style={{ color: 'green' }}>Total Parents</h2>
            <p style={{ color: 'green' }}>{metrics.totalParents}</p>
        </div>
        <div className="parents-metric-card">
        <FontAwesomeIcon icon={faUserCheck} className="parent-metric-icon" style={{ color: 'red' }} />
          <h2 style={{ color: 'red' }}>Active Parents</h2>
          <p style={{ color: 'red' }}>{metrics.activeParents}</p>
        </div>
      </div>

      {/* Add Parent Button */}
      <div className="add-parent-button-container">
        <button className="add-parent-button" onClick={() => openForm('Parent')}> + Add Parent</button>
      </div>
      {/* Add Parent Form */}
{activeForm === 'Parent' && (
  <div className="popup-form">
    <div className="form-container">
      <h2 className="form-title">Add Parent</h2>
      <form onSubmit={handleParentSubmit} className="parent-form">
        <div className="form-group">
          <label htmlFor="ParentName" className="form-label">Name:</label>
          <input type="text" id="ParentName" name="name" className="form-input" value={parentData.name} onChange={handleParentChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="ParentPhoneNumber" className="form-label">PhoneNumber:</label>
          <input type="text" id="ParentPhoneNumber" name="phoneNumber" className="form-input" value={parentData.phoneNumber} onChange={handleParentChange} required/>
        </div>
        <div className="form-group">
          <label htmlFor="ParentEmail" className="form-label">Email:</label>
          <input type="text" id="ParentEmail" name="email" className="form-input" value={parentData.email} onChange={handleParentChange}/>
        </div>
        <div style={{ color: ParentCreationDisclaimer.includes('✔️') ? 'green' : 'red', marginTop: '10px' }}>
          {ParentCreationDisclaimer}
        </div>
        <div className="parent-form-actions">
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
      <div className='form-close'>
      <button className="btn btn-close" onClick={closeForm}></button>
    </div>
  </div>
  </div>
)}


{/* View Parent Modal */}
{isViewModalOpen && (
  <div className="parents-popup-form">
    <div className="parents-form-container">
      <h2 className="parents-form-title">Parent Information</h2>

      <div className="parents-form-group">
        <p> <label htmlFor="ParentName" className="parents-form-label">Name:</label> {selectedParent.name}</p>
      </div>

      <div className="parents-form-group">
        <p><label htmlFor="ParentPhoneNumber" className="parents-form-label">Phone Number:</label> {selectedParent.phoneNumber}</p>
      </div>

      <div className="parents-form-group">
        <p><label htmlFor="ParentEmail" className="parents-form-label">Email:</label> {selectedParent.email}</p>
      </div>

      <div className="parents-form-group">
        <p> <label htmlFor="ParentStatus" className="parents-form-label">Status:</label> {selectedParent.status}</p>
      </div>

      <div className="parents-form-group">
      <p><label htmlFor="DateAdded" className="parents-form-label">Date Added:</label>{formatDate(selectedParent.createdAt)}</p>
      </div>
      <div className='parents-form-close'>
      <button className="btn btn-close" onClick={closeViewModal}></button>
      </div>
    </div>
  </div>
)}


{/* Edit Parent Modal */}
{isEditModalOpen && (
  <div className="popup-form">
    <div className="form-container">
      <h2 className="form-title">Edit Parent Information</h2>
      <form
  onSubmit={async (e) => {
    e.preventDefault();
    try {
      const result = await updateParent(selectedParent.id, selectedParent);
      setNotification({ message: 'Parent updated successfully!', type: 'success' }); 
      setEditModalOpen(false); // Close the modal
        // Update the parents list by replacing the updated parent
  setParents((prevParents) =>
    prevParents.map((parent) =>
      parent.id === selectedParent.id ? result : parent
    )
  );
    } catch (error) {
      console.error('Error updating parent:', error);
      setParentEditDisclaimer(`⚠️ ${error.message}`);
    }
  }}

        className="parent-form"
      >
        <div className="form-group">
          <label htmlFor="editParentName" className="form-label">Name:</label>
          <input
            type="text"
            id="editParentName"
            value={selectedParent.name}
            onChange={(e) =>
              setSelectedParent({ ...selectedParent, name: e.target.value })
            }
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editParentPhoneNumber" className="form-label">Phone Number:</label>
          <input
            type="text"
            id="editParentPhoneNumber"
            value={selectedParent.phoneNumber}
            onChange={(e) =>
              setSelectedParent({
                ...selectedParent,
                phoneNumber: e.target.value,
              })
            }
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editParentEmail" className="form-label">Email:</label>
          <input
            type="text"
            id="editParentEmail"
            value={selectedParent.email}
            onChange={(e) =>
              setSelectedParent({
                ...selectedParent,
                email: e.target.value,
              })
            }
            className="form-input"
          />
        </div>

        <div style={{ color: parentEditDisclaimer.includes('✔️') ? 'green' : 'red', marginTop: '10px' }}>
          {parentEditDisclaimer}
        </div>
        <div className="parent-form-actions">
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
      <div className='form-close'>
      <button className="btn btn-close" onClick={closeViewModal}></button>
    </div>
    </div>
  </div>
)}

{/* Delete Confirmation Modal */}
{isDeleteModalOpen && (
  <div className="popup-form">
    <div className="form-container">
      <h2 className="form-title">Delete Confirmation</h2>
      <p>Are you sure you want to delete {selectedParent.name}?</p>
      <div className="parent-form-actions">
        <button onClick={confirmDelete} className="delete-modal-confirm btn btn-primary">Yes</button>
        <button
          type="button"
          onClick={() => setDeleteModalOpen(false)}
          className="delete-modal-close btn btn-primary"
        >
          No
        </button>
      </div>
    </div>
  </div>
)}

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`page-button ${index + 1 === currentPage ? 'active' : ''}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Filters Section */}
<div className="parents-filters">
  <h2 className="parents-filter-title">Filter By</h2>
  
  {/* Time Range Filter */}
  <div className="parents-filter-group">
    <label className="parents-filter-label">Time Range:</label>
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="parents-filter-select"
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
  <div className="parents-filter-group">
    <label className="parents-filter-label">From:</label>
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
    <button className="clear-button" onClick={clearFilters}>
      Clear
    </button>
    <button className="apply-button" onClick={applyFilters}>
      Filter
    </button>
    <button className="export-button" onClick={handleExport}>
      <FontAwesomeIcon icon={faDownload} /> Export
    </button>
  </div>
</div>
      {/* Parents Table */}
      <table className="parents-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Status</th>
            <th>Date Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {/* Display filtered parents if filter is applied */}
  {filterApplied ? (
    filteredParents.length > 0 ? (
      filteredParents.map((parent) => (
        <tr key={parent.id}>
          <td>{parent.name}</td>
          <td>{parent.phoneNumber}</td>
          <td>{parent.status}</td>
          <td>{parent.email}</td>
          <td>{formatDate(parent.createdAt)}</td>
          <td>
            <FontAwesomeIcon
              icon={faEye}
              className="action-icon"
              title="View"
              onClick={() => openViewModal(parent)}
            />
            <FontAwesomeIcon
              icon={faEdit}
              className="action-icon"
              title="Edit"
              onClick={() => openEditModal(parent)}
            />
            <FontAwesomeIcon
              icon={faTrash}
              className="action-icon"
              title="Delete"
              onClick={() => openDeleteModal(parent)}
            />
          </td>
        </tr>
      ))
    ) : (
      // Show message if no filtered parents found
      <tr>
        <td colSpan="5" style={{ textAlign: 'center' }}>
          No parents were found for the selected filter criteria.
        </td>
      </tr>
    )
  ) : (
    // Display all sorted parents if no filter is applied
    sortedParents.map((parent) => (
      <tr key={parent.id}>
        <td>{parent.name}</td>
        <td>{parent.phoneNumber}</td>
        <td>{parent.email || 'N/A'}</td>
        <td>{parent.status}</td>
        <td>{formatDate(parent.createdAt)}</td>
        <td>
          <FontAwesomeIcon
            icon={faEye}
            className="action-icon"
            title="View"
            onClick={() => openViewModal(parent)}
          />
          <FontAwesomeIcon
            icon={faEdit}
            className="action-icon"
            title="Edit"
            onClick={() => openEditModal(parent)}
          />
          <FontAwesomeIcon
            icon={faTrash}
            className="action-icon"
            title="Delete"
            onClick={() => openDeleteModal(parent)}
          />
        </td>
      </tr>
    ))
  )}
</tbody>
      </table>
    </div>
    </div>
  );
};

export default ParentsPage;