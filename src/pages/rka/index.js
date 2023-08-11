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
import { FileUpload } from 'primereact/fileupload'
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
    let emptyRka = {
        namaFile: '',
        tahun: '',
        tipe: '-',
        file: '',
        userId: '',
    };

    const msgs = useRef(null)
    const router = useRouter()
    const [disabledTambah, setDisabledTambah] = useState(false)

    const [rkas, setRkas] = useState(null);
    const [rkaDialog, setRkaDialog] = useState(false);
    const [deleteRkaDialog, setDeleteRkaDialog] = useState(false);
    const [rka, setRka] = useState(emptyRka);
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
    const [session, setSession]= useState(null)

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                if (responseSession.data.role === "salah") { //!==
                    msgs.current.show([{ severity: 'error', summary: '', detail: 'Menu ini hanya bisa digunakan oleh akun admin', sticky: true, closable: false }])
                    setDisabledTambah(true)
                } else {
                    setSession(responseSession.data)
                    getRka()
                }
            } else {
                router.push("/")
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getRka = async () => {
        const responseRka = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/rka`, {withCredentials: true})
        if (responseRka.data) {
            setRkas(responseRka.data)
            setLoading(false)
        } else {
            setRkas(null)
            setLoading(false)
        }
    }

    useEffect(() => {
        getSession()
        initFilter()
    },[]);

    const openNew = () => {
        setRka(emptyRka);
        setSubmitted(false);
        setRkaDialog(true);
        setErrorSize(false)
        setFileUpload(null)
    };

    const hideDialog = () => {
        setSubmitted(false);
        setRkaDialog(false);
    };

    const hideDeleteRkaDialog = () => {
        setDeleteRkaDialog(false);
    };

    const saveRka = async () => {
        setSubmitted(true);

        if (errorSize === true) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Ukuran file lebih dari 5MB', life: 3000 });
            
            return
        }

        if (!fileUpload) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Wajib mengupload file', life: 3000 });
            
            return
        }

        if (rka.namaFile && rka.tahun) {
            setSimpanLoading(true)
            if (rka.id) {
                const id = rka.id;

                try {
                    let urlBukti = rka.file
                    let deleteFilePath = urlBukti.replace(`https://storage.googleapis.com/dispusaka-project/`, '')

                    if (fileUpload) {
                        const {url, fields, filePath} = await getBucketURL(`RKA/${session.username}`, fileUpload)

                        await Promise.all([uploadToBucket(url, fields, fileUpload), deleteFromBucket(deleteFilePath)])
                        urlBukti = `${url}${filePath}`
                    }

                    rka.file = urlBukti

                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/rka/${id}`, rka, {withCredentials:true})
                    if (response.status === 200){
                        getRka()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data RKA Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data RKA Gagal Diperbarui', life: 3000 });
                }                              
            } else {
                try {
                    let urlBukti = '-'

                    if (fileUpload) {
                        const {url, fields, filePath} = await getBucketURL(`RKA/${session.username}`, fileUpload)

                        await uploadToBucket(url, fields, fileUpload)

                        urlBukti = `${url}${filePath}`
                    }

                    rka.file = urlBukti
                    rka.userId = session.id

                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/rka", rka, {withCredentials:true})
                    if (response.status === 201){
                        getRka()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data RKA Berhasil Disimpan', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data RKA Gagal Disimpan', life: 3000 });
                }               
            }

            setRkaDialog(false);
            setRka(emptyRka);
            setSimpanLoading(false)
        }
    };

    const editRka = (rka) => {
        setRka({ ...rka });
        setRkaDialog(true);
    };

    const confirmDeleteRka = (rka) => {
        setRka(rka);
        setDeleteRkaDialog(true);
    };

    const deleteRka = async () => {
        
        setConfirmLoading(true)
        const id = rka.id

        try {
            let urlBukti = rka.file
            let deleteFilePath = urlBukti.replace(`https://storage.googleapis.com/dispusaka-project/`, '')

            await deleteFromBucket(deleteFilePath)

            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/rka/${id}`, {withCredentials: true})
            if (response.status === 200){
                getRka()
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data RKA Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data RKA Gagal Dihapus', life: 3000 });
        }

        setDeleteRkaDialog(false);
        setRka(emptyRka);
        setConfirmLoading(false)
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _rka = { ...rka };
        _rka[`${name}`] = val;

        setRka(_rka);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data RKA" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTambah} />
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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editRka(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteRka(rowData)} />
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
            <h5 className="m-0">Data RKA</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const rkaDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveRka} />
        </>
    );
    const deleteRkaDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteRkaDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteRka} />
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
                        value={rkas}
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
                    <Dialog visible={rkaDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '450px' }} header="Data RKA" modal className="p-fluid" footer={rkaDialogFooter} onHide={hideDialog}>                        
                        <div className="field">
                            <label htmlFor="namaFile">Nama File</label>
                            <InputText id="rka" value={rka.namaFile} onChange={(e) => onInputChange(e, 'namaFile')} required autoFocus className={classNames({ 'p-invalid': submitted && !rka.namaFile })} />
                            {submitted && !rka.namaFile && <small className="p-invalid">Nama File harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tahun">Tahun</label>
                            <InputText id="tahun" value={rka.tahun} onChange={(e) => onInputChange(e, 'tahun')} required className={classNames({ 'p-invalid': submitted && !rka.tahun })} />
                            {submitted && !rka.tahun && <small className="p-invalid">Tahun harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tipe">Tipe</label>
                            <InputText id="tipe" value={"-"} disabled />
                        </div>
                        <div className="field">
                            <label htmlFor="rka">Upload File</label> <br></br>
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
                    <Dialog visible={deleteRkaDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteRkaDialogFooter} onHide={hideDeleteRkaDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {rka && (
                                <span>
                                    Apakah anda yakin ingin menghapus data RKA <b>{rka.namaFile}</b>?
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

