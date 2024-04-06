<template>
  <DynamicTable :columns="columns" :columnTemplate="columnsTemplate" :data="data" @select="onSelect">
    <template #name="{row}">
      <a href="#"> {{ row.name }} </a>
    </template>
    
    <template #action="{row}">
      <span class="link" @click="onDetail(row)"> Detail </span> |
      <span class="link" @click="onEdit(row)"> Edit </span> |
      <span class="link" @click="onDelete(row)"> Delete </span>
    </template>
  </DynamicTable>

  <hr style="margin: 20px 0 0"/>

  <div class="grid">
    <div class="grid-item">
      <h4>Build columns</h4>
      <div class="box">
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
              v-model="columns"
              class="dragArea list-group"
              item-key="alias"
              group="people"
              handle=".handle"
            >
              <template #item="{ element, index }">
                <li class="list-group-item" :class="{'hover': element.isDrag}">
                  <div class="label align-items-center" @drop="e => onDrop(e, element)" @dragover="e => onDragover(e, element)" @dragleave="e => onDragleave(e, element)">
                    <div class="align-items-center">
                      <span class="handle">☰</span> <input class="input-title" type="text" v-model="element.title" placeholder="Column name"/>
                    </div>
                    <ul class="list-selected-field">
                      <li v-for="vfCode in element.fieldCodes" :key="vfCode"> {{ mapFieldInfo[vfCode]?.vfTitle }} </li>
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
              <ul class="list-field">
                <li v-for="field in listFields" :key="field.field">
                  <div class="label">{{ field.title }}:</div>
                  <div class="item" draggable="true" @dragstart="e => onDragstart(e, vfield)" v-for="vfield in field.variants" :key="vfield.vfCode"> {{ vfield.vfTitle }} </div>
                </li>
              </ul>
          </div>
          <div class="edit-columns">
            <h5>Symbol</h5>
            <hr style="margin: 5px 0"/>
              <ul class="list-field">
                <li v-for="field in listSymbol" :key="field.field">
                  <div class="label">{{ field.title }}:</div>
                  <div class="item" draggable="true" @dragstart="e => onDragstart(e, vfield)" v-for="vfield in field.variants" :key="vfield.vfCode"> {{ vfield.vfTitle }} </div>
                </li>
              </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="grid-item">
      <h4>Template columns</h4>
      <textarea v-model="vfFieldsEdit" />
    </div>
    <div class="grid-item">
      <h4>Table data</h4>
        <textarea v-model="dataEdit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DynamicTable from '@/components/DynamicTable.vue';
import { VfField, VfType, VariantsField, Column } from '@/interfaces/table';
import draggable from "vuedraggable";
import { toJson } from '@/utils/parse';

interface ColumnEdit extends Column {
  isDrag: boolean;
}

const columnsTemplate = computed(() => {
  return [...symbols.value, ...vfFields.value];
});

const mapFieldInfo = computed(() => {
  return columnsTemplate.value.reduce((map: {[vfCode: string]: VfField}, field: VfField) => {
    map[field.vfCode] = field;
    return map;
  }, {});
});

const symbols = ref<VfField[]> ([
  {
    vfTitle: '⌴',
    vfCode: 'space',
    vfType: VfType.SYMBOL,
    vfAcutalField: 'space',
    vfActualFieldTitle: 'Dấu cách',
    value: '&nbsp;',
  },
  {
    vfTitle: '↩',
    vfCode: 'newline',
    vfType: VfType.SYMBOL,
    vfAcutalField: 'newline',
    vfActualFieldTitle: 'NewLine',
    value: '<br/>',
  },
  {
    vfTitle: '-',
    vfCode: 'minus',
    vfType: VfType.SYMBOL,
    vfAcutalField: 'minus',
    vfActualFieldTitle: 'Dấu trừ',
    value: '&minus;',
  },
  {
    vfTitle: '|',
    vfCode: 'vertical',
    vfType: VfType.SYMBOL,
    vfAcutalField: 'vertical',
    vfActualFieldTitle: 'Dấu dọc',
    value: '|',
  },
]);

