// Pasang localStorage in-memory supaya tes konsisten di semua mesin.
const data = new Map()
const memoryStorage = {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    get length() {
        return data.size
    },
}
for (const target of [globalThis, globalThis.window].filter(Boolean)) {
    Object.defineProperty(target, 'localStorage', { value: memoryStorage, configurable: true, writable: true })
}