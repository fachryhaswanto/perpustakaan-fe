import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { FilterMatchMode } from 'primereact/api';
import React, { useEffect, useRef, useState } from 'react';
import useSWR, {useSWRConfig} from 'swr';
import axios from 'axios';

const fetcher = url => axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `${url}`).then(res => res.data)

function fetchData(key, fetcher){
    const {data, error} = useSWR(key, fetcher, {revalidateOnFocus:false})

    return {
        data : data,
        isLoading: !error && !data,
        isError : error
    }
}

const Crud = () => {

    let emptyKabupaten = {
        kode: '',
        nama: '',
    };  

    const [kabupatens, setKabupatens] = useState(null);
    const [kabupatenDialog, setKabupatenDialog] = useState(false);
    const [deleteKabupatenDialog, setDeleteKabupatenDialog] = useState(false);
    const [kabupaten, setKabupaten] = useState(emptyKabupaten);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filter, setFilter] = useState(null);
    const [loading, setLoading] = useState(true);

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;   

    const responseKabupaten = fetchData("/kabupaten", fetcher)
    const {mutate} = useSWRConfig()

    useEffect(() => {
        initFilter()
        if(responseKabupaten.data){
            setKabupatens(responseKabupaten.data)
            setLoading(false)
        }
    }, [responseKabupaten.data]); 

    const openNew = () => {
        setKabupaten(emptyKabupaten);
        setSubmitted(false);
        setKabupatenDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setKabupatenDialog(false);
    };

    const hideDeleteKabupatenDialog = () => {
        setDeleteKabupatenDialog(false);
    };

    const saveKabupaten = async () => {
        setSubmitted(true);
        
        if (kabupaten.nama && kabupaten.kode) {
            setSimpanLoading(true);
            if (kabupaten.id) {
                // const index = findIndexById(kabupaten.id);
                // _kabupatens[index] = _kabupaten;
                const id = kabupaten.id

                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/kabupaten/${id}`, kabupaten)
                    if(response.status === 200){
                        await mutate("/kabupaten")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Kabupaten Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'success', summary: 'Kesalahan', detail: 'Data Kabupaten Gagal Diperbarui', life: 3000 });
                }
            } else {
                // _kabupaten.id = createId();
                // _kabupatens.push(_kabupaten);
                
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/kabupaten", kabupaten)
                    if (response.status === 201){
                        await mutate("/kabupaten")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Kabupaten Berhasil Disimpan', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Kabupaten Gagal Disimpan', life: 3000 });
                }
            }

            setKabupatenDialog(false);
            setKabupaten(emptyKabupaten);
            setSimpanLoading(false);
        }
    };

    const editKabupaten = (kabupaten) => {
        setKabupaten({ ...kabupaten });
        setKabupatenDialog(true);
    };

    const confirmDeleteKabupaten = (kabupaten) => {
        setKabupaten(kabupaten);
        setDeleteKabupatenDialog(true);
    };

    const deleteKabupaten = async () => {

        // let _kabupatens = kabupatens.filter((val) => val.id !== kabupaten.id);
        setConfirmLoading(true)
        const id = kabupaten.id

        try {
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/kabupaten/${id}`)
            if (response.status === 200){
                await mutate("/kabupaten")
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Kabupaten Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Kabupaten Gagal Dihapus', life: 3000 });
        }

        setDeleteKabupatenDialog(false);
        setKabupaten(emptyKabupaten);   
        setConfirmLoading(false)    
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _kabupaten = { ...kabupaten };
        _kabupaten[`${name}`] = val;

        setKabupaten(_kabupaten);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Kabupaten" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const kodeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Kode</span>
                {rowData.kode}
            </>
        );
    };

    const kabupatenBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nama</span>
                {rowData.nama}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editKabupaten(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteKabupaten(rowData)} />
            </>
        );
    };

    const initFilter = () => {
        setFilter({
            'global' : {value : '', matchMode : FilterMatchMode.CONTAINS}
        })   
    }

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filter = { ...filter };
        _filter['global'].value = value;

        setFilter(_filter);
        setGlobalFilter(value);
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Data Kabupaten</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const kabupatenDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveKabupaten} />
        </>
    );
    const deleteKabupatenDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteKabupatenDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteKabupaten} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={kabupatens}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                        filters={filter}
                        emptyMessage="Tidak ada data"
                        header={header}
                        responsiveLayout="scroll"
                        removableSort
                        showGridlines
                        loading={loading}
                    >
                        <Column field="kode" header="Kode" sortable body={kodeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="nama" header="Nama Kabupaten" sortable body={kabupatenBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '1rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={kabupatenDialog} style={{ width: '450px' }} header="Data Kabupaten" modal blockScroll={true} closable={!simpanLoading} className="p-fluid" footer={kabupatenDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="kode">Kode</label>
                            <InputText id="kode" value={kabupaten.kode} onChange={(e) => onInputChange(e, 'kode')} required autoFocus className={classNames({ 'p-invalid': submitted && !kabupaten.kode })} />
                            {submitted && !kabupaten.kode && <small className="p-invalid">Kode harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="kabupaten">Nama Kabupaten</label>
                            <InputText id="nama" value={kabupaten.nama} onChange={(e) => onInputChange(e, 'nama')} required className={classNames({ 'p-invalid': submitted && !kabupaten.nama })} />
                            {submitted && !kabupaten.nama && <small className="p-invalid">Nama Kabupaten harus diisi</small>}
                        </div>

                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteKabupatenDialog} style={{ width: '450px' }} header="Konfirmasi" modal blockScroll={true} closable={!confirmLoading} footer={deleteKabupatenDialogFooter} onHide={hideDeleteKabupatenDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {kabupaten && (
                                <span>
                                    Apakah anda yakin ingin menghapus data kabupaten <b>{kabupaten.nama}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