const listSymbol = computed<VariantsField[]>(() => {
  const mapField: {[field: string]: number} = {};
  const list: VariantsField = [];

  for(const vfField of symbols.value) {
    if (mapField[vfField.vfAcutalField] === undefined) {
      list.push({
        title: vfField.vfActualFieldTitle,
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
const vfFields = ref<VfField[]> ([
  {
    vfTitle: 'Mã SV',
    vfCode: 'id',
    vfType: VfType.DATA,
    vfAcutalField: 'id',
    vfActualFieldTitle: 'Mã SV',
  },
  {
    vfTitle: 'MSV: {{value}}',
    vfCode: 'id2',
    vfType: VfType.DATA,
    vfAcutalField: 'id',
    vfActualFieldTitle: 'Mã SV',
    templateShow: 'MSV: {{value}}',
  },
  {
    vfTitle: 'Họ Tên',
    vfCode: 'name',
    vfType: VfType.DATA,
    vfAcutalField: 'name',
    vfActualFieldTitle: 'Họ tên',
  },
  {
    vfTitle: 'Tuổi',
    vfCode: 'age',
    vfType: VfType.DATA,
    vfAcutalField: 'age',
    vfActualFieldTitle: 'Tuổi',
  },
  {
    vfTitle: 'Giới tính',
    vfCode: 'gender',
    vfType: VfType.DATA,
    vfAcutalField: 'gender',
    vfActualFieldTitle: 'Giới tính',
  },
  {
    vfTitle: 'Ngành học',
    vfCode: 'major',
    vfType: VfType.DATA,
    vfAcutalField: 'major',
    vfActualFieldTitle: 'Ngành học',
  },
  {
    vfTitle: 'Điểm trung bình',
    vfCode: 'gpa',
    vfType: VfType.DATA,
    vfAcutalField: 'GPA',
    vfActualFieldTitle: 'Điểm trung bình',
  },
  {
    vfTitle: 'ĐTB: {{value}}',
    vfCode: 'gpa2',
    vfType: VfType.DATA,
    vfAcutalField: 'GPA',
    vfActualFieldTitle: 'Điểm trung bình',
    templateShow: 'ĐTB: {{value}}',
  },
  {
    vfTitle: 'Trạng thái',
    vfCode: 'status',
    vfType: VfType.DATA,
    vfAcutalField: 'status',
    enum: {
      dropout: 'Thôi học',
      studying: 'Đang học',
      graduate: 'Tốt nghiệp'
    },
    vfActualFieldTitle: 'Trạng thái',
  },
  {
    vfTitle: 'Tỉnh/TP',
    vfCode: 'provinceName',
    vfType: VfType.DATA,
    vfAcutalField: 'address.provinceName',
    vfActualFieldTitle: 'Tỉnh/TP',
  },
  {
    vfTitle: 'Quận/Huyện',
    vfCode: 'districtName',
    vfType: VfType.DATA,
    vfAcutalField: 'address.districtName',
    vfActualFieldTitle: 'Quận/Huyện',
  },
]);

const vfFieldsEdit = computed({
  get(): string {
    return JSON.stringify(vfFields.value, null, 2);
  },
  set(value: string) {
    vfFields.value = JSON.parse(value);
  }
});

const listFields = computed<VariantsField[]>(() => {
  const mapField: {[field: string]: number} = {};
  const list: VariantsField = [];

  for(const vfField of vfFields.value) {
    if (mapField[vfField.vfAcutalField] === undefined) {
      list.push({
        title: vfField.vfActualFieldTitle,
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

const data = ref([
  {
    id: 1,
    name: "Nguyễn Văn A",
    age: 20,
    gender: "Nam",
    major: "Khoa học máy tính",
    GPA: 3.5,
    courses: ["Introduction to Programming", "Data Structures", "Algorithms"],
    status: 'dropout',
    address: {
      prorinceId: 1,
      provinceName: 'Hà Nội',
      districtId: 1,
      districtName: 'Hoàng Mai',
    }
  },
  {
    id: 2,
    name: "Trần Thị B",
    age: 21,
    gender: "Nữ",
    major: "Kinh doanh",
    GPA: 3.2,
    courses: ["Marketing", "Accounting", "Business Communication"],
    status: 'studying',
    address: {
      prorinceId: 1,
      provinceName: 'Hà Nội',
      districtId: 2,
      districtName: 'Cầu Giấy',
    }
  },
  {
    id: 3,
    name: "Lê Văn C",
    age: 19,
    gender: "Nam",
    major: "Kỹ thuật điện",
    GPA: 3.8,
    courses: ["Circuit Theory", "Digital Electronics", "Power Systems"],
    status: 'graduate',
    address: {
      prorinceId: 2,
      provinceName: 'HCM',
      districtId: 1,
      districtName: 'Quận 1',
    }
  },
  {
    id: 4,
    name: "Lê Văn D",
    age: 19,
    gender: "Nam",
    major: "Kỹ thuật điện",
    GPA: 3.8,
    courses: ["Circuit Theory", "Digital Electronics", "Power Systems"],
    status: 'graduate',
    address: {
      prorinceId: 2,
      provinceName: 'HCM',
      districtId: 1,
      districtName: 'Quận 1',
    }
  },
  {
    id: 5,
    name: "Lê Văn E",
    age: 19,
    gender: "Nam",
    major: "Kỹ thuật điện",
    GPA: 3.8,
    courses: ["Circuit Theory", "Digital Electronics", "Power Systems"],
    status: 'graduate',
    address: {
      prorinceId: 2,
      provinceName: 'HCM',
      districtId: 1,
      districtName: 'Quận 1',
    }
  }
]);

const dataEdit = computed({
  get(): string {
    return JSON.stringify(data.value, null, 2);
  },
  set(value) {
    data.value = JSON.parse(value);
  }
});

const columns = ref<ColumnEdit[]>([ { "title": "Mã sinh viên", "fieldCodes": [ "id" ], "isDrag": false }, { "title": "Họ và tên", "fieldCodes": [ "name" ], "isDrag": false }, { "title": "Ngành học", "fieldCodes": [ "major", "newline", "gpa2" ], "isDrag": false }, { "title": "Địa chỉ", "fieldCodes": [ "districtName", "space", "minus", "space", "provinceName" ], "isDrag": false }, { "title": "Giới tính", "fieldCodes": [ "gender", "newline", "age" ], "isDrag": false }, { "title": "Trạng thái", "fieldCodes": [ "status" ], "isDrag": false } ]);
const onAddColumn = () => {
  columns.value.push({
    title: '',
    fieldCodes: [],
    isDrag: false,
  })
}

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
  columns.value.splice(index, 1);
}
</script>

<style lang="scss" scoped>

.link {
  color: blue;
  cursor: pointer;
}

.box {
  border: 1px solid #DDD;
  border-radius: 5px;
  padding: 10px;
  height: 390px;
}

.grid {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;

  h4 {
    margin-bottom: 10px;
  }
  
  .grid-item + .grid-item {
    margin-left: 10px;
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
        li {
          // border: 1px solid #DDD;
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
            //
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
          }
        }

        li + li {
          margin-left: 4px;
        }
      }
    }

    .edit-columns + .edit-columns {
      margin-left: 5px;
    }
  }
}

textarea {
  resize: none;
  width: calc(100% - 10px);
  height: 400px;
  outline-color: #DDD;
  border: 1px solid #DDD;
  border-radius: 5px;
  padding: 5px;
}

ul.list-group {
  padding-left: 0;
  // padding-right: 10px;
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
      // cursor: pointer;
      width: 100%;
      .input-title {
        border: none;
        border-bottom: 1px #ddd dotted;
        outline: none;
        width: 150px;
        margin-left: 4px;
      }

      .handle {
        cursor: move;
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
