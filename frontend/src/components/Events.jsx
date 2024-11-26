import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faDownload, faCalendarCheck, faCalendarMinus } from '@fortawesome/free-solid-svg-icons';
import { faBell, faUsers, faGraduationCap, faCalendarAlt, faUserCheck, faBars, faDashboard, faSignOut,faCog } from '@fortawesome/free-solid-svg-icons';
import './Events.css';
import { Link } from 'react-router-dom';
import {getEventsMetrics, getEvents, addEvent, deleteEvent, updateEvent, logout} from '../api';


// Retrieve user data from localStorage
const username = localStorage.getItem('username');
const email = localStorage.getItem('email');

const EventsPage = () => {
  // State for storing events data
  const [events, setEvents] = useState([]);
  const sortedEvents = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeForm, setActiveForm]= useState('');
  const [filterApplied, setFilterApplied] = useState(false);
// State for form inputs
 const [EventData, setEventData] = useState({ name: '', description: '', date: '' });
// State for the notification
const [notification, setNotification] = useState({ message: '', type: '' });
  // Form handling functions
  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...EventData, [name]: value });
  };

  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);


// Separate disclaimer states for each form
const [EventCreationDisclaimer, setEventCreationDisclaimer] = useState('');

  const openForm = (form) => {
    setActiveForm(form);
  };

  const closeForm = () => {
    setActiveForm('');
    setEventCreationDisclaimer('');
  };

  // Handle profile dropdown toggle
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Toggle side menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
  
    // Open View Modal
    const openViewModal = (event) => {
      setSelectedEvent(event);
      setViewModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (event) => {
      setSelectedEvent(event);
      setEditModalOpen(true);
    };
  
    // Open Delete Modal
    const openDeleteModal = (event) => {
      setSelectedEvent(event);
      setDeleteModalOpen(true);
    };
  
// Handle Delete Confirmation
const confirmDelete = async () => {

  try {
    await deleteEvent(selectedEvent.id);

    setDeleteModalOpen(false);

    setEvents((prevEvents) => prevEvents.filter(event => event.id !== selectedEvent.id));
    setMetrics((prevMetrics) => ({
      ...prevMetrics, totalEvents: prevMetrics.totalEvents - 1,
      activeEvents: prevMetrics.activeEvents - 1,
    }));

    setNotification({ message: 'Event deleted successfully!', type: 'success' });
    
  } catch (error) {
    console.error('Error deleting event:', error);
    setNotification({ message: 'Failed to delete event. Please try again later.', type: 'error' });
  }
};
  

    // Close View Modal
    const closeViewModal = () => {
      setSelectedEvent(null);
      setViewModalOpen(false);
      setEditModalOpen(false);
    };

    const closeNotification = () => {
      setNotification({ message: '', type: '' });
    };
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(events.length / itemsPerPage);
 // Metrics state
 const [metrics, setMetrics] = useState({
  totalEvents: '',
  activeEvents: '',
  disabledEvents: '',
});
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);}

  // Fetch events list on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getEvents();
        setEvents(events);
        setFilteredEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

// Export functionality
const handleExport = () => {

  const header = "Name,Description,Status,Date Added";
  const csvContent = events.map(event => 
    `${event.name},${event.description},${event.status},${formatDate(event.date)}`).join("\n");
  const csvData = `${header}\n${csvContent}`;
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'events_data.csv');
  a.click();
};

