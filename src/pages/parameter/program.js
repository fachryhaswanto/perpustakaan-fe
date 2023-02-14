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

function fetchData(key, fetcher){
    const {data, error} = useSWR(key, fetcher, {revalidateOnFocus:false})

    return {
        data : data,
        isLoading: !error && !data,
        isError : error
    }
}

const Crud = () => {
    let emptyProgram = {
        tahun: '',
        kode: '',
        pembebanan: '',
        program: '',
    };

    const [programs, setPrograms] = useState(null);
    const [programDialog, setProgramDialog] = useState(false);
    const [deleteProgramDialog, setDeleteProgramDialog] = useState(false);
    const [program, setProgram] = useState(emptyProgram);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [tahun, setTahun] = useState(null);
    const tahuns = []

    const pembebanans = [
        {pem: "APBD", value: "APBD"},
        {pem: "APBN", value: "APBN"}
    ]

    const [globalFilter, setGlobalFilter] = useState('');
    const [filter, setFilter] = useState(null)
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const responseProgram = fetchData("/program", fetcher)

    const {mutate} = useSWRConfig()
    
    let uniqueTahun = [...new Set(responseProgram.data?.map(d => d.tahun))]

    for (const t of uniqueTahun.sort()){
        tahuns.push({tah : `Tahun anggaran ${t}`, value : t})
    }

    useEffect(() => {
        if(responseProgram.data){
            setPrograms(responseProgram.data)
            setLoading(false)
        }
        initFilter()
    }, [responseProgram.data]);

    const openNew = () => {
        setProgram(emptyProgram);
        setSubmitted(false);
        setProgramDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProgramDialog(false);
    };

    const hideDeleteProgramDialog = () => {
        setDeleteProgramDialog(false);
    };

    const saveProgram = async () => {
        setSubmitted(true);

        if (program.kode && program.pembebanan && program.program && program.tahun) {
            setSimpanLoading(true)
            if (program.id) {
                const id = program.id;
                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/program/${id}`, program)
                    if (response.status === 200){
                        await mutate("/program")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Program Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Program Gagal Diperbarui', life: 3000 });
                }
            } else {
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + "/program", program)
                    if (response.status === 201) {
                        await mutate("/program")
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Progam Berhasil Disimpan', life: 3000 });
                    }
                } catch {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Program Gagal Disimpan', life: 3000 });
                }
                
            }

            setSimpanLoading(false)
            setProgramDialog(false);
            setProgram(emptyProgram);
        }
    };

    const editProgram = (program) => {
        setProgram({ ...program });
        setProgramDialog(true);
    };

    const confirmDeleteProgram = (program) => {
        setProgram(program);
        setDeleteProgramDialog(true);
    };

    const deleteProgram = async () => {
        // let _programs = programs.filter((val) => val.id !== program.id);
        const id = program.id
        setConfirmLoading(true)

        try {
            const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/program/${id}`)
            if (response.status === 200){
                await mutate("/program")
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Program Berhasil Dihapus', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Program Gagal Dihapus', life: 3000 });
        }

        setDeleteProgramDialog(false)
        setProgram(emptyProgram)
        setConfirmLoading(false)
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _program = { ...program };
        _program[`${name}`] = val;

        setProgram(_program);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Program" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} />
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

    const tahunBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Tahun</span>
                {rowData.tahun}
            </>
        );
    };

    const kodeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Kode</span>
                {rowData.kode}
            </>
        );
    };

    const pembebananBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Pembebanan</span>
                {rowData.pembebanan}
            </>
        );
    };

    const programBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Program</span>
                {rowData.program}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editProgram(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteProgram(rowData)} />
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
            <h5 className="m-0">Data Program</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const programDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveProgram} />
        </>
    );
    const deleteProgramDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteProgramDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteProgram} />
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
                        value={programs}
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
                        <Column field="kode" header="Kode" sortable body={kodeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="pembebanan" header="Pembebanan" sortable body={pembebananBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="program" header="Program" sortable body={programBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={programDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '450px' }} header="Data Program" modal className="p-fluid" footer={programDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="tahun">Tahun Anggaran</label>
                            <InputText id="tahun" value={program.tahun} onChange={(e) => onInputChange(e, 'tahun')} required autoFocus className={classNames({ 'p-invalid': submitted && !program.tahun })} />
                            {submitted && !program.tahun && <small className="p-invalid">Tahun Program harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="kode">Kode</label>
                            <InputText id="kode" value={program.kode} onChange={(e) => onInputChange(e, 'kode')} required className={classNames({ 'p-invalid': submitted && !program.kode })} />
                            {submitted && !program.kode && <small className="p-invalid">Kode Program harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="pembebanan">Pembebanan Anggaran</label>
                            <Dropdown value={program.pembebanan} options={pembebanans} onChange={(e) => onInputChange(e, 'pembebanan')} optionLabel="pem" optionValue="value" placeholder="Pilih pembebanan" required className={classNames({ 'p-invalid': submitted && !program.pembebanan })} />
                            {submitted && !program.pembebanan && <small className="p-invalid">Pembebanan Anggaran harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="program">Program</label>
                            <InputTextarea rows={5} cols={30} value={program.program} onChange={(e) => onInputChange(e, 'program')} autoResize required className={classNames({'p-invalid' : submitted && !program.program})} />
                            {submitted && !program.program && <small className="p-invalid">Program harus diisi</small>}
                        </div>

                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteProgramDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteProgramDialogFooter} onHide={hideDeleteProgramDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {program && (
                                <span>
                                    Apakah anda yakin ingin menghapus data program <b>{program.program}</b>?
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
