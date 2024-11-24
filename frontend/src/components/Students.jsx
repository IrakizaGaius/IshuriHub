import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faDownload, faUserXmark } from '@fortawesome/free-solid-svg-icons';
import { faBell, faUsers, faGraduationCap, faCalendarAlt, faUserCheck, faBars, faDashboard, faSignOut, faCog } from '@fortawesome/free-solid-svg-icons';
import './Students.css';
import { Link } from 'react-router-dom';
import { addStudent, getStudentsMetrics, getStudents, deleteStudent, updateStudent,logout} from '../api';

// Retrieve user data from localStorage
const username = localStorage.getItem('username');
const email = localStorage.getItem('email');


const StudentsPage = () => {
  // State for storing students data
  const [students, setStudents] = useState([]);
  const sortedStudents = [...students].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeForm, setActiveForm]= useState('');
  const [filterApplied, setFilterApplied] = useState(false);
// State for form inputs
 const [StudentData, setStudentData] = useState({ name: '', Class: '', parentName: '' });
// State for the notification message
const [notification, setNotification] = useState({ message: '', type: '' });

  // Form handling functions
  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...StudentData, [name]: value });
  };

  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);


// Separate disclaimer states for each form
const [StudentCreationDisclaimer, setStudentCreationDisclaimer] = useState('');

  const openForm = (form) => {
    setActiveForm(form);
  };

  const closeForm = () => {
    setActiveForm('');
    setStudentCreationDisclaimer('');
  };

  // Handle profile dropdown toggle
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Toggle side menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
  
    // Open View Modal
    const openViewModal = (student) => {
      setSelectedStudent(student);
      setViewModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (student) => {
      setSelectedStudent(student);
      setEditModalOpen(true);
    };
  
    // Open Delete Modal
    const openDeleteModal = (student) => {
      setSelectedStudent(student);
      setDeleteModalOpen(true);
    };
  
// Handle Delete Confirmation for Student
const confirmDelete = async () => {
  try {
    await deleteStudent(selectedStudent.id);
    setDeleteModalOpen(false); 
    setStudents((prevStudents) => prevStudents.filter(student => student.id !== selectedStudent.id));
    setMetrics((prevMetrics) => ({
      ...prevMetrics,
      totalStudents: prevMetrics.totalStudents - 1,
      activeStudents: prevMetrics.activeStudents - 1,
    }));
    setNotification({ message: 'Student deleted successfully!', type: 'success' });
    
  } catch (error) {
    console.error('Error deleting student:', error);
    setNotification({ message: 'Failed to delete student. Please try again later.', type: 'error' });
  }
};

  
    // Close View Modal
    const closeViewModal = () => {
      setSelectedStudent(null);
      setViewModalOpen(false);
      setEditModalOpen(false);
    };

    const closeNotification = () => {
      setNotification({ message: '', type: '' });
    };
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(students.length / itemsPerPage);
 // Metrics state
 const [metrics, setMetrics] = useState({
  totalStudents: '',
  activeStudents: '',
  disabledStudents: '',
});
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);}

  // Fetch students list on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const students = await getStudents();
        setStudents(students);
        setFilteredStudents(students);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

