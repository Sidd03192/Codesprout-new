/** @type {import('tailwindcss').Config} */
const {heroui} = require("@heroui/react");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
     "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
    darkMode: "class",

   plugins: [heroui({
      layout: {
        dividerWeight: "1px", 
        disabledOpacity: 0.45, 
        fontSize: {
          tiny: "0.75rem",
          small: "0.875rem",
          medium: "0.9375rem",
          large: "1.125rem",
        },
        lineHeight: {
          tiny: "1rem", 
          small: "1.25rem", 
          medium: "1.5rem", 
          large: "1.75rem", 
        },
        radius: {
          small: "6px", 
          medium: "8px", 
          large: "12px", 
        },
        borderWidth: {
          small: "1px", 
          medium: "1px", 
          large: "2px", 
        },
      },
      themes: {
        light: {
          colors: {
            secondary: {
          // We'll use Tailwind's "amber" palette for this example
          DEFAULT: '#f59e0b', // amber-500
          '50': '#fffbeb',
          '100': '#fef3c7',
          '200': '#fde68a',
          '300': '#fcd34d',
          '400': '#fbbf24',
          '500': '#f59e0b',
          '600': '#d97706',
          '700': '#b45309',
          '800': '#92400e',
          '900': '#78350f',
          '950': '#451a03',
        },
            primary: {
              DEFAULT: "#BEF264",
              foreground: "#000000",
            },
            background: {
              DEFAULT: "#FFFFFF"
            },
            content1: {
              DEFAULT: "#FFFFFF",
              foreground: "#11181C"
            },
            content2: {
              DEFAULT: "#f4f4f5",
              foreground: "#27272a"
            },
            content3: {
              DEFAULT: "#e4e4e7",
              foreground: "#3f3f46"
            },
            content4: {
              DEFAULT: "#d4d4d8",
              foreground: "#52525b"
            }
          }
        },
        dark: {
          secondary: {
          // We'll use Tailwind's "amber" palette for this example
          DEFAULT: '#f59e0b', // amber-500
          '50': '#fffbeb',
          '100': '#fef3c7',
          '200': '#fde68a',
          '300': '#fcd34d',
          '400': '#fbbf24',
          '500': '#f59e0b',
          '600': '#d97706',
          '700': '#b45309',
          '800': '#92400e',
          '900': '#78350f',
          '950': '#451a03',
        },
          primary: {
              DEFAULT: "#BEF264",
              foreground: "#000000",
            },
          colors: {
            background: {
              DEFAULT: "#121212"
            },
            content1: {
              DEFAULT: "#1a1a1a",
              foreground: "#ECEDEE"
            },
            content2: {
              DEFAULT: "#242424",
              foreground: "#ECEDEE"
            },
            content3: {
              DEFAULT: "#2e2e2e",
              foreground: "#ECEDEE"
            },
            content4: {
              DEFAULT: "#383838",
              foreground: "#ECEDEE"
            }
          }
        }
      }
    })
  ],

}