/** Tunda pemanggilan fn sampai `wait` ms tanpa panggilan baru. Punya .cancel(). */
export function debounce(fn, wait = 300) {
  let timer = null
  const debounced = (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}
