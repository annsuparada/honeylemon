/**
 * Shared Tailwind preset: daisyUI, aspect-ratio plugin, and daisyUI theme list.
 * @param {{ honeylemonBrand?: boolean }} [options] Pass `{ honeylemonBrand: true }` for the Honey Lemon custom daisyUI theme (omit for default theme list only).
 * @returns {import('tailwindcss').Config}
 */
function createTailwindPreset(options = {}) {
  const { honeylemonBrand = false } = options;

  const standardThemes = [
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter',
    'dim',
    'nord',
    'sunset',
  ];

  const honeylemonTheme = {
    honeylemon: {
      primary: '#1D4ED8',
      secondary: '#1F2937',
      accent: '#f97316',
      neutral: '#F9FAFB',
      'base-100': '#ffffff',
      info: '#00AEEF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      '--rounded-box': '1rem',
      '--rounded-btn': '0.5rem',
      '--rounded-badge': '1.9rem',
      '--animation-btn': '0.25s',
      '--btn-text-case': 'uppercase',
      '--navbar-padding': '1rem',
    },
  };

  return {
    theme: {
      extend: {},
    },
    plugins: [require('daisyui'), require('@tailwindcss/aspect-ratio')],
    daisyui: {
      themes: honeylemonBrand ? [...standardThemes, honeylemonTheme] : standardThemes,
    },
  };
}

module.exports = createTailwindPreset;
