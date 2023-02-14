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

const fetcher = url => axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `${url}`).then(res => res.data)

function fetchDataSubKegiatan(key, fetcher){
    const {data, error} = useSWR(key, fetcher, {revalidateOnFocus:false})

    return {
        data : data,
        isLoading: !error && !data,
        isError : error
    }
}

function fetchDataProgram(key, fetcher){
    const {data, error} = useSWR(key, fetcher)

    return {
        data : data,
        isLoading: !error && !data,
        isError : error
    }
}

function getUniqueTahun(data){
    const result = []

    for (const t of data) {
        result.push({tah : `Tahun anggaran ${t}`, value : t})
    }

    return result
}

const Crud = () => {

    let emptySubKegiatan = {
        tahun: '',
        nama_program: '',
        kode: '',
        kegiatan: '',
    };

    const [subKegiatans, setSubKegiatans] = useState(null);
    const [subKegiatanDialog, setSubKegiatanDialog] = useState(false);
    const [deleteSubKegiatanDialog, setDeleteSubKegiatanDialog] = useState(false);
    const [subKegiatan, setSubKegiatan] = useState(emptySubKegiatan);
    const [submitted, setSubmitted] = useState(false);

    const [tahun, setTahun] = useState(null);
    let tahunSubKegiatan = [];
    let tahunProgram = [];
    let dataProgram = [];
    let dataKode = [];

    const [globalFilter, setGlobalFilter] = useState("");
    const [loading, setLoading] = useState(true)

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [filter, setFilter] = useState(null)
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const responseSubKegiatan = fetchDataSubKegiatan("/subkegiatan", fetcher)
    
    const {mutate} = useSWRConfig()

    const uniqueTahunSubKegiatan = [...new Set(responseSubKegiatan.data?.map(d => d.tahun))]
    tahunSubKegiatan = getUniqueTahun(uniqueTahunSubKegiatan.sort())
    
    const responseProgram = fetchDataProgram("/program", fetcher)

    let uniqueTahunProgram = [...new Set(responseProgram.data?.map(d => d.tahun))]
    tahunProgram = getUniqueTahun(uniqueTahunProgram.sort())

    responseProgram.data?.map(d => (
        dataProgram.push({option : d.program, value : d.program}),
        dataKode.push({option : d.kode, value : d.kode})
    ))    

    useEffect(() => {
        if (responseSubKegiatan.data){
            setSubKegiatans(responseSubKegiatan.data)
            setLoading(false)
        }
        initFilter()
    }, [responseSubKegiatan.data]);

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

        if (subKegiatan.kegiatan && subKegiatan.kode && subKegiatan.nama_program && subKegiatan.tahun) {
            setSimpanLoading(true)
            if (subKegiatan.id) {
                const id = subKegiatan.id;
                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/subkegiatan/${id}`, subKegiatan)
                    if (response.status === 200){
                        await mutate("/subkegiatan")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Sub Kegiatan Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error){
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Sub Kegiatan Gagal Diperbarui', life: 3000 });
                }
            } else {
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/subkegiatan", subKegiatan)
                    if (response.status === 201){
                        await mutate("/subkegiatan")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Sub Kegiatan Berhasil Disimpan', life: 3000 });
                    }
                } catch (error) {
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
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/subkegiatan/${id}`)
            if (response.status === 200){
                await mutate("/subkegiatan")
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Sub Kegiatan Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Sub Kegiatan Gagal Dihapus', life: 3000 });
        }
        
        setDeleteSubKegiatanDialog(false);
        setSubKegiatan(emptySubKegiatan);
        setConfirmLoading(false)
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _subKegiatan = { ...subKegiatan };
        _subKegiatan[`${name}`] = val;

        setSubKegiatan(_subKegiatan);
    };

    const onProgramChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _subKegiatan = { ...subKegiatan };
        _subKegiatan[`${name}`] = val;

        for (let index = 0; index < dataProgram.length; index++) {
            const element = dataProgram[index].value;
            if (val === element){
                _subKegiatan["kode"] = dataKode[index].value
                break;
            }
            
        }

        setSubKegiatan(_subKegiatan);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Sub Kegiatan" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    // const rightToolbarTemplate = () => {
    //     return (
    //         <React.Fragment>
    //             <div className="card">
    //                 <h6>Tahun Anggaran</h6>
    //                 <Dropdown value={tahun} options={tahunSubKegiatan} onChange={(e) => setTahun(e.value)} optionLabel="tah" showClear optionValue="value" placeholder="Pilih tahun anggaran" />
    //             </div>
    //         </React.Fragment>
    //     );
    // };

    const tahunBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Tahun</span>
                {rowData.tahun}
            </>
        );
    };

    const namaProgramTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Kode</span>
                {rowData.nama_program}
            </>
        );
    };

    const kodeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Pembebanan</span>
                {rowData.kode}
            </>
        );
    };

    const kegiatanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Program</span>
                {rowData.kegiatan}
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
                        <Column field="tahun" header="Tahun" sortable body={tahunBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="nama_program" header="Nama Program" sortable body={namaProgramTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="kode" header="Kode" sortable body={kodeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="kegiatan" header="Kegiatan" sortable body={kegiatanBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={subKegiatanDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '450px' }} header="Data Sub Kegiatan" modal className="p-fluid" footer={programDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="tahun">Tahun Anggaran</label>
                            <Dropdown value={subKegiatan.tahun} options={tahunProgram} onChange={(e) => onInputChange(e, 'tahun')} autoFocus optionLabel="tah" optionValue="value" placeholder="Pilih Tahun Anggaran" required className={classNames({ 'p-invalid': submitted && !subKegiatan.tahun })} />
                            {submitted && !subKegiatan.tahun && <small className="p-invalid">Tahun Anggaran harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nama_program">Nama Program</label>
                            <Dropdown value={subKegiatan.nama_program} options={dataProgram} onChange={(e) => onProgramChange(e, 'nama_program')} optionLabel="option" optionValue="value" placeholder="Pilih Nama Program" required filter filterBy="option" className={classNames({ 'p-invalid': submitted && !subKegiatan.nama_program })} />
                            {submitted && !subKegiatan.nama_program && <small className="p-invalid">Nama Program harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="kode">Kode</label>
                            <InputText id="kode" value={subKegiatan.kode} disabled />
                        </div>
                        <div className="field">
                            <label htmlFor="kegiatan">Kegiatan</label>
                            <InputTextarea rows={5} cols={30} value={subKegiatan.kegiatan} onChange={(e) => onInputChange(e, 'kegiatan')} autoResize required className={classNames({'p-invalid' : submitted && !subKegiatan.kegiatan})} />
                            {submitted && !subKegiatan.kegiatan && <small className="p-invalid">Kegiatan harus diisi</small>}
                        </div>

                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteSubKegiatanDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteProgramDialogFooter} onHide={hideDeleteSubKegiatanDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {subKegiatan && (
                                <span>
                                    Apakah anda yakin ingin menghapus data Sub Kegiatan <b>{subKegiatan.kegiatan}</b>?
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
