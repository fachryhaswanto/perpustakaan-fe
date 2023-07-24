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
import { Message } from 'primereact/message';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { Fieldset } from 'primereact/fieldset';
import { MultiSelect } from 'primereact/multiselect';
import React, { useEffect, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
import { useRouter } from 'next/router';

const Crud = () => {
    let emptySpt = {
        jenis: '',
        template : '',
        subKegiatanId : '',
        nomor_spt : '',
        tanggal_spt : '',
        rekeningId: '',
        keperluan: '',
        tanggal_berangkat: '',
        tanggal_kembali: '',
        lama_perjalanan: '',
        pejabat_pemberi: '',
        status:'',
        statusSppd: 0,
        file_surat_tugas: '',
        userId: '',
    };

    let dataDitugaskan = []
    let dataPengikut = []

    const router = useRouter()
    const [disabledTombol, setDisabledTombol] = useState(false)
    const [session, setSession] = useState(null)

    const [spts, setSpts] = useState(null);
    const [sptDialog, setSptDialog] = useState(false);
    const [deleteSptDialog, setDeleteSptDialog] = useState(false);
    const [editDataDitugaskanDialog, setEditDataDitugaskanDialog] = useState(false)
    const [spt, setSpt] = useState(emptySpt);
    const [submitted, setSubmitted] = useState(false);
    const [sptId, setSptId] = useState(null)

    const [sptJenis, setSptJenis] = useState(false)
    const [editMode, setEditMode] = useState(false)

    const [fixPegawaiMulti, setFixPegawaiMulti] = useState(null)
    const [dataDitugaskanFill, setDataDitugaskanFill] = useState(null)
    const [disablingEditDataDitugaskan, setDisablingEditDataDitugaskan] = useState(false)
    const [statusSptVar, setStatusSptVar] = useState(null)
    const [nomorSpt, setNomorSpt] = useState(null)
    
    const [uploadFileDialog, setUploadFileDialog] = useState(false)
    const [ditugaskanDialog, setDitugaskanDialog] = useState(false)
    const [statusSpt, setStatusSpt] = useState(false)    
    const [confirmUbahStatusDialog, setConfirmUbahStatusDialog] = useState(false)

    const [tahun, setTahun] = useState(null);
    // let tahunSpt = [];
    // let tahunProgram = [];
    // let dataProgram = [];
    // let dataSubKegiatan = [];
    let dataPejabat = [];
    const [dataPejabatTest, setDataPejabatTest] = useState(null)
    let dataJenisPerjalanan = [];
    const [dataJenisPerjalananTest, setDataJenisPerjalananTest] = useState(null)
    let dataBidang = [];
    const [dataBidangTest, setDataBidangTest] = useState(null)
    let dataSubKegiatan = [];
    const [dataSubKegiatanTest, setDataSubKegiatanTest] = useState(null)
    let dataPegawaiMultiDitugaskan = [];
    let dataPegawaiMultiPengikut = [];
    const [dataPegawai, setDataPegawai] = useState(null)
    const [selectedDitugaskan, setSelectedDitugaskan] = useState(null)
    const [selectedPengikut, setSelectedPengikut] = useState(null)
    const [minDateBerangkat, setMinDateBerangkat] = useState(null)
    const [minDateKembali, setMinDateKembali] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [fileUploadId, setFileUploadId] = useState(null)
    const [namaFile, setNamaFile] = useState(null)
    const [disabledMulti, setDisabledMulti] = useState(null)

    const [selectedBidang, setSelectedBidang] = useState(null)

    const [responseDitugaskan, setResponseDitugaskan] = useState(null)

    const template = [
        {option:"Kepala Badan", value: "Kepala Badan"},
        {option:"Non Kepala Badan", value: "Non Kepala Badan"},
    ]
    
    const jenis = [
        {option:"Baru", value: "Baru"},
        {option:"Lanjutan", value: "Lanjutan"},
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
    
    // const responseSpt = fetchDataSpt("/spt", fetcher)

    // const responsePejabat = fetchDataPejabat("/pejabat", fetcher)
    // const responseJenisPerjalanan = fetchDataJenisPerjalanan("/rekening", fetcher)
    // const responseBidang = fetchBidang("/bidang", fetcher)
    // const responseSubkegiatan = fetchDataSubKegiatan("/subkegiatan", fetcher)
    //// const responsePegawai = fetchDataPegawai("/pegawai/search?statusPerjalanan=Tidak Dalam Perjalanan", fetcher)
   

    // responsePegawai.data?.map(d => {
    //     dataPegawaiMultiDitugaskan.push({name:d.bidang.singkatan + " - " + d.nama, value:d.id})
    // })

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                getSpt(responseSession.data.id)
                getPejabat()
                getJenisPerjalanan()
                getBidang()
                getSubKegiatan()
                setSession(responseSession.data)
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getSpt = async (id) => {
        if (id === 8) {
            const responseSpt = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt`, {withCredentials: true})
            if (responseSpt.data) {
                setSpts(responseSpt.data)
                setDisabledTombol(true)
            }
            setLoading(false)
        } else {
            const responseSpt = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/search?userId=${id}`, {withCredentials: true})
            if (responseSpt.data) {
                setSpts(responseSpt.data)
            }
            setLoading(false)
        }
    }

    const getPejabat = async () => {
        const responsePejabat = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat`, {withCredentials: true})
        if (responsePejabat.data) {
            responsePejabat.data?.map(d => (
                dataPejabat.push({option: d.nama, value: d.nama})
            ))
        }
        setDataPejabatTest(dataPejabat)
    }

    const getJenisPerjalanan = async () => {
        const responseJenisPerjalanan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/rekening`, {withCredentials: true})
        if (responseJenisPerjalanan.data) {
            responseJenisPerjalanan.data?.map(d => (
                dataJenisPerjalanan.push({option:d.kodeRekening + " - " + d.namaRekening, value:d.id})
            ))
        }
        setDataJenisPerjalananTest(dataJenisPerjalanan)
    }

    const getBidang = async () => {
        const responseBidang = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/bidang`, {withCredentials: true})
        if (responseBidang.data) {
            responseBidang.data?.map(d => {
                dataBidang.push({label: d.nama_bidang, value: d.id})
            })
        }
        setDataBidangTest(dataBidang)
    }    
    
    const getSubKegiatan = async () => {
        const responseSubKegiatan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/subkegiatan`, {withCredentials: true})
        if (responseSubKegiatan.data) {
            responseSubKegiatan.data?.map(d => {
                dataSubKegiatan.push({label: d.kodeSubKegiatan + " - " + d.namaSubKegiatan, value:d.id})
            })
        }
        setDataSubKegiatanTest(dataSubKegiatan)
    }

    useEffect(() => {
        getSession()
        initFilter();
    }, []);

    const openNew = async () => {
        // const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + "/spt/ditugaskan")
        // setResponseDitugaskan(response)
        setSpt(emptySpt);
        setSubmitted(false);
        setSptDialog(true);
        setSelectedDitugaskan(null);
        setSelectedPengikut(null);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSptDialog(false);
        setSptJenis(false);
        setEditMode(false)
        setSelectedDitugaskan(null)
        setSelectedPengikut(null)
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
        setSelectedPengikut(null);
    };

    const hideDitugaskanDialog = () => {
        setDitugaskanDialog(false)
        setSelectedDitugaskan(null)
        setFixPegawaiMulti(null)
        setDisabledMulti(false)
        setSptId(null)
    }

    const hideEditDataDitugaskanDialog = () => {
        setEditDataDitugaskanDialog(false)
    }

    const hideStatusSptDialog = () => {
        setStatusSpt(false)
        setStatusSptVar(null)
        setSptId(null)
        setNomorSpt(null)
    }

    const saveSpt = async () => {
        setSubmitted(true);

        spt.userId = session.id

        if (spt.jenis && spt.template && spt.subKegiatanId && spt.nomor_spt && spt.tanggal_spt && spt.rekeningId && spt.keperluan && spt.tanggal_berangkat && spt.tanggal_kembali && spt.lama_perjalanan && spt.pejabat_pemberi && spt.userId) {

            setSimpanLoading(true)

            if (spt.id) {
                const id = spt.id                

                try {
                    const response1 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/${id}`, spt, {withCredentials:true})
                    // const response2 = await axios.patch(`http://localhost:4000/sppd/${id}`, spt)
                    if (response1.status === 200){
                        getSpt(session.id)
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPT Gagal Diperbarui', life: 3000 });
                }
            } else {
                try {
                    const response1 = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/spt", spt, {withCredentials:true})
                    if (response1.status === 201){
                        getSpt(session.id)
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Disimpan', life: 3000 });                 
                    }
                } catch (error) {
                    console.log(error)
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPT Gagal Disimpan', life: 3000 });
                }
            }

            setSimpanLoading(false)
            setSptDialog(false);
            setSpt(emptySpt);
        }
    };

    const saveDitugaskan = async () => {

        setSubmitted(true)
        var pegawaiId = []

        if (selectedDitugaskan && selectedDitugaskan.length !== 0) {
            selectedDitugaskan.map((value =>
                dataDitugaskan.push({sptId: sptId, pegawaiId:value})
            ))
            selectedDitugaskan.map((value =>
                pegawaiId.push(value)    
            ))
            
            setConfirmLoading(true)

            try {
                const response1 = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/dataditugaskan", dataDitugaskan, {withCredentials:true})
                if (response1.status === 201){
                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Ditugaskan Berhasil Disimpan', life: 3000 });                 
                }
            } catch (error) {
                var errString = error.response.data.error
                var errStringSplit = errString.split(",")

                errStringSplit.map(data => {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: data, life: 5000 });
                })
            }

        } else {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terdapat Kesalahan', life: 3000 });
        }

        setSubmitted(false)
        hideDitugaskanDialog()
        setConfirmLoading(false)
        
    }

    const ubahStatusSpt = async () => {
        setConfirmLoading(true)

        var pegawaiIdDitugaskan = []
        var pegawaiIdPengikut = []

        try {

            const response1 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/search?sptId=${sptId}`, {withCredentials:true})
            if (response1.status === 200){
                response1.data?.map(data => {
                    pegawaiIdDitugaskan.push(data.pegawaiId)
                })
            }
            const response2 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/datapengikut/search?sptId=${sptId}`, {withCredentials:true})
            if (response2.status === 200){
                response2.data?.map(data => {
                    pegawaiIdPengikut.push(data.pegawaiId)
                })
            }

            const pegawaiId = pegawaiIdDitugaskan.concat(pegawaiIdPengikut)
            if (pegawaiId.length !== 0) {
                const response3 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/${sptId}`, {status : "Telah Kembali"}, {withCredentials:true})

                const response4 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/batch`, {id : pegawaiId, statusPerjalanan : "Tidak Dalam Perjalanan"}, {withCredentials:true})
                if (response3.status === 200 && response4.status === 200){
                    getSpt(session.id)
                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT dan Pegawai Berhasil Diperbarui', life: 3000 });
                }
            } else {
                toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Mohon untuk menginput data pegawai ditugaskan atau pegawai pengikut pada SPT ini', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terdapat Kesalahan', life: 3000 });
        }

        setConfirmLoading(false)
        hideStatusSptDialog()
        hideConfirmUbahStatus()
    }

    const editSpt = async (spt) => {
        // const responseDitugaskan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + "/spt/ditugaskan")
        // setResponseDitugaskan(responseDitugaskan)
        // const objDitugaskan = JSON.parse(spt.ditugaskan)
        // const objPengikut = JSON.parse(spt.pengikut)
        // setSelectedDitugaskan(objDitugaskan)
        // setSelectedPengikut(objPengikut)/
        setSpt({ ...spt });
        setSptDialog(true);
        setSptJenis(true)
        setEditMode(true)
    };

    const openUploadFileDialog = (id) => {
        setUploadFileDialog(true)
        setFileUploadId(id)
    }

    const openDitugaskanDialog = async (id) => {
        setDitugaskanDialog(true)
        setSptId(id)

        try {
            const responseDataDitugaskan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/search?sptId=${id}`, {withCredentials:true})
            if (responseDataDitugaskan.status === 200) {
                if (responseDataDitugaskan.data === null) {
                    const responseDataPegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai`, {withCredentials:true})
                    if (responseDataPegawai.status === 200) {
                        if (responseDataPegawai.data === null) {

                        } else {
                             responseDataPegawai.data?.map(d => {
                                dataPegawaiMultiDitugaskan.push({name:d.bidang.singkatan + " - " + d.nama, value:d.id})
                            })
                            setFixPegawaiMulti(dataPegawaiMultiDitugaskan)
                        }
                    }
                } else {
                    if (responseDataDitugaskan.data[0].spt.status === "Telah Kembali") {
                        setDisablingEditDataDitugaskan(true)
                        console.log(fixPegawaiMulti)
                    }
                    setDataDitugaskanFill(responseDataDitugaskan.data)
                }
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const openStatusSptDialog = (rowData) => {
        setStatusSpt(true)
        setStatusSptVar(rowData.status)
        setSptId(rowData.id)
        setNomorSpt(rowData.nomor_spt)
    }

    const openConfirmUbahStatus = () => {
        setConfirmUbahStatusDialog(true)
    }

    const hideConfirmUbahStatus = () => {
        setConfirmUbahStatusDialog(false)
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
                const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + `/upload/`, formData, {withCredentials:true})
                if (response.status === 200) {
                    let id = fileUploadId
                    spt.file_surat_tugas = String(id)
                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'File Berhasil Diupload', life: 3000 });
                    
                    try {
                        const response1 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/${id}`, spt, {withCredentials:true})
                        if (response1.status === 200){
                            getSpt(session.id)
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
            const response1 = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/${id}`, {withCredentials:true})
            // const response2 = await axios.delete(`http://localhost:4000/sppd/${id}`)

            if (response1.status === 200){
                getSpt(session.id)
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Dihapus', life: 3000 });
            }  
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPT Gagal Dihapus', life: 3000 });
        }

        setDeleteSptDialog(false);
        setSpt(emptySpt);
        setConfirmLoading(false)
    };

    const editDataDitugaskan = async () => {
        var sptId = dataDitugaskanFill[0].sptId
        var pegawaiId = []

        dataDitugaskanFill?.map(data => {
            pegawaiId.push(data.pegawaiId)
        })

        try {

            const dataPengikutResponse = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/datapengikut/search?sptId=${sptId}`, {withCredentials:true})
            if (dataPengikutResponse.status === 200) {
                if (dataPengikutResponse.data !== null) {
                    dataPengikutResponse.data?.map(data => {
                        pegawaiId.push(data.pegawaiId)
                    })
                }
            }

            const response1 = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/${sptId}`, {withCredentials:true})
            if (response1.status === 200){
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Ditugaskan Berhasil Direset', life: 3000 });
            }

            const responseDataSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?sptId=${sptId}`, {withCredentials:true})
            if (responseDataSppd.status === 200){
                if (responseDataSppd.data === null) {

                } else {
                    const response3 = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/sptid/${sptId}`, {withCredentials:true})
                    if (response3.status === 200) {
                        const response4 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/${sptId}`, {statusSppd : 0}, {withCredentials:true})

                        if (response4.status === 200) {
                            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT pada SPPD Berhasil Direset dan Diperbarui', life: 3000 });
                        }
                    }
                }
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan pada saat reset data', life: 3000 });
        }

        hideDitugaskanDialog()
        setDataDitugaskanFill(null)
        hideEditDataDitugaskanDialog()
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const showDataDitugaskanDialog = () => {
        setEditDataDitugaskanDialog(true)
    }

    const onInputChange = (e, name) => {
        
            const val = (e.target && e.target.value) || '';
            let _spt = { ...spt };
            _spt[`${name}`] = val;
            
            setSpt(_spt);
    };


    // const onBidangChange = async (e) => {
    //     setSelectedBidang(e)
    //     setSelectedDitugaskan(null)

    //     try {
    //         const response1 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/search?bidangid=${e}&statusperjalanan=tidak dalam perjalanan`)
    //         if (response1.status === 200){
    //             if (response1.data === null) {
    //                 setDataPegawai(null)
    //             } else {
    //                 var dataPegawaiMultiDitugaskan = []
    //                 response1.data?.map(d => {
    //                     dataPegawaiMultiDitugaskan.push({name: d.nama, value: d.id})
    //                 })
    //                 setDataPegawai(dataPegawaiMultiDitugaskan)
    //             }
    //         }
    //     } catch (error) {
    //         toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terdapat kesalahan', life: 3000 });
    //     }
    // }

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

            _spt["tanggal_berangkat"] = ""
            _spt["tanggal_kembali"] = ""
            _spt["lama_perjalanan"] = ""

        } else if (name === 'tanggal_berangkat') {
            let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1))
            setMinDateKembali(date)

            _spt["tanggal_kembali"] = ""
            _spt["lama_perjalanan"] = ""
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
                    <Button label="Tambah Data SPT" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTombol} />
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

    const subKegiatanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Sub Kegiatan</span>
                {rowData.subKegiatan.namaSubKegiatan} 
            </>
        )
    }

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
                {rowData.rekening.namaRekening}
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

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editSpt(rowData)} tooltip="Edit SPT" tooltipOptions={{position:'top'}} disabled={disabledTombol} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2" onClick={() => confirmDeleteSpt(rowData)} tooltip="Hapus SPT" tooltipOptions={{position: 'top'}} disabled={disabledTombol} />
                <Button icon="pi pi-file-word" className="p-button-rounded p-button-warning mr-2 mt-2" onClick={() => generateDocument(rowData)} tooltip="Download SPT" tooltipOptions={{position:"top"}} />
                {/* <Button icon="pi pi-file" className="p-button-rounded p-button-warning mr-2" onClick={() => openUploadFileDialog(rowData.id)} tooltip="Upload File Surat Tugas" tooltipOptions={{position:'top'}} /> */}
                <Button icon="pi pi-info" className="p-button-rounded p-button-info mr-2 mt-2" onClick={() => openStatusSptDialog(rowData)} tooltip="Status SPT" tooltipOptions={{position:"top"}} disabled={disabledTombol} />
            </>
        );
    };
    
    const ditugaskanPengikutBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-users" className="p-button-rounded p-button-info mr-2" onClick={() => openDitugaskanDialog(rowData.id)} tooltip="Pegawai Ditugaskan" tooltipOptions={{position:'top'}} disabled={disabledTombol} />
            </>
        );
    };

    const jenisSptBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Jenis SPT</span>
                {rowData.jenis}
            </>
        );
    };

    const templateSptBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Template SPT</span>
                {rowData.template}
            </>
        );
    };

    const statusSptBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Pejabat Pemberi Tugas</span>
                {rowData.status}
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

    const ditugaskanDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDitugaskanDialog} />
            <Button label="Simpan" icon="pi pi-check" disabled={!selectedDitugaskan} loading={confirmLoading} className="p-button-raised p-button-text" onClick={saveDitugaskan} />
        </>
    );

    const ditugaskanDialogFooterFilled = (
        <>
            <Button label="Kembali" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDitugaskanDialog} />
            <Button label="Ubah Data Ditugaskan" icon="pi pi-check" disabled={disablingEditDataDitugaskan} loading={confirmLoading} className="p-button-raised p-button-text p-button-warning" onClick={showDataDitugaskanDialog} />
        </>
    );

    const editDataDitugaskanDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideEditDataDitugaskanDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text p-button-warning" onClick={editDataDitugaskan} />
        </>
    );

    const statusSptDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideStatusSptDialog} />
            <Button label="Ubah Status SPT" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={openConfirmUbahStatus} />
        </>
    )

    const statusSptDialogFooterBacked = (
        <>
            
        </>
    )

    const confirmUbahStatusDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideConfirmUbahStatus} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={ubahStatusSpt} />
        </>
    )

    //multi select config
    const panelFooterTemplateDitugaskan = () => {
        const selectedItems = selectedDitugaskan;
        const length = selectedItems ? selectedItems.length : 0;
        return (
            <div className="py-2 px-3">
                <b>{length}</b> terpilih.
            </div>
        );
    }

    const panelFooterTemplatePengikut = () => {
        const selectedItems = selectedPengikut;
        const length = selectedItems ? selectedItems.length : 0;
        return (
            <div className="py-2 px-3">
                <b>{length}</b> terpilih
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

    const cekPegawaiDitugaskan = (e) => {
            setSelectedDitugaskan(e)
    }

    const cekPegawaiPengikut = (e) => {
            setSelectedPengikut(e)
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
                        <Column body={ditugaskanPengikutBodyTemplate} header="Pegawai Ditugaskan" headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={jenisSptBodyTemplate} header="Jenis SPT" headerStyle={{ minWidth: '7rem' }}></Column>
                        <Column body={templateSptBodyTemplate} header="Template SPT" headerStyle={{ minWidth: '7rem' }}></Column>
                        <Column body={statusSptBodyTemplate} header="Status SPT" headerStyle={{ minWidth: '7rem' }}></Column>
                        <Column field="subKegiatan" header="Sub Kegiatan" sortable body={subKegiatanBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="nomor_spt" header="Nomor SPT" sortable body={nomorBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="tanggal_spt" header="Tanggal SPT" sortable body={tanggalSptBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="jenis_perjalanan" header="Jenis Perjalanan" sortable body={jenisPerjalananBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="keperluan" header="Keperluan" sortable body={keperluanBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tanggal" header="Tanggal" sortable body={tanggalBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="pejabat" header="Pejabat Pemberi Tugas" sortable body={pejabatBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
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
                            <label htmlFor="jenis">Jenis SPT</label>
                            <Dropdown value={spt.jenis} options={jenis} onChange={(e) => onInputChange(e, 'jenis')} autoFocus optionLabel="option" optionValue="value" disabled={sptJenis} placeholder="Pilih template SPT" required className={classNames({ 'p-invalid': submitted && !spt.template })} />
                            {submitted && !spt.template && <small className="p-invalid">Template SPT harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="template">Template SPT</label>
                            <Dropdown value={spt.template} options={template} onChange={(e) => onInputChange(e, 'template')} optionLabel="option" optionValue="value" disabled={spt.status === "Telah Kembali" ? true : false} placeholder="Pilih template SPT" required className={classNames({ 'p-invalid': submitted && !spt.template })} />
                            {submitted && !spt.template && <small className="p-invalid">Template SPT harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="subKegiatan">Sub Kegiatan</label>
                            <Dropdown value={spt.subKegiatanId}  disabled={spt.status === "Telah Kembali" ? true : false} options={dataSubKegiatanTest} onChange={(e) => onInputChange(e, 'subKegiatanId')} optionLabel="label" optionValue="value" filter placeholder="Pilih Sub Kegiatan" required className={classNames({ 'p-invalid': submitted && !spt.subKegiatanId })} />
                            {submitted && !spt.subKegiatanId && <small className="p-invalid">Sub Kegiatan harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nomor_spt">Nomor SPT</label>
                            <InputText value={spt.nomor_spt} onChange={(e) => onInputChange(e, 'nomor_spt')} placeholder="Nomor SPT" required  disabled={spt.status === "Telah Kembali" ? true : false} className={classNames({'p-invalid' : submitted && !spt.nomor_spt})} />
                            {submitted && !spt.nomor_spt && <small className="p-invalid">Nomor SPT harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="pejabat_pemberi">Pejabat Pemberi Tugas</label>
                            <Dropdown value={spt.pejabat_pemberi} options={dataPejabatTest} onChange={(e) => onInputChange(e, 'pejabat_pemberi')} optionLabel="option" filter filterBy='option' optionValue="value" placeholder="Pilih pejabat pemberi tugas" required  disabled={spt.status === "Telah Kembali" ? true : false} className={classNames({ 'p-invalid': submitted && !spt.pejabat_pemberi })} />
                            {submitted && !spt.pejabat_pemberi && <small className="p-invalid">Pejabat pemberi tugas harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="keperluan">Keperluan</label>
                            <InputTextarea rows={5} cols={30} value={spt.keperluan} onChange={(e) => onInputChange(e, 'keperluan')} autoResize required  disabled={spt.status === "Telah Kembali" ? true : false} className={classNames({'p-invalid' : submitted && !spt.keperluan})} />
                            {submitted && !spt.keperluan && <small className="p-invalid">Keperluan harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_spt">Tanggal SPT</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={spt.tanggal_spt !== "" ? new Date(spt.tanggal_spt) : null} showIcon  disabled={editMode} onChange={(e) => tanggalChange(e.value, 'tanggal_spt')} className={classNames({'p-invalid' : submitted && !spt.tanggal_spt})}></Calendar>
                            {submitted && !spt.tanggal_spt && <small className="p-invalid">Tanggal SPT harus dipilih</small>}
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
                            <Dropdown value={spt.rekeningId} options={dataJenisPerjalananTest} onChange={(e) => onInputChange(e, 'rekeningId')} optionLabel="option" optionValue="value" placeholder="Pilih jenis perjalanan" required  disabled={spt.status === "Telah Kembali" ? true : false} className={classNames({ 'p-invalid': submitted && !spt.rekeningId })} />
                            {submitted && !spt.rekeningId && <small className="p-invalid">Jenis perjalanan harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_berangkat">Tanggal Berangkat</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={spt.tanggal_berangkat !== "" ? new Date(spt.tanggal_berangkat) : null} showIcon disabled={(spt.tanggal_spt && !editMode) || (!spt.tanggal_spt && editMode) ? false : true } onChange={(e) => tanggalChange(e.value, 'tanggal_berangkat')} minDate={minDateBerangkat} className={classNames({'p-invalid' : submitted && !spt.tanggal_berangkat})}></Calendar>
                            {submitted && !spt.tanggal_berangkat && <small className="p-invalid">Tanggal berangkat harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_kembali">Tanggal Kembali</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={spt.tanggal_kembali !== "" ? new Date(spt.tanggal_kembali) : null} onChange={(e) => tanggalChange(e.value, 'tanggal_kembali')} showIcon disabled={(spt.tanggal_berangkat && !editMode) || (!spt.tanggal_berangkat && editMode) ? false : true } minDate={minDateKembali} className={classNames({'p-invalid' : submitted && !spt.tanggal_kembali})}></Calendar>
                            {submitted && !spt.tanggal_kembali && <small className="p-invalid">Tanggal kembali harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="jumlah_hari">Lama Perjalanan (hari)</label>
                            <InputText id="jumlah_hari" value={spt.lama_perjalanan} disabled />
                        </div>
                        {/* <div className="field">
                            <label htmlFor="instansi">Instansi</label>
                            <Dropdown value={spt.instansi} options={dataInstansi} onChange={(e) => onInputChange(e, 'instansi')} optionLabel="option" filter filterBy='option' optionValue="value" placeholder="Pilih instansi" required className={classNames({ 'p-invalid': submitted && !spt.instansi })} />
                            {submitted && !spt.instansi && <small className="p-invalid">Instansi harus dipilih</small>}
                        </div> */}
                        {/* <div className="field">
                            <label htmlFor="pengikut">Pengikut</label>
                            <MultiSelect value={selectedPengikut} options={dataPegawaiMultiDitugaskan} onChange={(e) => setSelectedDitugaskan(e.value)} showSelectAll={false} optionLabel="name" placeholder="Pilih Pengikut" filter display="chip" panelFooterTemplate={panelFooterTemplate} />
                        </div> */}
                    </Dialog>

                     {/* DIALOG DITUGASKAN DATA */}
                     <Dialog visible={ditugaskanDialog} blockScroll={true} className="p-fluid" closable={!confirmLoading} style={{ width: '700px' }} header="Data Pegawai Ditugaskan" modal footer={fixPegawaiMulti !== null ? ditugaskanDialogFooter : ditugaskanDialogFooterFilled } onHide={hideDitugaskanDialog}>
                        <div className="field">
                            <label htmlFor="ditugaskan">Ditugaskan kepada</label>
                            {fixPegawaiMulti !== null ? (
                            <MultiSelect value={selectedDitugaskan} options={fixPegawaiMulti} onChange={(e) => cekPegawaiDitugaskan(e.value)} showSelectAll={false} required optionLabel="name" optionValue="value" placeholder="Pilih yang ditugaskan" filter display="chip" panelFooterTemplate={panelFooterTemplateDitugaskan} disabled={confirmLoading || disabledMulti} />
                            ) : (
                                dataDitugaskanFill?.map(data => {                                    
                                    return (
                                    <Fieldset key={data.pegawaiId} legend={data.pegawai.bidang.singkatan + " - " + data.pegawai.nama} toggleable>
                                        <p className="m-0">
                                            {"NIP : " + data.pegawai.nip}
                                        </p>
                                    </Fieldset>
                                    )
                                })
                            )}           
                            {/* {submitted && !selectedDitugaskan && <small className="p-invalid"> Pegawai Ditugaskan Harus Dipilih</small>} */}
                        </div>
                    </Dialog>

                     {/* DIALOG EDIT DATA DITUGASKAN */}
                     <Dialog visible={editDataDitugaskanDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={editDataDitugaskanDialogFooter} onHide={hideEditDataDitugaskanDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {spt && (
                                <span>
                                    <p>Apakah anda yakin ingin mengubah data <b>ditugaskan</b> untuk SPT ini ?</p>
                                    <b><p>Perubahan data ditugaskan akan mereset data pegawai ditugaskan dan data SPPD yang telah diinput</p></b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* DIALOG STATUS SPT */}
                    <Dialog visible={statusSpt} blockScroll={true} className="p-fluid" closable={!confirmLoading} style={{ width: '350px' }} header="Status SPT" modal footer={statusSptVar === "Belum Kembali" ? statusSptDialogFooter : statusSptDialogFooterBacked} onHide={hideStatusSptDialog}>
                        <div className="field">
                            <Message severity={statusSptVar === "Belum Kembali" ? 'warn' : 'success'} text={statusSptVar} />
                        </div>
                    </Dialog>

                    {/* DIALOG CONFIRM UBAH STATUS SPT */}
                    <Dialog visible={confirmUbahStatusDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '500px' }} header="Konfirmasi" modal footer={confirmUbahStatusDialogFooter} onHide={hideConfirmUbahStatus}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                <span>
                                    <p>Apakah anda yakin ingin mengubah status SPT ini, dengan nomor SPT <b>{nomorSpt}</b> ?</p>
                                    <b><p>Perubahan data status SPT akan mengakibatkan tidak dapat diubahnya data SPT dan SPPD ini</p></b>
                                </span>
                        </div>
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
                                    Apakah anda yakin ingin menghapus data SPT ini?<br></br><br></br>
                                    <b><p>Penghapusan SPT ini akan menghapus SPPD yang terhubung pada SPT ini</p></b>
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
        dataPejabat = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat/nama/${rowData.pejabat_pemberi}`, {withCredentials:true})
    } catch (error) {
        console.log(error)
    }
        
    arrdDitugaskan.forEach(function (arrayItem) {
        dataDitugaskanPromise.push(axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/nama/${arrayItem.name}`), {withCredentials:true})
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

    if (rowData.template === 'Kepala Badan') {
        documentTemplate = 'spt-bupati-formatted'
    } else if (rowData.template === 'Non Kepala Badan') {
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