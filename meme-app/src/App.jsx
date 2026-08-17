import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MemeCreator from './components/MemeCreator.jsx';
import Gallery from './components/Gallery.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Profile from './pages/Profile.jsx';
import PublicProfile from './pages/PublicProfile.jsx';
import Footer from './components/Footer.jsx';
import Services from './pages/Services.jsx';
import ScrollToTopButton from './components/ScrollToTopButton.jsx';
import MemeView from './pages/MemeView.jsx';

export default function App() {
  return (
    <div className="ma-app">
      <div className="ma-wrap">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<MemeCreator />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/u/:uid" element={<PublicProfile />} />
          <Route path="/meme/:memeId" element={<MemeView />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
