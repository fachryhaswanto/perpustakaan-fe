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
import { Messages } from 'primereact/messages';
import { useRouter } from 'next/router';

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
    let emptyInstansi = {
        instansi: '',
        kode_instansi: '',
        singkatan: '',
    };

    const router = useRouter()
    const msgs = useRef(null)
    const [disabledTambah, setDisabledTambah] = useState(false)

    const [instansis, setInstansis] = useState(null);
    const [instansiDialog, setInstansiDialog] = useState(false);
    const [deleteInstansiDialog, setDeleteInstansiDialog] = useState(false);
    const [instansi, setInstansi] = useState(emptyInstansi);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true)   

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [filter, setFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    // const responseInstansi = fetchData("/instansi", fetcher)

    // const {mutate} = useSWRConfig()

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                if (responseSession.data.role !== "admin") {
                    msgs.current.show([{ severity: 'error', summary: '', detail: 'Menu ini hanya bisa digunakan oleh akun admin', sticky: true, closable: false }])
                    setDisabledTambah(true)
                } else {
                    getInstansi()
                }
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getInstansi = async () => {
        const responseInstansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/instansi`, {withCredentials: true})
        if (responseInstansi.data) {
            setInstansis(responseInstansi.data)
            setLoading(false)
        }
    }

    useEffect(() => {
        getSession()
        initFilter()
    },[]);

    const openNew = () => {
        setInstansi(emptyInstansi);
        setSubmitted(false);
        setInstansiDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setInstansiDialog(false);
    };

    const hideDeleteInstansiDialog = () => {
        setDeleteInstansiDialog(false);
    };

    const saveInstansi = async () => {
        setSubmitted(true);

        if (instansi.instansi && instansi.singkatan && instansi.kode_instansi) {
            setSimpanLoading(true)
            if (instansi.id) {
                const id = instansi.id;

                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/instansi/${id}`, instansi, {withCredentials:true})
                    if (response.status === 200) {
                        getInstansi()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Instansi Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Instansi Gagal Diperbarui', life: 3000 });
                }
            } else {
                try{
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/instansi", instansi, {withCredentials:true})
                    if (response.status === 201) {
                        getInstansi()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Instansi Berhasil Disimpan', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Instansi Gagal Disimpan', life: 3000 });
                } 
            }

            setSimpanLoading(false);
            setInstansiDialog(false);
            setInstansi(emptyInstansi);
        }
    };

    const editInstansi = (instansi) => {
        setInstansi({ ...instansi });
        setInstansiDialog(true);
    };

    const confirmDeleteInstansi = (instansi) => {
        setInstansi(instansi);
        setDeleteInstansiDialog(true);
    };

    const deleteInstansi = async () => {
        // let _dinass = instansis.filter((val) => val.id !== instansi.id);

        setConfirmLoading(true)
        const id = instansi.id

        try {
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/instansi/${id}`, {withCredentials:true})
            if (response.status === 200){
                getInstansi()
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Data Instansi Berhasil Dihapus', life: 3000 });
            }
        } catch (error){
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Instansi Gagal Dihapus', life: 3000 });
        }

        setConfirmLoading(false)
        setDeleteInstansiDialog(false);
        setInstansi(emptyInstansi);
        
    };


    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _instansi = { ...instansi };
        _instansi[`${name}`] = val;

        setInstansi(_instansi);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Instansi" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTambah} />
                </div>
            </React.Fragment>
        );
    };

    const instansiBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nama Instansi</span>
                {rowData.instansi}
            </>
        );
    };

    const kodeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Kode Instansi</span>
                {rowData.kode_instansi}
            </>
        );
    };

    const singkatanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Singkatan</span>
                {rowData.singkatan}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editInstansi(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteInstansi(rowData)} />
            </>
        );
    };

    const initFilter = () => {
        setFilter({
            'global' : {value : null, matchMode : FilterMatchMode.CONTAINS}
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
            <h5 className="m-0">Data Instansi</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const instansiDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveInstansi} />
        </>
    );
    
    const deleteInstansiDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteInstansiDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteInstansi} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Messages ref={msgs} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={instansis}
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
                        <Column field="kode_instansi" header="Kode Instansi" sortable body={kodeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="instansi" header="Nama Instansi" sortable body={instansiBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="singkatan" header="Singkatan" sortable body={singkatanBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={instansiDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '450px' }} header="Data Instansi" modal className="p-fluid" footer={instansiDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="kode_instansi">Kode Instansi</label>
                            <InputText id="kode_instansi" value={instansi.kode_instansi} onChange={(e) => onInputChange(e, 'kode_instansi')} required autoFocus className={classNames({ 'p-invalid': submitted && !instansi.kode_instansi })} />
                            {submitted && !instansi.kode_instansi && <small className="p-invalid">Kode Instansi harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="instansi">Nama Instansi</label>
                            <InputText id="instansi" value={instansi.instansi} onChange={(e) => onInputChange(e, 'instansi')} required  className={classNames({ 'p-invalid': submitted && !instansi.instansi })} />
                            {submitted && !instansi.instansi && <small className="p-invalid">Nama Instansi harus diisi</small>}
                        </div>                      
                        <div className="field">
                            <label htmlFor="singkatan">Singkatan</label>
                            <InputText id="singkatan" value={instansi.singkatan} onChange={(e) => onInputChange(e, 'singkatan')} required className={classNames({ 'p-invalid': submitted && !instansi.singkatan })} />
                            {submitted && !instansi.singkatan && <small className="p-invalid">Singkatan harus diisi</small>}
                        </div>

                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteInstansiDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteInstansiDialogFooter} onHide={hideDeleteInstansiDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {instansi && (
                                <span>
                                    Apakah anda yakin ingin menghapus data instansi <b>{instansi.instansi}</b>?
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

