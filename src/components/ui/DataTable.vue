<template>
  <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
    <!-- Header opcional: search slot -->
    <div v-if="$slots.toolbar" class="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <slot name="toolbar" />
    </div>

    <div class="overflow-x-auto -mx-2 md:mx-0">
      <table class="w-[calc(100%+1rem)] md:w-full table-auto text-left">
        <thead class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="{ width: col.width || 'auto' }"
              class="px-4 py-3 font-semibold whitespace-nowrap"
            >
              {{ col.label }}
            </th>
            <th v-if="$slots.actions" class="px-4 py-3 font-semibold text-right whitespace-nowrap">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody
          v-if="!loading && rows.length"
          class="divide-y divide-gray-200 text-sm text-gray-700"
        >
          <tr v-for="(row, idx) in rows" :key="rowKey(row, idx)" class="hover:bg-gray-50">
            <td v-for="col in columns" :key="col.key + '-' + idx" class="px-4 py-3 align-middle">
              <slot :name="`cell:${col.key}`" :row="row">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-4 py-3 text-right align-middle">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="loading">
          <tr>
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="px-4 py-8 text-center text-gray-500"
            >
              Cargando...
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="px-4 py-10 text-center text-gray-400"
            >
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="$slots.footer" class="px-4 py-3 border-t border-gray-200 bg-gray-50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export interface DataTableColumn {
  key: string
  label: string
  width?: string
}

export default defineComponent({
  name: 'DataTable',
  props: {
    columns: { type: Array as PropType<DataTableColumn[]>, required: true },
    rows: { type: Array as PropType<Record<string, unknown>[]>, required: true },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: 'Sin registros' },
    rowKeyField: { type: String, default: '' },
  },
  methods: {
    rowKey(row: Record<string, unknown>, idx: number) {
      const keyField = this.rowKeyField as string
      return (keyField && (row[keyField] as string)) || idx
    },
  },
})
</script>
