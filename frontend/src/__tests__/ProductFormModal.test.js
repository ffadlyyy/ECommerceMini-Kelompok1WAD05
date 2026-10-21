import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductFormModal from '@/components/admin/ProductFormModal.vue'

const categories = [
  { id: 1, name: 'Ruang tamu', slug: 'ruang-tamu' },
  { id: 2, name: 'Pencahayaan', slug: 'pencahayaan' },
]

async function open(props = {}) {
  const w = mount(ProductFormModal, { props: { modelValue: false, categories, ...props }, attachTo: document.body })
  await w.setProps({ modelValue: true })
  return w
}
const form = () => document.querySelector('#product-form')
const inputs = () => [...form().querySelectorAll('input, textarea, select')]

describe('ProductFormModal', () => {
  it('menampilkan error validasi dan tidak mengirim form kosong', async () => {
    const w = await open()
    form().dispatchEvent(new Event('submit'))
    await w.vm.$nextTick()
    expect(document.body.textContent).toContain('Nama produk wajib diisi.')
    expect(document.body.textContent).toContain('Pilih kategori.')
    expect(w.emitted('submit')).toBeUndefined()
    w.unmount()
  })

  it('mengisi data produk saat mengubah dan mengirim payload bertipe benar', async () => {
    const product = { id: 9, name: 'Lampu', price: 620000, stock: 4, description: 'Hangat', image_url: null, is_new: false, category: categories[1] }
    const w = await open({ product })
    const [name] = inputs()
    expect(name.value).toBe('Lampu')
    form().dispatchEvent(new Event('submit'))
    await w.vm.$nextTick()
    expect(w.emitted('submit')[0][0]).toEqual({
      name: 'Lampu', category_id: 2, price: 620000, stock: 4, description: 'Hangat', image_url: null, is_new: false,
    })
    w.unmount()
  })
})
