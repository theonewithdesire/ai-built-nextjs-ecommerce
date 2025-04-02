import { useState, useEffect } from "react";

const useSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

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