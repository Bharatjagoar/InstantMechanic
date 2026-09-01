// Fixed categorical assignment (never cycled) so a category always renders the same
// color across charts, regardless of API ordering. Light/dark steps from the same slots.
export const CATEGORY_COLOR_MAP = {
  light: {
    Maintenance: '#2a78d6',
    Repair: '#eb6834',
    Diagnostics: '#1baf7a',
    Cosmetic: '#eda100',
    Emergency: '#e87ba4',
  },
  dark: {
    Maintenance: '#3987e5',
    Repair: '#d95926',
    Diagnostics: '#199e70',
    Cosmetic: '#c98500',
    Emergency: '#d55181',
  },
}

export const CATEGORY_FALLBACK_COLOR = { light: '#4a3aa7', dark: '#9085e9' }

export function colorForCategory(category, theme = 'light') {
  return CATEGORY_COLOR_MAP[theme][category] || CATEGORY_FALLBACK_COLOR[theme]
}
