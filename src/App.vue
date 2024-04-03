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
  <hr/>
  <div class="grid">
    <div class="grid-item">
      <h4>Table data</h4>
        <textarea v-model="dataEdit" />
    </div>
    <div class="grid-item">
      <h4>Template columns</h4>
      <textarea v-model="columnsEdit" />
    </div>
    <div class="grid-item">
      <h4>Columns</h4>
      <div class="box">
        <draggable
          tag="ul"
          :list="columnEdit"
          class="list-group"
          item-key="alias"
          @move="onMove"
          @update="onUpdate"
        >
          <template #item="{ element }">
            <li class="list-group-item">
              ☰ {{ element.name }}
            </li>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DynamicTable from '@/components/DynamicTable.vue';
import { Column } from '@/interfaces/table';
import draggable from "vuedraggable";

const columns = ref<string[]>([
  "id", "name", "name2", "status", "gender", "major", "gpa", "prorince", "address", "courses", "courses2", "action"
]);

const columnEdit = computed({
  get() {
    return columns.value.map((colum: string) => {
      return {
        alias: colum,
        name: mapColumnsTemplate.value[colum],
      }
    })
  },

  set(values) {
    columns.value = values.reduce((arr: string[], value: {alias: string, name: string}) => {
      arr.push(value.alias);
      return arr;
    }, []);
  }
});

const onMove = () => {
  return true;
}
const onUpdate = (evt) => {
  const oldIndex: number = evt.oldIndex;
  const newIndex: number = evt.newIndex;
  columns.value = moveIndexOfArray<string>(columns.value, oldIndex, newIndex);
}

function moveIndexOfArray<T>(array: T[], oldIndex: number, newIndex: number): T[] {
  if (oldIndex >= array.length || oldIndex < 0 || newIndex >= array.length || newIndex < 0 || oldIndex === newIndex) {
    return array;
  }
  const newArray = [...array];
  const element = newArray.splice(oldIndex, 1)[0];
  newArray.splice(newIndex, 0, element);
  return newArray;
}

const columnsTemplate = ref<Column[]>([
  {
    alias: 'id',
    field: 'id',
    name: 'Mã SV',
  },

  {
    alias: 'name',
    field: 'name',
    name: 'Họ tên',
    cssValue: "name"
  },
  {
    alias: 'name2',
    name: 'Name mixed',
    templateShow: '<div>{{name}}<div><div>{{major}}</div>',
  },
  {
    alias: 'status',
    field: 'status',
    name: 'Trạng thái',
    enum: {
      dropout: 'Thôi học',
      studying: 'Đang học',
      graduate: 'Tốt nghiệp'
    }
  },
  {
    alias: 'gender',
    field: 'gender',
    name: 'Giới tính',
  },
  {
    alias: 'major',
    field: 'major',
    name: 'Ngành học',
  },
  {
    alias: 'gpa',
    field: 'GPA',
    name: 'Điểm trung bình',
  },
  {
    alias: 'courses',
    field: 'courses',
    name: 'Các khóa học (default)',
  },
  {
    alias: 'courses2',
    field: 'courses',
    name: 'Các khóa học (template)',
    templateShow: '<div>{{$item}}</div>',
  },
  {
    alias: 'prorince',
    field: 'address.provinceName',
    name: 'Tỉnh/TP',
  },
  {
    alias: 'address',
    name: 'Địa chỉ',
    templateShow: '{{address.districtName}}, {{address.provinceName}}',
  },

  {
    alias: 'action',
    name: 'Action',
  },
]);

const mapColumnsTemplate = computed(() => {
  return columnsTemplate.value.reduce((map: {[alias: string]: string}, item) => {
    map[item.alias] = item.name;
    return map;
  }, {});
});

const columnsEdit = computed({
  get(): string {
    return JSON.stringify(columnsTemplate.value);
  },
  set(value) {
    columnsTemplate.value = JSON.parse(value);
  }
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
    return JSON.stringify(data.value);
  },
  set(value) {
    data.value = JSON.parse(value);
  }
});

const onDetail = (row: any) => {
  console.log("Detail", row);
}

const onEdit = (row: any) => {
  console.log("Edit", row);
}

const onDelete = (row: any) => {
  console.log("Delete", row);
}

const onSelect = (column: string, row: any) => {
  // console.log(column, row);
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
  grid-template-columns: auto auto auto;

  h4 {
    margin-bottom: 10px;
  }
  
  .grid-item + .grid-item {
    margin-left: 10px;
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
  padding-left: 10px;
  margin: 0;
  list-style: none;
  li {
    cursor: pointer;
    margin-top: 6px;
    &:first-child {
      margin-top: 0;
    }

    &.sortable-chosen {
      color: #F00;
    }
  }
}

::v-deep {
  .dynamic-table {
    .name {
      color: #F00;
    }
  }
}
</style>
