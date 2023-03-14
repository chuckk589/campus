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
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
export default {
  name: 'ResultsView',
  components: {
    AgGridVue,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'Attempt ID',
          field: 'attemptId',
          maxWidth: 150,
        },
        { field: 'userName', headerName: 'Имя' },
        { field: 'startedAt', headerName: 'Начат' },
        { field: 'finishedAt', headerName: 'Закончен' },
        { field: 'status', headerName: 'Статус' },
        { field: 'timeElapsed', headerName: 'Затраченное время' },
        { field: 'points', headerName: 'Баллы' },
        { field: 'mark', headerName: 'Оценка' },
        { field: 'feedback', headerName: 'Отзыв' },
      ],
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
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/results/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
    },
  },
};
</script>
