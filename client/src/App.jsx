import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CreateTemplate } from './pages/CreateTemplate';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-2xl">🎯</span> 3D Template Manager
            </Link>
            <div className="flex gap-6">
              <Link to="/" className="hover:text-blue-100 transition">Dashboard</Link>
              <Link to="/create" className="hover:text-blue-100 transition">Create Template</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateTemplate />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
