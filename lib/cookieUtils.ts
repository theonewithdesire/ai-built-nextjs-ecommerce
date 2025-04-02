/**
 * Utility functions for working with cookies
 */

/**
 * Get a cookie by name
 * @param name The name of the cookie to get
 * @returns The cookie value or null if it doesn't exist
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // Return null if running server-side
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

/**
 * Set a cookie with the given name, value, and options
 * @param name The name of the cookie
 * @param value The value of the cookie
 * @param options Optional settings for the cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    path?: string;
    expires?: Date | number;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  if (typeof document === 'undefined') {
    return; // Do nothing if running server-side
  }

  const cookieOptions = {
    path: '/',
    ...options,
  };

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (cookieOptions.path) {
    cookieString += `; path=${cookieOptions.path}`;
  }

  if (cookieOptions.expires) {
    const expirationDate = typeof cookieOptions.expires === 'number' 
      ? new Date(Date.now() + cookieOptions.expires * 1000)
      : cookieOptions.expires;
    cookieString += `; expires=${expirationDate.toUTCString()}`;
  }

  if (cookieOptions.maxAge) {
    cookieString += `; max-age=${cookieOptions.maxAge}`;
  }

  if (cookieOptions.domain) {
    cookieString += `; domain=${cookieOptions.domain}`;
  }

  if (cookieOptions.secure) {
    cookieString += '; secure';
  }

  if (cookieOptions.httpOnly) {
    cookieString += '; httpOnly';
  }

  if (cookieOptions.sameSite) {
    cookieString += `; samesite=${cookieOptions.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Delete a cookie by setting its expiration date to the past
 * @param name The name of the cookie to delete
 * @param options Optional settings for the cookie
 */
export function deleteCookie(
  name: string,
  options: {
    path?: string;
    domain?: string;
  } = {}
): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
  });
} 