// Holds the single Socket.io instance so controllers can emit events without
// importing server.js directly (which would create a circular import).
let ioInstance = null

export function setIO(io) {
  ioInstance = io
}

export function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet')
  }
  return ioInstance
}
