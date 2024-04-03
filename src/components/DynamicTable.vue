<template>
  <table class="dynamic-table">
    <thead>
      <tr >
        <th v-for="column in columns" :key="column" :class="`header-${column}`"> {{ getHeaderName(column) }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in data" :key="index">
        <td v-for="column in columns" :key="column" :class="`value-${column} value-type-${typeof getValue(row, column)}`" @click="onClick(column, row)">
          <slot :name="column" :row="row">
            <div :class="getColumn(column)?.cssValue" v-html="getValue(row, column)" />
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";
import { Column } from '@/interfaces/table';

interface Props {
  columns: string[];
  columnTemplate: Column[];
  data: any[];
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "select", column: string, row: any): void;
}>();

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

const render = (template: string, values: {[key: string]: any}): string => {
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    // const keys = key.trim().split('.');
    // let value = values;
    // keys.forEach((k) => {
    //   value = value[k];
    // });
    const value = values[key];
    return (value !== undefined && value !== null) ? value : match;
  });
}

const isObject = (variable: any): boolean => {
  return typeof variable === 'object' && variable !== null && !Array.isArray(variable);
}

const mapColumnInfo = computed(() => {
  return props.columnTemplate.reduce((map: {[alias: string]: Column}, column: Column) => {
    map[column.alias] = column;
    return map;
  }, {});
});

const getColumn = computed(() => {
  return (alias: string) => mapColumnInfo.value[alias];
});

const getHeaderName = computed(() => {
  return (alias: string) => getColumn.value(alias)?.name || alias;
});

const getValue = computed(() => {
  return (row: any, column: string) => {
    const objectRow = flattenObject(row);
    const columnInfo: Column | undefined = getColumn.value(column);
    if (columnInfo) {
      const values = row[columnInfo.field];

      if(Array.isArray(values)) {
        if (isObject(values)) {

        }
        return columnInfo.templateShow ? values.map((item: any) => render(columnInfo.templateShow, {$item: item})).join('') : values.join(', ');
      }

      const value = columnInfo.templateShow ? render(columnInfo.templateShow, objectRow) : objectRow[columnInfo.field];
      return columnInfo?.enum && Object.keys(columnInfo.enum).length > 0 ? columnInfo.enum[value] || value : value;
    }
    return '';
  }
});

const onClick = (column: string, row: any) => {
  emit('select', column, row);
}
</script>

<style scoped>
</style>