<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import StarRating from '@/components/ui/StarRating.vue'

defineProps({
  submitting: Boolean,
  /** Pesan error dari server (mis. belum login) */
  serverError: { type: String, default: '' },
})
const emit = defineEmits(['submit'])

const MIN = 10
const MAX = 500
const rating = ref(0)
const comment = ref('')
const errors = ref({ rating: '', comment: '' })

function validate() {
  errors.value = {
    rating: rating.value ? '' : 'Pilih rating 1–5 bintang.',
    comment: comment.value.trim().length >= MIN ? '' : `Tulis minimal ${MIN} karakter.`,
  }
  return !errors.value.rating && !errors.value.comment
}

function submit() {
  if (!validate()) return
  emit('submit', { rating: rating.value, comment: comment.value.trim() }, reset)
}
function reset() {
  rating.value = 0
  comment.value = ''
  errors.value = { rating: '', comment: '' }
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="submit">
    <h3 class="form__title">Tulis ulasan</h3>

    <div>
      <span class="form__label" id="rating-label">Rating</span>
      <StarRating v-model="rating" :size="26" aria-labelledby="rating-label" />
      <p v-if="errors.rating" class="form__error" role="alert">{{ errors.rating }}</p>
    </div>

    <BaseInput
      v-model="comment"
      label="Ulasan"
      multiline
      :rows="4"
      :maxlength="MAX"
      placeholder="Ceritakan pengalamanmu dengan produk ini"
      :error="errors.comment"
      :hint="`${comment.length}/${MAX}`"
    />

    <p v-if="serverError" class="form__error" role="alert">{{ serverError }}</p>

    <BaseButton type="submit" :disabled="submitting">{{ submitting ? 'Mengirim…' : 'Kirim ulasan' }}</BaseButton>
  </form>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--space-4); }
.form__title { font-size: 22px; }
.form__label { display: block; font-size: 13.5px; font-weight: 500; margin-bottom: var(--space-2); }
.form__error { font-size: 12.5px; color: var(--color-danger); margin-top: 4px; }
.form > :last-child { align-self: flex-start; }
</style>
