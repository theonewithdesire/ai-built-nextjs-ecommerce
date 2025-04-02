'use client';

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CardProps {
  id: number;
  name: string;
  description: string;
  image: string;
  bg_color: string;
  imagePosition?: 'left' | 'right';
}

const Card: React.FC<CardProps> = ({ 
  id, 
  name, 
  description, 
  image, 
  bg_color, 
  imagePosition = 'left' 
}) => {
  const router = useRouter();
  const imageClass = imagePosition === 'left' ? 'sm:-left-12' : 'sm:-right-12';
  const textClass = imagePosition === 'left' ? 'sm:ml-56' : 'sm:mr-56';
  
  // Handle image source
  let imageSrc = '/images/cookies/default-cookie.jpg';

  if (image) {
    // Check if it's an absolute URL (has a protocol)
    if (image.startsWith('http://') || image.startsWith('https://')) {
      imageSrc = image;
    } 
    // Check if it already starts with a slash, keep as is
    else if (image.startsWith('/')) {
      imageSrc = image;
    } 
    // Otherwise, prepend the path for cookies
    else {
      imageSrc = `/images/cookies/${image}`;
    }
  }

  const handleOrderNow = () => {
    router.push(`/cookies/${id}/order`);
  };

  return (
    <div
      className="relative bg-white dark:bg-dark-card transition-colors duration-300 text-black dark:text-dark-text rounded-2xl px-6 sm:px-20 py-4 sm:py-10 flex items-center w-full sm:w-11/12 mx-auto mt-14 group"
      style={{ 
        "--hover-bg-color": bg_color 
      } as React.CSSProperties}
    >
      <div className={`absolute ${imageClass} w-44 h-44 sm:w-80 sm:h-80 transition-all duration-300`}>
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>

      <div className={`flex flex-col justify-center ${textClass} text-left pl-6 sm:pl-0`}>
        <h2 className="text-2xl sm:text-6xl font-extrabold text-black dark:text-white group-hover:text-white sm:ml-0 ml-40 hover:cursor-default">
          {name}
        </h2>
        <p className="mt-6 ml-40 mr-4 text-sm text-gray-500 dark:text-white dark:text-opacity-80 sm:hidden whitespace-nowrap hover:opacity-60 hover:cursor-pointer" 
           onClick={() => router.push(`/cookies/${id}`)}>
          Learn More
        </p>
        <p className="mt-3 text-base text-gray-800 dark:text-white dark:text-opacity-90 group-hover:text-white hidden sm:block">
          {description}
        </p>

        {/* Buttons */}
        <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-4 group-hover:translate-x-2 transition-transform duration-300 hidden sm:flex">
          <button
            onClick={() => router.push(`/cookies/${id}`)}
            className="bg-white dark:bg-dark-card text-black dark:text-white px-10 py-2 rounded-2xl font-bold border border-white dark:border-gray-700 hover:opacity-90 transition-opacity duration-200"
          >
            Learn More
          </button>
          <button
            onClick={handleOrderNow}
            className="bg-white dark:bg-dark-card text-black dark:text-white px-10 py-2 rounded-2xl font-bold hover:opacity-90 transition-opacity duration-200"
          >
            Order Now
          </button>
        </div>
      </div>

      {/* Custom CSS for hover effects */}
      <style jsx>{`
        .group:hover {
          background-color: var(--hover-bg-color);
        }
        .group:hover .bg-white,
        .group:hover .dark\\:bg-dark-card {
          background-color: var(--hover-bg-color);
          color: white;
        }
        .group:hover .bg-white:last-child,
        .group:hover .dark\\:bg-dark-card:last-child {
          background-color: black;
          color: white;
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .group:hover .dark\\:bg-dark-card {
            border-color: var(--hover-bg-color);
          }
        }
      `}</style>
    </div>
  );
};

export default Card;
