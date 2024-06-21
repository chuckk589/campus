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
    <v-btn
      @click="addPatterns"
      class="mr-2"
      size="small"
      color="success"
      variant="outlined"
      >Импорт шаблонов</v-btn
    >
    <input
      ref="uploader"
      class="d-none"
      type="file"
      accept=".zip"
      @input="onFileChanged"
    />
  </div>
  <AgGridVue
    class="ag-theme-alpine"
    :column-defs="columnDefs"
    :default-col-def="defaultColDef"
    suppressCellFocus
    :get-row-id="getRowId"
    animateRows
    rowModelType="serverSide"
    :serverSideDatasource="serverSideDatasource"
    serverSideStoreType="partial"
    cacheBlockSize="30"
    style="height: 100%"
    @grid-ready="onGridReady"
    suppressRowClickSelection
    suppressExcelExport
    detailRowAutoHeight="true"
    pagination
    :detailCellRenderer="detailCellRenderer"
    :detailCellRendererParams="detailCellRendererParams"
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
          maxWidth: 150,
          field: 'id',
        },
        { field: 'question_hash', headerName: 'Хэш вопроса' },

        { field: 'question_type', headerName: 'Тип', maxWidth: 100 },
        { field: 'jsonAnswer', headerName: 'JSON', sortable: false },
        {
          field: 'state',
          headerName: 'Статус',
          valueFormatter: (params) =>
            this.$ctable.que_result.find((c) => c.value == params.value)?.title,
        },
        { field: 'updatedBy', headerName: 'Заполнен' },
        {
          field: 'createdAt',
          headerName: 'Дата создания',
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
      ],
      detailCellRenderer: 'AnswerCell',
      detailCellRendererParams: {
        url: '/v1/answers/',
      },
      gridApi: null,
      defaultColDef: {
        sortable: true,
        filter: true,
        flex: 1,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      serverSideDatasource: null,
      filtering: true,
    };
  },
  beforeUnmount() {
    this.$emitter.off('edit-answer');
  },
  methods: {
    addPatterns() {
      this.$refs.uploader.click();
    },
    onFileChanged(e) {
      if (e.target.files.length == 0) return;
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      const headers = { 'Content-Type': 'multipart/form-data' };
      this.$http.post('/v1/answers/', formData, headers).then((res) => {
        this.$refs.uploader.value = null;
        this.$emitter.emit('alert', {
          header: 'Готово',
          color: 'info',
          text: `Добавлено: ${res.data.result.success} новых шаблонов\nОбновлено: ${res.data.result.updated}\nОшибок в файлах: ${res.data.result.errored}`,
        });
      });
    },
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
    onGridReady(params) {
      this.gridApi = params.api;
      this.serverSideDatasource = {
        getRows: (params) => {
          this.$http({
            method: 'POST',
            url: `/v1/answers/load`,
            data: params.request,
          }).then((res) => {
            params.success({
              rowData: res.data.rows,
            });
          });
        },
      };
      this.$emitter.on('edit-answer', (evt) => {
        const node = this.gridApi.getRowNode(evt.id);
        node.setExpanded(false);
        node.setData(evt);
      });
    },
  },
};
</script>
