<template>
  <table class="dynamic-table">
    <thead>
      <tr >
        <th v-for="(column, index) in columns" :key="index"> {{ column.title }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in data" :key="index">
        <td v-for="(column, index) in columns" :key="index">
          <slot :name="`col-${index}`" :row="row">
            <div v-html="getValue(row, column)" />
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import { Column, VfField, VfType } from '@/interfaces/table';

interface Props {
  columns: Column[];
  columnTemplate: VfField[];
  data: any[];
}
const props = defineProps<Props>();

interface FlattenedObject {
  [key: string]: any;
}

function flattenObject(obj: any, parentKey: string = '', result: FlattenedObject = {}): FlattenedObject {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const prefixedKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        flattenObject(obj[key], prefixedKey, result);
      } else {
        result[prefixedKey] = obj[key];
      }
    }
  }
  return result;
}

const mapFieldInfo = computed(() => {
  return props.columnTemplate.reduce((map: {[vfCode: string]: VfField}, field: VfField) => {
    map[field.vfCode] = field;
    return map;
  }, {});
});

const getValue = computed(() => {
  return (row: any, column: Column) => {
    const values: string[] = [];
    for(const field of column.fields) {
      const fieldInfo = mapFieldInfo.value[field.vfCode];
      if (fieldInfo) {
        if (field.vfType === VfType.SYMBOL) {
          values.push(fieldInfo?.value || '');
          continue;
        }
        const objectRow = flattenObject(row);
        const value = objectRow[fieldInfo.vfAcutalField];
        values.push(fieldInfo?.enum && Object.keys(fieldInfo.enum).length > 0 ? fieldInfo.enum[value] || value : value);
      }
    }
    return values.join('');
  }
});
</script>

<style scoped>
</style>