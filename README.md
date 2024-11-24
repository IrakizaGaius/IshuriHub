# Ishuri Hub

Welcome to Ishuri Hub

A robust platform for managing student data and improving communication between schools, teachers, and parents.

About Ishuri Hub

Ishuri Hub simplifies school management by centralizing operations like student tracking, parent engagement, and event management. Administrators, teachers, and parents benefit from real-time updates, analytics, and efficient communication, fostering better collaboration for student success.

Key Features

Student Management: Maintain and track student records, performance, and attendance.

Parent Engagement: Communicate directly with parents and keep them informed.

Notifications: Send real-time updates and reminders for events or performance insights.

Event Management: Plan and monitor school events, ensuring full participation.

Data Insights: Generate actionable reports for informed decision-making.

Analytics: Access performance metrics for students and school operations.

System Requirements

Backend: Node.js (v16+), Express.js, MySQL Database
Frontend: React.js, React Router
Environment: .env file for secure configurations
Setup Instructions

Prerequisites

Node.js and npm installed
MySQL installed and running
Git for cloning the repository
Backend Installation

Clone the repository:

git clone <https://github.com/your-repo/ishuri-hub.git>
cd ishuri-hub/backend
Install dependencies:

npm install
Configure .env file:

plaintext
Copy code
PORT=5000  
DB_HOST=localhost  
DB_USER=root  
DB_PASSWORD=your_password  
DB_NAME=ishuri_hub  
MTN_CLIENT_ID=your_client_id  
MTN_CLIENT_SECRET=your_client_secret  
JWT_SECRET=your_jwt_secret

Run database migrations:
npx sequelize-cli db:migrate
Start the backend server:
npm start

Frontend Installation
Navigate to the frontend folder:

cd ../frontend

Install dependencies:
npm install

Start the frontend application:
npm start

Usage Instructions
Accessing the System

Login: Navigate to the login page and enter your credentials.
Dashboard: Access key features such as managing students, parents, and events.
Notifications: Send real-time updates to parents and students.
Reports: Generate insights into attendance, grades, and other metrics.

Default Routes
Public:
/api/users: User registration and login
Protected (Require authentication):
/api/attendances: Manage attendance
/api/grades: Manage grades
/api/parents: Manage parent details
/api/students: Manage student details
/api/notifications: Send notifications
/api/events: Organize events
/api/terms: Manage school terms

Contribution

Fork the repository.
Create a feature branch.
Submit a pull request for review.
