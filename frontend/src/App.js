import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import IndexPage from './components/IndexPage';
import Parents from './components/Parents';
import Events from './components/Events';
import Students from './components/Students';
import StudentDetails from './components/StudentDetails';
import Config from './components/config';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/dashboard/" element={<Dashboard />} />
        <Route path="/parents/" element={<Parents />} />
        <Route path="/events/" element={<Events />} />
        <Route path="/students/" element={<Students />} />
        <Route path="/student/:id" element={<StudentDetails />} />
        <Route path="/config" element={<Config />} />
      </Routes>
    </Router>
  );
};

export default App;