// Export functionality
const handleExport = () => {

  const header = "Name,Class,Status,Date Added";
  const csvContent = students.map(student => 
    `${student.name},${student.Class},${student.status},${formatDate(student.createdAt)}`).join("\n");
  const csvData = `${header}\n${csvContent}`;
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'Students_data.csv');
  a.click();
};
// Fetch user information and metrics from API on component mount
  useEffect(() => {

    const fetchMetrics = async () => {
      try {
        const data = await getStudentsMetrics();
        setMetrics(data); // Set metrics based on API response
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    
    
    fetchMetrics();

  }, []);

  // Student Creation
  const handleStudentsubmit = async (e) => {
    e.preventDefault();
    const { name, Class, parentName} = StudentData;
    // Validate form fields
    if (!name || !Class || !parentName) {
      setStudentCreationDisclaimer('⚠️ Please fill in all fields.');
      return;
    }

    try {
      const result = await addStudent({ name: name, Class: Class, parentName: parentName });
    
      setStudentData({ name: '', Class: '', parentName: '' });
      setActiveForm('');
      const newStudent = {
        id: result.student.id,
        name: result.student.name,
        Class: result.student.Class,
        status: result.student.status,
        createdAt: new Date(result.student.createdAt).toLocaleString(),
        updatedAt: new Date(result.student.updatedAt).toLocaleString(),
    };

    setStudents((prevStudents) => {
        const updatedStudents = [...prevStudents, newStudent];
        console.log('Updated Students State:', updatedStudents);
        return updatedStudents;
    });

      setMetrics((prevMetrics) => ({
        ...prevMetrics,
        totalStudents: prevMetrics.totalStudents + 1,
        activeStudents: prevMetrics.activeStudents + 1,
      }));
      setNotification({ message: 'Student created successfully!', type: 'success' });
    
    } catch (error) {
      console.error('Error during Student Creation:', error);

      setStudentCreationDisclaimer(`⚠️ Student Creation failed: ${error.message}`);
      setNotification({ message: 'Failed to create student. Please try again later.', type: 'error' });
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
  let filtered = [...students];
  const now = new Date();
  
  // Time-based filters
  if (filter === 'today') {
    filtered = filtered.filter(student => new Date(student.createdAt).toDateString() === now.toDateString());
  } else if (filter === 'lastweek') {
    const lastWeek = new Date(now.setDate(now.getDate() - 7));
    filtered = filtered.filter(student => new Date(student.createdAt) >= lastWeek);
  } else if (filter === 'last3months') {
    const last3Months = new Date(now.setMonth(now.getMonth() - 3));
    filtered = filtered.filter(student => new Date(student.createdAt) >= last3Months);
  } else if (filter === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    filtered = filtered.filter(student => new Date(student.createdAt) >= startOfYear);
  } else if (filter === 'all') {
    filtered = students;
  }

  // Date range filters
  if (dateRange.start) {
    filtered = filtered.filter(student => new Date(student.createdAt) >= new Date(dateRange.start));
  }
  if (dateRange.end) {
    filtered = filtered.filter(student => new Date(student.createdAt) <= new Date(dateRange.end));
  }

  setFilteredStudents(filtered); // Update state with filtered results
  setFilterApplied(true);
};

// Clear filters
const clearFilters = () => {
  setFilter('');
  setDateRange({ start: '', end: '' });
  setFilteredStudents(students); // Reset to original data
  setFilterApplied(false);
};

  return (
    <div className="students-wrapper">
      <div className={`students-side-menu ${menuOpen ? 'open' : ''}`}>
  <button className="students-menu-toggle" onClick={toggleMenu}>
    <FontAwesomeIcon icon={faBars} />
  </button>
  {/* Menu Icons */}
  <div className="students-menu-icons">
  <ul>
        <li><Link to="/dashboard"><FontAwesomeIcon icon={faDashboard} className="Dashboard-icon" /> {menuOpen && <span>Dashboard</span>}</Link></li>
        <li><Link to="/notifications"><FontAwesomeIcon icon={faBell} className="Notifications-icon" /> {menuOpen && <span>Notifications</span>}</Link></li>
        <li><Link to="/students"><FontAwesomeIcon icon={faGraduationCap} className="Students-icon" /> {menuOpen && <span>Students</span>}</Link></li>
        <li><Link to="/events"><FontAwesomeIcon icon={faCalendarAlt} className="Events-icon" /> {menuOpen && <span>Events</span>}</Link></li>
        <li><Link to="/parents"><FontAwesomeIcon icon={faUsers} className="Student-icon" /> {menuOpen && <span>Student</span>}</Link></li>
        <li><Link to="/config"><FontAwesomeIcon icon={faCog} className="Config-icon" /> {menuOpen && <span>Configurations</span>}</Link></li>
        <li onClick={toggleProfileDropdown}><FontAwesomeIcon icon={faUserCheck} className="Profile-icon" style={{ color: 'white' }} />{menuOpen && <span>Profile</span>}</li>
        <li onClick={handleLogout}><FontAwesomeIcon icon={faSignOut} className="Register-icon" style={{ color: 'white' }} />{menuOpen && <span>Logout</span>}</li>

      </ul>
  </div>
</div>

{/* Main Content */}
      <div className={`students-container ${menuOpen ? 'blur' : ''}`}>
                {/* Notification */}
      {notification.message && (
        <div className={`notification ${notification.type}`} style={{ top: notification.message ? '100px' : '-60px' }}>
          {notification.message}
        </div>
      )}

      {/* Close Notification after 3 seconds */}
      {notification.message && setTimeout(closeNotification, 3000)}

        {/* Header Section */}
        <header className="students-header">
          <h1 className="students-title">Student</h1>
        </header>
        {/* Profile Icon */}
        <div className="students-profile-container" onClick={toggleProfileDropdown}>
            <FontAwesomeIcon icon={faUserCheck} className="students-profile-icon" />
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="students-profile-dropdown">
                <p><strong>UserName: {username}</strong></p>
                <p><strong>Email: {email}</strong></p>
                <button className="students-logout-button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
      {/* Metric Cards */}
      <div className="students-metrics-container">
        <div className="students-metric-card">
        <FontAwesomeIcon icon={faUsers} className="student-metric-icon" style={{ color: 'green' }} />
            <h2 style={{ color: 'green' }}>Total Student</h2>
            <p style={{ color: 'green' }}>{metrics.totalStudents}</p>
        </div>
        <div className="students-metric-card">
        <FontAwesomeIcon icon={faUserCheck} className="student-metric-icon" style={{ color: 'red' }} />
          <h2 style={{ color: 'red' }}>Active Students</h2>
          <p style={{ color: 'red' }}>{metrics.activeStudents}</p>
        </div>
        <div className="students-metric-card">
        <FontAwesomeIcon icon={faUserXmark} className="student-metric-icon" style={{ color: 'black' }} />
          <h2 style={{ color: 'black' }}>Disabled Students</h2>
          <p style={{ color: 'black' }}>{metrics.disabledStudents}</p>
        </div>
      </div>

      {/* Add Student Button */}
      <div className="add-student-button-container">
        <button className="add-student-button" onClick={() => openForm('Student')}> + Add Student</button>
      </div>
      {/* Add Student Form */}
{activeForm === 'Student' && (
  <div className="popup-form">
    <div className="form-container">
      <h2 className="form-title">Add Student</h2>
      <form onSubmit={handleStudentsubmit} className="student-form">
        <div className="form-group">
          <label htmlFor="StudentName" className="form-label">Name:</label>
          <input type="text" id="StudentName" name="name" className="form-input" value={StudentData.name} onChange={handleStudentChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="StudentPhoneNumber" className="form-label">Class:</label>
          <input type="text" id="StudentPhoneNumber" name="Class" className="form-input" value={StudentData.Class} onChange={handleStudentChange} required/>
        </div>
        <div className="form-group">
          <label htmlFor="StudentPhoneNumber" className="form-label">Parent's Name:</label>
          <input type="text" id="StudentPhoneNumber" name="parentName" className="form-input" value={StudentData.ParentName} onChange={handleStudentChange} required/>
        </div>
        <div style={{ color: StudentCreationDisclaimer.includes('✔️') ? 'green' : 'red', marginTop: '10px' }}>
          {StudentCreationDisclaimer}
        </div>
        <div className="student-form-actions">
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
      <div className='form-close'>
      <button className="btn btn-close" onClick={closeForm}></button>
    </div>
  </div>
  </div>
)}


{/* View Student Modal */}
{isViewModalOpen && (
  <div className="students-popup-form">
    <div className="students-form-container">
      <h2 className="students-form-title">Student Information</h2>

      <div className="students-form-group">
      <p><label htmlFor="StudentName" className="students-form-label">Name:</label> {selectedStudent.name}</p>
      </div>

      <div className="students-form-group">
      <p><label htmlFor="StudentClass" className="students-form-label">Class:</label> {selectedStudent.Class}</p>
      </div>

      <div className="students-form-group">
      <p><label htmlFor="StudentStatus" className="students-form-label">Status:</label> {selectedStudent.status}</p>
      </div>

      <div className="students-form-group">
      <p><label htmlFor="DateAdded" className="students-form-label">Date Added:</label> {formatDate(selectedStudent.createdAt)}</p>
      </div>
      <div className='students-form-close'>
      <button className="btn btn-close" onClick={closeViewModal}></button>
    </div>
    </div>
  </div>
)}


{/* Edit Student Modal */}
{isEditModalOpen && (
  <div className="popup-form">
    <div className="form-container">
      <h2 className="form-title">Edit Student Information</h2>
      <form
  onSubmit={async (e) => {
    e.preventDefault();
    
    try {
      const updatedStudent = await updateStudent(selectedStudent.id, selectedStudent);

      setStudents((prevStudents) => 
        prevStudents.map((student) => 
          student.id === selectedStudent.id ? updatedStudent : student
        )
      );

      // Close the edit modal
      setEditModalOpen(false);

      // Clear the selected student from the state
      setSelectedStudent(null);

      // Display success notification
      setNotification({
        message: 'Student information updated successfully!',
        type: 'success'
      });

    } catch (error) {
      console.error('Error updating student:', error);

      // Display error message if the update fails
      setNotification({
        message: `Failed to update student. ${error.message}`,
        type: 'error'
      });
    }
  }}
        className="student-form"
      >
        <div className="form-group">
          <label htmlFor="editStudentName" className="form-label">Name:</label>
          <input
            type="text"
            id="editStudentName"
            value={selectedStudent.name}
            onChange={(e) =>
              setSelectedStudent({ ...selectedStudent, name: e.target.value })
            }
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editStudentPhoneNumber" className="form-label">Class:</label>
          <input
            type="text"
            id="editStudentPhoneNumber"
            value={selectedStudent.Class}
            onChange={(e) =>
              setSelectedStudent({
                ...selectedStudent,
                Class: e.target.value,
              })
            }
            className="form-input"
            required
          />
        </div>
        <div className="student-form-actions">
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
      <p>Are you sure you want to delete {selectedStudent.name}?</p>
      <div className="student-form-actions">
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
<div className="students-filters">
  <h2 className="students-filter-title">Filter By</h2>
  
  {/* Time Range Filter */}
  <div className="students-filter-group">
    <label className="students-filter-label">Time Range:</label>
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="students-filter-select"
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
  <div className="students-filter-group">
    <label className="students-filter-label">From:</label>
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
      {/* Students Table */}
      <table className="students-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Status</th>
            <th>Date Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {/* Display filtered students if filter is applied */}
  {filterApplied ? (
    filteredStudents.length > 0 ? (
      filteredStudents.map((student) => (
        <tr key={student.id} onClick={() => window.location.href = `/student/${student.id}`}
        style={{ cursor: "pointer" }}>
          <td>{student.name}</td>
          <td>{student.Class}</td>
          <td>{student.status}</td>
          <td>{formatDate(student.createdAt)}</td>
          <td onClick={(e) => e.stopPropagation()}>
            <FontAwesomeIcon
              icon={faEye}
              className="action-icon"
              title="View"
              onClick={() => openViewModal(student)}
            />
            <FontAwesomeIcon
              icon={faEdit}
              className="action-icon"
              title="Edit"
              onClick={() => openEditModal(student)}
            />
            <FontAwesomeIcon
              icon={faTrash}
              className="action-icon"
              title="Delete"
              onClick={() => openDeleteModal(student)}
            />
          </td>
        </tr>
      ))
    ) : (
      // Show message if no filtered students found
      <tr>
        <td colSpan="5" style={{ textAlign: 'center' }}>
          No students were found for the selected filter criteria.
        </td>
      </tr>
    )
  ) : (
    // Display all sorted students if no filter is applied
    sortedStudents.map((student) => (
      <tr key={student.id} onClick={() => window.location.href = `/student/${student.id}`}
      style={{ cursor: "pointer" }}>
        <td>{student.name}</td>
        <td>{student.Class}</td>
        <td>{student.status}</td>
        <td>{formatDate(student.createdAt)}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <FontAwesomeIcon
            icon={faEye}
            className="action-icon"
            title="View"
            onClick={() => openViewModal(student)}
          />
          <FontAwesomeIcon
            icon={faEdit}
            className="action-icon"
            title="Edit"
            onClick={() => openEditModal(student)}
          />
          <FontAwesomeIcon
            icon={faTrash}
            className="action-icon"
            title="Delete"
            onClick={() => openDeleteModal(student)}
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

export default StudentsPage;