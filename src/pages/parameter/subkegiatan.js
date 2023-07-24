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
    let emptySubKegiatan = {
        kegiatanId: '',
        kodeSubKegiatan: '',
        namaSubKegiatan: '',
        pejabatId: '',
    };

    const router = useRouter()
    const msgs = useRef(null)
    const [disabledTambah, setDisabledTambah] = useState(null)

    const [subKegiatans, setSubKegiatans] = useState(null);
    const [subKegiatanDialog, setSubKegiatanDialog] = useState(false);
    const [deleteSubKegiatanDialog, setDeleteSubKegiatanDialog] = useState(false);
    const [subKegiatan, setSubKegiatan] = useState(emptySubKegiatan);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [tahun, setTahun] = useState(null);
    const tahuns = []

    const [globalFilter, setGlobalFilter] = useState('');
    const [filter, setFilter] = useState(null)
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    // const responseSubKegiatan = fetchData("/subkegiatan", fetcher)
    // const responseKegiatan = fetchData("/kegiatan", fetcher)

    var kegiatans = []
    const [kegiatansTest, setKegiatansTest] = useState(null)
    const pejabats = []
    const [dataPejabatPptk, setDataPejabatPptk] = useState(null)

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                if (responseSession.data.role !== "admin") {
                    msgs.current.show([{ severity: 'error', summary: '', detail: 'Menu ini hanya bisa digunakan oleh akun admin', sticky: true, closable: false }])
                    setDisabledTambah(true)
                } else {
                    getKegiatan()
                    getSubKegiatan()
                    getPejabatPptk()
                }
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getSubKegiatan = async () => {
        const responseSubKegiatan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/subkegiatan`, {withCredentials: true})
        if (responseSubKegiatan.data) {
            setSubKegiatans(responseSubKegiatan.data)
            setLoading(false)
        }
    }

    const getKegiatan = async () => {
        const responseKegiatan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kegiatan`, {withCredentials: true})
        if (responseKegiatan.data) {
            responseKegiatan.data?.map(kegiatan => (
                kegiatans.push({keg: kegiatan.namaKegiatan, value: kegiatan.id})
            ))
        }
        setKegiatansTest(kegiatans)
    }

    const getPejabatPptk = async () => {
        const responsePejabatPptk = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat/search?jabatan=Pejabat Pelaksana Teknis Kegiatan`, {withCredentials: true})
        if (responsePejabatPptk.data) {
            responsePejabatPptk.data?.map(pejabat => (
                pejabats.push({label: pejabat.nama, value: pejabat.id})
            ))
        }
        setDataPejabatPptk(pejabats)
    }

    useEffect(() => {
        getSession()
        initFilter()
    }, []);

    const openNew = () => {
        setSubKegiatan(emptySubKegiatan);
        setSubmitted(false);
        setSubKegiatanDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSubKegiatanDialog(false);
    };

    const hideDeleteSubKegiatanDialog = () => {
        setDeleteSubKegiatanDialog(false);
    };

    const saveSubKegiatan = async () => {
        setSubmitted(true);

        if (subKegiatan.kegiatanId && subKegiatan.kodeSubKegiatan && subKegiatan.namaSubKegiatan) {
            setSimpanLoading(true)
            if (subKegiatan.id) {
                const id = subKegiatan.id;
                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/subkegiatan/${id}`, subKegiatan, {withCredentials:true})
                    if (response.status === 200){
                        getSubKegiatan()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Sub Kegiatan Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Sub Kegiatan Gagal Diperbarui', life: 3000 });
                }
            } else {
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/subkegiatan", subKegiatan, {withCredentials:true})
                    if (response.status === 201) {
                        getSubKegiatan()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Sub Kegiatan Berhasil Disimpan', life: 3000 });
                    }
                } catch {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Sub Kegiatan Gagal Disimpan', life: 3000 });
                }
                
            }

            setSimpanLoading(false)
            setSubKegiatanDialog(false);
            setSubKegiatan(emptySubKegiatan);
        }
    };

    const editSubKegiatan = (subKegiatan) => {
        setSubKegiatan({ ...subKegiatan });
        setSubKegiatanDialog(true);
    };

    const confirmDeleteSubKegiatan = (subKegiatan) => {
        setSubKegiatan(subKegiatan);
        setDeleteSubKegiatanDialog(true);
    };

    const deleteSubKegiatan = async () => {
        // let _programs = subKegiatans.filter((val) => val.id !== subKegiatan.id);
        const id = subKegiatan.id
        setConfirmLoading(true)

        try {
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/subkegiatan/${id}`, {withCredentials:true})
            if (response.status === 200){
                getSubKegiatan()
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Sub Kegiatan Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Sub Kegiatan Gagal Dihapus', life: 3000 });
        }

        setDeleteSubKegiatanDialog(false)
        setSubKegiatan(emptySubKegiatan)
        setConfirmLoading(false)
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _program = { ...subKegiatan };
        _program[`${name}`] = val;

        setSubKegiatan(_program);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Sub Kegiatan" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTambah} />
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

    const namaKegiatanBodyTemplate = (rowData) => {
        
        return (
            <>
                <span className="p-column-title">Nama Kegiatan</span>
                {rowData.kegiatan.namaKegiatan}
            </>
        );
    };

    const kodeSubKegiatanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Kode Sub Kegiatan</span>
                {rowData.kodeSubKegiatan}
            </>
        );
    };

    const namaSubKegiatanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nama Sub Kegiatan</span>
                {rowData.namaSubKegiatan}
            </>
        );
    };

    const pptkBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Pejabat Pelaksana Teknis Kegiatan</span>
                Nama : {rowData.pejabat.nama}
                <br></br>
                NIP : {rowData.pejabat.nip}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editSubKegiatan(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteSubKegiatan(rowData)} />
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
            <h5 className="m-0">Data Sub Kegiatan</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const programDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveSubKegiatan} />
        </>
    );
    const deleteProgramDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteSubKegiatanDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteSubKegiatan} />
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
                        value={subKegiatans}
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
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="kode" header="Nama Kegiatan" sortable body={namaKegiatanBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="pembebanan" header="Kode Sub Kegiatan" sortable body={kodeSubKegiatanBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="subKegiatan" header="Nama Sub Kegiatan" sortable body={namaSubKegiatanBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="subKegiatan" header="Nama Sub Kegiatan" sortable body={namaSubKegiatanBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="pptk" header="Pejabat Pelaksana Teknis Kegiatan" sortable body={pptkBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={subKegiatanDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '650px' }} header="Data Kegiatan" modal className="p-fluid" footer={programDialogFooter} onHide={hideDialog}>
                    <div className="field">
                            <label htmlFor="pembebanan">Kegiatan</label>
                            <Dropdown value={subKegiatan.kegiatanId} options={kegiatansTest} onChange={(e) => onInputChange(e, 'kegiatanId')} optionLabel="keg" optionValue="value" placeholder="Pilih Kegiatan" required className={classNames({ 'p-invalid': submitted && !subKegiatan.kegiatanId })} />
                            {submitted && !subKegiatan.kegiatanId && <small className="p-invalid">Program harus dipilih</small>}
                    </div>
                    <div className="field">
                        <label htmlFor="kode">Kode Sub Kegiatan</label>
                        <InputText id="kode" value={subKegiatan.kodeSubKegiatan} onChange={(e) => onInputChange(e, 'kodeSubKegiatan')} required className={classNames({ 'p-invalid': submitted && !subKegiatan.kodeSubKegiatan })} />
                        {submitted && !subKegiatan.kodeSubKegiatan && <small className="p-invalid">Kode Sub Kegiatan harus diisi</small>}
                    </div>
                    <div className="field">
                        <label htmlFor="subKegiatan">Nama Sub Kegiatan</label>
                        <InputTextarea rows={5} cols={30} value={subKegiatan.namaSubKegiatan} onChange={(e) => onInputChange(e, 'namaSubKegiatan')} autoResize required className={classNames({'p-invalid' : submitted && !subKegiatan.namaSubKegiatan})} />
                        {submitted && !subKegiatan.namaSubKegiatan && <small className="p-invalid">Nama Sub Kegiatan harus diisi</small>}
                    </div>
                    <div className="field">
                            <label htmlFor="pptk">Pejabat Pelaksana Teknis Kegiatan</label>
                            <Dropdown value={subKegiatan.pejabatId} options={dataPejabatPptk} onChange={(e) => onInputChange(e, 'pejabatId')} optionLabel="label" optionValue="value" placeholder="Pilih Pejabat Pelaksana Teknis Kegiatan" required className={classNames({ 'p-invalid': submitted && !subKegiatan.pejabatId })} />
                            {submitted && !subKegiatan.pejabatId && <small className="p-invalid">Pejabat Pelaksana Teknis Kegiatan Harus Dipilih</small>}
                    </div>

                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteSubKegiatanDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteProgramDialogFooter} onHide={hideDeleteSubKegiatanDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {subKegiatan && (
                                <span>
                                    Apakah anda yakin ingin menghapus data subKegiatan <b>{subKegiatan.subKegiatan}</b>?
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
