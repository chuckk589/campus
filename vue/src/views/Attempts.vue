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
    rowModelType="serverSide"
    :serverSideDatasource="serverSideDatasource"
    serverSideStoreType="partial"
    cacheBlockSize="30"
    pagination
    style="height: 100%"
    @grid-ready="onGridReady"
    masterDetail
    detailRowAutoHeight
    :detailCellRendererParams="detailCellRendererParams"
    enableCellTextSelection
  >
  </AgGridVue>
</template>

<script>
//  <!-- rowModelType="infinite"
//   cacheBlockSize="100"
//   cacheOverflowSize="2;"
//   maxConcurrentDatasourceRequests="2"
//   infiniteInitialRowCount="1"
//   maxBlocksInCache="2" -->
import { AgGridVue } from 'ag-grid-vue3';
import AttemptCell from '@/components/cellRenderers/AttemptCell.vue';
import AttemptAnswerCell from '@/components/cellRenderers/AttemptAnswerCell.vue';
import AnswerCell from '@/components/cellRenderers/AnswerCell.vue';
import PathCell from '@/components/cellRenderers/PathCell.vue';

export default {
  name: 'AttemptsView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    AttemptCell,
    // eslint-disable-next-line vue/no-unused-components
    AttemptAnswerCell,
    // eslint-disable-next-line vue/no-unused-components
    AnswerCell,
    // eslint-disable-next-line vue/no-unused-components
    PathCell,
  },
  data() {
    return {
      columnDefs: [
        {
          field: 'attemptId',
          headerName: 'Attempt ID',
          cellRenderer: 'agGroupCellRenderer',
        },
        { field: 'userName', headerName: 'Имя' },
        { field: 'questionAmount', headerName: 'Кол-во вопросов' },
        { field: 'path', headerName: 'Категории', cellRenderer: 'PathCell' },
        { field: 'cmid', headerName: 'CMID' },
        {
          field: 'status',
          headerName: 'Статус',
          valueFormatter: (params) =>
            this.$ctable.quiz_status.find((c) => c.value == params.value)
              ?.title,
        },
        {
          field: 'createdAt',
          headerName: 'Дата создания',
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
        {
          field: 'action',
          headerName: '',
          filter: false,
          sortable: false,
          cellRenderer: 'AttemptCell',
        },
      ],
      gridApi: null,
      defaultColDef: {
        sortable: true,
        flex: 1,
        filter: true,
      },
      serverSideDatasource: null,
      detailCellRendererParams: {
        detailGridOptions: {
          enableCellTextSelection: true,
          suppressCellFocus: true,
          detailCellRenderer: 'AnswerCell',
          detailCellRendererParams: {
            url: '/v1/attempt/pattern/',
          },
          masterDetail: true,
          detailRowAutoHeight: true,
          columnDefs: [
            {
              field: 'nativeId',
              cellRenderer: 'agGroupCellRenderer',
              headerName: 'ID',
              valueFormatter: (params) => +params.value + 1,
            },
            // {
            //   field: 'answered',
            //   headerName: 'Получен ответ',
            //   valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
            // },
            { field: 'jsonAnswer', headerName: 'JSON' },
            {
              field: 'result',
              headerName: 'Результат',
              valueFormatter: (params) =>
                this.$ctable.que_result.find((c) => c.value == params.value)
                  ?.title,
            },
            // {
            //   field: 'action',
            //   headerName: '',
            //   maxWidth: 70,
            //   cellRenderer: 'AttemptAnswerCell',
            // },
          ],
          defaultColDef: {
            sortable: true,
            filter: true,
            flex: 1,
          },
          // getDetailRowData: (params) => {
          //   params.successCallback(params.data.children);
          // },
        },
        getDetailRowData: (params) => {
          params.successCallback(params.data.answers);
        },
      },
      getRowId: function (params) {
        return params.data.id;
      },
    };
  },
  beforeUnmount() {
    this.$emitter.off('edit-attempt');
    // this.$emitter.off('edit-attempt-answer');
    this.$emitter.off('edit-answer');
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      // this.$http({ method: 'GET', url: `/v1/attempt/` }).then((res) => {
      //   this.rowData = res.data;
      //   this.gridApi.setRowData(res.data);
      // });
      this.serverSideDatasource = {
        getRows: (params) => {
          this.$http({
            method: 'POST',
            url: `/v1/attempt/lazy`,
            data: params.request,
          }).then((res) => {
            params.successCallback(res.data.rows, res.data.lastRow);
          });
        },
      };
      this.$emitter.on('edit-attempt', (evt) => {
        // const index = this.rowData.findIndex((c) => c.id == evt.id);
        // this.rowData[index] = evt;
        // this.gridApi.applyTransaction({ update: [evt] });
        // this.gridApi.refreshCells({ force: true });
        const node = this.gridApi.getRowNode(evt.id);
        node.setData(evt);
      });
      // this.$emitter.on('edit-attempt-answer', (evt) => {
      //   const row = this.rowData.find((c) =>
      //     c.answers.find((d) => d.id == evt.id),
      //   );
      //   row.answers[row.answers.findIndex((c) => c.id == evt.id)] = evt;
      //   setTimeout(() => this.gridApi.applyTransaction({ update: [row] }), 0);
      // });
      this.$emitter.on('edit-answer', (evt) => {
        // const row = this.rowData.find((c) =>
        //   c.answers.find((d) => d.id == evt.id),
        // );
        // row.answers[row.answers.findIndex((c) => c.id == evt.id)] = evt;
        // setTimeout(() => this.gridApi.applyTransaction({ update: [row] }), 0);
        this.gridApi.forEachNode((n) => {
          const rowindex = n.data.answers.findIndex((c) => c.id == evt.id);
          if (rowindex != -1) {
            n.data.answers[rowindex] = evt;
            n.setData({ ...n.data });
            this.gridApi.refreshCells({ force: true });
          }
        });
      });
    },
  },
};
</script>

<style>
.r0,
.r1 {
  line-height: 1.7;
  font-variant-ligatures: none;
  box-sizing: border-box;
  display: flex;
  margin: 0.25rem 0;
  align-items: flex-start;
}
</style>
