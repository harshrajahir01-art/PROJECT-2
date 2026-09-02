import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Camera, LayoutDashboard, Database, 
  Bell, MapPin, FileText, LogOut, Menu, X, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Scan Vehicle', path: '/scan', icon: Camera, primary: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Timeline Map', path: '/map', icon: MapPin },
    { name: 'Vehicle Registry', path: '/vehicles', icon: Database },
    { name: 'Alert Center', path: '/alerts', icon: Bell },
    { name: 'Audit Logs', path: '/audit', icon: FileText, adminOnly: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#0E1526]/95 backdrop-blur border-b border-[#1E293B] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/scan" className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
                  VehicleShield
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-blue-950 text-blue-400 border border-blue-800 rounded">
                  ANPR • V2.4
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    item.primary
                      ? isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30'
                      : isActive
                      ? 'bg-slate-800 text-blue-400 border border-slate-700'
                      : 'text-gray-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${item.primary ? 'text-current' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-200">{user?.full_name || 'Operator'}</div>
              <div className="text-xs text-blue-400/90 font-mono flex items-center justify-end space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                <span>{user?.role} • {user?.badge_number || 'ACTIVE'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 border border-slate-800 hover:border-red-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link
              to="/scan"
              className="p-2 bg-blue-600 text-white rounded-lg shadow-md flex items-center justify-center"
            >
              <Camera className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0E1526] px-4 pt-2 pb-4 space-y-1">
          <div className="p-2 mb-2 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-xs font-semibold text-gray-200">{user?.full_name}</div>
                <div className="text-[10px] text-gray-400">{user?.role} ({user?.badge_number})</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs px-2.5 py-1 bg-red-950/80 text-red-400 border border-red-800 rounded font-medium"
            >
              Logout
            </button>
          </div>

          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
