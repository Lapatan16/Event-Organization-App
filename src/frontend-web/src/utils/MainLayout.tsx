import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
// import { useState, useEffect } from 'react';

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
