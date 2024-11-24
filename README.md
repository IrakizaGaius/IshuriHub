# 📚 Ishuri Hub

Welcome to **Ishuri Hub**, a robust platform designed to streamline school management by centralizing student data, enhancing parent-teacher communication, and fostering collaboration for student success.

---

## 🚀 About Ishuri Hub

Ishuri Hub simplifies school operations by offering real-time updates, analytics, and tools for managing students, events, and communication. Administrators, teachers, and parents can collaborate efficiently, ensuring better outcomes for students.

---

## ✨ Key Features

- **Student Management**: Maintain and track student records, performance, and attendance.
- **Parent Engagement**: Communicate directly with parents and keep them informed about their child's progress.
- **Notifications**: Send real-time updates and reminders for events and performance insights.
- **Event Management**: Plan and monitor school events, ensuring seamless participation.
- **Data Insights**: Generate actionable reports for informed decision-making.
- **Analytics**: Access key metrics for students and school operations.

---

## ⚙️ System Requirements

### Backend
- **Node.js** (v16+)
- **Express.js**
- **MySQL Database**

### Frontend
- **React.js**
- **React Router**

### Environment
- `.env` file for secure configurations

---

## 🛠️ Setup Instructions

### Prerequisites
- Install **Node.js** and **npm**.
- Install and configure **MySQL**.
- Install **Git** for cloning the repository.

---

### Backend Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/IshuriHub.git
   cd IshuriHub/backend
   
2. **Install dependencies**:
   ```bash
   npm install

3. **Configure the .env file**:

```bash
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ishuri_hub
MTN_CLIENT_ID=your_client_id
MTN_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret

```
4. **Run database migrations**:

```bash
npx sequelize-cli db:migrate
```

5. **Start the backend server**:

```bash
npm start
```

**Frontend Installation**

1. **Navigate to the frontend folder**:

```bash
cd ../frontend
```

2. **Install dependencies**:

```bash
npm install
```

3. **Start the frontend application**:

```bash
npm start
```

🖥️ Usage Instructions

Accessing the System

1. **Login**: Navigate to the login page and enter your credentials.
2. **Dashboard**: Access key features such as managing students, parents, and events.
3. **Notifications**: Send real-time updates to parents.
4. **Reports**: Generate insights into attendance, grades, and other metrics.

**Default API Routes**

**Public Routes**:
1. **/api/users**: User registration and login

**Protected Routes (Require Authentication)**:

1. **/api/attendances**: Manage attendance
2. **/api/grades**: Manage grades
3. **/api/subjects**: Manage Student's Subjects.
4. **/api/parents**: Manage parent details
5. **/api/students**: Manage student details
6. **/api/notifications**: Send notifications
7. **/api/events**: Organize events
8. **/api/terms**: Manage school terms

🤝 **Contribution**

We welcome contributions to improve Ishuri Hub! Here's how you can contribute:

1. **Fork the repository**.

2. **Create a feature branch**:
```bash
git checkout -b feature-name
```

3. **Submit a pull request for review**.
