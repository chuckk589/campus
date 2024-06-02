<template>
  <div class="h-100">
    <div class="d-flex mb-2">
      <v-btn
        @click="addBanned"
        class="mr-2"
        size="small"
        color="success"
        variant="outlined"
        >Добавить</v-btn
      >

      <v-btn @click="deleteBanned" size="small" color="error" variant="outlined"
        >Удалить выбранное</v-btn
      >
    </div>
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
      style="height: calc(100% - 30px)"
      @grid-ready="onGridReady"
      suppressExcelExport
    >
    </AgGridVue>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import BanCell from '@/components/cellRenderers/BanCell.vue';
export default {
  name: 'BanlistView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    BanCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          headerCheckboxSelection: true,
          checkboxSelection: true,
          maxWidth: 150,
        },
        { field: 'login', headerName: 'Логин' },
        { field: 'userId', headerName: 'ID кампус' },
        { field: 'name', headerName: 'Имя' },
        {
          field: 'reason',
          headerName: 'Причина блокировки',
          sortable: true,
        },
        {
          field: 'createdAt',
          headerName: 'Дата блокировки',
          sortable: true,
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
        {
          field: 'action',
          headerName: '',
          filter: false,
          sortable: false,
          cellRenderer: 'BanCell',
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
  beforeUnmount() {
    this.$emitter.off('create-restriction');
    this.$emitter.off('edit-restriction');
  },
  methods: {
    addBanned() {
      this.$emitter.emit('openModal', {
        url: `/restriction/`,
        method: 'POST',
        header: 'Заблокировать',
        eventName: 'create-restriction',
        fields: [
          {
            label: 'ID кампус',
            key: 'userId',
          },
          {
            label: 'Причина блокировки',
            key: 'reason',
          },
        ],
      });
    },
    deleteBanned() {
      const selectedRows = this.gridApi.getSelectedRows();
      if (!selectedRows.length) return;
      const ids = selectedRows.map((c) => c.id);
      this.$http({
        method: 'DELETE',
        url: `/v1/restriction?ids=${ids.join(',')}`,
      }).then((res) => {
        setTimeout(
          () =>
            this.gridApi.applyTransaction({
              remove: res.data.map((id) => this.gridApi.getRowNode(id)),
            }),
          0,
        );
      });
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/restriction` }).then((res) => {
        this.gridApi.setGridOption('rowData', res.data);
      });
      this.$emitter.on('edit-restriction', (evt) => {
        const rowNode = this.gridApi.getRowNode(evt.id);
        rowNode.setData(evt);
      });
      this.$emitter.on('create-restriction', (evt) => {
        this.gridApi.applyTransaction({ add: [evt] });
      });
    },
  },
};
</script>
