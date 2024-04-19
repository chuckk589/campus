<template>
  <div class="d-flex mb-2">
    <v-btn
      @click="getExtension"
      class="mr-2"
      size="small"
      :loading="loading"
      :disabled="loading"
      color="success"
      variant="outlined"
      >Сгенерировать расширение</v-btn
    >
    <v-btn
      @click="dropEverything"
      class="mr-2"
      size="small"
      color="error"
      variant="outlined"
      >Очистить все</v-btn
    >
  </div>
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
  >
  </AgGridVue>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import ConfigCell from '../components/cellRenderers/ConfigCell.vue';
export default {
  name: 'SettingsView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    ConfigCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          hide: true,
        },
        { field: 'name', headerName: 'Имя' },
        {
          field: 'value',
          headerName: 'Значение',
          valueFormatter: this.privateFormatter,
        },

        { field: 'description', headerName: 'Описание' },
        {
          field: 'action',
          headerName: '',
          filter: false,
          sortable: false,
          maxWidth: 70,
          cellRenderer: 'ConfigCell',
        },
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
      loading: false,
    };
  },
  beforeUnmount() {
    this.$emitter.off('edit-config');
    this.$emitter.off('drop-db');
  },
  methods: {
    privateFormatter(params) {
      if (params.data.category == 'secret') {
        return '******';
      }
    },
    getExtension() {
      this.loading = true;
      this.$http({
        method: 'GET',
        url: `/v1/status/version/`,
        responseType: 'blob',
      })
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'campus-chrome.zip');
          document.body.appendChild(link);
          link.click();
          link.remove();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    dropEverything() {
      this.$emitter.emit('openDialog', {
        header: 'Очистка базы данных',
        message:
          'Вы уверены, что хотите удалить все данные? (шаблоны и настройки затронуты не будут)',
        eventName: 'drop-db',
      });
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/status/configs/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
      this.$emitter.on('edit-config', (evt) => {
        if (!evt || evt.category == 'secret') return;
        const rowNode = this.gridApi.getRowNode(evt.id);
        rowNode.setData(evt);
      });
      this.$emitter.on('drop-db', (id) => {
        this.$http({
          method: 'DELETE',
          url: `/v1/status/drop`,
        }).then(() => {
          this.$emitter.emit('alert', {
            header: 'Готово',
            color: 'info',
            text: `Данные успешно удалены`,
          });
        });
      });
    },
  },
};
</script>
