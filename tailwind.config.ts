import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-inter)', 'sans-serif'],
  			poppins: ['var(--font-poppins)', 'sans-serif'],
  			vietnam: ['var(--font-be-vietnam)', 'sans-serif'],
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			// Cinematic custom colors
  			cinema: {
  				red: '#E50914',
  				orange: '#FF6B35',
  				dark: '#0A0A0F',
  				surface: '#111118',
  				elevated: '#1A1A24',
  				border: 'rgba(255,255,255,0.08)',
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(24px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' },
  			},
  			'slide-right': {
  				from: { opacity: '0', transform: 'translateX(-20px)' },
  				to: { opacity: '1', transform: 'translateX(0)' },
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(0.95)' },
  				to: { opacity: '1', transform: 'scale(1)' },
  			},
  			'shimmer-fast': {
  				'0%': { backgroundPosition: '-200% center' },
  				'100%': { backgroundPosition: '200% center' },
  			},
  			'hero-crossfade': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0' },
  			},
  			'badge-pulse': {
  				'0%, 100%': { boxShadow: '0 0 0 0 rgba(229,9,20,0.7)' },
  				'70%': { boxShadow: '0 0 0 8px rgba(229,9,20,0)' },
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-6px)' },
  			},
  		},
  		animation: {
  			'fade-up': 'fade-up 0.5s ease-out forwards',
  			'fade-in': 'fade-in 0.4s ease-out forwards',
  			'slide-right': 'slide-right 0.4s ease-out forwards',
  			'scale-in': 'scale-in 0.3s ease-out forwards',
  			'shimmer-fast': 'shimmer-fast 1.5s linear infinite',
  			'badge-pulse': 'badge-pulse 2s infinite',
  			'float': 'float 3s ease-in-out infinite',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
