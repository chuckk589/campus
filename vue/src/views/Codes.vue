<template>
  <div class="h-100">
    <div class="d-flex mb-2">
      <v-btn
        @click="addCodes"
        class="mr-2"
        size="small"
        color="success"
        variant="outlined"
        >Добавить код</v-btn
      >
      <v-btn @click="deleteCodes" size="small" color="error" variant="outlined"
        >Удалить выбранное</v-btn
      >
    </div>

    <AgGridVue
      class="ag-theme-alpine"
      style="height: calc(100% - 30px)"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :embed-full-width-rows="true"
      :animate-rows="true"
      pagination
      :suppressCellFocus="true"
      :suppressRowClickSelection="true"
      :get-row-id="getRowId"
      :row-data="rowData"
      :animateRows="true"
      rowSelection="multiple"
      rowMultiSelectWithClick
      @grid-ready="onGridReady"
    >
    </AgGridVue>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import CodeCell from '../components/cellRenderers/CodeCell.vue';
export default {
  name: 'CodesView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    CodeCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          headerCheckboxSelection: true,
          checkboxSelection: true,
        },
        { field: 'value', headerName: 'Значение' },
        {
          field: 'status',
          headerName: 'Статус',
          valueFormatter: (params) =>
            this.$ctable.code_status.find((c) => c.value == params.value)
              ?.title,
          sortable: true,
        },
        {
          field: 'createdAt',
          headerName: 'Дата создания',
          sortable: true,
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
        {
          field: 'action',
          headerName: '',
          filter: false,
          sortable: false,
          cellRenderer: 'CodeCell',
        },
      ],

      gridApi: null,
      defaultColDef: {
        sortable: true,
        flex: 1,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      rowData: [],
    };
  },
  beforeUnmount() {
    this.$emitter.off('delete-code');
    this.$emitter.off('new-code');
    this.$emitter.off('edit-code');
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/code/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
      this.$emitter.on('delete-code', (ids) => {
        this.$http({
          method: 'DELETE',
          url: `/v1/code?ids=${ids.join(',')}`,
        }).then((res) => {
          setTimeout(
            () =>
              this.gridApi.applyTransaction({
                remove: res.data.map((id) => this.gridApi.getRowNode(id)),
              }),
            0,
          );
        });
      });
      this.$emitter.on('new-code', (evt) => {
        setTimeout(() => this.gridApi.applyTransaction({ add: evt }), 0);
      });
      this.$emitter.on('edit-code', (evt) => {
        console.log(evt);
        const index = this.rowData.findIndex((c) => c.id == evt.id);
        this.rowData[index] = evt;
        this.gridApi.applyTransaction({ update: [evt] });
        this.gridApi.refreshCells({ force: true });
      });
    },
    addCodes() {
      this.$emitter.emit('openModal', {
        url: `/code/`,
        method: 'POST',
        header: 'Добавить',
        eventName: 'new-code',
        fields: [
          {
            label: 'Кол-во',
            key: 'amount',
          },
        ],
      });
    },
    deleteCodes() {
      const selectedRows = this.gridApi.getSelectedRows();
      if (!selectedRows.length) return;
      const ids = selectedRows.map((c) => c.id);
      this.$emitter.emit('openDialog', {
        header: 'Удаление кодов',
        message: 'Вы уверены, что хотите удалить коды?',
        eventName: 'delete-code',
        id: ids,
      });
    },
  },
};
</script>
