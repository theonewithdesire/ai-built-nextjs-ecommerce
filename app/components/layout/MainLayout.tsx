'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import useSidebar from '@/app/hooks/useSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <div className="flex flex-col min-h-screen">
      <Header setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <main className="flex-grow pt-20 pb-10">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout; 