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
import { Dropdown } from 'primereact/dropdown';
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

    let emptyPejabat = {
        nama : '',
        nip : '',
        pangkat : '',
        golongan : '',
        eselon : '',
        jabatan : '',
    };  

    const msgs = useRef(null)
    const router = useRouter()
    const [disabledTambah, setDisabledTambah] = useState(false)

    const [pejabats, setPejabats] = useState(null);
    const [pejabatDialog, setPejabatDialog] = useState(false);
    const [deletePejabatDialog, setDeletePejabatDialog] = useState(false);
    const [pejabat, setPejabat] = useState(emptyPejabat);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filter, setFilter] = useState(null);
    const [loading, setLoading] = useState(true);

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;   

    const pangkatDropdown = [
        {label : "-", value : "-"},
        {label : "Juru Muda", value : "Juru Muda"},
        {label : "Juru Muda Tingkat I", value : "Juru Muda Tingkat I"},
        {label : "Juru", value : "Juru"},
        {label : "Juru Tingkat I", value : "Juru Tingkat I"},
        {label : "Pengatur Muda", value : "Pengatur Muda"},
        {label : "Pengatur Muda Tingkat I", value : "Pengatur Muda Tingkat I"},
        {label : "Pengatur", value : "Pengatur"},
        {label : "Pengatur Tingkat I", value : "Pengatur Tingkat I"},
        {label : "Penata Muda", value : "Penata Muda"},
        {label : "Penata Muda Tingkat I", value : "Penata Muda Tingkat I"},
        {label : "Penata", value : "Penata"},
        {label : "Penata Tingkat I", value : "Penata Tingkat I"},
        {label : "Pembina", value : "Pembina"},
        {label : "Pembina Tingkat I", value : "Pembina Tingkat I"},
        {label : "Pembina Utama Muda", value : "Pembina Utama Muda"},
        {label : "Pembina Utama Madya", value : "Pembina Utama Madya"},
        {label : "Pembina Utama", value : "Pembina Utama"},
    ]

    const golonganDropdown = [
        {
            label : "Tidak mempunyai golongan", code : "Tidak mempunyai golongan",
            items : [
                {label : "-", value : "-"}
            ]
        },
        {
            label : "Golongan I", code : "Golongan I",
            items : [
                {label : "I/a", value : "I/a"},
                {label : "I/b", value : "I/b"},
                {label : "I/c", value : "I/c"},
                {label : "I/d", value : "I/d"},
            ]
        },
        {
            label : "Golongan II", code : "Golongan II",
            items : [
                {label : "II/a", value : "II/a"},
                {label : "II/b", value : "II/b"},
                {label : "II/c", value : "II/c"},
                {label : "II/d", value : "II/d"},
            ]
        },
        {
            label : "Golongan III", code : "Golongan III",
            items : [
                {label : "III/a", value : "III/a"},
                {label : "III/b", value : "III/b"},
                {label : "III/c", value : "III/c"},
                {label : "III/d", value : "IIId"},
            ]
        },
        {
            label : "Golongan IV", code : "Golongan IV",
            items : [
                {label : "IV/a", value : "IV/a"},
                {label : "IV/b", value : "IV/b"},
                {label : "IV/c", value : "IV/c"},
                {label : "IV/d", value : "IV/d"},
                {label : "IV/e", value : "IV/e"},
            ]
        },
    ]

    const eselonDropDown = [
        {label : "-", value : "-"},
        {label : "Eselon I", value : "Eselon I"},
        {label : "Eselon II", value : "Eselon II"},
        {label : "Eselon III", value : "Eselon III"},
        {label : "Eselon IV", value : "Eselon IV"},
    ]

    const jabatanDropdown = [
        {label : "Sekretaris Daerah", value : "Sekretaris Daerah"},
        {label : "Pengguna Anggaran", value : "Pengguna Anggaran"},
        {label : "Kuasa Pengguna Anggaran", value : "Kuasa Pengguna Anggaran"},
        {label : "Pejabat Pelaksana Teknis Kegiatan", value : "Pejabat Pelaksana Teknis Kegiatan"},
        {label : "Bendahara Pengeluaran", value : "Bendahara Pengeluaran"},
    ]

    // const responsePejabat = fetchData("/pejabat", fetcher)
    // const {mutate} = useSWRConfig()

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                if (responseSession.data.role !== "admin") {
                    msgs.current.show([{ severity: 'error', summary: '', detail: 'Menu ini hanya bisa digunakan oleh akun admin', sticky: true, closable: false }])
                    setDisabledTambah(true)
                } else {
                    getPejabat()
                }
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getPejabat = async () => {
        const responsePejabat = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat`, {withCredentials: true})
        if (responsePejabat.data) {
            setPejabats(responsePejabat.data)
            setLoading(false)
        }
    }

    useEffect(() => {
        initFilter()
        getSession()
    }, []); 

    const openNew = () => {
        setPejabat(emptyPejabat);
        setSubmitted(false);
        setPejabatDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPejabatDialog(false);
    };

    const hideDeletePejabatDialog = () => {
        setDeletePejabatDialog(false);
    };

    const savePejabat = async () => {
        setSubmitted(true);
        
        if (pejabat.nama && pejabat.nip && pejabat.pangkat && pejabat.golongan && pejabat.jabatan) {
            setSimpanLoading(true);
            if (pejabat.id) {
                // const index = findIndexById(pejabat.id);
                // _kabupatens[index] = _pejabat;
                const id = pejabat.id

                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat/${id}`, pejabat, {withCredentials:true})
                    if(response.status === 200){
                        getPejabat()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Pejabat Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'success', summary: 'Kesalahan', detail: 'Data Pejabat Gagal Diperbarui', life: 3000 });
                }
            } else {
                // _pejabat.id = createId();
                // _kabupatens.push(_pejabat);
                
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/pejabat", pejabat, {withCredentials:true})
                    if (response.status === 201){
                        getPejabat()
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Pejabat Berhasil Disimpan', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Pejabat Gagal Disimpan', life: 3000 });
                }
            }

            setPejabatDialog(false);
            setPejabat(emptyPejabat);
            setSimpanLoading(false);
        }
    };

    const editPejabat = (pejabat) => {
        setPejabat({ ...pejabat });
        setPejabatDialog(true);
    };

    const confirmDeletePejabat = (pejabat) => {
        setPejabat(pejabat);
        setDeletePejabatDialog(true);
    };

    const deletePejabat = async () => {

        // let _kabupatens = pejabats.filter((val) => val.id !== pejabat.id);
        setConfirmLoading(true)
        const id = pejabat.id

        try {
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat/${id}`, {withCredentials:true})
            if (response.status === 200){
                getPejabat()
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Pejabat Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Pejabat Gagal Dihapus', life: 3000 });
        }

        setDeletePejabatDialog(false);
        setPejabat(emptyPejabat);   
        setConfirmLoading(false)    
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _pejabat = { ...pejabat };
        _pejabat[`${name}`] = val;

        setPejabat(_pejabat);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Pejabat" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTambah} />
                </div>
            </React.Fragment>
        );
    };

    const namaBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nama</span>
                {rowData.nama}
            </>
        );
    };

    const nipBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">NIP</span>
                {rowData.nip}
            </>
        );
    };

    const pangkatBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Pangkat</span>
                {rowData.pangkat}
            </>
        );
    };

    const golonganBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Golongan</span>
                {rowData.golongan}
            </>
        );
    };

    const eselonBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Eselon</span>
                {rowData.eselon}
            </>
        );
    };

    const jabatanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Jabatan</span>
                {rowData.jabatan}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editPejabat(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeletePejabat(rowData)} />
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
            <h5 className="m-0">Data Pejabat</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const pejabatDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={savePejabat} />
        </>
    );
    const deletePejabatDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeletePejabatDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deletePejabat} />
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
                        value={pejabats}
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
                        <Column field="nama" header="Nama" sortable body={namaBodyTemplate} headerStyle={{ minWidth: '12rem' }}></Column>
                        <Column field="nip" header="NIP" sortable body={nipBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="pangkat" header="Pangkat" sortable body={pangkatBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="golongan" header="Golongan" sortable body={golonganBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="eselon" header="Eselon" sortable body={eselonBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="jabatan" header="Jabatan" sortable body={jabatanBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={pejabatDialog} style={{ width: '450px' }} header="Data Pejabat" modal blockScroll={true} closable={!simpanLoading} className="p-fluid" footer={pejabatDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nama">Nama</label>
                            <InputText id="nama" value={pejabat.nama} onChange={(e) => onInputChange(e, 'nama')} required autoFocus className={classNames({ 'p-invalid': submitted && !pejabat.nama })} />
                            {submitted && !pejabat.nama && <small className="p-invalid">Nama harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nip">NIP</label>
                            <InputText id="nip" value={pejabat.nip} onChange={(e) => onInputChange(e, 'nip')} required className={classNames({ 'p-invalid': submitted && !pejabat.nip })} />
                            {submitted && !pejabat.nip && <small className="p-invalid">NIP harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="pangkat">Pangkat</label>
                            <Dropdown value={pejabat.pangkat} options={pangkatDropdown} onChange={(e) => onInputChange(e, 'pangkat')} optionLabel="label" optionValue='value' placeholder='Pilih Pangkat' required className={classNames({ 'p-invalid': submitted && !pejabat.pangkat })} />
                            {submitted && !pejabat.pangkat && <small className="p-invalid">Pangkat harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="golongan">Golongan</label>
                            <Dropdown value={pejabat.golongan} options={golonganDropdown} onChange={(e) => onInputChange(e, 'golongan')} optionLabel="label" optionGroupLabel='label' optionGroupChildren='items' optionValue='value' placeholder='Pilih Golongan' required className={classNames({ 'p-invalid': submitted && !pejabat.golongan })} />
                            {submitted && !pejabat.golongan && <small className="p-invalid">Golongan harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="eselon">Eselon</label>
                            <Dropdown value={pejabat.eselon} options={eselonDropDown} onChange={(e) => onInputChange(e, 'eselon')} optionLabel="label" optionValue='value' placeholder='Pilih Eselon' required className={classNames({ 'p-invalid': submitted && !pejabat.eselon })} />
                            {submitted && !pejabat.eselon && <small className="p-invalid">Eselon harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="jabatan">Jabatan</label>
                            <Dropdown value={pejabat.jabatan} options={jabatanDropdown} onChange={(e) => onInputChange(e, 'jabatan')} optionLabel="label" optionValue='value' placeholder='Pilih Jabatan' required className={classNames({ 'p-invalid': submitted && !pejabat.jabatan })} />
                            {submitted && !pejabat.jabatan && <small className="p-invalid">Jabatan harus dipilih</small>}
                        </div>
                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deletePejabatDialog} style={{ width: '450px' }} header="Konfirmasi" modal blockScroll={true} closable={!confirmLoading} footer={deletePejabatDialogFooter} onHide={hideDeletePejabatDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {pejabat && (
                                <span>
                                    Apakah anda yakin ingin menghapus data pejabat <b>{pejabat.nama}</b>?
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