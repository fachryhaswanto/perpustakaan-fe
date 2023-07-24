import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { FilterMatchMode } from 'primereact/api';
import React, { useEffect, useRef, useState } from 'react';
import useSWR, {useSWRConfig} from 'swr';
import axios from 'axios';
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

    let emptyPegawai = {
        nip: '',
        nama: '',
        jenis_kelamin: '',
        status : '',
        tempat_lahir : '',
        tanggal_lahir : '',
        instansi : '',
        bidangId : '',
        golongan : '',
        eselon : '',
        pangkat : '',
        jabatan : '',
        statusPerjalanan : '',
        userId: '',
    };  

    const [session, setSession] = useState(null)
    const router = useRouter()

    const [pegawais, setPegawais] = useState(null);
    const [pegawaiDialog, setPegawaiDialog] = useState(false);
    const [deletePegawaiDialog, setDeletePegawaiDialog] = useState(false);
    const [pegawai, setPegawai] = useState(emptyPegawai);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filter, setFilter] = useState(null);
    const [loading, setLoading] = useState(true);

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const jenisKelDropdown = [
        {label : "Laki-Laki", value: "Laki-Laki"},
        {label : "Perempuan", value: "Perempuan"}
    ]
    const instansiDropdown = []
    const [instansiDropTest, setInstansiDropTest] = useState(null)

    const bidangDropdown = []
    const [bidangDropTest, setBidangDropTest] = useState(null)

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
    const statusDropdown = [
        {label : "Pegawai Negeri Sipil", value : "Pegawai Negeri Sipil"},
        {label : "Pekerja Harian Lepas", value : "Pegawai Harian Lepas"},
    ]

    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;   

    // const responsePegawai = fetchData("/pegawai", fetcher)
    // const responseInstansi = fetchData("/instansi", fetcher)
    // const responseBidang = fetchData("/bidang", fetcher)

    // const {mutate} = useSWRConfig()

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) { 
                setSession(responseSession.data)
                getPegawai(responseSession.data.id)
                getInstansi()
                getBidang(responseSession.data.id)
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getPegawai = async (id) => {
    
        if (id === 8) {
            const responsePegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai`, {withCredentials: true})
            if (responsePegawai.data) {
                setPegawais(responsePegawai.data)
                setLoading(false)
            }
        } else {
            const responsePegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/search?userId=${id}`, {withCredentials: true})
            if (responsePegawai.data) {
                setPegawais(responsePegawai.data)
                setLoading(false)
            } else {
                setLoading(false)
            }
        }
    }
    
    const getInstansi = async () => {
        const responseInstansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/instansi`, {withCredentials: true})
        if (responseInstansi.data) {
            responseInstansi.data?.map(d => (
                instansiDropdown.push({label : d.instansi, value : d.instansi})
            ))
        }
        setInstansiDropTest(instansiDropdown)
    }

    const getBidang = async (id) => {
        if (id === 8) {
            const responseBidang = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/bidang`, {withCredentials: true})
            if (responseBidang.data) {
                responseBidang.data?.map(d => (
                    bidangDropdown.push({label : d.nama_bidang, value : d.id})
                ))
            }
            setBidangDropTest(bidangDropdown)
        } else {
            const responseBidang = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/bidang/${id}`, {withCredentials: true})
            if (responseBidang.data) {
                bidangDropdown.push({label : responseBidang.data.nama_bidang, value : responseBidang.data.id})
            }
            setBidangDropTest(bidangDropdown)
        }
        
    }

    useEffect(() => {
        initFilter()
        getSession()
    }, []); 

    const openNew = () => {
        setPegawai(emptyPegawai);
        setSubmitted(false);
        setPegawaiDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPegawaiDialog(false);
    };

    const hideDeletePegawaiDialog = () => {
        setDeletePegawaiDialog(false);
    };

    const savePegawai = async () => {
        setSubmitted(true);
        
        if (pegawai.nip && pegawai.nama && pegawai.jenis_kelamin && pegawai.status && pegawai.tempat_lahir && pegawai.tanggal_lahir && pegawai.instansi && pegawai.bidangId && pegawai.golongan && pegawai.eselon && pegawai.pangkat && pegawai.jabatan && pegawai.userId && session.id) {
            setSimpanLoading(true);
            if (pegawai.id) {
                // const index = findIndexById(pegawai.id);
                // _kabupatens[index] = _pegawai;
                const id = pegawai.id

                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/${id}`, pegawai, {withCredentials:true})
                    if(response.status === 200){
                        getPegawai(session.id)
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Pegawai Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'success', summary: 'Kesalahan', detail: 'Data Pegawai Gagal Diperbarui', life: 3000 });
                }
            } else {
                // _pegawai.id = createId();
                // _kabupatens.push(_pegawai);
                
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/pegawai", pegawai, {withCredentials:true})
                    if (response.status === 201){
                        getPegawai(session.id)
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Pegawai Berhasil Disimpan', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Pegawai Gagal Disimpan', life: 3000 });
                }
            }

            setPegawaiDialog(false);
            setPegawai(emptyPegawai);
            setSimpanLoading(false);
        }
    };

    const editPegawai = (pegawai) => {
        setPegawai({ ...pegawai });
        setPegawaiDialog(true);
    };

    const confirmDeletePegawai = (pegawai) => {
        setPegawai(pegawai);
        setDeletePegawaiDialog(true);
    };

    const deletePegawai = async () => {

        // let _kabupatens = pegawais.filter((val) => val.id !== pegawai.id);
        setConfirmLoading(true)
        const id = pegawai.id

        try {
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/${id}`, {withCredentials:true})
            if (response.status === 200){
                getPegawai(session.id)
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Pegawai Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Pegawai Gagal Dihapus', life: 3000 });
        }

        setDeletePegawaiDialog(false);
        setPegawai(emptyPegawai);   
        setConfirmLoading(false)    
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _pegawai = { ...pegawai };
        _pegawai[`${name}`] = val;

        if (name === "bidangId") {
            _pegawai["userId"] = val
        }

        setPegawai(_pegawai);
    };

    const tahunReverse = (string) => {
        return string.split('/').reverse().join('/')
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Pegawai" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const nipBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Kode</span>
                {rowData.nip}
            </>
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

    const jeniskelBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Jenis Kelamin</span>
                {rowData.jenis_kelamin}
            </>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                {rowData.status}
            </>
        );
    };
    
    const tempatDanTanggalLahirBodyTemplate = (rowData) => {

        const tanggal_lahir = tahunReverse(rowData.tanggal_lahir)            

        return (
            <>
                <span className="p-column-title">Tempat/Tanggal Lahir</span>
                {rowData.tempat_lahir} / {tanggal_lahir}
            </>
        );
    };

    const instansiBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Instansi</span>
                {rowData.instansi}
            </>
        );
    };

    const bidangBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Bidang</span>
                {rowData.bidang.nama_bidang}
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

    const pangkatBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Pangkat</span>
                {rowData.pangkat}
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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editPegawai(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mt-2" onClick={() => confirmDeletePegawai(rowData)} />
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
            <h5 className="m-0">Data Pegawai</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const pegawaiDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={savePegawai} />
        </>
    );
    const deletePegawaiDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeletePegawaiDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deletePegawai} />
        </>
    );

    const ambilTanggal = (tanggal) => {
        const date = new Date(tanggal)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const withSlashes = [year,month,day].join("/")
        
        return withSlashes
    }

    const tanggalChange = (tanggal, name) => {
        let _pegawai = { ...pegawai };
        _pegawai[`${name}`] = ambilTanggal(tanggal);
        setPegawai(_pegawai);
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={pegawais}
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
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
                        <Column field="nip" header="NIP" sortable body={nipBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="nama" header="Nama Pegawai" sortable body={namaBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="jenis_kelamin" header="Jenis Kelamin" sortable body={jeniskelBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="status" header="Status" sortable body={statusBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="tempat_lahir" header="Tempat / Tanggal Lahir" sortable body={tempatDanTanggalLahirBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="instansi" header="Instansi" sortable body={instansiBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="bidang" header="Bidang" sortable body={bidangBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="golongan" header="Golongan" sortable body={golonganBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="eselon" header="Eselon" sortable body={eselonBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="pangkat" header="Pangkat" sortable body={pangkatBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="jabatan" header="Jabatan" sortable body={jabatanBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={pegawaiDialog} style={{ width: '600px' }} header="Data Pegawai" modal blockScroll={true} closable={!simpanLoading} className="p-fluid" footer={pegawaiDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nip">NIP</label>
                            <InputText id="nip" value={pegawai.nip} onChange={(e) => onInputChange(e, 'nip')} required autoFocus className={classNames({ 'p-invalid': submitted && !pegawai.nip })} />
                            {submitted && !pegawai.nip && <small className="p-invalid">NIP harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nama">Nama Pegawai</label>
                            <InputText id="nama" value={pegawai.nama} onChange={(e) => onInputChange(e, 'nama')} required className={classNames({ 'p-invalid': submitted && !pegawai.nama })} />
                            {submitted && !pegawai.nama && <small className="p-invalid">Nama Pegawai harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="jenis_kelamin">Jenis Kelamin</label>
                            <Dropdown value={pegawai.jenis_kelamin} options={jenisKelDropdown} onChange={(e) => onInputChange(e, 'jenis_kelamin')} optionLabel="label" optionValue='value' placeholder='Pilih Jenis Kelamin' required className={classNames({ 'p-invalid': submitted && !pegawai.jenis_kelamin })} />
                            {submitted && !pegawai.jenis_kelamin && <small className="p-invalid">Jenis Kelamin harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="status">Status</label>
                            <Dropdown value={pegawai.status} options={statusDropdown} onChange={(e) => onInputChange(e, 'status')} optionLabel="label" optionValue='value' placeholder='Pilih Status' required className={classNames({ 'p-invalid': submitted && !pegawai.status })} />
                            {submitted && !pegawai.status && <small className="p-invalid">Status Pegawai harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tempat_lahir">Tempat Lahir</label>
                            <InputText id="tempat_lahir" value={pegawai.tempat_lahir} onChange={(e) => onInputChange(e, 'tempat_lahir')} required className={classNames({ 'p-invalid': submitted && !pegawai.tempat_lahir })} />
                            {submitted && !pegawai.tempat_lahir && <small className="p-invalid">Tempat Lahir harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_lahir">Tanggal Lahir</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={pegawai.tanggal_lahir !== "" ? new Date(pegawai.tanggal_lahir) : null} showIcon onChange={(e) => tanggalChange(e.value, 'tanggal_lahir')} className={classNames({'p-invalid' : submitted && !pegawai.tanggal_lahir})}></Calendar>
                            {submitted && !pegawai.tanggal_lahir && <small className="p-invalid">Tanggal Lahir harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="instansi">Instansi</label>
                            <Dropdown value={pegawai.instansi} options={instansiDropTest} onChange={(e) => onInputChange(e, 'instansi')} optionLabel="label" optionValue='value' placeholder='Pilih Instansi' required filter filterBy='label' className={classNames({ 'p-invalid': submitted && !pegawai.instansi })} />
                            {submitted && !pegawai.instansi && <small className="p-invalid">Instansi harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="bidang">Bidang</label>
                            <Dropdown value={pegawai.bidangId} options={bidangDropTest} onChange={(e) => onInputChange(e, 'bidangId')} optionLabel="label" optionValue='value' placeholder='Pilih Bidang' required filter filterBy='label' className={classNames({ 'p-invalid': submitted && !pegawai.bidangId })} />
                            {submitted && !pegawai.bidangId && <small className="p-invalid">Bidang harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="golongan">Golongan</label>
                            <Dropdown value={pegawai.golongan} options={golonganDropdown} onChange={(e) => onInputChange(e, 'golongan')} optionLabel="label" optionGroupLabel='label' optionGroupChildren='items' optionValue='value' placeholder='Pilih Golongan' required className={classNames({ 'p-invalid': submitted && !pegawai.golongan })} />
                            {submitted && !pegawai.golongan && <small className="p-invalid">Golongan harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="eselon">Eselon</label>
                            <Dropdown value={pegawai.eselon} options={eselonDropDown} onChange={(e) => onInputChange(e, 'eselon')} optionLabel="label" optionValue='value' placeholder='Pilih Eselon' required className={classNames({ 'p-invalid': submitted && !pegawai.eselon })} />
                            {submitted && !pegawai.eselon && <small className="p-invalid">Eselon harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="pangkat">Pangkat</label>
                            <Dropdown value={pegawai.pangkat} options={pangkatDropdown} onChange={(e) => onInputChange(e, 'pangkat')} optionLabel="label" optionValue='value' placeholder='Pilih Pangkat' required className={classNames({ 'p-invalid': submitted && !pegawai.pangkat })} />
                            {submitted && !pegawai.pangkat && <small className="p-invalid">Pangkat harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="jabatan">Jabatan</label>
                            <InputText id="jabatan" value={pegawai.jabatan} onChange={(e) => onInputChange(e, 'jabatan')} required className={classNames({ 'p-invalid': submitted && !pegawai.jabatan })} />
                            {submitted && !pegawai.jabatan && <small className="p-invalid">Jabatan harus diisi</small>}
                        </div>
                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deletePegawaiDialog} style={{ width: '450px' }} header="Konfirmasi" modal blockScroll={true} closable={!confirmLoading} footer={deletePegawaiDialogFooter} onHide={hideDeletePegawaiDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {pegawai && (
                                <span>
                                    Apakah anda yakin ingin menghapus data pegawai <b>{pegawai.nama}</b>?
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
