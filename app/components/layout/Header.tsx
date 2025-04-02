'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMenuAlt4 } from "react-icons/hi";
import { BsHandbag } from "react-icons/bs";

interface HeaderProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsOpen }) => {
  const [bagCount, setBagCount] = useState(0);
  const router = useRouter();

  // Check if user is on checkout page
  const isCheckoutPage = false; // This needs to be updated with actual route detection

  // Get user from localStorage, with null fallback for SSR
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Client-side only
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

  // Load bag items on mount and when they change
  useEffect(() => {
    // Get initial bag count
    const loadBagCount = () => {
      try {
        // Try to get bag count from localStorage
        const storedBagCount = localStorage.getItem('bagCount');
        if (storedBagCount) {
          setBagCount(parseInt(storedBagCount, 10) || 0);
        } else {
          // Try to get items from bag
          const bagItems = JSON.parse(localStorage.getItem("bag") || "[]");
          if (bagItems.length > 0) {
            setBagCount(bagItems.length);
            localStorage.setItem('bagCount', bagItems.length.toString());
          } else {
            // Try to get items from bagItems (backward compatibility)
            const oldBagItems = JSON.parse(localStorage.getItem("bagItems") || "[]");
            setBagCount(oldBagItems.length);
            localStorage.setItem('bagCount', oldBagItems.length.toString());
          }
        }
      } catch (error) {
        console.error('Error loading bag count:', error);
        setBagCount(0);
      }
    };

    // Only run in browser
    if (typeof window !== 'undefined') {
      // Load initial bag count
      loadBagCount();

      // Listen for storage changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'bag' || e.key === 'bagItems' || e.key === 'bagCount') {
          loadBagCount();
        }
      };

      // Listen for custom bagUpdated event (from Agent ordering)
      const handleBagUpdated = (e: CustomEvent) => {
        if (e.detail && typeof e.detail.count === 'number') {
          setBagCount(e.detail.count);
        } else {
          loadBagCount();
        }
      };

      // Add event listeners
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('bagUpdated', handleBagUpdated as EventListener);

      // Clean up event listeners
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('bagUpdated', handleBagUpdated as EventListener);
      };
    }
  }, []);

  const handleOrderNow = () => {
    router.push('/cookies');
  };

  return (
    <>
      <header className="bg-primary dark:bg-dark-bg px-4 sm:px-6 py-3 flex justify-between items-center fixed top-0 left-0 w-full z-40 mb-20 shadow-sm transition-colors duration-200">
        {/* Left Menu */}
        <div className="flex items-center">
          <button
            className="text-blackText dark:text-dark-text text-2xl"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <HiMenuAlt4 className="w-6 h-6" />
          </button>
          <span className="ml-2 text-blackText dark:text-dark-text font-bold text-xl font-custom hidden sm:block">
            Menu
          </span>
        </div>

        {/* Centered cookies text/link */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link 
            href="/"
            className="font-bold text-2xl xs:text-3xl sm:text-4xl hover:opacity-75 transition-opacity dark:text-dark-text"
            aria-label="Go to home page"
          >
            cookies
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center">
          
          {user ? (
            !isCheckoutPage && (
              <button
                onClick={() => {}}
                className="bg-black dark:bg-gray-800 text-white px-2 py-2 rounded-2xl font-bold hover:bg-gray-800 dark:hover:opacity-90 transition-all duration-200 flex items-center gap-1 sm:gap-2 relative"
                aria-label="View bag"
              >
                <BsHandbag className="w-5 h-5" />
                <span className="hidden xs:inline">View Bag</span>
                {bagCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                    {bagCount}
                  </span>
                )}
              </button>
            )
          ) : (
            <button 
              onClick={handleOrderNow}
              className="bg-black dark:bg-gray-800 text-white px-3 sm:px-10 py-2 rounded-2xl font-bold hover:opacity-90 transition-opacity duration-200 text-sm whitespace-nowrap"
              aria-label="Order now"
            >
              Order Now
            </button>
          )}
          {isCheckoutPage && <div className="w-10" />}
        </div>
      </header>
    </>
  );
};

export default Header;
