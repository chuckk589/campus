<template>
  <AgGridVue
    class="ag-theme-alpine"
    :column-defs="columnDefs"
    :default-col-def="defaultColDef"
    animateRows
    suppressCellFocus
    :get-row-id="getRowId"
    :row-data="rowData"
    rowSelection="multiple"
    suppressRowClickSelection
    pagination
    style="height: 100%"
    @grid-ready="onGridReady"
    suppressExcelExport
  >
  </AgGridVue>
  <h4 class="accesshide">Текст вопроса</h4>
  <input type="hidden" name="q848480:12_:sequencecheck" value="1" />
  <div class="qtext">
    <p>При решении задачи перечисления в комбинаторном анализе:</p>
  </div>
  <div class="ablock no-overflow visual-scroll-x">
    <div class="prompt">Выберите один или несколько ответов:</div>
    <div class="answer">
      <div class="r0">
        <input type="hidden" name="q848480:12_choice0" value="0" /><input
          type="checkbox"
          name="q848480:12_choice0"
          value="1"
          id="q848480:12_choice0"
          aria-labelledby="q848480:12_choice0_label"
        />
        <div
          class="d-flex w-auto"
          id="q848480:12_choice0_label"
          data-region="answer-label"
        >
          <div class="flex-fill ml-1">
            <p>в соединениях используются элементы несчётных множеств</p>
          </div>
        </div>
      </div>
      <div class="r1">
        <input type="hidden" name="q848480:12_choice1" value="0" /><input
          type="checkbox"
          name="q848480:12_choice1"
          value="1"
          id="q848480:12_choice1"
          aria-labelledby="q848480:12_choice1_label"
        />
        <div
          class="d-flex w-auto"
          id="q848480:12_choice1_label"
          data-region="answer-label"
        >
          <div class="flex-fill ml-1">
            <p>
              составляемые соединения содержат несчётное множество элементов
            </p>
          </div>
        </div>
      </div>
      <div class="r0">
        <input type="hidden" name="q848480:12_choice2" value="0" /><input
          type="checkbox"
          name="q848480:12_choice2"
          value="1"
          id="q848480:12_choice2"
          aria-labelledby="q848480:12_choice2_label"
        />
        <div
          class="d-flex w-auto"
          id="q848480:12_choice2_label"
          data-region="answer-label"
        >
          <div class="flex-fill ml-1">
            <p>составляемые соединения содержат конечное число элементов</p>
          </div>
        </div>
      </div>
      <div class="r1">
        <input type="hidden" name="q848480:12_choice3" value="0" /><input
          type="checkbox"
          name="q848480:12_choice3"
          value="1"
          id="q848480:12_choice3"
          aria-labelledby="q848480:12_choice3_label"
        />
        <div
          class="d-flex w-auto"
          id="q848480:12_choice3_label"
          data-region="answer-label"
        >
          <div class="flex-fill ml-1">
            <p>применяются основные комбинаторные понятия</p>
          </div>
        </div>
      </div>
      <div class="r0">
        <input type="hidden" name="q848480:12_choice4" value="0" /><input
          type="checkbox"
          name="q848480:12_choice4"
          value="1"
          id="q848480:12_choice4"
          aria-labelledby="q848480:12_choice4_label"
        />
        <div
          class="d-flex w-auto"
          id="q848480:12_choice4_label"
          data-region="answer-label"
        >
          <div class="flex-fill ml-1">
            <p>могут применяться правило суммы и правило произведения</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
export default {
  name: 'UsersView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          maxWidth: 150,
        },
        { field: 'login', headerName: 'Логин' },
        { field: 'userId', headerName: 'ID кампус' },
        { field: 'name', headerName: 'Имя' },
        {
          field: 'createdAt',
          headerName: 'Дата регистрации',
          sortable: true,
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
        {
          field: 'isBanned',
          headerName: 'Заблокирован',
          sortable: true,
          valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
        },
      ],
      defaultCsvExportParams: null,
      gridApi: null,
      defaultColDef: {
        sortable: true,
        flex: 1,
        filter: true,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      rowData: [],
    };
  },
  beforeUnmount() {
    // this.$emitter.off('edit-user');
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/user/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
      // this.$emitter.on('edit-user', (evt) => {
      //   const rowNode = this.gridApi.getRowNode(evt.id);
      //   rowNode.setData(evt);
      // });
    },
  },
};
</script>
