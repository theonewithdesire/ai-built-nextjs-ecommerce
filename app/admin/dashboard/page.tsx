"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookieUtils";
import Image from "next/image";
import Link from "next/link";

type Cookie = {
  id: number;
  name: string;
  description: string;
  image: string;
  stock: number;
  bg_color: string;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  allergens: string[];
  top_reviews: string[];
};

export default function AdminDashboard() {
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"cookies" | "orders">("cookies");
  const [showModal, setShowModal] = useState(false);
  const [cookieToDelete, setCookieToDelete] = useState<Cookie | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication and fetch new access token
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        let refreshToken = getCookie('refreshToken');
        
        // If no token in cookie, check localStorage backup
        if (!refreshToken) {
          const backupToken = localStorage.getItem('refreshTokenBackup');
          if (backupToken) {
            refreshToken = backupToken;
          }
        }
        
        if (!refreshToken) {
          router.push('/admin/login');
          return;
        }

        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: refreshToken }),
        });
        
        if (!res.ok) {
          throw new Error("Verification failed");
        }
        
        const data = await res.json();
        
        if (!data.valid || !data.isAdmin) {
          localStorage.removeItem('refreshTokenBackup'); // Clear invalid backup
          router.push('/admin/login');
          return;
        }
        
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          loadCookies(data.accessToken);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error("Authentication error:", err);
        // Clear potentially invalid backup token
        localStorage.removeItem('refreshTokenBackup');
        router.push('/admin/login');
      }
    };

    verifyAuth();
  }, [router]);

  const loadCookies = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cookies", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to load cookies");
      }
      
      const data = await res.json();
      
      // Fix the cookies access - the API returns { cookies: [...] }
      if (data.cookies && Array.isArray(data.cookies)) {
        // Ensure stock is always a number
        const cookiesWithNumberStock = data.cookies.map((cookie: any) => ({
          ...cookie,
          stock: Number(cookie.stock) || 0
        }));
        setCookies(cookiesWithNumberStock);
      } else {
        console.error("Unexpected data format:", data);
        setError("Invalid data format received from server");
        setCookies([]);
      }
    } catch (err) {
      console.error("Error loading cookies:", err);
      setError("Failed to load cookies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (cookie: Cookie) => {
    setCookieToDelete(cookie);
    setShowModal(true);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setCookieToDelete(null);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!cookieToDelete || !accessToken) return;
    
    try {
      const res = await fetch(`/api/cookies/${cookieToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete cookie");
      }
      
      // Filter out the deleted cookie
      setCookies(cookies.filter(cookie => cookie.id !== cookieToDelete.id));
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting cookie:", err);
      setDeleteError("Failed to delete cookie. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary w-10 h-10 rounded-md flex items-center justify-center mr-3">
              <span className="text-black text-xl font-bold">🍪</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Cookie Admin</h1>
          </div>
          <button 
            onClick={() => {
              document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              localStorage.removeItem('refreshTokenBackup');
              router.push('/admin/login');
            }}
            className="bg-black hover:opacity-75 text-white px-4 py-2 rounded-md text-sm font-medium transition-opacity duration-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("cookies")}
                className={`${
                  activeTab === "cookies"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm`}
              >
                Cookies Management
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`${
                  activeTab === "orders"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm`}
              >
                Orders
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "cookies" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">All Cookies</h2>
                  <div className="flex space-x-2">
                    <Link
                      href="/admin/cookies/add"
                      className="bg-black hover:opacity-75 text-white px-4 py-2 rounded-md text-sm font-medium transition-opacity duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add New Cookie
                    </Link>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : cookies.length === 0 ? (
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 py-12">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No cookies</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new cookie</p>
                      <div className="mt-6">
                        <Link
                          href="/admin/cookies/add"
                          className="inline-flex items-center px-4 py-2 bg-black hover:opacity-75 text-white rounded-md text-sm font-medium transition-opacity duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          New Cookie
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cookie
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Allergens
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cookies.map((cookie) => (
                          <tr key={cookie.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden" 
                                     style={{ backgroundColor: cookie.bg_color || '#FFDEAD' }}>
                                  {cookie.image ? (
                                    <Image
                                      src={cookie.image.startsWith('http') ? cookie.image : `/images/cookies/${cookie.image}`}
                                      alt={cookie.name}
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 flex items-center justify-center text-lg">
                                      🍪
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{cookie.name}</div>
                                  <div className="text-sm text-gray-500 max-w-xs truncate">{cookie.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                cookie.stock > 10 
                                  ? "bg-green-100 text-green-800" 
                                  : cookie.stock > 0 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {cookie.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {cookie.allergens && cookie.allergens.length > 0 ? cookie.allergens.slice(0, 3).map((allergen, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {allergen}
                                  </span>
                                )) : (
                                  <span className="text-xs text-gray-500">None</span>
                                )}
                                {cookie.allergens && cookie.allergens.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    +{cookie.allergens.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Link
                                  href={`/admin/cookies/edit/${cookie.id}`}
                                  className="p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors duration-200"
                                  title="Edit Cookie"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                <button
                                  onClick={() => openDeleteModal(cookie)}
                                  className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                  title="Delete Cookie"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        The order management feature is coming soon. Stay tuned!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center py-16">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Order Management</h3>
                  <p className="mt-1 text-gray-500">This feature is under development. Check back soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium text-gray-900">Delete Cookie</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{cookieToDelete?.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            
            {deleteError && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{deleteError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full bg-black hover:opacity-75 text-white px-4 py-2 rounded-md text-sm font-medium transition-opacity duration-200 sm:ml-3 sm:w-auto"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="mt-3 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors duration-200 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}