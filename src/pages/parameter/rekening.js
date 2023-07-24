import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import { FilterMatchMode } from 'primereact/api';
import React, { useEffect, useRef, useState } from 'react';
import useSWR, {useSWRConfig} from 'swr';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Messages } from 'primereact/messages'

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
    let emptyRekening = {
        kodeRekening: '',
        namaRekening: '',
    };

    const router = useRouter()
    const msgs = useRef(null)
    const [disabledTambah, setDisabledTambah] = useState(false)

    const [rekenings, setRekenings] = useState(null);
    const [rekeningDialog, setRekeningDialog] = useState(false);
    const [deleteRekeningDialog, setDeleteRekeningDialog] = useState(false);
    const [rekening, setRekening] = useState(emptyRekening);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [globalFilter, setGlobalFilter] = useState('');
    const [filter, setFilter] = useState(null)
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    // const responseRekening = fetchData("/rekening", fetcher)

    // const {mutate} = useSWRConfig()

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                if (responseSession.data.role !== "admin") {
                    msgs.current.show([{ severity: 'error', summary: '', detail: 'Menu ini hanya bisa digunakan oleh akun admin', sticky: true, closable: false }])
                    setDisabledTambah(true)
                } else {
                    getRekening()
                }
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getRekening = async () => {
        const responseRekening = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/rekening`, {withCredentials: true})
        if (responseRekening.data) {
            setRekenings(responseRekening.data)
            setLoading(false)
        }
    }

    useEffect(() => {
        getSession()
        initFilter()
    }, []);

    const openNew = () => {
        setRekening(emptyRekening);
        setSubmitted(false);
        setRekeningDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setRekeningDialog(false);
    };

    const hideDeleteRekeningDialog = () => {
        setDeleteRekeningDialog(false);
    };

    const saveRekening = async () => {
        setSubmitted(true);

        if (rekening.kodeRekening && rekening.namaRekening) {
            setSimpanLoading(true)
            if (rekening.id) {
                const id = rekening.id;
                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/rekening/${id}`, rekening, {withCredentials: true})
                    if (response.status === 200){
                        getRekening()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Rekening Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Rekening Gagal Diperbarui', life: 3000 });
                }
            } else {
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/rekening", rekening, {withCredentials: true})
                    if (response.status === 201) {
                        getRekening()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Rekening Berhasil Disimpan', life: 3000 });
                    }
                } catch {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Rekening Gagal Disimpan', life: 3000 });
                }
                
            }

            setSimpanLoading(false)
            setRekeningDialog(false);
            setRekening(emptyRekening);
        }
    };

    const editRekening = (rekening) => {
        setRekening({ ...rekening });
        setRekeningDialog(true);
    };

    const confirmDeleteRekening = (rekening) => {
        setRekening(rekening);
        setDeleteRekeningDialog(true);
    };

    const deleteRekening = async () => {
        // let _programs = rekenings.filter((val) => val.id !== rekening.id);
        const id = rekening.id
        setConfirmLoading(true)

        try {
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/rekening/${id}`, {withCredentials: true})
            if (response.status === 200){
                getRekening()
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Rekening Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Rekening Gagal Dihapus', life: 3000 });
        }

        setDeleteRekeningDialog(false)
        setRekening(emptyRekening)
        setConfirmLoading(false)
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _program = { ...rekening };
        _program[`${name}`] = val;

        setRekening(_program);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Rekening" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTambah} />
                </div>
            </React.Fragment>
        );
    };

    // const rightToolbarTemplate = () => {
    //     return (
    //         <React.Fragment>
    //             <div className="card">
    //                 <h6>Tahun Anggaran</h6>
    //                 <Dropdown value={tahun} options={tahuns} onChange={(e) => setTahun(e.value)} optionLabel="tah" showClear optionValue="value" placeholder="Pilih tahun anggaran" />
    //             </div>
    //         </React.Fragment>
    //     );
    // };

    const kodeRekeningBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Kode Rekening</span>
                {rowData.kodeRekening}
            </>
        );
    };

    const namaRekeningBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nama Rekening</span>
                {rowData.namaRekening}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editRekening(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteRekening(rowData)} />
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
            <h5 className="m-0">Data Rekening</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const rekeningDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveRekening} />
        </>
    );
    const deleteRekeningDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteRekeningDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteRekening} />
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
                        value={rekenings}
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
                        <Column field="kodeRekening" header="Kode Rekening" sortable body={kodeRekeningBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="namaRekening" header="Nama Rekening" sortable body={namaRekeningBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={rekeningDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '450px' }} header="Data Rekening" modal className="p-fluid" footer={rekeningDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="kodeRekening">Kode Rekening</label>
                            <InputText id="kodeRekening" value={rekening.kodeRekening} onChange={(e) => onInputChange(e, 'kodeRekening')} required className={classNames({ 'p-invalid': submitted && !rekening.kodeRekening })} />
                            {submitted && !rekening.kodeRekening && <small className="p-invalid">Kode Rekening harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="namaRekening">Nama Rekening</label>
                            <InputTextarea rows={5} cols={30} value={rekening.namaRekening} onChange={(e) => onInputChange(e, 'namaRekening')} autoResize required className={classNames({'p-invalid' : submitted && !rekening.namaRekening})} />
                            {submitted && !rekening.namaRekening && <small className="p-invalid">Nama Rekening harus diisi</small>}
                        </div>

                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteRekeningDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteRekeningDialogFooter} onHide={hideDeleteRekeningDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {rekening && (
                                <span>
                                    Apakah anda yakin ingin menghapus data rekening <b>{rekening.rekening}</b>?
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
