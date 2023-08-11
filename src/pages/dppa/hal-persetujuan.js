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
import { useRouter } from 'next/router';
import { Messages } from 'primereact/messages';
import { deleteFromBucket, getBucketURL, uploadToBucket } from '../../libs/bucket'

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
    let emptyHalPersetujuanDPA = {
        namaFile: '',
        tahun: '',
        tipe: 'Halaman Persetujuan DPPA',
        file: '',
        userId: '',
    };

    const msgs = useRef(null)
    const router = useRouter()
    const [disabledTambah, setDisabledTambah] = useState(false)
    const [session, setSession] = useState(null)

    const [halPersetujuans, setHalPersetujuans] = useState(null);
    const [halPersetujuanDialog, setHalPersetujuanDialog] = useState(false);
    const [deleteHalPersetujuanDialog, setDeleteHalPersetujuanDialog] = useState(false);
    const [halPersetujuan, setHalPersetujuan] = useState(emptyHalPersetujuanDPA);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true)   

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [filter, setFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const fileUploadRef = useRef(null)
    const [fileUpload, setFileUpload] = useState(null)
    const [errorSize, setErrorSize] = useState(false)

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                if (responseSession.data.role === "salah") { //!==
                    msgs.current.show([{ severity: 'error', summary: '', detail: 'Menu ini hanya bisa digunakan oleh akun admin', sticky: true, closable: false }])
                    setDisabledTambah(true)
                } else {
                    getHalPersetujuan()
                    setSession(responseSession.data)
                }
            } else {
                router.push("/")
            }
        } catch (error) {
        }
    }

    const getHalPersetujuan = async () => {
        const responseHalPersetujuan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dppa/search?tipe=Halaman Persetujuan DPPA`, {withCredentials: true})
        if (responseHalPersetujuan.data) {
            setHalPersetujuans(responseHalPersetujuan.data)
            setLoading(false)
        } else {
            setHalPersetujuans(null)
            setLoading(false)
        }
    }

    useEffect(() => {
        getSession()
        initFilter()
    },[]);

    const openNew = () => {
        setHalPersetujuan(emptyHalPersetujuanDPA);
        setSubmitted(false);
        setHalPersetujuanDialog(true);
        setErrorSize(null)
        setFileUpload(null)
    };

    const hideDialog = () => {
        setSubmitted(false);
        setHalPersetujuanDialog(false);
    };

    const hideDeleteHalPersetujuanDialog = () => {
        setDeleteHalPersetujuanDialog(false);
    };

    const saveHalPersetujuan = async () => {
        setSubmitted(true);

        if (errorSize === true) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Ukuran file lebih dari 5MB', life: 3000 });
            
            return
        }

        if (!fileUpload) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Wajib mengupload file', life: 3000 });
            
            return
        }

        if (halPersetujuan.namaFile && halPersetujuan.tahun) {
            setSimpanLoading(true)
            if (halPersetujuan.id) {
                const id = halPersetujuan.id;

                try {
                    let urlBukti = halPersetujuan.file
                    let deleteFilePath = urlBukti.replace(`https://storage.googleapis.com/dispusaka-project/`, '')

                    if (fileUpload) {
                        const {url, fields, filePath} = await getBucketURL(`Halaman-Persetujuan-DPPA/${session.username}`, fileUpload)

                        await Promise.all([uploadToBucket(url, fields, fileUpload), deleteFromBucket(deleteFilePath)])
                        urlBukti = `${url}${filePath}`
                    }

                    halPersetujuan.file = urlBukti

                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/dppa/${id}`, halPersetujuan, {withCredentials:true})
                    if (response.status === 200){
                        getHalPersetujuan()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Halaman Persetujuan DPPA Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Halaman Persetujuan DPPA Gagal Diperbarui', life: 3000 });
                }                              
            } else {
                try {
                    let urlBukti = '-'

                    if (fileUpload) {
                        const {url, fields, filePath} = await getBucketURL(`Halaman-Persetujuan-DPPA/${session.username}`, fileUpload)

                        await uploadToBucket(url, fields, fileUpload)

                        urlBukti = `${url}${filePath}`
                    }

                    halPersetujuan.file = urlBukti
                    halPersetujuan.userId = session.id

                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/dppa", halPersetujuan, {withCredentials:true})
                    if (response.status === 201){
                        getHalPersetujuan()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Halaman Persetujuan DPPA Berhasil Disimpan', life: 3000 });
                    }
                } catch (error) {
                    console.log(error)
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Halaman Persetujuan DPPA Gagal Disimpan', life: 3000 });
                }               
            }

            setHalPersetujuanDialog(false);
            setHalPersetujuan(emptyHalPersetujuanDPA);
            setSimpanLoading(false)
            setFileUpload(null)
            setErrorSize(null)
        }
    };

    const editHalPersetujuan = (halPersetujuan) => {
        setHalPersetujuan({ ...halPersetujuan });
        setHalPersetujuanDialog(true);
    };

    const confirmDeleteHalPersetujuan = (halPersetujuan) => {
        setHalPersetujuan(halPersetujuan);
        setDeleteHalPersetujuanDialog(true);
    };

    const deleteHalPersetujuan = async () => {
        setConfirmLoading(true)
        const id = halPersetujuan.id

        try {
            let urlBukti = halPersetujuan.file
            let deleteFilePath = urlBukti.replace(`https://storage.googleapis.com/dispusaka-project/`, '')

            await deleteFromBucket(deleteFilePath)

            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/dppa/${id}`, {withCredentials: true})
            if (response.status === 200){
                getHalPersetujuan()
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Halaman Persetujuan DPPA Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Halaman Persetujuan DPPA Gagal Dihapus', life: 3000 });
        }

        setDeleteHalPersetujuanDialog(false);
        setHalPersetujuan(emptyHalPersetujuanDPA);
        setConfirmLoading(false)
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _halPersetujuan = { ...halPersetujuan };
        _halPersetujuan[`${name}`] = val;

        setHalPersetujuan(_halPersetujuan);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Halaman Persetujuan DPPA" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTambah} />
                </div>
            </React.Fragment>
        );
    };

    const namaFileBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Kode</span>
                {rowData.namaFile}
            </>
        );
    };

    const tahunBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nama</span>
                {rowData.tahun}
            </>
        );
    };

    const fileBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">File</span>
                <Button label='Download File' onClick={() => window.open(rowData.file, '_blank')} />
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editHalPersetujuan(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteHalPersetujuan(rowData)} />
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
            <h5 className="m-0">Data Halaman Persetujuan DPPA</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const halPersetujuanDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveHalPersetujuan} />
        </>
    );
    const deleteHalPersetujuanDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteHalPersetujuanDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteHalPersetujuan} />
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
                        value={halPersetujuans}
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
                        <Column field="namaFile" header="Nama File" sortable body={namaFileBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="tahun" header="Tahun" sortable body={tahunBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="file" header="File" sortable body={fileBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}                 
                    <Dialog visible={halPersetujuanDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '450px' }} header="Data Halaman Persetujuan DPPA" modal className="p-fluid" footer={halPersetujuanDialogFooter} onHide={hideDialog}>                        
                        <div className="field">
                            <label htmlFor="namaFile">Nama File</label>
                            <InputText id="halPersetujuan" value={halPersetujuan.namaFile} onChange={(e) => onInputChange(e, 'namaFile')} required autoFocus className={classNames({ 'p-invalid': submitted && !halPersetujuan.namaFile })} />
                            {submitted && !halPersetujuan.namaFile && <small className="p-invalid">Nama File harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tahun">Tahun</label>
                            <InputText id="tahun" value={halPersetujuan.tahun} onChange={(e) => onInputChange(e, 'tahun')} required className={classNames({ 'p-invalid': submitted && !halPersetujuan.tahun })} />
                            {submitted && !halPersetujuan.tahun && <small className="p-invalid">Tahun harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tipe">Tipe</label>
                            <InputText id="tipe" value={"Halaman Persetujuan DPPA"} disabled />
                        </div>
                        <div className="field">
                            <label htmlFor="halPersetujuan">Upload File</label><br></br>
                            <input 
                                accept=".pdf,.docx,.xlsx,.jpeg,.jpg,.png,.pptx"
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files[0]?.size > 5 * 1024 * 1024) {
                                        setErrorSize(true)
                                    } else if (e.target.files[0]) {
                                        setFileUpload(e.target.files[0])
                                        setErrorSize(false)
                                    }
                                }}
                            />
                        </div>
                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteHalPersetujuanDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteHalPersetujuanDialogFooter} onHide={hideDeleteHalPersetujuanDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {halPersetujuan && (
                                <span>
                                    Apakah anda yakin ingin menghapus data Halaman Persetujuan DPPA <b>{halPersetujuan.namaFile}</b>?
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

