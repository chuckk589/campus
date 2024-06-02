<template>
  <AgGridVue
    class="ag-theme-alpine"
    :column-defs="columnDefs"
    :default-col-def="defaultColDef"
    animateRows
    suppressCellFocus
    :get-row-id="getRowId"
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
          cellDataType: false,
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
    };
  },

  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/user/` }).then((res) => {
        this.gridApi.setGridOption('rowData', res.data);
      });
    },
  },
};
</script>
