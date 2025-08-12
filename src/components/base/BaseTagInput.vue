<template>
  <div class="tag-input" @click="focusInput">
    <ul class="tags">
      <li v-for="(t, i) in value" :key="t + i" class="tag">
        <span class="label">{{ t }}</span>
        <button type="button" class="remove" aria-label="Remove tag" @click.stop="remove(i)">×</button>
      </li>

      <li class="field">
        <input
          ref="inputRef"
          v-model="draft"
          :placeholder="placeholder"
          :disabled="disabled || isMaxed"
          @keydown="onKeydown"
          @blur="commitIfAny"
          @paste.prevent="onPaste"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

type Emits = { (e:"update:modelValue", v:string[]):void };
const emit = defineEmits<Emits>();

const props = withDefaults(defineProps<{
  modelValue: string[];
  max?: number;                 // 最大タグ数
  separators?: string[];        // 区切り文字
  placeholder?: string;
  disabled?: boolean;
  normalize?: (s:string)=>string | null; // 正規化/バリデーション（nullで拒否）
}>(), {
  max: 3,
  separators: () => [",", "、"],
  placeholder: "Add keyword and press Enter",
  disabled: false,
});

const value = computed({
  get: () => Array.isArray(props.modelValue) ? props.modelValue.filter(x => typeof x === "string") : [],
  set: (v: string[]) => emit("update:modelValue", v),
});


const draft = ref("");
const inputRef = ref<HTMLInputElement|null>(null);
const isMaxed = computed(() => value.value.length >= props.max);

function focusInput() { inputRef.value?.focus(); }

function cleaned(s: string): string | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const n = props.normalize ? props.normalize(trimmed) : trimmed;
  if (n == null) return null;
  // 重複排除（大文字小文字同一視）
  const exists = value.value.some(v => v.toLowerCase() === n.toLowerCase());
  return exists ? null : n;
}

function commitOne(s: string) {
  if (isMaxed.value) return;
  const n = cleaned(s);
  if (n == null) return;
  value.value = [...value.value, n];
}

function commitIfAny() {
  if (!draft.value.trim()) return;
  commitOne(draft.value);
  draft.value = "";
}

function remove(i: number) {
  const next = value.value.slice();
  next.splice(i, 1);
  value.value = next;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" || e.key === "Tab") {
    e.preventDefault();
    commitIfAny();
    return;
  }
  // 区切り文字で確定
  if (props.separators.includes(e.key)) {
    e.preventDefault();
    commitIfAny();
    return;
  }
  // 入力が空で Backspace → 最後のタグを削除
  if (e.key === "Backspace" && !draft.value) {
    if (value.value.length) {
      e.preventDefault();
      remove(value.value.length - 1);
    }
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData("text") ?? "";
  const parts = text.split(new RegExp(`[${props.separators.join("")}\\s]+`, "g"))
                    .map(s => s.trim()).filter(Boolean);
  for (const p of parts) {
    if (isMaxed.value) break;
    commitOne(p);
  }
  draft.value = "";
}

// v-model に null が来ても安全に
watch(() => props.modelValue, (v) => {
  if (!Array.isArray(v)) emit("update:modelValue", []);
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.tag-input {
  min-height: 50px;
  padding: $space-3;
  border: 2px solid $color-border;
  border-radius: $radius-lg;
  background: #fff;
  cursor: text;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }

  &:hover {
    border-color: rgba(26, 115, 232, 0.3);
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin: 0;
  padding: 0;
  list-style: none;
  min-height: 26px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: $color-primary;
  color: white;
  font-weight: 500;
  font-size: 14px;
  animation: tagAppear 0.2s ease;
}

@keyframes tagAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  line-height: 1;
  font-size: 12px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.field {
  flex: 1;
  min-width: 120px;
}

.field input {
  width: 100%;
  border: 0;
  outline: none;
  padding: 8px 4px;
  font: inherit;
  background: transparent;
  font-size: 16px;

  &::placeholder {
    color: $color-muted;
  }
}
</style>