import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Camera, Layers, MapPin, Search, 
  Palette, Compass, BookOpen, Settings, Sun, Moon, 
  LogOut, Menu, X, User as UserIcon, Database, LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Main Navigation links requested by user
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Number Plate Types', path: '/plate-types' },
    { name: 'States & UTs', path: '/states' },
    { name: 'RTO Directory', path: '/rto-directory' },
    { name: 'Decoder', path: '/decoder' },
    { name: 'Plate Visualizer', path: '/visualizer' },
    { name: 'Map Explorer', path: '/map-explorer' },
    { name: 'AI Scanner', path: '/scan', badge: 'LIVE' },
    { name: 'About', path: '/about' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 dark:bg-[#0E1526]/95 backdrop-blur border-b border-gray-200 dark:border-[#1E293B] sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <span className="text-xl">🇮🇳</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 dark:from-blue-400 dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
                    RTO Explorer
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded">
                    INDIA
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Vehicle Registration Guide
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center space-x-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-white'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="px-1 py-0.2 text-[9px] rounded font-black bg-emerald-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-2.5">
            
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-slate-700"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            {/* Admin Management Link */}
            <Link
              to="/admin/rto"
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 transition-colors"
              title="Admin RTO Management"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>

            {/* User Profile / Logout or Login */}
            {user ? (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-slate-700">
                <Link
                  to="/dashboard"
                  className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-blue-500 flex items-center space-x-1"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-block px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Hamburger Button */}
            <div className="xl:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-[#0E1526] border-b border-gray-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-1 shadow-2xl">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{item.name}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] rounded font-black bg-emerald-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <Link
              to="/admin/rto"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-blue-500 flex items-center space-x-1"
            >
              <Settings className="h-4 w-4" />
              <span>Admin Management</span>
            </Link>

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="px-3.5 py-2 text-xs font-bold text-red-500 flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
