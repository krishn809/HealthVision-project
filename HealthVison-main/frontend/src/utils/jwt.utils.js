/**
 * Check if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        // Correctly handle Base64Url format used by JWT
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        if (!decoded.exp) return false;

        const now = Date.now();
        const expiresAt = decoded.exp * 1000;

        return expiresAt < now;
    } catch (e) {
        return true;
    }
};

/**
 * Get current user from local storage
 * @returns {Object|null} - User object or null
 */
export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Clear user from local storage
 */
export const logout = () => {
    localStorage.removeItem('user');
};
