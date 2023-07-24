import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { FilterMatchMode } from 'primereact/api';
import { Divider } from 'primereact/divider';
import React, { useEffect, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
import { InputTextarea } from 'primereact/inputtextarea';
import { useRouter } from 'next/router';

const fetcher = url => axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `${url}`).then(res => res.data)

function fetchDataSppd(key, fetcher){
    const {data, error} = useSWR(key, fetcher, {revalidateOnFocus: false})

    return {
        data : data,
        isLoading: !error && !data,
        isError : error
    }
}

function fetchDataInstansi(key, fetcher){
    const {data, error} = useSWR(key, fetcher, {revalidateOnFocus: false})

    return {
        data : data,
        isLoading: !error && !data,
        isError : error
    }
}

function fetchDataPejabat(key, fetcher){
    const {data, error} = useSWR(key, fetcher, {revalidateOnFocus:false})

    return {
        data : data,
        isLoading: !error && !data,
        isError : error
    }
}

const Crud = () => {
    const router = useRouter();

    let emptyJoin = {
        id: '',
        template_sppd: '',
        ditugaskan:'',
        nomor_sppd: '',
        tanggal_sppd: '',
        tingkat_biaya: '',
        instansi: '',
        tanda_tangan: '',
        nomor_spt : '',
        tanggal_spt : '',
        jenis_perjalanan: '',
        keperluan: '',
        alat_angkutan: '',
        tempat_berangkat : '',
        tempat_tujuan : '',
        tanggal_berangkat: '',
        tanggal_kembali: '',
        lama_perjalanan: '',
        pejabat_pemberi: '',
        status : '',
    };

    let emptySppd = {
        template_sppd: '',
        nomor_sppd: '',
        tanggal_sppd: '',
        tingkat_biaya: '',
        instansi: '',
        tanda_tangan: '',
        idspt: ''
    }

    const [sppds, setSppds] = useState(null);
    const [sppdDialog, setSppdDialog] = useState(false);
    const [detailSppdDialog, setDetailSppdDialog] = useState(false);
    const [sppd, setSppd] = useState(emptyJoin);
    const [submitted, setSubmitted] = useState(false);

    const template = [
        {option:"Bupati", value: "Bupati"},
        {option:"Non Bupati", value: "Non Bupati"},
    ]

    const tingkatBiaya = [
        {option: "A", value: "A"},
        {option: "B", value: "B"},
        {option: "C", value: "C"},
        {option: "D", value: "D"},
        {option: "E", value: "E"},
        {option: "F", value: "F"},
        {option: "G", value: "G"},
    ]

    const instansiDrop = []
    const pejabatDrop = []

    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true)

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)

    const [filter, setFilter] = useState(null)
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const {mutate} = useSWRConfig()
    
    const responseSppd = fetchDataSppd("/join", fetcher)

    const responseInstansi = fetchDataInstansi("/instansi", fetcher)
    const responsePejabat = fetchDataPejabat("/pejabat", fetcher)

    const getSession = async () => {

        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
        } catch (error) {
            if(error.response.status === 401) {
                router.push("/")
            }
        }
        
    }

    getSession()

    responseInstansi.data?.map(d => (
        instansiDrop.push({option: d.instansi, value: d.instansi})
    ))
    responsePejabat.data?.map(d => (
        pejabatDrop.push({option: d.nama, value: d.nama})
    ))

    useEffect(() => {

        if (!responseSppd.data) {
            setLoading(false)
        } else if(responseSppd.data){
            setSppds(responseSppd.data)
            setLoading(false)
        }
        initFilter(); 

    }, []);

    const openNew = () => {
        setSppd(emptyJoin);
        setSubmitted(false);
        setSppdDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSppdDialog(false);
        setDetailSppdDialog(false);
    };

    const saveSppd = async () => {
        setSubmitted(true);

        if (sppd.template, sppd.nomor_sppd && sppd.tanggal_sppd && sppd.tingkat_biaya, sppd.instansi, sppd.tanda_tangan) {

            setSimpanLoading(true)

            if (sppd.id) {
                const id = sppd.id;

                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/${id}`, sppd)
                    if (response.status === 200){
                        await mutate("/join")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPT Gagal Diperbarui', life: 3000 });
                }
            } 

            setSimpanLoading(false)
            setSppdDialog(false);
            setSppd(emptyJoin);
        }
    };

    const seeDetailSppdDialog = (sppd) => {    
        setSppd({ ...sppd });
        setDetailSppdDialog(true);
    };
    
    const changePengikut = (pengikut) => {
        try {

            const arrPengikut = JSON.parse(pengikut)
            const pengikutString = arrPengikut.map((d) => d.name).join(', ')
            return pengikutString
        }
        catch (error){
            
        }
        
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        
            const val = (e.target && e.target.value) || '';
            let _sppd = { ...sppd };
            _sppd[`${name}`] = val;
            
            setSppd(_sppd);
    };

    const ambilTanggal = (tanggal) => {
        const date = new Date(tanggal)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = String(date.getDate()).padStart(2, '0')
        const withSlashes = [year,month,day].join("/")
        
        return withSlashes
    }

    const tanggalChange = (tanggal, name) => {

        let _sppd = { ...sppd };
        _sppd[`${name}`] = ambilTanggal(tanggal);
        
        // if(name === 'tanggal_spt'){
        //     let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1))
        //     setMinDateBerangkat(date)
        // } else if (name === 'tanggal_berangkat') {
        //     let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1))
        //     setMinDateKembali(date)
        // }

        setSppd(_sppd);
    }

    const tahunReverse = (string) => {
        return string.split('/').reverse().join('/')
    }

    // const leftToolbarTemplate = () => {
    //     return (
    //         <React.Fragment>
    //             <div className="my-2">
    //                 <Button label="Tambah Data SPT" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} />
    //             </div>
    //         </React.Fragment>
    //     );
    // };

    // const rightToolbarTemplate = () => {
    //     return (
    //         <React.Fragment>
    //             <div className="card">
    //                 <h6>Tahun Anggaran</h6>
    //                 <Dropdown value={tahun} options={tahunSpt} onChange={(e) => setTahun(e.value)} optionLabel="tah" optionValue="value" showClear placeholder="Pilih tahun anggaran" />
    //             </div>
    //         </React.Fragment>
    //     );
    // };

    const nomorSppdBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nomor SPPD</span>
                {rowData.nomor_sppd}
            </>
        );
    };

    const tanggalSppdBodyTemplate = (rowData) => {

        const tanggal_sppd = tahunReverse(rowData.tanggal_sppd)

        return (
            <>
               {tanggal_sppd}
            </>
        );
    };

    const tingkatBiayaBodyTemplate = (rowData) => {

        return (
            <>
               {rowData.tingkat_biaya}
            </>
        );
    };

    const instansiBodyTemplate = (rowData) => {

        return (
            <>
               {rowData.instansi}
            </>
        );
    };

    // const alatAngkutanBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Alat Angkutan</span>
    //             {rowData.alat_angkutan}
    //         </>
    //     );
    // };

    // const tempatBerangkatBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Tempat Berangkat</span>
    //             {rowData.tempat_berangkat}
    //         </>
    //     );
    // };

    // const tempatTujuanBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Tempat Tujuan</span>
    //             {rowData.tempat_tujuan}
    //         </>
    //     );
    // };

    const nomorSptBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nomor SPT</span>
                {rowData.nomor_spt}
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

    // const tanggalSptBodyTemplate = (rowData) => {

    //     const tanggal_spt = tahunReverse(rowData.tanggal_spt)

    //     return (
    //         <>
    //            {tanggal_spt}
    //         </>
    //     );
    // };

    const tandaTanganBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Sub Kegiatan</span>
                {rowData.tanda_tangan}
            </>
        );
    };

    // const jenisPerjalananBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Jenis Perjalanan</span>
    //             {rowData.jenis_perjalanan}
    //         </>
    //     );
    // };

    // const keperluanBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Keperluan</span>
    //             {rowData.keperluan}
    //         </>
    //     );
    // };

    // const tanggalBodyTemplate = (rowData) => {

    //     const tanggal_berangkat = tahunReverse(rowData.tanggal_berangkat)
    //     const tanggal_kembali = tahunReverse(rowData.tanggal_kembali)

    //     return (
    //         <>
    //             <span className="p-column-title">Tanggal</span>
    //             Berangkat: <b>{tanggal_berangkat}</b>
    //             <br></br><br></br>
    //             Kembali: <b>{tanggal_kembali}</b>
    //             <br></br><br></br>
    //             Lama Perjalanan: <Tag value={`${rowData.lama_perjalanan} hari`} ></Tag> 
    //         </>
    //     );
    // };

    // const instansiBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Tanggal</span>
    //             {rowData.instansi}
    //         </>
    //     );
    // };

    // const pejabatBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Pejabat Pemberi Tugas</span>
    //             {rowData.pejabat_pemberi}
    //         </>
    //     );
    // };

    const ditugaskanBodyTemplate = (rowData) => {

        const arrDitugaskan = JSON.parse(rowData.ditugaskan)
        const ditugaskan = arrDitugaskan.map((d) => d.name).join(', ')         

        return (
            <>
                <span className="p-column-title">Ditugaskan kepada</span>
                {ditugaskan}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-send" className="p-button-rounded p-button-success mr-2" onClick={() => seeDetailSppdDialog(rowData)} tooltip="Detail SPPD" tooltipOptions={{position: "top"}} />
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
            <h5 className="m-0">Data SPPD</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const sppdDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveSppd} />
        </>
    );

    const detailSppdDialogFooter = (
        <>
            <Button label="Tutup" className="p-button-text p-button-raised" onClick={hideDialog} />
        </>
    );

    const uploadSuratTugas = (sppd) => {
        setSppd(sppd);
        setUploadFileDialog(true);
    };
    const hideUploadDialog = () => {
        setUploadFileDialog(false)
    }


    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">                    
                    <Toast ref={toast} />
                    {/* <Toolbar className="mb-4"></Toolbar> */}

                    <DataTable
                        ref={dt}
                        value={sppds}
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
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="ditugaskan" header="Ditugaskan kepada" sortable body={ditugaskanBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="nomor_sppd" header="Nomor SPPD" sortable body={nomorSppdBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="tanggal_sppd" header="Tanggal SPPD" sortable body={tanggalSppdBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="tingkat_biaya" header="Tingkat Biaya" sortable body={tingkatBiayaBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="instansi" header="Instansi" sortable body={instansiBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="tanda_tangan" header="Yang Menandatangani" sortable body={tandaTanganBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="nomor_spt" header="Nomor SPT" sortable body={nomorSptBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="status" header="Status" sortable body={statusBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={sppdDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '600px' }} header="Data SPPD" modal className="p-fluid" footer={sppdDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="template">Template SPPD</label>
                            <Dropdown value={sppd.template_sppd} options={template} onChange={(e) => onInputChange(e, 'template_sppd')} autoFocus optionLabel="option" optionValue="value" placeholder="Pilih template SPT" required className={classNames({ 'p-invalid': submitted && !sppd.template_sppd })} />
                            {submitted && !sppd.template_sppd && <small className="p-invalid">Template SPPD harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nomor_sppd">Nomor SPPD</label>
                            <InputText value={sppd.nomor_sppd} autoFocus onChange={(e) => onInputChange(e, 'nomor_sppd')} required className={classNames({'p-invalid' : submitted && !sppd.nomor_sppd})} />
                            {submitted && !sppd.nomor_sppd && <small className="p-invalid">Nomor SPPD harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_spt">Tanggal SPPD</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={new Date(sppd.tanggal_sppd)} showIcon onChange={(e) => tanggalChange(e.value, 'tanggal_sppd')} className={classNames({'p-invalid' : submitted && !sppd.tanggal_sppd})}></Calendar>
                            {submitted && !sppd.tanggal_sppd && <small className="p-invalid">Tanggal SPPD harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="template">Tingkat Biaya</label>
                            <Dropdown value={sppd.tingkat_biaya} options={tingkatBiaya} onChange={(e) => onInputChange(e, 'tingkat_biaya')} optionLabel="option" optionValue="value" placeholder="Pilih tingkat biaya" required className={classNames({ 'p-invalid': submitted && !sppd.tingkat_biaya })} />
                            {submitted && !sppd.tingkat_biaya && <small className="p-invalid">Tingkat biaya harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="template">Intansi</label>
                            <Dropdown value={sppd.instansi} options={instansiDrop} onChange={(e) => onInputChange(e, 'instansi')} optionLabel="option" optionValue="value" placeholder="Pilih instansi" required className={classNames({ 'p-invalid': submitted && !sppd.instansi })} />
                            {submitted && !sppd.instansi && <small className="p-invalid">Instansi harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="template">Pejabat Yang Menandatangani</label>
                            <Dropdown value={sppd.tanda_tangan} options={pejabatDrop} onChange={(e) => onInputChange(e, 'tanda_tangan')} optionLabel="option" optionValue="value" placeholder="Pilih pejabat yang menandatangani" required className={classNames({ 'p-invalid': submitted && !sppd.tanda_tangan })} />
                            {submitted && !sppd.tanda_tangan && <small className="p-invalid">Pejabat yang menandatangani harus dipilih harus dipilih</small>}
                        </div>
                        {/* <div className="field">
                            <label htmlFor="alat_angkutan">Alat Angkutan</label>
                            <Dropdown value={sppd.alat_angkutan} options={alatAngkutan} onChange={(e) => onInputChange(e, 'alat_angkutan')} optionLabel="option" optionValue="value" placeholder="Pilih jenis alat angkutan" required className={classNames({ 'p-invalid': submitted && !sppd.alat_angkutan })} />
                            {submitted && !sppd.alat_angkutan && <small className="p-invalid">Jenis alat angkutan harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tempat_berangkat">Tempat Berangkat</label>
                            <InputText value={sppd.tempat_berangkat} onChange={(e) => onInputChange(e, 'tempat_berangkat')} required className={classNames({'p-invalid' : submitted && !sppd.tempat_berangkat})} />
                            {submitted && !sppd.tempat_berangkat && <small className="p-invalid">Tempat Berangkat harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tempat_tujuan">Tempat Tujuan</label>
                            <InputText value={sppd.tempat_tujuan} onChange={(e) => onInputChange(e, 'tempat_tujuan')} required className={classNames({'p-invalid' : submitted && !sppd.tempat_tujuan})} />
                            {submitted && !sppd.tempat_tujuan && <small className="p-invalid">Tempat Tujuan harus diisi</small>}
                        </div> */}
                    </Dialog>

                    {/* DETAIL SPPD DIALOG*/}
                    <Dialog visible={detailSppdDialog} blockScroll={true} style={{ width: '1100px' }} header="Detil Data SPT dan SPPD" modal className="p-fluid" footer={detailSppdDialogFooter} onHide={hideDialog}>
                        <Divider align="center">
                            <span className="p-tag">SPPD</span>
                        </Divider>
                        <div className="field">
                            <label htmlFor="template_sppd">Template SPPD</label>
                            <InputText value={sppd.template_sppd} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="nomor_sppd">Nomor SPPD</label>
                            <InputText value={sppd.nomor_sppd} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_sppd">Tanggal SPPD</label>
                            <InputText value={tahunReverse(sppd.tanggal_sppd)} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="tingkat_biaya">Tingkat Biaya</label>
                            <InputText value={sppd.tingkat_biaya} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="instansi">Instansi</label>
                            <InputText value={sppd.instansi} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="tanda_tangan">Pejabat yang menandatangani</label>
                            <InputText value={sppd.tanda_tangan} readOnly/>
                        </div>
                        <Divider align="center">
                            <span className="p-tag">SPT</span>
                        </Divider>
                        <div className="field">
                            <label htmlFor="nomor_spt">Nomor SPT</label>
                            <InputText value={sppd.nomor_spt} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_spt">Tanggal SPT</label>
                            <InputText value={sppd.tanggal_spt} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="jenis_perjalanan">Jenis Perjalanan</label>
                            <InputText value={sppd.jenis_perjalanan} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="keperluan">Keperluan</label>
                            <InputTextarea autoResize value={sppd.keperluan} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="alat_angkutan">Alat Angkutan</label>
                            <InputText value={sppd.alat_angkutan} readOnly />
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_spt">Tanggal SPT</label>
                            <InputText value={tahunReverse(sppd.tanggal_spt)} readOnly />
                        </div>
                        <div className="field">
                            <label htmlFor="temmpat_berangkat">Tempat Berangkat</label>
                            <InputText value={sppd.tempat_berangkat} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="tempat_tujuan">Tempat Tujuan</label>
                            <InputText value={sppd.tempat_tujuan} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="tempat_berangkat">Tanggal Berangkat</label>
                            <InputText value={tahunReverse(sppd.tanggal_berangkat)} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_kembali">Tanggal Kembali</label>
                            <InputText value={tahunReverse(sppd.tanggal_kembali)} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="lama_perjalanan">Lama Perjalanan</label>
                            <InputText value={sppd.lama_perjalanan} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="pejabat_pemberi">Pejabat Pemberi</label>
                            <InputText value={sppd.pejabat_pemberi} readOnly/>
                        </div>
                        <div className="field">
                            <label htmlFor="status">Status</label>
                            <InputText value={sppd.status} readOnly/>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;

let PizZipUtils = null;

if (typeof window !== "undefined") {
import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
});
}

function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

 //TEMPLATEING DOCUMENT
 const generateDocument = async (rowData) => {

    const tahunReverse = (string) => {
        return string.split('/').reverse().join('/')
    }

    // let tanggal = tahunReverse(rowData.tanggal_sppd)
    let tahun = new Date().getFullYear()

    let arrdDitugaskan = JSON.parse(rowData.ditugaskan)
    let dataDitugaskanPromise = []
    let dataFDitugaskan = []
    let ditugaskan = []

    let dataPejabat

    try {
        dataPejabat = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat/nama/${rowData.pejabat_pemberi}`)
    } catch (error) {
        console.log(error)
    }

    // console.log(dataPejabat)

    arrdDitugaskan.forEach(function (arrayItem) {
        dataDitugaskanPromise.push(axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/nama/${arrayItem.name}`))
    });

    try {
        dataFDitugaskan = await Promise.all(dataDitugaskanPromise)
    }
    catch (error) {
        console.log(error)
    }

    dataFDitugaskan.map((datas) => {
        ditugaskan.push(datas.data)
    })

    let documentTemplate
    if (rowData.template_sppd === 'Bupati') {
        documentTemplate = 'sppd-bupati-formatted'
    } else if (rowData.template_sppd === 'Non Bupati') {
        documentTemplate = 'sppd-non-bupati-formatted'
    }

    ditugaskan.forEach((arrayItem) => {
      
        loadFile(`/document/${documentTemplate}.docx`, function (
        error,
        content
        ) {
        if (error) {
            throw error;
        }
        var zip = new PizZip(content);
        var doc = new Docxtemplater().loadZip(zip);
        doc.setData({
            nomor_sppd: rowData.nomor_sppd,
            tahun: tahun,
            nama_pemberi: dataPejabat.data.nama,
            nama_ditugaskan: arrayItem.nama,
            pangkat: arrayItem.pangkat,
            golongan: arrayItem.golongan, 
            jabatan: arrayItem.jabatan,
            tingkat_biaya: rowData.tingkat_biaya,
            keperluan: rowData.keperluan,
            alat_angkutan: rowData.alat_angkutan,
            tempat_berangkat: rowData.tempat_berangkat,
            tempat_tujuan: rowData.tempat_tujuan,
            lama_perjalanan: rowData.lama_perjalanan,
            tanggal_berangkat: tahunReverse(rowData.tanggal_berangkat),
            tanggal_kembali: tahunReverse(rowData.tanggal_kembali),
            instansi: rowData.instansi,
            tanggal_sppd: tahunReverse(rowData.tanggal_sppd),
            jabatan_pemberi: dataPejabat.data.jabatan,
            ppt: dataPejabat.data.pangkat,
            gpt: dataPejabat.data.golongan,
            npt: dataPejabat.data.nip,
        });
        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render();
        } catch (error) {
            // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
            function replaceErrors(key, value) {
            if (value instanceof Error) {
                return Object.getOwnPropertyNames(value).reduce(function (
                error,
                key
                ) {
                error[key] = value[key];
                return error;
                },
                {});
            }
            return value;
            }
            console.log(JSON.stringify({ error: error }, replaceErrors));
    
            if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors
                .map(function (error) {
                return error.properties.explanation;
                })
                .join("\n");
            console.log("errorMessages", errorMessages);
            // errorMessages is a humanly readable message looking like this :
            // 'The tag beginning with "foobar" is unopened'
            }
            throw error;
        }
        var out = doc.getZip().generate({
            type: "blob",
            mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }); 
        // Output the document using Data-URI
        saveAs(out, `sppd-${arrayItem.nama}.docx`);
        });
    
    })
    
};