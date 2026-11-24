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
          blue: '#2563EB',      // Primary Blue
          dark: '#1D4ED8',      // Dark Blue (hover/active)
          light: '#EFF6FF',     // Light Blue background / tint
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        surface: {
          white: '#FFFFFF',
          bg: '#F3F4F6',        // Background Gray
          border: '#E5E7EB',    // Border Gray
          card: '#FFFFFF',
        },
        content: {
          heading: '#111827',   // Primary Heading
          body: '#374151',      // Body Text
          muted: '#6B7280',     // Secondary / Muted Text
          subtle: '#9CA3AF',
        },
        status: {
          success: '#16A34A',   // Success Green
          warning: '#F59E0B',   // Warning Amber
          danger: '#DC2626',    // Danger Red
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
