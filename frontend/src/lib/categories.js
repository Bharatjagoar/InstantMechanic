// Fixed categorical assignment (never cycled) so a category always renders the same
// color across charts, regardless of API ordering.
export const CATEGORY_COLOR_MAP = {
  Maintenance: '#2a78d6',
  Repair: '#eb6834',
  Diagnostics: '#1baf7a',
  Cosmetic: '#eda100',
  Emergency: '#e87ba4',
}

export const CATEGORY_FALLBACK_COLOR = '#4a3aa7'

export function colorForCategory(category) {
  return CATEGORY_COLOR_MAP[category] || CATEGORY_FALLBACK_COLOR
}
