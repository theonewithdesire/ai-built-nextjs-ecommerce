import React from 'react';
import db from '@/lib/db';
import { CookieRow } from '@/lib/types';
import Card from './components/ui/Card';

async function getCookies() {
  try {
    const cookies = db.prepare(`
      SELECT * FROM cookies
    `).all() as CookieRow[];
    
    return cookies.map(cookie => ({
      ...cookie,
      nutrition: JSON.parse(cookie.nutrition || '{}'),
      allergens: JSON.parse(cookie.allergens || '[]'),
      top_reviews: JSON.parse(cookie.top_reviews || '[]'),
      stock: Number(cookie.stock) || 0
    }));
  } catch (error) {
    console.error("Error fetching cookies:", error);
    return [];
  }
}

// Get current date for header
function getCurrentWeek() {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - now.getDay());
  const endDate = new Date(now);
  endDate.setDate(startDate.getDate() + 6);
  
  const formatDate = (date: Date) => {
    return `${date.getDate()}-${date.getMonth() + 1}`;
  };
  
  return `${formatDate(startDate)} ${formatDate(endDate)}`;
}

export default async function Home() {
  const cookies = await getCookies();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-bg transition-colors">
      <main className="flex-grow pt-12 md:pt-20 px-2 sm:px-4 lg:px-6 max-w-7xl mx-auto w-full">
        <div className="space-y-2 md:space-y-8 pb-6 md:pb-8">
          {/* Header section */}
          <div className="mt-8 sm:mt-4">
            <div className="text-left my-12 pl-8 mt-0 mb-24">
              <p className="text-lg text-gray-600 dark:text-black mt-2 inline-block bg-pinkBg dark:bg-dark-pink px-8 py-2 rounded-lg transition-colors"> 
                week of {getCurrentWeek()}
              </p>
              <h2 className="text-7xl font-extrabold text-blackText dark:text-dark-text transition-colors">
                cookies of the week
              </h2>
            </div>
          </div>
          
          {/* Cards Container */}
          <div className="space-y-16 md:space-y-24">
            {cookies.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xl text-gray-600 dark:text-gray-300">No cookies available at the moment. Check back soon!</p>
              </div>
            ) : (
              cookies.map((cookie, index) => {
                // Ensure image path starts with a slash for Next.js Image component
                const imagePath = cookie.image && !cookie.image.startsWith('/') && !cookie.image.startsWith('http') 
                  ? `/images/cookies/${cookie.image}` 
                  : cookie.image || '';
                
                return (
                  <div 
                    key={cookie.id}
                    className="transform transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <Card 
                      id={cookie.id}
                      name={cookie.name}
                      description={cookie.description || ''}
                      image={imagePath}
                      bg_color={cookie.bg_color || '#f5e050'}
                      imagePosition={index % 2 === 0 ? 'left' : 'right'} 
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 