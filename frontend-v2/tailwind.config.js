/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: '#0B1120',    // Deep pro-work navy
                    blue: '#0055eb',    // Bajaj Corporate Blue
                    gold: '#D4AF37',    // Premium gold accent
                    slate: '#1E293B',
                },
                background: '#0B1120',
                foreground: '#FFFFFF',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'premium': '0 10px 40px -10px rgba(0, 85, 235, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }
        },
    },
    plugins: [],
}
