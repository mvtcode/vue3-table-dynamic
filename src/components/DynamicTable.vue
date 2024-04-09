<template>
  <table class="dynamic-table">
    <thead>
      <tr >
        <th v-for="(column, index) in columns" :key="index" :class="{'drag-over': column.isDrag}"> {{ column.title }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in data" :key="index">
        <td v-for="(column, index2) in columns" :key="index2" :class="{'drag-over': column.isDrag}">
          <div v-html="getValue(row, column, index)" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { defineProps, computed, onMounted, ref, onBeforeUnmount } from "vue";
import { Column, VfField, VfType } from '@/interfaces/table';
import { symbols } from '@/constants/otherField';

interface Props {
  columns: Column[];
  columnTemplate: VfField[];
  actions: VfField[];
  data: any[];
}
const props = defineProps<Props>();

interface FlattenedObject {
  [key: string]: any;
}

const emit = defineEmits<{
  (e: "onSelectAction", action: string, row: any, index: number): void;
}>();

const prefixFunction = 'tdac';
const callFunction = ref('');

onMounted(() => {
  callFunction.value = `${prefixFunction}${Math.floor(Math.random() * 1e6)}`;
  const w: any = window;
  w[callFunction.value] = function (action: string, index: number) {
    const row = props.data[index];
    emit('onSelectAction', action, row, index);
  }
});

onBeforeUnmount(() => {
  const w: any = window;
  if (w[callFunction.value]) {
    w[callFunction.value] = undefined;
    delete w[callFunction.value];
  }
})

const vfFields = computed(() => {
  return [...symbols, ...props.actions, ...props.columnTemplate];
})

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
    const value = values[key];
    return (value !== undefined && value !== null) ? value : match;
  });
}

const mapFieldInfo = computed(() => {
  return vfFields.value.reduce((map: {[vfCode: string]: VfField}, field: VfField) => {
    map[field.vfCode] = field;
    return map;
  }, {});
});

const getValue = computed(() => {
  return (row: any, column: Column, index: number) => {
    const values: string[] = [];
    for(const vfCode of column.fieldCodes) {
      const fieldInfo = mapFieldInfo.value[vfCode];
      if (fieldInfo) {
        if (fieldInfo.vfType === VfType.SYMBOL) {
          values.push(fieldInfo?.value || '');
          continue;
        }

        if (fieldInfo.vfType === VfType.ACTION) {
          const value = `<span class="btn btn-${fieldInfo.vfAcutalField}" onClick="${callFunction.value}('${fieldInfo.vfAcutalField}', ${index})">${fieldInfo?.vfTitle || ''}</span>`;
          values.push(value);
          continue;
        }

        if (fieldInfo.vfRenderFunc) {
          const vFun = fieldInfo.vfRenderFunc(row, fieldInfo, index);
          values.push(vFun);
          continue;
        }

        const rowValue = row[fieldInfo.vfAcutalField as string];
        if(Array.isArray(rowValue)) {
          const vArr = fieldInfo.templateShow ? rowValue.map((item: any) => render(fieldInfo.templateShow as string, {$item: item})).join('') : rowValue.join(', ');
          values.push(vArr);
          continue;
        }

        const objectRow = flattenObject(row);
        let value = objectRow[fieldInfo.vfAcutalField];
        if (fieldInfo?.enum && Object.keys(fieldInfo.enum).length > 0) {
          value = fieldInfo.enum[value] || value;
        }

        if (fieldInfo?.templateShow) {
          value = render(fieldInfo?.templateShow, {value});
        }

        values.push(value);
      }
    }
    return values.join('');
  }
});
</script>

<style lang="scss" scoped>
.drag-over {
  color: #F00;
}
</style>