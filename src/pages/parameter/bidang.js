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
    const {data, error} = useSWR(key, fetcher, {revalidateOnFocus: false})

    return {
        data : data,
        isLoading: !error && !data,
        isError : error
    } 
}
 
const Crud = () => {
    let emptyBidang = {
        nama_bidang: '',
        singkatan: '',
    };

    const [bidangs, setBidangs] = useState(null);
    const [bidangDialog, setBidangDialog] = useState(false);
    const [deleteBidangDialog, setDeleteBidangDialog] = useState(false);
    const [bidang, setBidang] = useState(emptyBidang);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true)   

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [filter, setFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const responseBidang = fetchData('/bidang', fetcher)

    const {mutate} = useSWRConfig()

    useEffect(() => {
        if (!responseBidang.data) {
            setLoading(false)
        } else if (responseBidang.data){
            setBidangs(responseBidang.data)
            setLoading(false)
        }
        initFilter()
    }, [responseBidang.data]);

    const openNew = () => {
        setBidang(emptyBidang);
        setSubmitted(false);
        setBidangDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setBidangDialog(false);
    };

    const hideDeleteBidangDialog = () => {
        setDeleteBidangDialog(false);
    };

    const saveBidang = async () => {
        setSubmitted(true);

        if (bidang.nama_bidang && bidang.singkatan) {
            setSimpanLoading(true)
            if (bidang.id) {
                const id = bidang.id;

                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/bidang/${id}`, bidang)
                    if (response.status === 200){
                        await mutate("/bidang")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Bidang Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Bidang Gagal Diperbarui', life: 3000 });
                }                              
            } else {
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/bidang", bidang)
                    if (response.status === 201){
                        await mutate("/bidang")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Bidang Berhasil Disimpan', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Bidang Gagal Disimpan', life: 3000 });
                }               
            }

            setBidangDialog(false);
            setBidang(emptyBidang);
            setSimpanLoading(false)
        }
    };

    const editBidang = (bidang) => {
        setBidang({ ...bidang });
        setBidangDialog(true);
    };

    const confirmDeleteBidang = (bidang) => {
        setBidang(bidang);
        setDeleteBidangDialog(true);
    };

    const deleteBidang = async () => {
        // let _bidangs = bidangs.filter((val) => val.id !== bidang.id);
        setConfirmLoading(true)
        const id = bidang.id

        try {
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/bidang/${id}`)
            if (response.status === 200){
                await mutate("/bidang")
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Bidang Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Bidang Gagal Dihapus', life: 3000 });
        }

        setDeleteBidangDialog(false);
        setBidang(emptyBidang);
        setConfirmLoading(false)
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _bidang = { ...bidang };
        _bidang[`${name}`] = val;

        setBidang(_bidang);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Bidang" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const kodeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Kode</span>
                {rowData.nama_bidang}
            </>
        );
    };

    const bidangBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nama</span>
                {rowData.singkatan}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editBidang(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteBidang(rowData)} />
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
            <h5 className="m-0">Data Bidang</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const bidangDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveBidang} />
        </>
    );
    const deleteBidangDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteBidangDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteBidang} />
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
                        value={bidangs}
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
                        <Column field="bidang" header="Nama Bidang" sortable body={kodeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="singkatan" header="Singkatan" sortable body={bidangBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={bidangDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '450px' }} header="Data Bidang" modal className="p-fluid" footer={bidangDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="bidang">Nama Bidang</label>
                            <InputText id="bidang" value={bidang.nama_bidang} onChange={(e) => onInputChange(e, 'nama_bidang')} required autoFocus className={classNames({ 'p-invalid': submitted && !bidang.nama_bidang })} />
                            {submitted && !bidang.nama_bidang && <small className="p-invalid">Nama Bidang harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="singkatan">Singkatan</label>
                            <InputText id="singkatan" value={bidang.singkatan} onChange={(e) => onInputChange(e, 'singkatan')} required className={classNames({ 'p-invalid': submitted && !bidang.singkatan })} />
                            {submitted && !bidang.singkatan && <small className="p-invalid">Singkatan harus diisi</small>}
                        </div>

                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteBidangDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteBidangDialogFooter} onHide={hideDeleteBidangDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {bidang && (
                                <span>
                                    Apakah anda yakin ingin menghapus data bidang <b>{bidang.nama_bidang}</b>?
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

