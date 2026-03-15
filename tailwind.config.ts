import { withUt } from "uploadthing/tw";

module.exports = withUt({
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        /* ☕ Coffee Tremor palette (light) */
        tremor: {
          brand: {
            faint: "#F5EBDD",    // Cream
            muted: "#E8D5BC",    // Light latte
            subtle: "#C4A484",   // Latte
            DEFAULT: "#6F4E37",  // Coffee Brown
            emphasis: "#4B3621", // Mocha
            inverted: "#FFFDF8", // Warm white
          },
          background: {
            muted: "#FAF6F0",    // Warm off-white
            subtle: "#F5EBDD",   // Cream
            DEFAULT: "#FFFDF8",  // Warm white
            emphasis: "#4B3621", // Mocha
          },
          border: {
            DEFAULT: "#E8D5BC",
          },
          ring: {
            DEFAULT: "#E8D5BC",
          },
          content: {
            subtle: "#A08B76",   // Latte muted
            DEFAULT: "#7D6650",  // Medium coffee
            emphasis: "#4B3621", // Mocha
            strong: "#3B2F2F",   // Espresso
            inverted: "#FFFDF8",
          },
        },
        /* ☕ Coffee Tremor palette (dark) */
        "dark-tremor": {
          brand: {
            faint: "#1A130E",    // Deep espresso
            muted: "#2A1F17",    // Dark mocha
            subtle: "#6F4E37",   // Coffee Brown
            DEFAULT: "#C4A484",  // Latte
            emphasis: "#E8D5BC", // Light latte
            inverted: "#1A130E",
          },
          background: {
            muted: "#1A130E",    // Deep espresso
            subtle: "#2A1F17",   // Dark mocha
            DEFAULT: "#1F1610",  // Espresso bg
            emphasis: "#E8D5BC", // Light latte
          },
          border: {
            DEFAULT: "#3B2F2F",
          },
          ring: {
            DEFAULT: "#3B2F2F",
          },
          content: {
            subtle: "#7D6650",
            DEFAULT: "#A08B76",
            emphasis: "#E8D5BC",
            strong: "#F5EBDD",
            inverted: "#1A130E",
          },
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Custom coffee tokens for direct use */
        coffee: {
          espresso: "#3B2F2F",
          mocha: "#4B3621",
          brown: "#6F4E37",
          latte: "#C4A484",
          cream: "#F5EBDD",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark — warm coffee glow
        "dark-tremor-input": "0 1px 2px 0 rgb(75 54 33 / 0.1)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(75 54 33 / 0.15), 0 1px 2px -1px rgb(75 54 33 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(75 54 33 / 0.15), 0 2px 4px -2px rgb(75 54 33 / 0.1)",
        // Premium coffee glow
        "coffee-glow": "0 4px 24px -4px rgb(111 78 55 / 0.25)",
        "coffee-glow-lg": "0 8px 40px -8px rgb(111 78 55 / 0.3)",
      },
      keyframes: {
        scroll: {
          to: {
            transform: "translate(calc(-50% - 0.5rem))",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "automation-zoom-in": {
          "0%": { transform: "translateY(-30px) scale(0.2)" },
          "100%": { transform: "translateY(0px) scale(1)" },
        },
      },
      animation: {
        scroll:
          "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "automation-zoom-in": "automation-zoom-in 0.5s",
      },
    },
  },
  // @ts-ignore
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
});