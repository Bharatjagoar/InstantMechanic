export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pickOne(array) {
  return array[randomInt(0, array.length - 1)]
}

export function pickWeighted(weights) {
  const entries = Object.entries(weights)
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = Math.random() * total
  for (const [value, weight] of entries) {
    roll -= weight
    if (roll <= 0) return value
  }
  return entries[entries.length - 1][0]
}

export function randomDateBetween(start, end) {
  const startMs = start.getTime()
  const endMs = end.getTime()
  return new Date(startMs + Math.random() * (endMs - startMs))
}
