'use client';

import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Load user from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem("user");
        setUser(userData ? JSON.parse(userData) : null);
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      }
    }
  }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleSidebarOrderNow = () => {
    setIsOpen(false);
    router.push('/cookies');
  };

  // Handle clicks outside sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[role="dialog"]');
      if (isOpen && sidebar && !sidebar.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  return (
    <div
      className={`fixed top-0 left-0 w-full sm:w-96 h-full bg-white dark:bg-dark-card shadow-lg transform transition-all duration-300 ease-in-out z-[60] ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Navigation sidebar"
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold dark:text-dark-text">Menu</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <IoClose className="text-2xl dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-4">
        {user ? (
          <button
            onClick={() => handleNavigation("/profile")}
            className="w-full text-left p-3 rounded-lg hover:text-primary dark:hover:text-dark-pink transition-all duration-100 text-2xl sm:text-3xl font-semibold dark:text-dark-text"
            aria-label="Go to profile"
          >
            Profile
          </button>
        ) : (
          <button 
            onClick={() => handleNavigation("/signin")}
            className="w-full text-left p-3 rounded-lg hover:text-primary dark:hover:text-dark-pink transition-all duration-100 text-2xl sm:text-3xl font-extrabold dark:text-dark-text"
            aria-label="Sign up or sign in"
          >
            Sign Up
          </button>
        )}

        <hr className="border-gray-200 dark:border-gray-700 my-4" />
        
        <button
          onClick={() => handleNavigation("/")}
          className="w-full text-left p-3 rounded-lg hover:text-primary dark:hover:text-dark-pink transition-all duration-100 text-2xl sm:text-3xl font-extrabold dark:text-dark-text"
          aria-label="Go to home page"
        >
          Home
        </button>                
        
        <button
          onClick={handleSidebarOrderNow}
          className="w-full text-left p-3 rounded-lg hover:text-primary dark:hover:text-dark-pink transition-all duration-100 text-2xl sm:text-3xl font-extrabold dark:text-dark-text"
          aria-label="Order cookies"
        >
          Order
        </button>
        
        <button
          onClick={handleSidebarOrderNow}
          className="w-full text-left p-3 rounded-lg hover:text-primary dark:hover:text-dark-pink transition-all duration-100 text-2xl sm:text-3xl font-extrabold dark:text-dark-text"
          aria-label="Order catering"
        >
          Catering
        </button>

        <button
          onClick={() => handleNavigation("/agent")}
          className="w-full text-left p-3 rounded-lg hover:text-primary dark:hover:text-dark-pink transition-all duration-100 text-2xl sm:text-3xl font-extrabold dark:text-dark-text"
          aria-label="Go to agent page"
        >
          Agent
        </button>
        
        <div className="absolute bottom-4 left-0 w-full px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 cookies</p>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
