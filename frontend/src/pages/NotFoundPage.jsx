import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-xl">
        <Compass className="h-10 w-10 animate-spin" />
      </div>
      <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white">
        404
      </h1>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">
        Page or RTO Route Not Found
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mt-2">
        The vehicle registration or explorer page you requested could not be located.
      </p>
      <div className="flex items-center space-x-3 mt-8">
        <Link
          to="/"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all"
        >
          <Home className="h-4 w-4" />
          <span>Return to Home</span>
        </Link>
        <Link
          to="/rto-directory"
          className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
        >
          <Search className="h-4 w-4" />
          <span>Search RTO Directory</span>
        </Link>
      </div>
    </div>
  );
};
