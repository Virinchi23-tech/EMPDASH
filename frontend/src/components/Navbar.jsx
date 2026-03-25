import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="navbar-custom shadow-sm sticky-top">
      <div className="d-flex align-items-center gap-3">
        <div className="position-relative">
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Search Intelligence..."
            style={{ borderRadius: '10px', width: '300px' }}
          />
          <Search size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
        </div>
      </div>
      <div className="d-flex align-items-center gap-4">
        <div className="position-relative cursor-pointer">
          <Bell size={22} className="text-secondary" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>5</span>
        </div>
        <div className="d-flex align-items-center gap-2 cursor-pointer border-start ps-4">
          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <User size={20} className="text-primary" />
          </div>
          <div>
            <div className="fw-bold mb-0 text-dark" style={{ lineHeight: '1' }}>{user.name || 'System User'}</div>
            <small className="text-secondary" style={{ fontSize: '0.75rem' }}>{user.role || 'Staff'}</small>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
