<template>
  <div class="h-100">
    <div class="d-flex mb-2">
      <v-btn
        @click="add"
        class="mr-2"
        size="small"
        color="success"
        variant="outlined"
        >Добавить пользователя</v-btn
      >

      <v-btn @click="remove" size="small" color="error" variant="outlined"
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
      style="height: 100%"
      @grid-ready="onGridReady"
      suppressExcelExport
    >
    </AgGridVue>
  </div>
</template>

<script>
import OwnerCell from '@/components/cellRenderers/OwnerCell.vue';
import { AgGridVue } from 'ag-grid-vue3';
export default {
  name: 'OwnersView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    OwnerCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          maxWidth: 150,
          headerCheckboxSelection: true,
          checkboxSelection: true,
        },
        {
          field: 'role',
          headerName: 'Роль',
          valueFormatter: (params) =>
            this.$ctable.owner_role.find((c) => c.value == params.value)?.title,
        },
        {
          field: 'username',
          headerName: 'Логин',
        },
        {
          field: 'email',
          headerName: 'Email',
        },
        {
          field: 'credentials',
          headerName: 'ФИО',
        },
        {
          field: 'createdAt',
          headerName: 'Дата регистрации',
          sortable: true,
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
        {
          field: 'action',
          headerName: '',
          filter: false,
          sortable: false,
          cellRenderer: 'OwnerCell',
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
    this.$emitter.off('edit-owner');
    this.$emitter.off('delete-owner');
    this.$emitter.off('new-owner');
  },
  methods: {
    add() {
      this.$emitter.emit('openModal', {
        url: `/owner/`,
        method: 'POST',
        header: 'Добавить',
        eventName: 'new-owner',
        fields: [
          {
            label: 'Роль',
            key: 'role',
            type: 'select',
            options: this.$ctable.owner_role,
          },
          {
            label: 'Логин',
            key: 'username',
          },
          {
            label: 'Email',
            key: 'email',
          },
          {
            label: 'ФИО',
            key: 'credentials',
          },
          {
            label: 'Пароль',
            key: 'password',
            type: 'password',
          },
        ],
      });
    },
    remove() {
      const selectedRows = this.gridApi.getSelectedRows();
      if (!selectedRows.length) return;
      const ids = selectedRows.map((c) => c.id);
      this.$emitter.emit('openDialog', {
        header: 'Удаление пользователей',
        message: 'Вы уверены?',
        eventName: 'delete-owner',
        id: ids,
      });
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/owner/` }).then((res) => {
        this.gridApi.setGridOption('rowData', res.data);
      });
      this.$emitter.on('edit-owner', (evt) => {
        const rowNode = this.gridApi.getRowNode(evt.id);
        rowNode.setData(evt);
      });
      this.$emitter.on('delete-owner', (ids) => {
        this.$http({
          method: 'DELETE',
          url: `/v1/owner?ids=${ids.join(',')}`,
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
    },
  },
};
</script>
