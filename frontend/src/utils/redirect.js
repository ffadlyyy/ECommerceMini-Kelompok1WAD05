/** Hanya izinkan redirect ke path internal ("/orders"), bukan "//evil.com" atau URL penuh. */
export function safeRedirect(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : null
}
