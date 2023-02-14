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
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { MultiSelect } from 'primereact/multiselect';
import React, { useEffect, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

const fetcher = url => axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `${url}`).then(res => res.data)

function fetchDataSpt(key, fetcher){
    const {data, error} = useSWR(key, fetcher)

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

function fetchDataPegawai(key, fetcher){
    const {data, error} = useSWR(key, fetcher, {revalidateOnFocus:false})

    return {
        data : data,
        isLoading: !error && !data,
        isError : error
    }
}

// function getUniqueTahun(data){
//     const result = []

//     for (const t of data) {
//         result.push({tah : `Tahun anggaran ${t}`, value : t})
//     }

//     return result
// }

const Crud = () => {
    let emptySpt = {
        id : '',
        template : '',
        nomor_spt : '',
        tanggal_spt : '',
        ditugaskan: '',
        jenis_perjalanan: '',
        keperluan: '',
        alat_angkutan: '',
        tempat_berangkat : '',
        tempat_tujuan : '',
        tanggal_berangkat: '',
        tanggal_kembali: '',
        lama_perjalanan: '',
        pejabat_pemberi: '',
        status:'',
        file_surat_tugas: '',
    };

    const [spts, setSpts] = useState(null);
    const [sptDialog, setSptDialog] = useState(false);
    const [deleteSptDialog, setDeleteSptDialog] = useState(false);
    const [spt, setSpt] = useState(emptySpt);
    const [submitted, setSubmitted] = useState(false);
    
    const [uploadFileDialog, setUploadFileDialog] = useState(false)

    const [tahun, setTahun] = useState(null);
    // let tahunSpt = [];
    // let tahunProgram = [];
    // let dataProgram = [];
    // let dataSubKegiatan = [];
    let dataInstansi = [];
    let dataPejabat = [];
    let dataPegawaiDrop = [];
    let dataPegawaiMulti = [];
    const [selectedDitugaskan, setSelectedDitugaskan] = useState(null)
    const [minDateBerangkat, setMinDateBerangkat] = useState(null)
    const [minDateKembali, setMinDateKembali] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [fileUploadId, setFileUploadId] = useState(null)
    const [namaFile, setNamaFile] = useState(null)

    const [responseDitugaskan, setResponseDitugaskan] = useState(null)
    
    const sptOpt = [
        {spt: "Perjalanan dinas dalam daerah", value: "Perjalanan dinas dalam daerah"},
        {spt: "Perjalanan dinas luar daerah", value: "Perjalanan dinas luar daerah"},
        {spt: "Perjalanan dinas luar negeri", value: "Perjalanan dinas luar negeri"},
    ]

    const template = [
        {option:"Bupati", value: "Bupati"},
        {option:"Non Bupati", value: "Non Bupati"},
    ]

    const status = [
        {option:"Belum Kembali", value: "Belum Kembali"},
        {option:"Telah Kembali", value: "Telah Kembali"},
    ]

    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true)

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)

    const [filter, setFilter] = useState(null)
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const {mutate} = useSWRConfig()
    
    const responseSpt = fetchDataSpt("/spt", fetcher)

    // const uniqueTahunSpt = [...new Set(responseSpt.data?.map(d => d.tahun))]
    // tahunSpt = getUniqueTahun(uniqueTahunSpt.sort())

    const responsePejabat = fetchDataPejabat("/pejabat", fetcher)
    const responsePegawai = fetchDataPegawai("/pegawai", fetcher)

    responsePejabat.data?.map(d => (
        dataPejabat.push({option: d.nama, value: d.nama})
    ))
    responsePegawai.data?.map(d => (
        dataPegawaiMulti.push({name : d.nama})
    ))
    responsePegawai.data?.map(d => (
        dataPegawaiDrop.push({option : d.nama, value: d.nama})
    ))

    useEffect(() => {
        if (!responseSpt.data){
            setLoading(false)
        } else if(responseSpt.data){
            setSpts(responseSpt.data)
            setLoading(false)
        }
        initFilter();
    }, [responseSpt.data]);

    // useEffect(() => {
    //     if (responseDitugaskan !== null) {
    //         parsingDitugaskan(responseDitugaskan)
    //     }
    // }, [responseDitugaskan])

    const openNew = async () => {
        const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + "/spt/ditugaskan")
        setResponseDitugaskan(response)
        setSpt(emptySpt);
        setSubmitted(false);
        setSptDialog(true);
        setSelectedDitugaskan(null)
        
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSptDialog(false);
        setSelectedDitugaskan(null)
        setResponseDitugaskan(null)
    };

    const hideUploadFileDialog = () => {
        setUploadFileDialog(false);
        setFileUploadId(null)
        setNamaFile(null)
        setSelectedFile(null)
    };    

    const hideDeleteSptDialog = () => {
        setDeleteSptDialog(false);
        setSelectedDitugaskan(null);
    };

    const saveSpt = async () => {
        setSubmitted(true);

        if (spt.template && spt.nomor_spt && spt.tanggal_spt && spt.jenis_perjalanan && spt.keperluan && spt.alat_angkutan && spt.tempat_berangkat && spt.tempat_tujuan && spt.tanggal_berangkat && spt.tanggal_kembali && selectedDitugaskan !== null && spt.lama_perjalanan && spt.pejabat_pemberi && spt.status) {

            setSimpanLoading(true)
            if (selectedDitugaskan !== null){
                spt.ditugaskan = JSON.stringify(selectedDitugaskan)
            }

            if (spt.id) {
                const id = spt.id;

                try {
                    const response1 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/${id}`, spt)
                    // const response2 = await axios.patch(`http://localhost:4000/sppd/${id}`, spt)
                    if (response1.status === 200){
                        await mutate("/spt")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPT Gagal Diperbarui', life: 3000 });
                }
            } else {
                try {
                    const response1 = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/spt", spt)
                    // const response2 = await axios.post("http://localhost:4000/sppd", spt)
                    if (response1.status === 201){

                        await mutate("/spt")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Disimpan', life: 3000 });                 
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPT Gagal Disimpan', life: 3000 });
                }
            }

            setSimpanLoading(false)
            setSptDialog(false);
            setSpt(emptySpt);
        }
    };

    const editSpt = async (spt) => {
        const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + "/spt/ditugaskan")
        setResponseDitugaskan(response)
        const obj = JSON.parse(spt.ditugaskan)
        setSelectedDitugaskan(obj)
        setSpt({ ...spt });
        setSptDialog(true);
    };

    const openUploadFileDialog = (id) => {
        setUploadFileDialog(true)
        setFileUploadId(id)
    }

    const confirmDeleteSpt = (spt) => {
        setSpt(spt);
        setDeleteSptDialog(true);
    };

    //file upload config
    const onFileChange = (e) => {
        setSelectedFile(e.target.files[0])
        setNamaFile(fileUploadId)
    }
    
    const uploadFile = async () => {
        const formData = new FormData()

        if (!selectedFile){
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Mohon untuk mengupload file', life: 3000 });
        } else if (selectedFile.size > 5000000){
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Ukuran file melebih 5MB', life: 3000 });
        } else {

            setUploadLoading(true)

            formData.append(
                "file",
                selectedFile,
                namaFile
            )
            // console.log(selectedFile)

            try {
                const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + `/upload/`, formData)
                if (response.status === 200) {
                    let id = fileUploadId
                    spt.file_surat_tugas = String(id)
                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'File Berhasil Diupload', life: 3000 });
                    
                    try {
                        const response1 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/${id}`, spt)
                        if (response1.status === 200){
                            await mutate("/spt")
                            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Diperbarui', life: 3000 });
                        }
                    } catch (error) {
                        toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPT Gagal Diperbarui', life: 3000 });
                    }
                }  
            } catch {
                toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'File Gagal Diupload', life: 3000 });
            }
            
            setUploadLoading(false)
            setSpt(emptySpt);
            setUploadFileDialog(false)
        }
    }

    const deleteSpt = async () => {
        // let _spts = spts.filter((val) => val.id !== spt.id);
        const id = spt.id
        setConfirmLoading(true)

        try {
            const response1 = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/${id}`)
            // const response2 = await axios.delete(`http://localhost:4000/sppd/${id}`)

            if (response1.status === 200){
                await mutate("/spt")
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Dihapus', life: 3000 });
            }  
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPT Gagal Dihapus', life: 3000 });
        }

        setDeleteSptDialog(false);
        setSpt(emptySpt);
        setConfirmLoading(false)
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        
            const val = (e.target && e.target.value) || '';
            let _spt = { ...spt };
            _spt[`${name}`] = val;
            
            setSpt(_spt);
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

        let _spt = { ...spt };
        _spt[`${name}`] = ambilTanggal(tanggal);
        
        if(name === 'tanggal_spt'){
            // let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1))
            let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate()))
            setMinDateBerangkat(date)
        } else if (name === 'tanggal_berangkat') {
            let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1))
            setMinDateKembali(date)
        }

        if (_spt["tanggal_berangkat"] && _spt["tanggal_kembali"]) {
            _spt["lama_perjalanan"] = calculateDate(_spt["tanggal_berangkat"], _spt["tanggal_kembali"])
        }

        setSpt(_spt);
    }

    const calculateDate = (tanggal1, tanggal2) => {        
        const date1 = new Date(tanggal1)
        const date2 = new Date(tanggal2)
        const difference = date2.getTime() - date1.getTime()
        
        const totalHari = Math.ceil(difference / (1000 * 3600 * 24))
        // console.log(date1)
        // console.log(date2)
        // console.log(difference)
        // console.log(totalHari)
        if (totalHari > 0) {
            return totalHari.toString()
        }        
    }

    const tahunReverse = (string) => {
        return string.split('/').reverse().join('/')
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data SPT" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

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

    // const tahunBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Tahun</span>
    //             {rowData.tahun}
    //         </>
    //     );
    // };

    const nomorBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nomor SPT</span>
                {rowData.nomor_spt}
            </>
        );
    };

    const tanggalSptBodyTemplate = (rowData) => {

        const tanggal_spt = tahunReverse(rowData.tanggal_spt)

        return (
            <>
               {tanggal_spt}
            </>
        );
    };

    // const programBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Program</span>
    //             {rowData.program}
    //         </>
    //     );
    // };

    // const subKegiatanBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Sub Kegiatan</span>
    //             {rowData.sub_kegiatan}
    //         </>
    //     );
    // };

    const jenisPerjalananBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Jenis Perjalanan</span>
                {rowData.jenis_perjalanan}
            </>
        );
    };

    const keperluanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Keperluan</span>
                {rowData.keperluan}
            </>
        );
    };

    const tanggalBodyTemplate = (rowData) => {

        const tanggal_berangkat = tahunReverse(rowData.tanggal_berangkat)
        const tanggal_kembali = tahunReverse(rowData.tanggal_kembali)

        return (
            <>
                <span className="p-column-title">Tanggal</span>
                Berangkat: <b>{tanggal_berangkat}</b>
                <br></br><br></br>
                Kembali: <b>{tanggal_kembali}</b>
                <br></br><br></br>
                Lama Perjalanan: <Tag value={`${rowData.lama_perjalanan} hari`} ></Tag> 
            </>
        );
    };

    const pejabatBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Pejabat Pemberi Tugas</span>
                {rowData.pejabat_pemberi}
            </>
        );
    };

    const ambilDokumen = async (id) => {
        // await axios.get(`http://localhost:4000/getfile/${id}`)
        window.open(process.env.NEXT_PUBLIC_BASE_URL_API + `/getfile/${id}`)
    }

    const fileBodyTemplate = (rowData) => {
        if (rowData.file_surat_tugas === "") {
            return (
                <>
                    <span className="p-column-title">File Surat Tugas</span>
                    {"Tidak ada file"}
                </>
            );
        } else {
            return (
                <>
                    <span className="p-column-title">File Surat Tugas</span>                    
                    {/* <a href={`http://localhost:4000/getfile/${rowData.id}`} target="_blank">Lihat Dokumen</a> */}
                    <Button label="Lihat Dokumen" className="p-button-raised p-button-text" onClick={() => ambilDokumen(rowData.id)} />
                </>
            );
        }
    };

    // const pengikutBodyTemplate = (rowData) => {

        // const arrPengikut = JSON.parse(rowData.pengikut)
        // const dataPengikut = arrPengikut.map((d) => d.name).join(', ')         

    //     return (
    //         <>
    //             <span className="p-column-title">Pengikut</span>
    //             {dataPengikut}
    //         </>
    //     );
    // };

    const ditugaskanBodyTemplate = (rowData) => {

        const arrDitugaskan = JSON.parse(rowData.ditugaskan)
        const dataDitugaskan = arrDitugaskan.map((d) => d.name).join(', ')         

        return (
            <>
                <span className="p-column-title">Ditugaskan kepada</span>
                {dataDitugaskan}
            </>
        );
    };

    const alatAngkutanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Alat Angkutan</span>
                {rowData.alat_angkutan}
            </>
        );
    };

    const tempatBerangkatBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Tempat Berangkat</span>
                {rowData.tempat_berangkat}
            </>
        );
    };

    const tempatTujuanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Tempat Tujuan</span>
                {rowData.tempat_tujuan}
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

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editSpt(rowData)} tooltip="Edit SPT" tooltipOptions={{position:'top'}} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2" onClick={() => confirmDeleteSpt(rowData)} tooltip="Hapus SPT" tooltipOptions={{position: 'top'}} />
                <Button icon="pi pi-file" className="p-button-rounded p-button-warning mr-2" onClick={() => openUploadFileDialog(rowData.id)} tooltip="Upload File Surat Tugas" tooltipOptions={{position:'top'}} />
                <Button icon="pi pi-file-word" className="p-button-rounded p-button-warning mr-2 mt-2" onClick={() => generateDocument(rowData)} tooltip="Download SPT" tooltipOptions={{position:"top"}} />
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
            <h5 className="m-0">Data SPT</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const sptDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveSpt} />
        </>
    );

     const uploadFileDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={uploadLoading} className="p-button-text p-button-raised" onClick={hideUploadFileDialog} />
            <Button label="Upload File" icon="pi pi-check" loading={uploadLoading} className="p-button-text p-button-raised" onClick={uploadFile} />
        </>
    );

    const deleteSptDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteSptDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteSpt} />
        </>
    );

    //multi select config
    const panelFooterTemplate = () => {
        const selectedItems = selectedDitugaskan;
        const length = selectedItems ? selectedItems.length : 0;
        return (
            <div className="py-2 px-3">
                <b>{length}</b> pegawai terpilih.
            </div>
        );
    }

    // const parsingDitugaskan = (response) => {
    //     if (response.data === null) {

    //     } else {

    //         response.data.map((data) => {
    //             data.ditugaskan = JSON.parse(data.ditugaskan)
    //         })
    //     }
    // }

    const cekPegawaiDitugaskan = async (e) => {
            setSelectedDitugaskan(e)
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">       
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={spts}
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
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '13rem' }}></Column>
                        <Column field="nomor_spt" header="Nomor SPT" sortable body={nomorBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="tanggal_spt" header="Tanggal SPT" sortable body={tanggalSptBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="ditugaskan" header="Ditugaskan kepada" sortable body={ditugaskanBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="jenis_perjalanan" header="Jenis Perjalanan" sortable body={jenisPerjalananBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="keperluan" header="Keperluan" sortable body={keperluanBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tanggal" header="Tanggal" sortable body={tanggalBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="pejabat" header="Pejabat Pemberi Tugas" sortable body={pejabatBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="alat_angkutan" header="Alat Angkutan" sortable body={alatAngkutanBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="tempat_berangkat" header="Tempat Berangkat" sortable body={tempatBerangkatBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="tempat_tujuan" header="Tempat Tujuan" sortable body={tempatTujuanBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="status" header="Status" sortable body={statusBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="file_surat_tugas" header="File Surat Tugas" sortable body={fileBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        {/* <Column field="pengikut" header="Pengikut" sortable body={pengikutBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column> */}
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={sptDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '1100px' }} header="Data SPT" modal className="p-fluid" footer={sptDialogFooter} onHide={hideDialog}>
                        {/* <div className="field">
                            <label htmlFor="tahun">Tahun Anggaran</label>
                            <Dropdown autoFocus value={spt.tahun} options={tahunProgram} onChange={(e) => onInputChange(e, 'tahun')} optionLabel="tah" optionValue="value" placeholder="Pilih tahun anggaran" required className={classNames({ 'p-invalid': submitted && !spt.tahun })} />
                            {submitted && !spt.tahun && <small className="p-invalid">Tahun Program harus diisi</small>}
                        </div> */}
                        <div className="field">
                            <label htmlFor="template">Template SPT</label>
                            <Dropdown value={spt.template} options={template} onChange={(e) => onInputChange(e, 'template')} autoFocus optionLabel="option" optionValue="value" placeholder="Pilih template SPT" required className={classNames({ 'p-invalid': submitted && !spt.template })} />
                            {submitted && !spt.template && <small className="p-invalid">Template SPT harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nomor_spt">Nomor SPT</label>
                            <InputText value={spt.nomor_spt} onChange={(e) => onInputChange(e, 'nomor_spt')} placeholder="Nomor SPT" required className={classNames({'p-invalid' : submitted && !spt.nomor_spt})} />
                            {submitted && !spt.nomor_spt && <small className="p-invalid">Nomor SPT harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="pejabat_pemberi">Pejabat Pemberi Tugas</label>
                            <Dropdown value={spt.pejabat_pemberi} options={dataPejabat} onChange={(e) => onInputChange(e, 'pejabat_pemberi')} optionLabel="option" filter filterBy='option' optionValue="value" placeholder="Pilih pejabat pemberi tugas" required className={classNames({ 'p-invalid': submitted && !spt.pejabat_pemberi })} />
                            {submitted && !spt.pejabat_pemberi && <small className="p-invalid">Pejabat pemberi tugas harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="ditugakan">Ditugaskan kepada</label>
                            <MultiSelect value={selectedDitugaskan} options={dataPegawaiMulti} onChange={(e) => cekPegawaiDitugaskan(e.value)} showSelectAll={false} required optionLabel="name" placeholder="Pilih Pegawai" filter display="chip" panelFooterTemplate={panelFooterTemplate} />
                            {/* <Dropdown value={spt.ditugaskan} options={dataPegawaiDrop} onChange={(e) => onInputChange(e, 'ditugaskan')} optionLabel="option" optionValue="value" placeholder="Pilih ditugaskan kepada" required filter filterBy="option" className={classNames({ 'p-invalid': submitted && !spt.sub_kegiatan })} /> */}
                            {submitted && !selectedDitugaskan && <small className="p-invalid">Pegawai Ditugaskan harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="keperluan">Keperluan</label>
                            <InputTextarea rows={5} cols={30} value={spt.keperluan} onChange={(e) => onInputChange(e, 'keperluan')} autoResize required className={classNames({'p-invalid' : submitted && !spt.keperluan})} />
                            {submitted && !spt.keperluan && <small className="p-invalid">Keperluan harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_spt">Tanggal SPT</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={new Date(spt.tanggal_spt)} showIcon onChange={(e) => tanggalChange(e.value, 'tanggal_spt')} className={classNames({'p-invalid' : submitted && !spt.tanggal_spt})}></Calendar>
                            {submitted && !spt.tanggal_spt && <small className="p-invalid">Tanggal SPT harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="alat_angkutan">Alat Angkutan</label>
                            <InputText value={spt.alat_angkutan} onChange={(e) => onInputChange(e, 'alat_angkutan')} placeholder="Alat Angkutan" required className={classNames({'p-invalid' : submitted && !spt.alat_angkutan})} />
                            {submitted && !spt.alat_angkutan && <small className="p-invalid">Alat angkutan harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tempat_berangkat">Tempat Berangkat</label>
                            <InputText value={spt.tempat_berangkat} onChange={(e) => onInputChange(e, 'tempat_berangkat')} placeholder="Tempat Berangkat" required className={classNames({'p-invalid' : submitted && !spt.tempat_berangkat})} />
                            {submitted && !spt.tempat_berangkat && <small className="p-invalid">Tempat berangkat harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tempat_kembali">Tempat Tujuan</label>
                            <InputText value={spt.tempat_tujuan} onChange={(e) => onInputChange(e, 'tempat_tujuan')} placeholder="Tempat Tujuan" required className={classNames({'p-invalid' : submitted && !spt.tempat_tujuan})} />
                            {submitted && !spt.tempat_tujuan && <small className="p-invalid">Tempat tujuan harus diisi</small>}
                        </div>
                        {/* <div className="field">
                            <label htmlFor="program">Program</label>
                            <Dropdown value={spt.program} options={dataProgram} onChange={(e) => onInputChange(e, 'program')} optionLabel="option" optionValue="value" placeholder="Pilih program" required filter filterBy='option' className={classNames({ 'p-invalid': submitted && !spt.program })} />
                            {submitted && !spt.program && <small className="p-invalid">Program harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="sub_kegiatan">Sub Kegiatan</label>
                            <Dropdown value={spt.sub_kegiatan} options={dataSubKegiatan} onChange={(e) => onInputChange(e, 'sub_kegiatan')} optionLabel="option" optionValue="value" placeholder="Pilih sub kegiatan" required filter filterBy="option" className={classNames({ 'p-invalid': submitted && !spt.sub_kegiatan })} />
                            {submitted && !spt.sub_kegiatan && <small className="p-invalid">Sub Kegiatan harus dipilih</small>}
                        </div> */}
                        <div className="field">
                            <label htmlFor="jenis_perjalanan">Jenis Perjalanan</label>
                            <Dropdown value={spt.jenis_perjalanan} options={sptOpt} onChange={(e) => onInputChange(e, 'jenis_perjalanan')} optionLabel="spt" optionValue="value" placeholder="Pilih jenis perjalanan" required className={classNames({ 'p-invalid': submitted && !spt.jenis_perjalanan })} />
                            {submitted && !spt.jenis_perjalanan && <small className="p-invalid">Jenis perjalanan harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_berangkat">Tanggal Berangkat</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={new Date(spt.tanggal_berangkat)} showIcon disabled={spt.tanggal_spt ? false : true } onChange={(e) => tanggalChange(e.value, 'tanggal_berangkat')} minDate={minDateBerangkat} className={classNames({'p-invalid' : submitted && !spt.tanggal_berangkat})}></Calendar>
                            {submitted && !spt.tanggal_berangkat && <small className="p-invalid">Tanggal berangkat harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_kembali">Tanggal Kembali</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={new Date(spt.tanggal_kembali)} onChange={(e) => tanggalChange(e.value, 'tanggal_kembali')} showIcon disabled={spt.tanggal_berangkat ? false : true } minDate={minDateKembali} className={classNames({'p-invalid' : submitted && !spt.tanggal_kembali})}></Calendar>
                            {submitted && !spt.tanggal_kembali && <small className="p-invalid">Tanggal kembali harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="jumlah_hari">Lama Perjalanan (hari)</label>
                            <InputText id="jumlah_hari" value={spt.lama_perjalanan} disabled />
                        </div>
                        <div className="field">
                            <label htmlFor="status">Status</label>
                            <Dropdown value={spt.status} options={status} onChange={(e) => onInputChange(e, 'status')} optionLabel="option" optionValue="value" placeholder="Pilih status" required className={classNames({ 'p-invalid': submitted && !spt.status })} />
                            {submitted && !spt.status && <small className="p-invalid">Status harus dipilih</small>}
                        </div>
                        {/* <div className="field">
                            <label htmlFor="instansi">Instansi</label>
                            <Dropdown value={spt.instansi} options={dataInstansi} onChange={(e) => onInputChange(e, 'instansi')} optionLabel="option" filter filterBy='option' optionValue="value" placeholder="Pilih instansi" required className={classNames({ 'p-invalid': submitted && !spt.instansi })} />
                            {submitted && !spt.instansi && <small className="p-invalid">Instansi harus dipilih</small>}
                        </div> */}
                        {/* <div className="field">
                            <label htmlFor="pengikut">Pengikut</label>
                            <MultiSelect value={selectedPengikut} options={dataPegawaiMulti} onChange={(e) => setSelectedDitugaskan(e.value)} showSelectAll={false} optionLabel="name" placeholder="Pilih Pengikut" filter display="chip" panelFooterTemplate={panelFooterTemplate} />
                        </div> */}
                    </Dialog>

                    {/* DIALOG UPLOAD FILE */}
                    <Dialog visible={uploadFileDialog} blockScroll={true} closable={!uploadLoading} style={{ width: '450px' }} header="Upload File Surat Tugas" modal footer={uploadFileDialogFooter} onHide={hideUploadFileDialog}>
                        <div className='field'>
                            <label htmlFor="surat_tugas" className='mr-3'>Surat Tugas</label>
                            <input type="file" accept='application/pdf' onChange={(e) => onFileChange(e)} />
                        </div>
                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteSptDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteSptDialogFooter} onHide={hideDeleteSptDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {spt && (
                                <span>
                                    Apakah anda yakin ingin menghapus data SPT ini?
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

// DOCUMENT TEMPLATING

let PizZipUtils = null;

if (typeof window !== "undefined") {
import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
});
}

function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

//TEMPLATING DOCUMENT
const generateDocument = async (rowData) => {

    const tahunReverse = (string) => {
        return string.split('/').reverse().join('/')
    }

    let dataPejabat
    let documentTemplate

    let arrdDitugaskan = JSON.parse(rowData.ditugaskan)
    let dataDitugaskanPromise = []
    let dataFDitugaskan = []
    let ditugaskan = []
    let tanggal = tahunReverse(rowData.tanggal_spt)
    let tahun = new Date().getFullYear()

    try {
        dataPejabat = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat/nama/${rowData.pejabat_pemberi}`)
    } catch (error) {
        console.log(error)
    }
        
    arrdDitugaskan.forEach(function (arrayItem) {
        dataDitugaskanPromise.push(axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/nama/${arrayItem.name}`))
    });
    
    try {
        dataFDitugaskan = await Promise.all(dataDitugaskanPromise)
    }
    catch (error) {
        console.log(error)
    }

    dataFDitugaskan.map((datas, index) => {
        let data = datas.data
        data.i = index+1
        ditugaskan.push(data)
    })
    // console.log(ditugaskan)

    if (rowData.template === 'Bupati') {
        documentTemplate = 'spt-bupati-formatted'
    } else if (rowData.template === 'Non Bupati') {
        documentTemplate = 'spt-non-bupati-formatted'
    }

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
        tahun : tahun,
        nomor_surat: rowData.nomor_spt,
        nama_pemberi_tugas: dataPejabat.data.nama,
        ppt: dataPejabat.data.pangkat,
        gpt: dataPejabat.data.golongan,
        nip_pemberi_tugas: dataPejabat.data.nip,
        jabatan_pemberi_tugas: dataPejabat.data.jabatan,
        dtg: ditugaskan,
        keperluan_kegiatan: rowData.keperluan,
        tanggal_spt: tahunReverse(rowData.tanggal_spt),

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
      saveAs(out, `spt-${tanggal}.docx`);
    });
  };