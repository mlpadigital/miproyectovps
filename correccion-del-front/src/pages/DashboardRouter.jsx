
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * This component is deprecated as routing is now handled directly in App.jsx
 * keeping it as a redirect to avoid breaking legacy imports.
 */
const DashboardRouter = () => {
  return <Navigate to="/dashboard" replace />;
};

export default DashboardRouter;
