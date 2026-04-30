import { useState } from 'react';
import './App.css';
import { HomePage } from './pages/HomePage.jsx';
import { CoursePage } from './pages/CoursePage.jsx';
import { NewCoursePage } from './pages/NewCoursePage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});

  function navigate(page, params = {}) {
    setCurrentPage(page);
    setPageParams(params);
  }

  function renderPage() {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'course':
        return <CoursePage folder={pageParams.folder} onNavigate={navigate} />;
      case 'new':
        return <NewCoursePage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  }

  return <div className="min-h-screen">{renderPage()}</div>;
}

export default App;
