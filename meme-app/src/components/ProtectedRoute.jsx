import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="ma-loading">checking your session&hellip;</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && !isAdmin) {
    return (
      <div className="ma-card">
        <div className="ma-emptystate">
          This page is for admins only. Ask your project owner to set your account's role to
          "admin" in Firestore.
        </div>
      </div>
    );
  }
  return children;
}
