import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './IndexPage.css';


const IndexPage = () => {
  const navigate = useNavigate();
  const [menuActive, setMenuActive] = useState(false);
  const [activeForm, setActiveForm]= useState('')
  const [isVisible, setIsVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
// Separate disclaimer states for each form
const [loginDisclaimer, setLoginDisclaimer] = useState('');
const [registerDisclaimer, setRegisterDisclaimer] = useState('');
const [resetDisclaimer, setResetDisclaimer] = useState('');
const [verificationCode, setVerificationCode] = useState('');
const [verificationDisclaimer, setVerificationDisclaimer] = useState('');


  const openForm = (form) => {
    setActiveForm(form);
  };

  const closeForm = () => {
    setActiveForm('');
    setLoginDisclaimer('');
    setRegisterDisclaimer('');
    setResetDisclaimer('');
  };

  // State for managing modal visibility
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // State for form inputs
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', passwordConfirm: '', role: '' });
  const [resetEmail, setResetEmail] = useState({ email: ''});

  // Form handling functions
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetEmail({...resetEmail, [name]: value});
  };


const API_URL = 'https://ishurihub.onrender.com'; 

const handleLoginSubmit = async (e) => {
  e.preventDefault();

  const { username, password } = loginData;
  if (!username || !password) {
    setLoginDisclaimer('⚠️ Please fill in all fields.');
    return;
  }

  try {
    // Step 1: Authenticate user credentials
    const authResponse = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const authResult = await authResponse.json();

    if (authResponse.ok) {
      setShowLogin(false);
      setLoginData({ username: '', password: '' });
      setActiveForm('verification');
      const email = authResult.user.email;
      const codeResponse = await fetch(`${API_URL}/api/users/send-login-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const codeResult = await codeResponse.json();

      if (codeResponse.ok) {
        localStorage.setItem('username', authResult.user.username || '');
        localStorage.setItem('email', email || '');
        localStorage.setItem('token', authResult.token || '');
      } else {
        setLoginDisclaimer(`⚠️ Failed to send login code: ${codeResult.error}`);
      }
    } else {
      setLoginDisclaimer(`⚠️ Login failed: ${authResult.error}`);
    }
  } catch (error) {
    console.error('Error during login:', error);
    setLoginDisclaimer('⚠️ Login failed due to a network issue');
  }
};

  // Register form submission handler with API call
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, passwordConfirm, role } = registerData;

    if (!username || !email || !password || !passwordConfirm || !role) {
     setRegisterDisclaimer('⚠️ Please fill in all fields');
      return;
    }

    if (password !== passwordConfirm) {
      setRegisterDisclaimer('⚠️ Passwords do not match.');
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, email, password, role}), 
      });
    
      const result = await response.json();
      
    if (response.ok) {
      setRegisterDisclaimer('✔️ Registration successful. Please check your email for a verification code.');
      setRegisterData({ username: '', email: '', password: '', passwordConfirm: '', role: '' });
      setShowRegister(false);
    } else if (result.error === 'User already exists') {
      setRegisterDisclaimer('⚠️ User with the same email already exists.');
    } else {
      setRegisterDisclaimer(`⚠️ Registration failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Error during registration:', error);
    setRegisterDisclaimer('⚠️ Registration failed due to a network issue.');
  }
  };
  

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    const { email } = resetEmail;
    if (! email) {
      setResetDisclaimer('⚠️ Please fill in all fields');
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/users/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), 
      });
  
      const result = await response.json();
      if (response.ok) {
        setResetEmail('');
        setShowResetPassword(false);
      } else {
        setResetDisclaimer(`⚠️ Password reset failed: ${result.error}`);
      }
    } catch (error) {
      console.error('⚠️ Error during password reset:', error);
      setResetDisclaimer('⚠️ Password reset failed due to a network issue');
    }
  };
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
  
    if (!verificationCode) {
      setVerificationDisclaimer('⚠️ Please enter the verification code.');
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/users/verify-login-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: localStorage.getItem('email'), code: verificationCode }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setActiveForm('');
        navigate('/dashboard');
      } else {
        setVerificationDisclaimer(`⚠️ Verification failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setVerificationDisclaimer('⚠️ Verification failed due to a network issue.');
    }
  };
  
  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Function to toggle the visibility of the button
  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  // Toggle function for mobile menu
  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };
  const scrollToSection = (e, id) => {
    e.preventDefault(); // Prevent the default anchor link behavior
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the section
    }
  };
  
  return (
    <div className="container-fluid p-0" id="Home">
      <header className="header bg-primary text-white py-3 d-flex align-items-center">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="logo-container">
            <img src="/images/Home Book.jpg" alt="Logo" className="logo" />
          </div>
          <nav className="navbar">
            <ul className={`nav-links ${menuActive ? 'active' : ''}`}>
            <li><a href="#" onClick={(e) => scrollToSection(e, 'Home')}>Home</a></li>
            <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About Us</a></li>
            <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Features</a></li>
            <li><a href="#benefits" onClick={(e) => scrollToSection(e, 'benefits')}>Benefits</a></li>
            <li><a href="#use-cases" onClick={(e) => scrollToSection(e, 'use-cases')}>Use Cases</a></li>
            <li><a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')}>Testimonials</a></li>
            <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Contact Us</a></li>
            <li><button className="btn btn-light mr-2" onClick={() => openForm('login')}>Login</button></li>
            <li><button className="btn btn-light" onClick={() => openForm('register')}>Register</button></li>
            </ul>
            <div className="menu-icon d-md-none" onClick={toggleMenu}>
              <i className="fas fa-bars"></i>
            </div>
          </nav>
        </div>
{/* Login Form */}
{activeForm === 'login' && (
  <div className="popup-form">
    <div className="form-container">
      <h2 className="form-title">Login</h2>
      <form onSubmit={handleLoginSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="loginUserName" className="form-label">Username:</label>
          <input type="text" id="loginUserName" name="username" className="form-input" value={loginData.username} onChange={handleLoginChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="loginPassword" className="form-label">Password:</label>
          <input type="password" id="loginPassword" name="password" className="form-input" value={loginData.password} onChange={handleLoginChange} required/>
        </div>
        <div className="form-check">
          <input type="checkbox" id="rememberMe" className="form-check-input" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
          <label htmlFor="rememberMe" className="form-check-label">Remember Me</label>
        </div>
        <div style={{ color: loginDisclaimer.includes('✔️') ? 'green' : 'red', marginTop: '10px' }}>
          {loginDisclaimer}
        </div>
        <div className="form-actions">
        <button type="button" className="btn btn-link" onClick={() => openForm('reset') && setLoginDisclaimer('')}>Forgot Password?</button>
          <button type="submit" className="btn btn-primary">Login</button>
          
        </div>
      </form>
      <div className="form-footer">
        <p>Don't have an account? 
          <button className="btn btn-link" onClick={() => openForm('register')}>Register</button>
        </p>
      </div>
      <div className='form-close'>
      <button className="btn btn-close" onClick={closeForm}></button>
    </div>
  </div>
  </div>
)}

      {/* Register Form */}
      {activeForm === 'register' && (
        <div className="popup-form">
          <div className="form-container">
            <h2>Register</h2>
            <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
                <label htmlFor="registerName">Username: </label>
                <input type="text" id="registerName" name="username" className="form-control" value={registerData.username} onChange={handleRegisterChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="registerEmail">Email: </label>
                <input type="email" id="registerEmail" name="email" className="form-control" value={registerData.email} onChange={handleRegisterChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="registerPassword">Password: </label>
                <input type="password" id="registerPassword" name="password" className="form-control" value={registerData.password} onChange={handleRegisterChange} required />
              </div>
              <div className="form-group">
  <label htmlFor="registerPasswordConfirm">Confirm Password:</label>
  <input type="password" id="registerPasswordConfirm" name="passwordConfirm" className="form-control" value={registerData.passwordConfirm} onChange={handleRegisterChange}required />
</div>
<div className="form-group">
  <label htmlFor="registerRole">Role:</label>
  <select id="registerRole" name="role" className="form-control" value={registerData.role} onChange={handleRegisterChange} required>
    <option value="">Select Role</option>
    <option value="School Admin">School Admin</option>
    <option value="Teacher">Teacher</option>
  </select>
</div>
          <div style={{ color: registerDisclaimer.includes('successful') ? 'green' : 'red', marginTop: '10px' }}>
            {registerDisclaimer}
          </div>
<div className="form-actions">
<button type="button" className="btn btn-password" onClick={() => openForm('reset')}>Forgot Password?</button>
<button type="submit" className="btn btn-register">Register</button>
</div>

            </form>
            <div className="form-footer">
            <p>
              Already have an account? <button className="btn btn-login" onClick={() => openForm('login')}>Login</button>
            </p>
            </div>
            <div className='form-close'>
      <button className="btn btn-close" onClick={closeForm}></button>
    </div>
          </div>
        </div>
      )}

      {/* Reset Password Form */}
      {activeForm === 'reset' && (
        <div className="popup-form">
          <div className="form-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label htmlFor="resetEmail">Email</label>
                <input type="email" id="resetEmail" required name='email' value={resetEmail.email} onChange={handleResetChange} className='form-control'/>
              </div>
              <div style={{ color: resetDisclaimer.includes('✔️') ? 'green' : 'red', marginTop: '10px' }}>
          {resetDisclaimer}
        </div>
              <div className="form-actions">
              <button className="btn btn-login" onClick={() => openForm('login') && setResetDisclaimer('')}>Back to Login</button>
              <button type="submit" className="btn btn-email">Send Reset Link</button>
              </div>
            </form>
            <div className='form-close'>
      <button className="btn btn-close" onClick={closeForm}></button>
    </div>
          </div>
        </div>
      )}
      {/* Verification Code Form */}
{activeForm === 'verification' && (
  <div className="popup-form">
    <div className="form-container">
      <h2>Verify Your Code</h2>
      <form onSubmit={handleVerificationSubmit}>
        <div className="form-group">
          <label htmlFor="verificationCode">Verification Code</label>
          <input
            type="text"
            id="verificationCode"
            required
            name="code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="form-control"
          />
        </div>
        <div style={{ color: verificationDisclaimer.includes('✔️') ? 'green' : 'red', marginTop: '10px' }}>
          {verificationDisclaimer}
        </div>
        <div className="form-actions">
          <button className="btn btn-login" onClick={() => openForm('login') && setVerificationDisclaimer('')}>
            Back to Login
          </button>
          <button type="submit" className="btn btn-verify">Verify Code</button>
        </div>
      </form>
      <div className="form-close">
        <button className="btn btn-close" onClick={closeForm}></button>
      </div>
    </div>
  </div>
)}

</header>

{/* Welcome Section */}
<section className="welcome-section text-center py-5">
  <div className="container" id="welcome">
    <h1>Welcome to Ishuri Hub</h1>
    <p>Your one-stop solution for managing students' data and keeping parents updated</p>
    <a href="#about" className="btn btn-primary mt-4">Learn More</a>
  </div>
</section>

{/* About Section */}
<section className="about-section container my-5" id="about">
  <div className="row justify-content-center">
    <div className="col-12 text-center">
      <h2>About Ishuri Hub</h2>
      <p className="lead">
  Ishuri Hub is a <span className="highlight">comprehensive platform</span> designed to revolutionize the way schools manage their student's data and Establish Effective Communication and Collaboration with Parents. 
  Our platform offers a <span className="highlight">user-friendly interface</span> that allows administrators to efficiently handle student records, attendance, and academic performance.
  Teachers can easily <span className='highlight'>track student progress</span>, <span className='highlight'>communicate with parents</span>, and <span className='highlight'>access educational resources</span>. 
  Parents are empowered with real-time updates on their child's academic journey, attendance, and school events, fostering a collaborative environment for student success.
  Ishuri Hub Ensures also <span className='highlight'>Data Manipulation</span> for Admins and Teachers by <span className='highlight'>generating Reports</span> and pinpointing Student's Data.
</p>
    </div>
  </div>
  <div className="row justify-content-center mt-5">
    <div className="col-md-6 text-center">
      <img src="/images/Background.png" alt="Ishuri Hub" className="img-fluid about-image" />
    </div>
  </div>
  {/* Metric Cards */}
  <div className="row text-center mt-5 metrics-section">
    <div className="col-sm-6 col-lg-2 metric-card">
      <h4>5,000+</h4>
      <p>Students Managed</p>
    </div>
    <div className="col-sm-6 col-lg-2 metric-card">
      <h4>1,200+</h4>
      <p>Parents Engaged</p>
    </div>
    <div className="col-sm-6 col-lg-2 metric-card">
      <h4>150+</h4>
      <p>Schools Using</p>
    </div>
    <div className="col-sm-6 col-lg-2 metric-card">
      <h4>95%</h4>
      <p>Parent Satisfaction</p>
    </div>
    <div className="col-sm-6 col-lg-2 metric-card">
      <h4>99.9%</h4>
      <p>System Uptime</p>
    </div>
  </div>
</section>
      <section className="bg-light py-5">
  <div className="container" id="features">
    <h2 className="features-header">Features</h2>
    <div className="features-container">
      <div className="features-wrapper">
        <div className="features-box text-center">
          <i className="fas fa-user-graduate fa-3x mb-3"></i>
          <h4>Student Management</h4>
          <p>Manage student data, track performance, and communicate with students and parents.</p>
        </div>
        <div className="features-box text-center">
          <i className="fas fa-users fa-3x mb-3"></i>
          <h4>Parent Management</h4>
          <p>Keep track of parent information and maintain effective communication with them.</p>
        </div>
        <div className="features-box text-center">
          <i className="fas fa-bell fa-3x mb-3"></i>
          <h4>Notifications</h4>
          <p>Send notifications to students and parents about important updates and events.</p>
        </div>
        <div className="features-box text-center">
          <i className="fas fa-chart-line fa-3x mb-3"></i>
          <h4>Real-Time Analytics</h4>
          <p>Get real-time insights into student performance and school operations with our advanced analytics tools.</p>
        </div>
        <div className="features-box text-center">
          <i className="fas fa-calendar-alt fa-3x mb-3"></i>
          <h4>Event Management</h4>
          <p>Organize and manage school events, track attendance, and send reminders to parents and students.</p>
        </div>
        <div className="features-box text-center">
          <i className="fas fa-shield-alt fa-3x mb-3"></i>
          <h4>Data Manipulation</h4>
          <p>Provides Reports and Data Manipulation features such as filtering and sorting to help administrators and teachers make data-driven decisions.</p>
        </div>
        <div className="features-box text-center">
          <i className="fas fa-user-graduate fa-3x mb-3"></i>
          <h4>Student Management</h4>
          <p>Manage student data, track performance, and communicate with students and parents.</p>
        </div>
        <div className="features-box text-center">
          <i className="fas fa-users fa-3x mb-3"></i>
          <h4>Parent Management</h4>
          <p>Keep track of parent information and maintain effective communication with them.</p>
        </div>
      </div>
    </div>
  </div>
</section>
{/* Benefits Section */}
<section className="benefits-section py-5" id="benefits">
  <div className="container">
    <h2 className="text-center mb-5">Benefits of Using Ishuri Hub</h2>
    
    <div className="row">
      {/* Administrators' Benefits */}
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="benefit-card p-4 h-100 text-center">
          <h4 className="mb-3">For Administrators</h4>
          <ul className="list-unstyled">
            <li>Centralized data management</li>
            <li>Real-time analytics and reporting</li>
            <li>Improved communication with parents and teachers</li>
            <li>Efficient event and attendance management</li>
          </ul>
        </div>
      </div>
      
      {/* Teachers' Benefits */}
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="benefit-card p-4 h-100 text-center">
          <h4 className="mb-3">For Teachers</h4>
          <ul className="list-unstyled">
            <li>Easy access to student data and performance metrics</li>
            <li>Streamlined communication with parents</li>
            <li>Tools for tracking and improving student progress</li>
            <li>Automated notifications and reminders</li>
          </ul>
        </div>
      </div>

      {/* Parents' Benefits */}
      <div className="col-lg-4 col-md-12 mb-4">
        <div className="benefit-card p-4 h-100 text-center">
          <h4 className="mb-3">For Parents</h4>
          <ul className="list-unstyled">
            <li>Receive real-time updates on students' progress</li>
            <li>Stay informed about events and attendance</li>
            <li>Direct communication with teachers and administrators</li>
            <li>Get notifications on students’ achievements and areas of improvement</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>
{/* Use Cases Section */}
<section className="container-fluid use-cases-section py-5" id="use-cases">
  <div className="container">
    <h2 className="text-center mb-5 section-title">Use Cases</h2>
    <div className="row">
      {/* Use Case 1: Tracking Student Progress */}
      <div className="col-lg-6 col-md-12 mb-4">
        <div className="card use-case-card shadow-sm">
          <div className="card-body">
            <div className="icon-wrapper">
              <i className="fas fa-chart-line use-case-icon"></i>
            </div>
            <h4 className="card-title">Tracking Student Progress</h4>
            <p className="card-text">
              With Ishuri Hub, teachers can easily track student progress and performance. Our dashboards provide detailed insights into each student's academic journey, helping teachers identify areas for improvement and provide targeted support.
            </p>
          </div>
        </div>
      </div>
      {/* Use Case 2: Sending Notifications to Parents */}
      <div className="col-lg-6 col-md-12 mb-4">
        <div className="card use-case-card shadow-sm">
          <div className="card-body">
            <div className="icon-wrapper">
              <i className="fas fa-bell use-case-icon"></i>
            </div>
            <h4 className="card-title">Sending Notifications to Parents</h4>
            <p className="card-text">
              Keep parents informed and engaged with automated notifications. Whether it's an upcoming event, a student's performance update, or an important announcement, Ishuri Hub ensures that parents receive timely and relevant information.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* Testimonials Section */}
<section className="testimonials-section py-5" id="testimonials">
  <div className="container">
    <h2 className="text-center section-title mb-5">What People Are Saying</h2>
    <div className="row">
      {/* Testimonial 1 */}
      <div className="col-md-4">
        <div className="testimonial-card shadow-lg p-4 mb-4">
          <div className="testimonial-icon">
            <i className="fas fa-user-shield"></i>
          </div>
          <p className="testimonial-text">"Ishuri Hub has transformed the way we manage our school data. It's user-friendly and efficient."</p>
          <p className="text-right"><strong>- School Administrator</strong></p>
        </div>
      </div>
      {/* Testimonial 2 */}
      <div className="col-md-4">
        <div className="testimonial-card shadow-lg p-4 mb-4">
          <div className="testimonial-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <p className="testimonial-text">"As a teacher, I can easily track student performance and communicate with parents. Highly recommend!"</p>
          <p className="text-right"><strong>- Teacher</strong></p>
        </div>
      </div>
      {/* Testimonial 3 */}
      <div className="col-md-4">
        <div className="testimonial-card shadow-lg p-4 mb-4">
          <div className="testimonial-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <p className="testimonial-text">"I love how I can stay updated with my child's progress and receive important notifications."</p>
          <p className="text-right"><strong>- Parent</strong></p>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* Contact Us Section */}
<section className="contact-section py-5" id="contact">
  <div className="container">
    <h2 className="text-center section-title mb-4">Contact Us</h2>
    <div className="row justify-content-center">
      <div className="col-md-8">
        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="Name">Name</label>
            <input type="text" className="form-control" id="Name" placeholder="Enter your Name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" className="form-control" id="email" placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea className="form-control" id="message" rows="4" placeholder="Enter your message" required></textarea>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Submit</button>
        </form>
      </div>
    </div>
  </div>
</section>
{/* Footer Section */}
<footer className="footer bg-dark text-white text-center py-5">
  
  <div className="container">
    <h3 className="footer-title">Stay Connected with Us</h3>
    <ul className="footer-links list-unstyled">
      <li><a href="#about" className="text-white">About Us</a></li>
      <li><a href="#benefits" className="text-white">Benefits</a></li>
      <li><a href="#use-cases" className="text-white">Use Cases</a></li>
      <li><a href="#testimonials" className="text-white">Testimonials</a></li>
      <li><a href="#contact" className="text-white">Contact Us</a></li>
    </ul>
    <div className="social-icons">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
        <i className="fab fa-facebook-f"></i>
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
        <i className="fab fa-twitter"></i>
      </a>
      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
        <i className="fab fa-linkedin-in"></i>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
        <i className="fab fa-instagram"></i>
      </a>
    </div>
    <p className="mt-4">&copy; 2023 Ishuri Hub. All rights reserved.</p>
  </div>
</footer>
<button onClick={scrollToTop} className="scroll-up-btn">
   &#8679; {/* Unicode for arrow up icon */}
</button>

    </div>
  );
};

export default IndexPage;