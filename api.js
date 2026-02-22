/**
 * 🛰️ Los Santos Dashboard — API Service Bridge
 * This module handles the communication between the Frontend 
 * and the MongoDB-backed Node.js API.
 */

const API_CONFIG = {
    isEnabled: false, // TOGGLE THIS FOR THE HACKATHON DEMO
    baseUrl: 'http://localhost:5000/api'
};

const LS_API = {
    async fetchState(userId) {
        if (!API_CONFIG.isEnabled) return JSON.parse(localStorage.getItem('ls_state') || '{}');

        try {
            const res = await fetch(`${API_CONFIG.baseUrl}/state/${userId}`);
            return await res.json();
        } catch (err) {
            console.warn('API Fetch failed, falling back to LocalStorage:', err);
            return JSON.parse(localStorage.getItem('ls_state') || '{}');
        }
    },

    async updateState(userId, updates) {
        // Always sync to LocalStorage first for speed
        const current = JSON.parse(localStorage.getItem('ls_state') || '{}');
        const newState = { ...current, ...updates };
        localStorage.setItem('ls_state', JSON.stringify(newState));

        if (!API_CONFIG.isEnabled) return;

        try {
            await fetch(`${API_CONFIG.baseUrl}/state/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...updates })
            });
        } catch (err) {
            console.error('API Sync failed:', err);
        }
    },

    async signup(email, password) {
        if (!API_CONFIG.isEnabled) return { success: true };

        const res = await fetch(`${API_CONFIG.baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return res.json();
    }
};

window.LS_API = LS_API;
window.API_CONFIG = API_CONFIG;
