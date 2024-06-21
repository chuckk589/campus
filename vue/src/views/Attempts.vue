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
import { useAuthStore } from '@/stores/auth';
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
        {
          field: 'userName',
          headerName: 'Имя',
        },
        {
          field: 'questionAmount',
          filter: 'agNumberColumnFilter',
          headerName: 'Кол-во вопросов',
        },
        {
          field: 'unanswered',
          headerName: 'Без ответа',
          filter: 'agNumberColumnFilter',
        },
        {
          field: 'path',
          headerName: 'Категории',
          cellRenderer: 'PathCell',
          sortable: false,
        },
        { field: 'cmid', headerName: 'CMID' },

        {
          field: 'isProctoring',
          headerName: 'Прокторинг',
          filter: false,
          valueFormatter: (params) => (params.value === true ? 'Да' : 'Нет'),
        },
        {
          field: 'status',
          headerName: 'Статус',
          valueFormatter: (params) =>
            this.$ctable.quiz_status.find((c) => c.value == params.value)
              ?.title,
        },
        {
          field: 'createdAt',
          filter: 'agDateColumnFilter',
          headerName: 'Дата создания',
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
      ],
      gridApi: null,
      defaultColDef: {
        sortable: true,
        flex: 1,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        filterParams: {
          maxNumConditions: 1,
        },
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
              maxWidth: 150,
              valueFormatter: (params) => +params.value + 1,
              comparator: (valueA, valueB) => valueA - valueB,
            },
            {
              field: 'jsonAnswer',
              headerName: 'JSON',
              valueFormatter: (params) =>
                params.data.disabled ? '*****' : params.value,
              cellStyle: (params) => {
                if (params.data.status == 'correct') {
                  return { backgroundColor: 'rgba(0, 128, 0, 0.1)' };
                } else if (
                  params.data.status == 'incorrect' ||
                  !params.data.jsonAnswer
                ) {
                  return { backgroundColor: 'rgba(255, 0, 0, 0.1)' };
                }
              },
            },
            {
              field: 'state',
              headerName: 'Статус',
              maxWidth: 150,
              valueFormatter: (params) =>
                this.$ctable.que_result.find((c) => c.value == params.value)
                  ?.title,
            },
          ],
          isRowMaster: (dataItem) => {
            return !dataItem.disabled;
          },

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
    };
  },
  beforeUnmount() {
    this.$emitter.off('edit-attempt');
    this.$emitter.off('edit-answer');
  },

  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.serverSideDatasource = {
        getRows: (params) => {
          this.$http({
            method: 'POST',
            url: `/v1/attempt/load`,
            data: params.request,
          }).then((res) => {
            params.success({
              rowData: res.data.rows,
              // rowCount: res.data.lastRow,
            });
          });
        },
      };
      this.$emitter.on('edit-attempt', (evt) => {
        const node = this.gridApi.getRowNode(evt.id);
        node.setData(evt);
      });
      this.$emitter.on('edit-answer', (evt) => {
        this.gridApi.forEachNode((n) => {
          const rowindex = n.data.answers.findIndex((c) => c.id == evt.id);
          if (rowindex != -1) {
            n.data.answers[rowindex] = evt;
            n.setData({ ...n.data });
            this.gridApi.refreshCells({ force: true });
          }
        });
      });
      const { user } = useAuthStore();
      if (user.role == 'admin') {
        this.columnDefs.splice(7, 0, {
          field: 'editable',
          headerName: 'Редактируемый',
          valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
          filter: false,
        });
        this.columnDefs.push({
          field: 'action',
          headerName: '',
          filter: false,
          sortable: false,
          cellRenderer: 'AttemptCell',
        });
        this.detailCellRendererParams.detailGridOptions.columnDefs.push({
          field: 'updatedBy',
          headerName: 'Кем обновлено',
          maxWidth: 200,
        });
      }
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
