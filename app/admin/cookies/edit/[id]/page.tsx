"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { getCookie } from "@/lib/cookieUtils";

type CookieFormInput = {
  name: string;
  description: string;
  bg_color: string;
  image: string;
  stock: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  allergens: string[];
  top_reviews: string[];
};

const commonAllergens = [
  "Gluten",
  "Dairy",
  "Eggs",
  "Peanuts",
  "Tree Nuts",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame"
];

export default function EditCookiePage({ params }: { params: { id: string } }) {
  // Properly unwrap the params Promise using React.use()
  const unwrappedParams = React.use(params as any) as { id: string };
  const cookieId = unwrappedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CookieFormInput>({
    defaultValues: {
      bg_color: "#f5e050",
      nutrition: {
        calories: 250,
        protein: 3,
        fat: 12,
        carbs: 36
      },
      allergens: [],
      top_reviews: []
    },
    mode: 'onBlur'
  });

  const watchBgColor = watch("bg_color");
  const watchName = watch("name");
  const watchDescription = watch("description");
  const watchStock = watch("stock");

  // Check authentication and fetch cookie data
  useEffect(() => {
    const verifyAuthAndLoadCookie = async () => {
      try {
        // Check if user is authenticated
        const refreshToken = getCookie('refreshToken');
        if (!refreshToken) {
          router.push('/admin/login');
          return;
        }

        const authRes = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: refreshToken }),
        });
        
        const authData = await authRes.json();
        
        if (!authData.valid || !authData.isAdmin) {
          router.push('/admin/login');
          return;
        }
        
        if (authData.accessToken) {
          setAccessToken(authData.accessToken);
          
          // Now fetch the cookie data
          const cookieRes = await fetch(`/api/cookies/${cookieId}`, {
            headers: {
              "Authorization": `Bearer ${authData.accessToken}`
            }
          });
          
          if (!cookieRes.ok) {
            throw new Error("Failed to load cookie data");
          }
          
          const data = await cookieRes.json();
          
          if (!data || !data.cookie) {
            throw new Error("Invalid cookie data received");
          }
          
          const cookieData = data.cookie;
          
          // Set form values from cookie data
          setValue("name", cookieData.name);
          setValue("description", cookieData.description || "");
          setValue("bg_color", cookieData.bg_color || "#f5e050");
          setValue("image", cookieData.image || "");
          setValue("stock", Number(cookieData.stock) || 0);
          
          // Handle nested nutrition object
          if (cookieData.nutrition) {
            setValue("nutrition.calories", Number(cookieData.nutrition.calories) || 0);
            setValue("nutrition.protein", Number(cookieData.nutrition.protein) || 0);
            setValue("nutrition.fat", Number(cookieData.nutrition.fat) || 0);
            setValue("nutrition.carbs", Number(cookieData.nutrition.carbs) || 0);
          }
          
          // Handle array fields
          if (cookieData.allergens) {
            setValue("allergens", cookieData.allergens);
          }
          
          if (cookieData.top_reviews) {
            // If it's an array, join with newlines for the textarea
            if (Array.isArray(cookieData.top_reviews)) {
              setValue("top_reviews", cookieData.top_reviews);
            } else {
              setValue("top_reviews", cookieData.top_reviews);
            }
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setFetchError("Failed to load cookie data. Please try again.");
      } finally {
        setLoading(false);
        setIsChecking(false);
      }
    };

    verifyAuthAndLoadCookie();
  }, [cookieId, router, setValue]);

  const onSubmit: SubmitHandler<CookieFormInput> = async (data) => {
    if (!accessToken) {
      setSubmitStatus({
        success: false,
        message: "Authentication error. Please login again.",
      });
      return;
    }
    
    setSubmitStatus(null);
    setLoading(true);
    
    try {
      // Convert top_reviews from string to array if it's a string (from textarea)
      if (typeof data.top_reviews === 'string') {
        data.top_reviews = (data.top_reviews as unknown as string)
          .split('\n')
          .filter(review => review.trim() !== '');
      }
      
      const res = await fetch(`/api/cookies/${cookieId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update cookie");
      }
      
      setSubmitStatus({
        success: true,
        message: "Cookie updated successfully!",
      });
      
      // After successful update, wait a moment then redirect to dashboard
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error updating cookie:", err);
      setSubmitStatus({
        success: false,
        message: err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <header className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary w-10 h-10 rounded-md flex items-center justify-center mr-3">
              <span className="text-black text-xl font-bold">🍪</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Cookie</h1>
          </div>
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="bg-black hover:opacity-75 text-white px-4 py-2 rounded-md text-sm font-medium transition-opacity duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Edit Cookie</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update the information for this cookie.
            </p>
          </div>

          {fetchError && (
            <div className="mx-6 mt-6 bg-red-50 border-red-400 border-l-4 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{fetchError}</p>
                </div>
              </div>
            </div>
          )}
          
          {submitStatus && (
            <div className={`mx-6 mt-6 ${
              submitStatus.success ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"
            } border-l-4 p-4 rounded-md`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {submitStatus.success ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${submitStatus.success ? "text-green-700" : "text-red-700"}`}>
                    {submitStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 p-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                Cookie Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Cookie name is required" })}
                className={`border ${errors.name ? "border-red-500" : "border-gray-500"} rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
                placeholder="Chocolate Chip Cookie"
                aria-invalid={errors.name ? "true" : "false"}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={3}
                {...register("description", { required: "Description is required" })}
                className={`border ${errors.description ? "border-red-500" : "border-gray-500"} rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
                placeholder="A delicious cookie with chocolate chips"
                aria-invalid={errors.description ? "true" : "false"}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bg_color" className="block text-gray-700 text-sm font-bold mb-2">
                  Background Color
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    id="bg_color"
                    {...register("bg_color")}
                    className="border border-gray-500 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                    placeholder="#f5e050"
                  />
                  <input
                    type="color"
                    {...register("bg_color")}
                    className="ml-2 h-9 w-9 p-0 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-gray-700 text-sm font-bold mb-2">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  id="stock"
                  type="number"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Stock cannot be negative" },
                  })}
                  className={`border ${errors.stock ? "border-red-500" : "border-gray-500"} rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
                  placeholder="10"
                  aria-invalid={errors.stock ? "true" : "false"}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
                Image URL
              </label>
              <input
                id="image"
                type="text"
                {...register("image")}
                className="border border-gray-500 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                placeholder="cookie-name.jpg or https://example.com/cookie.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                For local images, just enter the filename (e.g., "chocolate-chip.jpg"). Images should be placed in the /public/images/cookies folder.
              </p>
            </div>

            <div>
              <h3 className="text-gray-700 text-sm font-bold mb-2">Nutrition Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nutrition.calories" className="block text-gray-700 text-xs mb-1">
                    Calories
                  </label>
                  <input
                    id="nutrition.calories"
                    type="number"
                    min="0"
                    {...register("nutrition.calories", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                    className="border border-gray-500 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="nutrition.protein" className="block text-gray-700 text-xs mb-1">
                    Protein (g)
                  </label>
                  <input
                    id="nutrition.protein"
                    type="number"
                    min="0"
                    step="0.1"
                    {...register("nutrition.protein", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                    className="border border-gray-500 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="nutrition.fat" className="block text-gray-700 text-xs mb-1">
                    Fat (g)
                  </label>
                  <input
                    id="nutrition.fat"
                    type="number"
                    min="0"
                    step="0.1"
                    {...register("nutrition.fat", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                    className="border border-gray-500 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="nutrition.carbs" className="block text-gray-700 text-xs mb-1">
                    Carbs (g)
                  </label>
                  <input
                    id="nutrition.carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    {...register("nutrition.carbs", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                    className="border border-gray-500 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-gray-700 text-sm font-bold mb-2">Allergens</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                {commonAllergens.map((allergen) => (
                  <div key={allergen} className="flex items-center">
                    <input
                      id={`allergen-${allergen}`}
                      type="checkbox"
                      value={allergen}
                      {...register("allergens")}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label htmlFor={`allergen-${allergen}`} className="ml-2 block text-sm text-gray-700">
                      {allergen}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="top_reviews" className="block text-gray-700 text-sm font-bold mb-2">
                Top Reviews (one per line)
              </label>
              <textarea
                id="top_reviews"
                rows={3}
                {...register("top_reviews")}
                className="border border-gray-500 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                placeholder="Great cookie, loved the texture!&#10;The best cookie I've ever had!"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter each review on a new line. These will be displayed on the cookie detail page.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-black hover:opacity-75 text-white rounded-md py-2 px-4 font-bold text-lg transition-opacity duration-200 flex-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : "Update Cookie"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/dashboard")}
                className="bg-gray-200 text-gray-800 rounded-md py-2 px-4 font-bold text-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
