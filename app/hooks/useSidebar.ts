import { useState, useEffect } from "react";

interface UseSidebarReturn {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const useSidebar = (): UseSidebarReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);
  
  return { isOpen, setIsOpen }; 
}

export default useSidebar; 