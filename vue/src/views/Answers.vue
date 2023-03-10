<template>
  <div class="d-flex mb-2">
    <v-btn
      @click="filterPending"
      class="mr-2"
      size="small"
      color="success"
      :variant="filtering ? 'flat' : 'outlined'"
      >Требующие ответа</v-btn
    >
    <v-btn @click="deleteAnswers" size="small" color="error" variant="outlined"
      >Удалить выбранное</v-btn
    >
  </div>
  <AgGridVue
    class="ag-theme-alpine"
    :column-defs="columnDefs"
    :default-col-def="defaultColDef"
    suppressCellFocus
    :get-row-id="getRowId"
    :row-data="rowData"
    animateRows
    style="height: 100%"
    @grid-ready="onGridReady"
    suppressRowClickSelection
    suppressExcelExport
    detailRowAutoHeight="true"
    pagination
    :detailCellRenderer="detailCellRenderer"
    :isExternalFilterPresent="isExternalFilterPresent"
    :doesExternalFilterPass="doesExternalFilterPass"
    masterDetail
  >
  </AgGridVue>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import AnswerCell from '../components/cellRenderers/AnswerCell.vue';
export default {
  name: 'AnswersView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    AnswerCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          cellRenderer: 'agGroupCellRenderer',
          field: 'id',
        },
        { field: 'question_hash', headerName: 'Хэш вопроса' },

        { field: 'question_type', headerName: 'Тип' },
        { field: 'jsonAnswer', headerName: 'JSON' },
        {
          field: 'createdAt',
          headerName: 'Дата создания',
          sortable: true,
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
      ],
      defaultCsvExportParams: null,
      detailCellRenderer: 'AnswerCell',
      gridApi: null,
      defaultColDef: {
        sortable: true,
        filter: true,
        flex: 1,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      rowData: [],
      filtering: true,
    };
  },
  beforeUnmount() {
    this.$emitter.off('edit-answer');
  },
  methods: {
    filterPending() {
      this.filtering = !this.filtering;
      this.gridApi.onFilterChanged();
    },
    isExternalFilterPresent() {
      return this.filtering;
    },
    doesExternalFilterPass(node) {
      if (node.data) {
        return node.data.jsonAnswer == null;
      }
      return true;
    },
    deleteAnswers() {
      console.log('todo');
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/answers/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
      this.$emitter.on('edit-answer', (evt) => {
        console.log(evt);
        const node = this.gridApi.getRowNode(evt.id);
        node.setExpanded(false);
        const index = this.rowData.findIndex((c) => c.id == evt.id);
        this.rowData[index] = evt;
        this.gridApi.applyTransaction({ update: [evt] });
        this.gridApi.refreshCells({ force: true });
      });
    },
  },
};
</script>
