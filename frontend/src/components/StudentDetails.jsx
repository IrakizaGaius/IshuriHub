import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUsers, faGraduationCap, faCalendarAlt, faUserCheck, faUserGraduate, faBars, faDownload, faDashboard, faSignOut, faCalendarCheck, faCog } from '@fortawesome/free-solid-svg-icons';
import { Link, useParams} from 'react-router-dom';
import './StudentDetails.css';
import { getSubjects, getStudent, getTerms, addMarks, getMarks, getAttendance, addAttendance } from '../api';

const StudentDetailsPage = () => {
  const { id } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [currentTerm, setCurrentTerm] = useState(null);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newMarkData, setNewMarkData] = useState({
    subject: '',
    testType: '',
    markPercentage: ''
  });
  const [attendance, setAttendance] = useState([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    date: '',
    status: '',
  });
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);}

  // Retrieve user data from localStorage
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');

  const [terms, setTerms] = useState([]);
  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);
  // State for the notification message
const [notification, setNotification] = useState({ message: '', type: '' });
  
  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    // Handle profile dropdown toggle
    const toggleProfileDropdown = () => {
      setShowProfileDropdown(!showProfileDropdown);
    };
  
    // Toggle side menu
    const toggleMenu = () => {
      setMenuOpen(!menuOpen);
    };
    
    const closeNotification = () => {
      setNotification({ message: '', type: '' });
    };
    // Logout function
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


    const fetchMarksForStudent = async () => {
      try {
        const rawMarks = await getMarks(selectedStudent.id, currentTerm.id);

        const structuredMarks = rawMarks.reduce((acc, mark) => {
          const { StudentId, Subject, testType, marks } = mark;
    
          if (!acc[StudentId]) acc[StudentId] = {};
          if (!acc[StudentId][currentTerm.id]) acc[StudentId][currentTerm.id] = {};
          if (!acc[StudentId][currentTerm.id][Subject.name]) {
            acc[StudentId][currentTerm.id][Subject.name] = { test: 0, exam: 0 };
          }
    
          acc[StudentId][currentTerm.id][Subject.name][testType] = marks;
    
          return acc;
        }, {});
    
        setMarks(structuredMarks);
      } catch (error) {
        console.error("Error fetching marks:", error);
      }
    };
    
    
useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedStudent || !currentTerm) return;
      try {
        const attendanceData = await getAttendance(selectedStudent.id, currentTerm.id);
        setAttendance(attendanceData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [selectedStudent, currentTerm]);
// Handle attendance submission
const handleAttendanceSubmit = async (e) => {
  e.preventDefault();
  try {
    const recordedAttendance = await addAttendance({
      studentId: selectedStudent.id,
      termId: currentTerm.id,
      date: newAttendance.date,
      status: newAttendance.status,
    });
    setAttendance((prev) => [
      ...prev,
      recordedAttendance,
    ]);
    setIsAttendanceModalOpen(false); 
    setNotification({ message: 'Attendance recorded successfully!', type: 'success' });
    setNewAttendance({ date: '', status: '' });
  } catch (error) {
    console.error("Error recording attendance:", error);
  }
};

const displayedAttendance = attendance.filter(
  (entry) => 
    entry.studentId === selectedStudent?.id && 
    entry.termId === currentTerm?.id
);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const student = await getStudent(id);
        setSelectedStudent(student);

        const subjects = await getSubjects();
        setSubjects(subjects);

        const termDetails = await getTerms();
        setTerms(termDetails);
        const now = new Date();

        const activeTerm = termDetails.find(
          (term) => new Date(term.startDate) <= now && now <= new Date(term.endDate)
        );
        setCurrentTerm(activeTerm || termDetails[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleSubjectChange = (e) => {
    const selectedSubject = subjects.find(subject => subject.name === e.target.value);
    setNewMarkData({
      ...newMarkData,
      subject: selectedSubject
    });
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
  if (!selectedStudent || !newMarkData.subject || !newMarkData.subject.id) {
    return;
  }
  
    try {
      await addMarks({
        studentId: selectedStudent.id,
        subjectId: newMarkData.subject.id,
        testType: newMarkData.testType,
        marks: newMarkData.markPercentage,
    });
      await fetchMarksForStudent();
      setIsMarksModalOpen(false);
      setNotification({ message: 'Marks added successfully!', type: 'success' });
      setNewMarkData({ subject: '', testType: '', markPercentage: '' });

    } catch (error) {
      console.error('Error adding marks:', error);
    }
  };


  useEffect(() => {
    if (selectedStudent && currentTerm) {
      fetchMarksForStudent();
    }
  }, [selectedStudent, currentTerm]);
  
  const calculateSubjectTotal = (subjectMarks) => {
    const testMarks = subjectMarks?.test || 0;
    const examMarks = subjectMarks?.exam || 0;
    return (testMarks + examMarks) / 2; 
  };

  const handleExportReport = () => {
    if (!selectedStudent || !currentTerm) {
      alert("No data available to export.");
      return;
    }
  

    const headers = ["Student Name", "Subject", "Test", "Exam", "Term Total"];
    

    const rows = subjects.map((subject) => {
      const subjectMarks = marks[selectedStudent.id]?.[currentTerm.id]?.[subject.name] || {};
      const testMarks = subjectMarks.test || "-";
      const examMarks = subjectMarks.exam || "-";
      const subjectTotal = calculateSubjectTotal(subjectMarks);
      return [
        selectedStudent.name, 
        subject.name, 
        testMarks, 
        examMarks, 
        subjectTotal || "-"
      ];
    });
  

    const overallTotal = subjects.reduce((total, subject) => {
      const subjectMarks = marks[selectedStudent.id]?.[currentTerm.id]?.[subject.name] || {};
      return total + calculateSubjectTotal(subjectMarks);
    }, 0);
  

    rows.push(["", "Overall Total", "", "", overallTotal]);
  

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report_${currentTerm.name}_${selectedStudent.name}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="StudentDetails-wrapper">
     {/* Side Menu */}
<div className={`side-menu ${menuOpen ? 'open' : ''}`}>
  <button className="menu-toggle" onClick={toggleMenu}>
    <FontAwesomeIcon icon={faBars} />
  </button>
  {/* Menu Icons */}
  <div className="menu-icons">
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
<div className={`StudentDetails-container ${menuOpen ? 'blur' : ''}`}>
                 {/* Notification */}
                 {notification.message && (
        <div className={`notification ${notification.type}`} style={{ top: notification.message ? '100px' : '-60px' }}>
          {notification.message}
        </div>
      )}

      {/* Close Notification after 3 seconds */}
      {notification.message && setTimeout(closeNotification, 3000)}

        {/* Header Section */}
        <header className="StudentDetails-header">
          <h1 className="StudentDetails-title">Student Details</h1>
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
    <div className="student-details-container">
      <h1>{currentTerm ? `Current Term: ${currentTerm.name}` : 'No Active Term'}</h1>

      {/* Add Marks Button */}
      <div className="add-marks-button-container">
        <button className="add-marks-button" onClick={() => setIsMarksModalOpen(true)}> + Add Marks</button>
      </div>
      {/* Export Report Button */}
      <button className="export-report-button" onClick={handleExportReport}>
        <FontAwesomeIcon icon={faDownload} /> Export</button>
      {/* Add Marks Modal */}
      {isMarksModalOpen && (
        <div className="marks-popup-form">
          <div className="marks-form-container">
            <h2>Add Marks for {selectedStudent?.name}</h2>
            <form onSubmit={handleMarksSubmit}>
              <div className="marks-form-group">
                <label>Subject</label>
                <select
                  value={newMarkData.subject ? newMarkData.subject.name : ""}  
                  onChange={handleSubjectChange}
                >
                  <option value="" disabled>Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="marks-form-group">
  <label htmlFor="testType">Test Type</label>
  <select
    id="testType"
    value={newMarkData.testType || ""}
    onChange={(e) =>
      setNewMarkData({ ...newMarkData, testType: e.target.value })
    }
  >
    <option value="" disabled>Select Test Type</option>
    <option value="test">Test</option>
    <option value="exam">Exam</option>
  </select>
</div>

<div className="marks-form-group">
  <label>Mark Percentage</label>
  <input
    type="number"
    value={newMarkData.markPercentage}
    onChange={(e) => {
      // Convert input value to a float number and set it
      const value = parseFloat(e.target.value);
      
      // Check if the value is a valid number (NaN is returned for invalid inputs)
      if (!isNaN(value) && value >= 0 && value <= 100) {
        setNewMarkData({ ...newMarkData, markPercentage: value });
      }
    }}
    min="0"
    max="100"
    step="0.01"  // Allow float input by defining step
  />
</div>

              <div className="marks-form-actions">
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
        
            </form>
            <div className='marks-form-close'>
      <button className="btn btn-close" onClick={() => { 
        setNewMarkData({ subject: "", testType: "", markPercentage: "" }); 
        setIsMarksModalOpen(false);}}></button>
      </div>
          </div>
        </div>
      )}
{isAttendanceModalOpen && (
  <div className="attendance-popup-form">
    <div className="attendance-form-container">
      <h2>Attendance for {selectedStudent?.name}</h2>
      <form onSubmit={handleAttendanceSubmit}>
        <div className="attendance-form-group">
          <label>Date</label>
          <input
            type="date"
            value={newAttendance.date || ""}
            min={currentTerm?.startDate.split('T')[0]} 
            max={currentTerm?.endDate.split('T')[0]}
            onChange={(e) =>
              setNewAttendance({
                ...newAttendance,
                date: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="attendance-form-group">
          <label>Status</label>
          <select
            value={newAttendance.status || ""}
            onChange={(e) =>
              setNewAttendance({
                ...newAttendance,
                status: e.target.value,
              })
            }
            required
          >
            <option value="" disabled>Select Status</option>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        </div>

        <div className="attendance-form-actions">
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
      <div className="attendance-form-close">
        <button
          className="btn btn-close"
          onClick={() => {
            setNewAttendance({ date: "", status: "" });
            setIsAttendanceModalOpen(false);
          }}
        ></button>
      </div>
    </div>
  </div>
)}

      {/* Term Report Table */}
      {currentTerm ? (
  <div className="term-report">
    <h2>Report for {currentTerm.name}</h2>
    <p>Duration: {formatDate(currentTerm.startDate)} To {formatDate(currentTerm.endDate)}</p>

    <table>
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Subject</th>
          <th> Test (%)</th>
          <th>Exam (%)</th>
          <th>Term Total(%)</th>
        </tr>
      </thead>
      <tbody>
        {subjects.map((subject, index) => {
          const subjectMarks = marks[selectedStudent?.id]?.[currentTerm?.id]?.[subject.name] || {};
          const subjectTotal = calculateSubjectTotal(subjectMarks);
          return (
            <tr key={`${selectedStudent.id}-${subject.id}`}>
              {index === 0 && (
                <td rowSpan={subjects.length}>{selectedStudent.name}</td>
              )}
              <td>{subject.name}</td>
              <td>{subjectMarks.test || '-'}</td>
              <td>{subjectMarks.exam || '-'}</td>
              <td>{subjectTotal || '-'}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
      <tr>
  <td colSpan="4" style={{ textAlign: 'right' }}>Overall Total</td>
  <td>
    {parseFloat(
      (
        subjects.reduce((total, subject) => {
          const subjectMarks =
            marks[selectedStudent?.id]?.[currentTerm?.id]?.[subject.name] || {};
          return total + calculateSubjectTotal(subjectMarks);
        }, 0) / 14
      ).toFixed(2)
    )}%
  </td>
</tr>
      </tfoot>
    </table>
  </div>
) : (
  <p>No active term is currently ongoing.</p>
)}


{/* Attendance Table */}
<div className="attendance-section">
        <h2>Attendance for {currentTerm?.name}</h2>

        {/* Attendance Table */}
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    {displayedAttendance.length > 0 ? (
      displayedAttendance.map((entry, index) => (
        <tr key={index}>
          <td>         
            {new Date(entry.date).toLocaleDateString('en-US', {
            weekday: 'short', // E.g., "Thu"
            year: 'numeric',
            month: 'long', // E.g., "November"
            day: '2-digit',
          })}
          </td>
          <td style={{ color: entry.status === 'PRESENT' ? 'green' : 'red' }}>
            {entry.status}</td> 
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="2">No attendance records found.</td>
      </tr>
    )}
  </tbody>
        </table>

        {/* Add Attendance Button */}
        <button className="record-attendance-button" onClick={() => setIsAttendanceModalOpen(true)}> + Record Attendance</button>

      </div>
    </div>
    </div>
    </div>
  );
}


export default StudentDetailsPage;