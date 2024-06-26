<template>
  <div class="box box-grid">
    <div class="grid-col-2">
      <div class="edit-columns">
        <div class="justify-content-space-between">
          <h5> Columns </h5>
          <div>
            <button class="btn-plus" @click="onAddColumn">✚</button>
          </div>
        </div>
        <hr style="margin: 5px 0"/>
        <draggable
          tag="ul"
          v-model="columnsEdit"
          class="dragArea list-group custom-scroll"
          item-key="alias"
          group="people"
          handle=".handle"
        >
          <template #item="{ element, index }">
            <li class="list-group-item" :class="{'hover': element.isDrag}">
              <div class="label align-items-center" @drop="e => onDrop(e, element)" @dragover="e => onDragover(e, element)" @dragleave="e => onDragleave(e, element)">
                <div class="align-items-center">
                  <span class="handle">☰</span>

                  <Popper placement="right-start" arrow>
                    <button class="btn-more">⋯</button>
                    <template #content>
                      <div class="popover-action">
                        <div>
                          <button class="btn-more" :class="{active: (element.align || 'left') === 'left'}" @click="element.align = 'left'">
                            <img :src="AlignLeftIcon" />
                          </button>
                          <button class="btn-more" :class="{active: element.align === 'center'}" @click="element.align = 'center'">
                            <img :src="AlignCenterIcon" />
                          </button>
                          <button class="btn-more" :class="{active: element.align === 'right'}" @click="element.align = 'right'">
                            <img :src="AlignRightIcon" />
                          </button>
                        </div>
                        <div style="margin-top: 4px">
                          <button class="btn-more" :class="{active: element.vAlign === 'top'}" @click="element.vAlign = 'top'">
                            <img :src="VerticalAlignTopIcon" />
                          </button>
                          <button class="btn-more" :class="{active: (element.vAlign || 'middle') === 'middle'}" @click="element.vAlign = 'middle'">
                            <img :src="VerticalAlignCenterIcon" />
                          </button>
                          <button class="btn-more" :class="{active: element.vAlign === 'bottom'}" @click="element.vAlign = 'bottom'">
                            <img :src="VerticalAlignBottomIcon" />
                          </button>
                        </div>
                      </div>
                      <div></div>
                    </template>
                  </Popper>
                  
                  <input class="input-title" type="text" v-model="element.title" placeholder="Column name"/>
                </div>
                <ul class="list-selected-field">
                  <li v-for="vfCode in element.fieldCodes" :key="vfCode">
                    <img v-if="mapFieldInfo[vfCode]?.vfType === VfType.ICON" class="icon-selected":src="mapFieldInfo[vfCode]?.value" />
                    <span v-else>{{ mapFieldInfo[vfCode]?.vfTitle }}</span>
                  </li>
                  <li v-show="!element.fieldCodes.length" class="no-data">Kéo field vào đây</li>
                </ul>
              </div>
              <div>
                <button class="btn btn-close" @click.stop="closeIndex(index)">
                  ✘
                </button>
              </div>
            </li>
          </template>
        </draggable>
      </div>

      <div class="edit-columns">
        <h5>Fields</h5>
        <hr style="margin: 5px 0"/>
          <ul class="list-field custom-scroll">
            <li v-for="field in listFields" :key="field.field">
              <div class="label">{{ field.title }}:</div>
              <div class="item" draggable="true" @dragstart="e => onDragstart(e, vfield)" v-for="vfield in field.variants" :key="vfield.vfCode"> {{ vfield.vfTitle }} </div>
            </li>
          </ul>
      </div>
      <div class="edit-columns">
        <div>
          <h5>Separator</h5>
          <hr style="margin: 5px 0"/>
          <ul class="list-field-symbol">
            <li v-for="field in symbols" :key="field.vfAcutalField">
              <div class="item" draggable="true" @dragstart="e => onDragstart(e, field)"> {{ field.vfTitle }} </div>
            </li>
          </ul>
        </div>
        <div style="margin-top: 10px">
          <h5>Actions</h5>
          <hr style="margin: 5px 0"/>
          <ul class="list-field-symbol">
            <li v-for="field in actions" :key="field.vfAcutalField">
              <div class="item btn" draggable="true" @dragstart="e => onDragstart(e, field)"> {{ field.vfTitle }} </div>
            </li>
          </ul>
        </div>
        <div style="margin-top: 10px">
          <h5>Icons</h5>
          <hr style="margin: 5px 0"/>
          <ul class="list-field-symbol">
            <li v-for="field in icons" :key="field.vfAcutalField">
              <img :src="field.value" class="icon" draggable="true" @dragstart="e => onDragstart(e, field)"/>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import draggable from "vuedraggable";
import { toJson } from '@/utils/parse';
import { VfField, VariantsField, Column, VfType } from '@/interfaces/table';
import { symbols } from '@/constants/symbols';
import Popper from "vue3-popper";

import AlignLeftIcon from '@/assets/icons/align-left.svg';
import AlignCenterIcon from '@/assets/icons/align-center.svg';
import AlignRightIcon from '@/assets/icons/align-right.svg';
import VerticalAlignTopIcon from '@/assets/icons/vertal-align-top.svg';
import VerticalAlignCenterIcon from '@/assets/icons/vertal-align-center.svg';
import VerticalAlignBottomIcon from '@/assets/icons/vertal-align-bottom.svg';

interface Props {
  modelValue: Column[];
  vfFields: VfField[];
  actions: VfField[];
  icons: VfField[];
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", ColumnEdit: Column[]): void;
}>();

const columnsEdit = computed({
  get() {
    return props.modelValue;
  },
  set(values: Column[]) {
    emit("update:modelValue", values);
  }
})

const columnsTemplate = computed(() => {
  return [...symbols, ...props.actions, ...props.icons, ...props.vfFields];
});

