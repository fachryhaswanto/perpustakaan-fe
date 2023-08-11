import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

const Dashboard = () => {
    const [products, setProducts] = useState(null);
    const menu1 = useRef(null);
    const menu2 = useRef(null);
    const [lineOptions, setLineOptions] = useState(null);
    const router = useRouter()
    // const { layoutConfig } = useContext(LayoutContext);

    const [halPersetujuanDPA, setHalPersetujuanDPA] = useState(null)
    const [halDepanDPA, setHalDepanDPA] = useState(null)
    const [skpdDPA, setSkpdDPA] = useState(null)
    const [pendapatanDPA, setPendapatanDPA] = useState(null)
    const [belanjaDPA, setBelanjaDPA] = useState(null)
    const [rincBelanjaDPA, setRincBelanjaDPA] = useState(null)

    const [halPersetujuanDPPA, setHalPersetujuanDPPA] = useState(null)
    const [halDepanDPPA, setHalDepanDPPA] = useState(null)
    const [skpdDPPA, setSkpdDPPA] = useState(null)
    const [pendapatanDPPA, setPendapatanDPPA] = useState(null)
    const [belanjaDPPA, setBelanjaDPPA] = useState(null)
    const [rincBelanjaDPPA, setRincBelanjaDPPA] = useState(null)

    const [lkip, setLkip] = useState(null)
    const [rkpd, setRkpd] = useState(null)
    const [rka, setRka] = useState(null)
    const [renja, setRenja] = useState(null)

    const getHalPersetujuanDPA = async () => {
        try {
            const responseHalPersetujuanDPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dpa/count?tipe=Halaman Persetujuan DPA`, {withCredentials: true})
            if (responseHalPersetujuanDPA) {
                setHalPersetujuanDPA(responseHalPersetujuanDPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getHalDepanDPA = async () => {
        try {
            const responseHalDepanDPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dpa/count?tipe=Halaman Depan DPA`, {withCredentials: true})
            if (responseHalDepanDPA) {
                setHalDepanDPA(responseHalDepanDPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getSkpdDPA = async () => {
        try {
            const responseSkpdDPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dpa/count?tipe=SKPD DPA`, {withCredentials: true})
            if (responseSkpdDPA) {
                setSkpdDPA(responseSkpdDPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getPendapatanDPA = async () => {
        try {
            const responsePendapatanDPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dpa/count?tipe=Pendapatan DPA`, {withCredentials: true})
            if (responsePendapatanDPA) {
                setPendapatanDPA(responsePendapatanDPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getBelanjaDPA = async () => {
        try {
            const responseBelanjaDPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dpa/count?tipe=Belanja DPA`, {withCredentials: true})
            if (responseBelanjaDPA) {
                setBelanjaDPA(responseBelanjaDPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getRincBelanjaDPA = async () => {
        try {
            const responseRincBelanjaDPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dpa/count?tipe=Pendapatan DPA`, {withCredentials: true})
            if (responseRincBelanjaDPA) {
                setRincBelanjaDPA(responseRincBelanjaDPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }



    const getHalPersetujuanDPPA = async () => {
        try {
            const responseHalPersetujuanDPPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dppa/count?tipe=Halaman Persetujuan DPPA`, {withCredentials: true})
            if (responseHalPersetujuanDPPA) {
                setHalPersetujuanDPPA(responseHalPersetujuanDPPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getHalDepanDPPA = async () => {
        try {
            const responseHalDepanDPPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dppa/count?tipe=Halaman Depan DPPA`, {withCredentials: true})
            if (responseHalDepanDPPA) {
                setHalDepanDPPA(responseHalDepanDPPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getSkpdDPPA = async () => {
        try {
            const responseSkpdDPPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dppa/count?tipe=SKPD DPPA`, {withCredentials: true})
            if (responseSkpdDPPA) {
                setSkpdDPPA(responseSkpdDPPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getPendapatanDPPA = async () => {
        try {
            const responsePendapatanDPPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dppa/count?tipe=Pendapatan DPPA`, {withCredentials: true})
            if (responsePendapatanDPPA) {
                setPendapatanDPPA(responsePendapatanDPPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getBelanjaDPPA = async () => {
        try {
            const responseBelanjaDPPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dppa/count?tipe=Belanja DPPA`, {withCredentials: true})
            if (responseBelanjaDPPA) {
                setBelanjaDPPA(responseBelanjaDPPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getRincBelanjaDPPA = async () => {
        try {
            const responseRincBelanjaDPPA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dppa/count?tipe=Pendapatan DPPA`, {withCredentials: true})
            if (responseRincBelanjaDPPA) {
                setRincBelanjaDPPA(responseRincBelanjaDPPA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getLKIP = async () => {
        try {
            const responseLKIP = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/lkip/count`, {withCredentials: true})
            if (responseLKIP) {
                setLkip(responseLKIP.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getRKPD = async () => {
        try {
            const responseRKPD = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/rkpd/count`, {withCredentials: true})
            if (responseRKPD) {
                setRkpd(responseRKPD.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getRKA = async () => {
        try {
            const responseRKA = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/rka/count`, {withCredentials: true})
            if (responseRKA) {
                setRka(responseRKA.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const getRenja = async () => {
        try {
            const responseRenja = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/renja/count`, {withCredentials: true})
            if (responseRenja) {
                setRenja(responseRenja.data)
            }
        } catch(error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    useEffect(() => {
        getHalPersetujuanDPA()
        getHalDepanDPA()
        getSkpdDPA()
        getPendapatanDPA()
        getBelanjaDPA()
        getRincBelanjaDPA()

        getHalPersetujuanDPPA()
        getHalDepanDPPA()
        getSkpdDPPA()
        getPendapatanDPPA()
        getBelanjaDPPA()
        getRincBelanjaDPPA()

        getLKIP()
        getRKPD()
        getRKA()
        getRenja()
    }, []);

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    return (
        <div className="grid">
            <div className="col-12 lg:col-12 xl:col-12">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <div className="text-900 font-medium text-xl">SISTEM INFORMASI PROGRAM DAN PERENCANAAN TERPADU</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Halaman Persetujuan DPA</span>
                            <div className="text-900 font-medium text-xl">{halPersetujuanDPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center ml-2" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-blue-500 text-xl" />
                        </div>
                    </div>
                <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dpa/hal-persetujuan")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Halaman Depan DPA</span>
                            <div className="text-900 font-medium text-xl">{halDepanDPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-orange-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dpa/hal-depan")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">SKPD DPA</span>
                            <div className="text-900 font-medium text-xl">{skpdDPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dpa/skpd")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Pendapatan DPA</span>
                            <div className="text-900 font-medium text-xl">{pendapatanDPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center ml-2" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-purple-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dpa/pendapatan")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Belanja DPA</span>
                            <div className="text-900 font-medium text-xl">{belanjaDPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dpa/rincian-belanja")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Rincian Belanja DPA</span>
                            <div className="text-900 font-medium text-xl">{rincBelanjaDPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dpa/rincian-belanja")}/>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Halaman Persetujuan DPPA</span>
                            <div className="text-900 font-medium text-xl">{halPersetujuanDPPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center ml-2" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-blue-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dppa/hal-persetujuan")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Halaman Depan DPPA</span>
                            <div className="text-900 font-medium text-xl">{halDepanDPPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-orange-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dppa/hal-depan")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">SKPD DPPA</span>
                            <div className="text-900 font-medium text-xl">{skpdDPPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dppa/skpd")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Pendapatan DPPA</span>
                            <div className="text-900 font-medium text-xl">{pendapatanDPPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center ml-2" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-purple-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dppa/pendapatan")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Belanja DPPA</span>
                            <div className="text-900 font-medium text-xl">{belanjaDPPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dppa/rincian-belanja")}/>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-2">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Rincian Belanja DPPA</span>
                            <div className="text-900 font-medium text-xl">{rincBelanjaDPPA} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/dppa/rincian-belanja")}/>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">LKIP</span>
                            <div className="text-900 font-medium text-xl">{lkip} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("file/lkip")}/>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">RKPD</span>
                            <div className="text-900 font-medium text-xl">{rkpd} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/rkpd")}/>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">RKA</span>
                            <div className="text-900 font-medium text-xl">{rka} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/rka")}/>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">RENJA</span>
                            <div className="text-900 font-medium text-xl">{renja} File</div>
                        </div>
                        <div className="flex align-items-center justify-content-center " style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                <Button icon="pi pi-arrow-right" tooltip='Lihat detail' tooltipOptions={{position:'bottom'}} onClick={() => router.push("/renja")}/>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
