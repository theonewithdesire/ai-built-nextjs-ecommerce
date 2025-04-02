'use client';

import React from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok, FaXTwitter, FaYoutube, FaLinkedin, FaPinterest } from "react-icons/fa6";

const Footer: React.FC = () => {
  return (
    <footer className="text-blackText dark:text-dark-text text-center mt-12 transition-colors">
      <div className="border-t-2 border-primary dark:border-dark-pink"></div>
      
      {/* Upper Section */}
      <div className="bg-white dark:bg-dark-bg py-6 transition-colors">
        {/* Social Media Icons */}
        <div className="flex justify-center gap-4 sm:gap-5 mt-4 text-xl sm:text-2xl">
          <Link 
            href="#" 
            className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            aria-label="Facebook"
          >
            <FaFacebook />
          </Link>
          <Link 
            href="#" 
            className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            aria-label="Instagram"
          >
            <FaInstagram />
          </Link>
          <Link 
            href="#" 
            className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            aria-label="TikTok"
          >
            <FaTiktok />
          </Link>
          <Link 
            href="#" 
            className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            aria-label="Twitter"
          >
            <FaXTwitter />
          </Link>
          <Link 
            href="#" 
            className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            aria-label="YouTube"
          >
            <FaYoutube />
          </Link>
          <Link 
            href="#" 
            className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </Link>
          <Link 
            href="#" 
            className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            aria-label="Pinterest"
          >
            <FaPinterest />
          </Link>
        </div>
      </div>

      {/* Lower Section */}
      <div className="bg-primary dark:bg-dark-pink py-6 transition-colors">
        <h1 className="text-5xl xs:text-6xl sm:text-7xl font-bold font-custom">cookies</h1>
        <p className="mt-2 text-sm">
          © 2025 all rights reserved.
        </p>
        <div className="text-xs mt-1 px-4 flex flex-wrap justify-center gap-x-1">
          <Link href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy Policy</Link> 
          <span>|</span>
          <Link href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms and Conditions</Link> 
          <span>|</span>
          <Link href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Non-edible Cookie Preferences</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
