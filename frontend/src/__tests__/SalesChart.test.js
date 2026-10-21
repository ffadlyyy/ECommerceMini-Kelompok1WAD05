import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SalesChart from '@/components/admin/SalesChart.vue'

const data = [
  { date: '2026-10-03', revenue: 620000, orders: 1 },
  { date: '2026-10-06', revenue: 4140000, orders: 2 },
]

describe('SalesChart', () => {
  it('mengisi hari tanpa penjualan supaya sumbu waktu utuh', () => {
    const w = mount(SalesChart, { props: { data } })
    // 3–6 Okt = 4 hari, masing-masing punya area hover yang bisa difokus
    expect(w.findAll('rect.chart__hit')).toHaveLength(4)
    // hanya hari dengan pendapatan yang punya batang
    expect(w.findAll('path.chart__bar').filter((p) => p.attributes('d'))).toHaveLength(2)
  })

  it('menampilkan tooltip saat batang difokus', async () => {
    const w = mount(SalesChart, { props: { data } })
    await w.findAll('rect.chart__hit')[3].trigger('focus')
    expect(w.get('.chart__tooltip').text().replace(/\s/g, ' ')).toContain('Rp 4.140.000')
  })

  it('menyediakan tampilan tabel', async () => {
    const w = mount(SalesChart, { props: { data } })
    expect(w.find('table').exists()).toBe(false)
    await w.get('.chart__toggle').trigger('click')
    expect(w.findAll('tbody tr')).toHaveLength(4)
  })

  it('menampilkan pesan bila belum ada data', () => {
    const w = mount(SalesChart, { props: { data: [] } })
    expect(w.text()).toContain('Belum ada penjualan')
  })
})
