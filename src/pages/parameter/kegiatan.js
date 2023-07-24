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
import { Messages } from 'primereact/messages';

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
    let emptyKegiatan = {
        programId: '',
        kodeKegiatan: '',
        namaKegiatan: '',
    };

    const router = useRouter()
    const msgs = useRef(null)
    const [disabledTambah, setDisabledTambah] = useState(false)

    const [kegiatans, setKegiatans] = useState(null);
    const [kegiatanDialog, setKegiatanDialog] = useState(false);
    const [deleteKegiatanDialog, setDeleteKegiatanDialog] = useState(false);
    const [kegiatan, setKegiatan] = useState(emptyKegiatan);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [globalFilter, setGlobalFilter] = useState('');
    const [filter, setFilter] = useState(null)
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    // const responseKegiatan = fetchData("/kegiatan", fetcher)
    // const responseProgram = fetchData("/program", fetcher)

    var programs = []
    const [programsTest, setProgramsTest] = useState(null)

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                if (responseSession.data.role !== "admin") {
                    msgs.current.show([{ severity: 'error', summary: '', detail: 'Menu ini hanya bisa digunakan oleh akun admin', sticky: true, closable: false }])
                    setDisabledTambah(true)
                } else {
                    getProgram()
                    getKegiatan()
                }
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getKegiatan = async () => {
        const responseKegiatan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kegiatan`, {withCredentials: true})
        if (responseKegiatan.data) {
            setKegiatans(responseKegiatan.data)
            setLoading(false)
        }
    }

    const getProgram = async () => {
        const responseProgram = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/program`, {withCredentials: true})
        if (responseProgram.data) {
            responseProgram.data?.map(program => (
                programs.push({prog: program.program, value: program.id})
            ))
        }
        setProgramsTest(programs)
    }

    useEffect(() => {
        getSession()
        initFilter()
    }, []);

    const openNew = () => {
        setKegiatan(emptyKegiatan);
        setSubmitted(false);
        setKegiatanDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setKegiatanDialog(false);
    };

    const hideDeleteKegiatanDialog = () => {
        setDeleteKegiatanDialog(false);
    };

    const saveKegiatan = async () => {
        setSubmitted(true);

        if (kegiatan.programId && kegiatan.kodeKegiatan && kegiatan.namaKegiatan) {
            setSimpanLoading(true)
            if (kegiatan.id) {
                const id = kegiatan.id;
                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/kegiatan/${id}`, kegiatan, {withCredentials:true})
                    if (response.status === 200){
                        getKegiatan()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Kegiatan Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Kegiatan Gagal Diperbarui', life: 3000 });
                }
            } else {
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/kegiatan", kegiatan, {withCredentials: true})
                    if (response.status === 201) {
                        getKegiatan()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Kegiatan Berhasil Disimpan', life: 3000 });
                    }
                } catch {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Kegiatan Gagal Disimpan', life: 3000 });
                }
                
            }

            setSimpanLoading(false)
            setKegiatanDialog(false);
            setKegiatan(emptyKegiatan);
        }
    };

    const editKegiatan = (kegiatan) => {
        setKegiatan({ ...kegiatan });
        setKegiatanDialog(true);
    };

    const confirmDeleteKegiatan = (kegiatan) => {
        setKegiatan(kegiatan);
        setDeleteKegiatanDialog(true);
    };

    const deleteKegiatan = async () => {
        // let _programs = kegiatans.filter((val) => val.id !== kegiatan.id);
        const id = kegiatan.id
        setConfirmLoading(true)

        try {
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/kegiatan/${id}`, {withCredentials:true})
            if (response.status === 200){
                getKegiatan()
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Kegiatan Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Kegiatan Gagal Dihapus', life: 3000 });
        }

        setDeleteKegiatanDialog(false)
        setKegiatan(emptyKegiatan)
        setConfirmLoading(false)
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _program = { ...kegiatan };
        _program[`${name}`] = val;

        setKegiatan(_program);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Kegiatan" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTambah} />
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

    const namaProgramBodyTemplate = (rowData) => {
        
        return (
            <>
                <span className="p-column-title">Nama Program</span>
                {rowData.program.program}
            </>
        );
    };

    const kodeKegiatanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Pembebanan</span>
                {rowData.kodeKegiatan}
            </>
        );
    };

    const namaKegiatanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nama Kegiatan</span>
                {rowData.namaKegiatan}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editKegiatan(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteKegiatan(rowData)} />
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
            <h5 className="m-0">Data Kegiatan</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const programDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveKegiatan} />
        </>
    );
    const deleteProgramDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteKegiatanDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteKegiatan} />
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
                        value={kegiatans}
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
                        <Column field="kode" header="Nama Program" sortable body={namaProgramBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="pembebanan" header="Kode Kegiatan" sortable body={kodeKegiatanBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="kegiatan" header="Nama Kegiatan" sortable body={namaKegiatanBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={kegiatanDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '550px' }} header="Data Kegiatan" modal className="p-fluid" footer={programDialogFooter} onHide={hideDialog}>
                    <div className="field">
                            <label htmlFor="program">Program</label>
                            <Dropdown value={kegiatan.programId} options={programsTest} onChange={(e) => onInputChange(e, 'programId')} optionLabel="prog" optionValue="value" placeholder="Pilih program" required className={classNames({ 'p-invalid': submitted && !kegiatan.programId })} />
                            {submitted && !kegiatan.programId && <small className="p-invalid">Program harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="kode">Kode Kegiatan</label>
                            <InputText id="kode" value={kegiatan.kodeKegiatan} onChange={(e) => onInputChange(e, 'kodeKegiatan')} required className={classNames({ 'p-invalid': submitted && !kegiatan.kodeKegiatan })} />
                            {submitted && !kegiatan.kodeKegiatan && <small className="p-invalid">Kode Kegiatan harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="kegiatan">Nama Kegiatan</label>
                            <InputTextarea rows={5} cols={30} value={kegiatan.namaKegiatan} onChange={(e) => onInputChange(e, 'namaKegiatan')} autoResize required className={classNames({'p-invalid' : submitted && !kegiatan.namaKegiatan})} />
                            {submitted && !kegiatan.namaKegiatan && <small className="p-invalid">Nama Kegiatan harus diisi</small>}
                        </div>

                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteKegiatanDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteProgramDialogFooter} onHide={hideDeleteKegiatanDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {kegiatan && (
                                <span>
                                    Apakah anda yakin ingin menghapus data kegiatan <b>{kegiatan.namaKegiatan}</b>?
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
