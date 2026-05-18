import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import QuestionFlow from './pages/QuestionFlow';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/analysis" element={<QuestionFlow />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