const mapFieldInfo = computed(() => {
  return columnsTemplate.value.reduce((map: {[vfCode: string]: VfField}, field: VfField) => {
    map[field.vfCode] = field;
    return map;
  }, {});
});

const listFields = computed<VariantsField[]>(() => {
  const mapField: {[field: string]: number} = {};
  const list: VariantsField[] = [];

  for(const vfField of props.vfFields) {
    if (mapField[vfField.vfAcutalField] === undefined) {
      list.push({
        title: vfField.vfActualFieldTitle || '',
        field: vfField.vfAcutalField,
        variants: [vfField],
      });

      mapField[vfField.vfAcutalField] = list.length - 1;
    } else {
      list[mapField[vfField.vfAcutalField]].variants.push(vfField);
    }
  }

  return list;
});

const onAddColumn = () => {
  emit('update:modelValue', [
    ...props.modelValue,
    {
      title: '',
      fieldCodes: [],
      isDrag: false,
    }
  ]);
};

const onDragstart = (e: any, field: VfField) => {
  e.dataTransfer.setData("text", JSON.stringify(field));
}

const onDragover = (e: any, colum: Column,) => {
  e.preventDefault();
  colum.isDrag = true;
}

const onDragleave = (e: any, colum: Column,) => {
  e.preventDefault();
  colum.isDrag = false;
}

const onDrop = (e: any, colum: Column) => {
  e.preventDefault();
  const data = toJson(e.dataTransfer.getData("text"));
  if (data && data.vfCode) {
    colum.fieldCodes.push(data.vfCode);
  }
  colum.isDrag = false;
}

const closeIndex = (index: number) => {
  const values = props.modelValue;
  const column = values[index];
  if (column.fieldCodes.length > 0) {
    column.fieldCodes.length = 0;
  } else {
    values.splice(index, 1);
  }
  emit('update:modelValue', values);
}
</script>

<style lang="scss" scoped>
.box {
  &.box-grid {
    padding: 10px;
    height: 390px;
  }
}

.grid-col-2 {
  display: grid;
  grid-template-columns: 3fr 2fr 1fr;
  height: calc(100% - 10px);

  .edit-columns {
    border: 1px solid #DDD;
    border-radius: 5px;
    padding: 5px;
    width: calc(100% - 15px);
    min-height: calc(100% - 15px);
    height: 100%;
    
    h5 {
      margin: 0;
    }

    .btn-plus {
      width: 30px;
      padding: 1px 0;
      cursor: pointer;
      color: rgb(35, 32, 211);
      border: 1px solid;
      border-radius: 5px;
    }

    ul.list-field {
      padding-left: 0;
      list-style: none;
      margin: 0;
      max-height: calc(100% - 33px);
      li {
        border-radius: 5px;
        white-space: nowrap;
        padding: 2px 4px;
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        font-size: 12px;

        &:first-child {
          margin-left: 4px;
        }

        &.no-data {
          color: #999;
        }

        .label {

        }
        .item {
          border-radius: 5px;
          border: 1px solid #DDD;
          padding: 2px 4px;
          margin-left: 4px;
          min-width: 20px;
          text-align: center;
          cursor: grab;
        }
      }

      li + li {
        margin-left: 4px;
      }
    }

    ul.list-field-symbol {
      padding-left: 0;
      list-style: none;
      margin: 0;
      display: block;
      min-width: 20px;
      li {
        display: inline-block;
        margin-bottom: 4px;

        .item, .icon {
          border-radius: 5px;
          border: 1px solid #DDD;
          padding: 2px 4px;
          margin-left: 4px;
          min-width: 20px;
          text-align: center;
          cursor: grab;
        }

        .icon {
          height: 18px;
        }
      }
    }
  }

  .edit-columns + .edit-columns {
    margin-left: 5px;
  }
}

ul.list-group {
  padding-left: 0;
  max-height: calc(100% - 33px);
  overflow-y: auto;
  margin: 0;
  list-style: none;
  li.list-group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    margin-top: 4px;
    border: 1px solid #DDD;
    border-radius: 5px;

    &.hover {
      border-color: #F00;
    }

    &.sortable-chosen {
      border-color: #F00;
      cursor: move;
    }

    .label {
      width: 100%;
      .input-title {
        border: none;
        border-bottom: 1px #ddd dotted;
        outline: none;
        width: 120px;
        margin-left: 4px;
      }

      .handle {
        cursor: move;
      }

      .btn-more {
        background: none;
        border-radius: 5px;
        border: 1px solid #DDD;
        cursor: pointer;
        margin: 0 2px;

        &:hover, &.active {
          color: #2320d3;
          border-color: #2320d3;
        }

        img {
          width: 20px;
          width: 20px
        }
      }

      ul.list-selected-field {
        padding-left: 0;
        list-style: none;
        margin: 0;
        li {
          border: 1px solid #DDD;
          border-radius: 5px;
          white-space: nowrap;
          padding: 2px 4px;
          display: inline-block;
          margin-bottom: 4px;
          font-size: 12px;
          min-width: 20px;
          text-align: center;

          &:first-child {
            margin-left: 4px;
          }

          &:has(.icon-selected) {
            padding: 2px;
          }

          .icon-selected {
            height: 12px;
            margin-bottom: -2px;
          }

          &.no-data {
            border: none;
            color: #999;
          }
        }
        li + li {
          margin-left: 4px;
        }
      }
    }

    .btn {
      width: 30px;
      cursor: pointer;
      border: 1px solid;
      border-radius: 5px;

      &.btn-edit {
        color: #9290f0;
      }

      &.btn-close {
        color: #F00;
      }
    }

    .btn + .btn {
      margin-left: 4px;
    }
  }
}
</style>