// Fetch user information and metrics from API on component mount
  useEffect(() => {

    const fetchMetrics = async () => {
      try {
        const data = await getEventsMetrics();
        setMetrics(data); // Set metrics based on API response
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    
    
    fetchMetrics();

  }, []);

  // Event Creation
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    const { name, description, date } = EventData;
    // Validate form fields
    if (!name || !description || !date) {
      setEventCreationDisclaimer('⚠️ Please fill in all fields.');
      return;
    }

    try {
      setActiveForm('');
  const result = await addEvent({ name: name, description: description, date: date });
  setEventData({ name: '', description: '', date: '' });
  setEvents((prevEvents) => [...prevEvents, result]);
  setMetrics((prevMetrics) => ({
    ...prevMetrics,
    totalEvents: prevMetrics.totalEvents + 1,
    activeEvents: prevMetrics.activeEvents + 1,
  }));
  setNotification({ message: 'Event created successfully!', type: 'success' });
} catch (error) {
  console.error('Error during Event Creation:', error);
  setEventCreationDisclaimer(`⚠️ Event Creation failed: ${error.message}`);

  setNotification({ message: 'Failed to create event. Please try again later.', type: 'error' });
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
  let filtered = [...events];
  const now = new Date();
  
  // Time-based filters
  if (filter === 'today') {
    filtered = filtered.filter(event => new Date(event.createdAt).toDateString() === now.toDateString());
  } else if (filter === 'lastweek') {
    const lastWeek = new Date(now.setDate(now.getDate() - 7));
    filtered = filtered.filter(event => new Date(event.createdAt) >= lastWeek);
  } else if (filter === 'last3months') {
    const last3Months = new Date(now.setMonth(now.getMonth() - 3));
    filtered = filtered.filter(event => new Date(event.createdAt) >= last3Months);
  } else if (filter === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    filtered = filtered.filter(event => new Date(event.createdAt) >= startOfYear);
  } else if (filter === 'all') {
    filtered = events;
  }

  // Date range filters
  if (dateRange.start) {
    filtered = filtered.filter(event => new Date(event.createdAt) >= new Date(dateRange.start));
  }
  if (dateRange.end) {
    filtered = filtered.filter(event => new Date(event.createdAt) <= new Date(dateRange.end));
  }

  setFilteredEvents(filtered); // Update state with filtered results
  setFilterApplied(true);
};

// Clear filters
const clearFilters = () => {
  setFilter('');
  setDateRange({ start: '', end: '' });
  setFilteredEvents(events); // Reset to original data
  setFilterApplied(false);
};

  return (
    <div className="events-wrapper">
      <div className={`events-side-menu ${menuOpen ? 'open' : ''}`}>
  <button className="events-menu-toggle" onClick={toggleMenu}>
    <FontAwesomeIcon icon={faBars} />
  </button>
  {/* Menu Icons */}
  <div className="events-menu-icons">
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
      <div className={`events-container ${menuOpen ? 'blur' : ''}`}>
                {/* Notification */}
      {notification.message && (
        <div className={`notification ${notification.type}`} style={{ top: notification.message ? '100px' : '-60px' }}>
          {notification.message}
        </div>
      )}

      {/* Close Notification after 3 seconds */}
      {notification.message && setTimeout(closeNotification, 3000)}

        {/* Header Section */}
        <header className="events-header">
          <h1 className="events-title">Events</h1>
        </header>
        {/* Profile Icon */}
        <div className="events-profile-container" onClick={toggleProfileDropdown}>
            <FontAwesomeIcon icon={faUserCheck} className="events-profile-icon" />
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="events-profile-dropdown">
                <p><strong>UserName: {username}</strong></p>
                <p><strong>Email: {email}</strong></p>
                <button className="events-logout-button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
      {/* Metric Cards */}
      <div className="events-metrics-container">
        <div className="events-metric-card">
        <FontAwesomeIcon icon={faCalendarAlt} className="event-metric-icon" style={{ color: 'green' }} />
            <h2 style={{ color: 'green' }}>Total Events</h2>
            <p style={{ color: 'green' }}>{metrics.totalEvents}</p>
        </div>
        <div className="events-metric-card">
        <FontAwesomeIcon icon={faCalendarCheck} className="event-metric-icon" style={{ color: 'red' }} />
          <h2 style={{ color: 'red' }}>Active Events</h2>
          <p style={{ color: 'red' }}>{metrics.activeEvents}</p>
        </div>
        <div className="events-metric-card">
        <FontAwesomeIcon icon={faCalendarMinus} className="event-metric-icon" style={{ color: 'black' }} />
          <h2 style={{ color: 'black' }}>Disabled Events</h2>
          <p style={{ color: 'black' }}>{metrics.disabledEvents}</p>
        </div>
      </div>

      {/* Add Event Button */}
      <div className="add-event-button-container">
        <button className="add-event-button" onClick={() => openForm('Event')}> + Add Event</button>
      </div>
      {/* Add Event Form */}
{activeForm === 'Event' && (
  <div className="popup-form">
    <div className="form-container">
      <h2 className="form-title">Add Event</h2>
      <form onSubmit={handleEventSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="EventName" className="form-label">Name:</label>
          <input type="text" id="EventName" name="name" className="form-input" value={EventData.name} onChange={handleEventChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="EventDescription" className="form-label">Description:</label>
          <input type="text" id="EventDescription" name="description" className="form-input" value={EventData.description} onChange={handleEventChange} required/>
        </div>
        <div className="form-group">
        <label htmlFor="EventDate" className="form-label">Date:</label>
        <input type="date" name="date" value={EventData.date} onChange={handleEventChange} required />
        </div>
        <div style={{ color: EventCreationDisclaimer.includes('✔️') ? 'green' : 'red', marginTop: '10px' }}>
          {EventCreationDisclaimer}
        </div>
        <div className="event-form-actions">
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
      <div className='form-close'>
      <button className="btn btn-close" onClick={closeForm}></button>
    </div>
  </div>
  </div>
)}


{/* View Event Modal */}
{isViewModalOpen && (
  <div className="events-popup-form">
    <div className="events-form-container">
      <h2 className="events-form-title">Event Information</h2>
      
      <div className="events-form-group">
      <p><label htmlFor="EventName" className="events-form-label">Name:</label> {selectedEvent.name}</p>
      </div>
      
      <div className="events-form-group">
      <p><label htmlFor="EventDescription" className="events-form-label">Description:</label> {selectedEvent.description}</p>
      </div>
      
      <div className="events-form-group">
      <p><label htmlFor="DateAdded" className="events-form-label">Event Date:</label> {formatDate(selectedEvent.date)}</p>
      </div>
      
      <div className="events-form-close">
        <button className="btn btn-close" onClick={closeViewModal}></button>
      </div>
    </div>
  </div>
)}


{/* Edit Event Modal */}
{isEditModalOpen && (
  <div className="popup-form">
    <div className="form-container">
      <h2 className="form-title">Edit Event Information</h2>
      <form
  onSubmit={async (e) => {
    e.preventDefault();

    try {
      const updatedEvent = await updateEvent(selectedEvent.id, selectedEvent);

      setEvents((prevEvents) => 
        prevEvents.map((event) => 
          event.id === selectedEvent.id ? updatedEvent : event
        )
      );
      setEditModalOpen(false);
      setSelectedEvent(null);
      setNotification({
        message: 'Event information updated successfully!',
        type: 'success'
      });

    } catch (error) {
      console.error('Error updating event:', error);
      setNotification({
        message: `Failed to update event. ${error.message}`,
        type: 'error'
      });
    }
  }}
        className="event-form"
      >
        <div className="form-group">
          <label htmlFor="editEventName" className="form-label">Name:</label>
          <input
            type="text"
            id="editEventName"
            value={selectedEvent.name}
            onChange={(e) =>
              setSelectedEvent({ ...selectedEvent, name: e.target.value })
            }
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editEventDescription" className="form-label">Description:</label>
          <input
            type="text"
            id="editEventDescription"
            value={selectedEvent.description}
            onChange={(e) =>
              setSelectedEvent({
                ...selectedEvent,
                description: e.target.value,
              })
            }
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
  <label htmlFor="editEventDate" className="form-label">Event Date:</label>
  <input
    type="date"
    id="editEventDate"
    value={selectedEvent.date}
    min={new Date().toISOString().split('T')[0]}  // Sets the minimum date to today
    onChange={(e) =>
      setSelectedEvent({ ...selectedEvent, date: e.target.value })
    }
    className="form-input"
    required
  />
</div>

        <div className="event-form-actions">
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
      <p>Are you sure you want to delete {selectedEvent.name}?</p>
      <div className="event-form-actions">
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
<div className="events-filters">
  <h2 className="events-filter-title">Filter By</h2>
  
  {/* Time Range Filter */}
  <div className="events-filter-group">
    <label className="events-filter-label">Time Range:</label>
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="events-filter-select"
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
  <div className="events-filter-group">
    <label className="events-filter-label">From:</label>
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
      {/* Events Table */}
      <table className="events-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Event Date</th> 
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {/* Display filtered events if filter is applied */}
  {filterApplied ? (
    filteredEvents.length > 0 ? (
      filteredEvents.map((event) => (
        <tr key={event.id}>
          <td>{event.name}</td>
          <td>{event.description}</td>
          <td>{event.status}</td>
        <td>{formatDate(event.date)}</td>
          <td>{formatDate(event.createdAt)}</td>
          <div className="action-icons">
          <FontAwesomeIcon
            icon={faEye}
            className="view-action-icon"
            title="View"
            onClick={() => openViewModal(event)}
          />
          <FontAwesomeIcon
            icon={faEdit}
            className="edit-action-icon"
            title="Edit"
            onClick={() => openEditModal(event)}
          />
          <FontAwesomeIcon
            icon={faTrash}
            className="delete-action-icon"
            title="Delete"
            onClick={() => openDeleteModal(event)}
          />
        </div>
        </tr>
      ))
    ) : (
      // Show message if no filtered events found
      <tr>
        <td colSpan="5" style={{ textAlign: 'center' }}>
          No events were found for the selected filter criteria.
        </td>
      </tr>
    )
  ) : (
    // Display all sorted events if no filter is applied
    sortedEvents.map((event) => (
      <tr key={event.id}>
        <td>{event.name}</td>
        <td>{event.description}</td>
        <td>{event.status}</td>
        <td>{formatDate(event.date)}</td>
        <td>{formatDate(event.createdAt)}</td>
        <div className="action-icons">
          <FontAwesomeIcon
            icon={faEye}
            className="view-action-icon"
            title="View"
            onClick={() => openViewModal(event)}
          />
          <FontAwesomeIcon
            icon={faEdit}
            className="edit-action-icon"
            title="Edit"
            onClick={() => openEditModal(event)}
          />
          <FontAwesomeIcon
            icon={faTrash}
            className="delete-action-icon"
            title="Delete"
            onClick={() => openDeleteModal(event)}
          />
        </div>
      </tr>
    ))
  )}
</tbody>
      </table>
    </div>
    </div>
  );
};

export default EventsPage;