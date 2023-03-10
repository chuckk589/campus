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
    masterDetail
    detailRowAutoHeight
    :detailCellRendererParams="detailCellRendererParams"
  >
  </AgGridVue>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
export default {
  name: 'AttemptsView',
  components: {
    AgGridVue,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          cellRenderer: 'agGroupCellRenderer',
        },
        { field: 'userId', headerName: 'ID пользователя' },
        { field: 'userName', headerName: 'Имя' },
        { field: 'questionAmount', headerName: 'Кол-во вопросов' },
        { field: 'cmid', headerName: 'CMID' },
        { field: 'attemptId', headerName: 'Attempt ID' },
        {
          field: 'createdAt',
          headerName: 'Дата создания',
          sortable: true,
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
      ],
      gridApi: null,
      defaultColDef: {
        sortable: true,
        flex: 1,
        filter: true,
      },
      detailCellRendererParams: {
        detailGridOptions: {
          suppressCellFocus: true,
          columnDefs: [
            {
              headerName: 'ID',
              field: 'id',
            },
            { field: 'question_hash', headerName: 'Хэш вопроса' },
            { field: 'question_type', headerName: 'Тип' },
          ],
          defaultColDef: {
            sortable: true,
            filter: true,
            flex: 1,
          },
        },
        getDetailRowData: (params) => {
          params.successCallback(params.data.answers);
        },
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
      this.$http({ method: 'GET', url: `/v1/attempt/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
    },
  },
};
</script>
