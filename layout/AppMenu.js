import getConfig from 'next/config';
import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { UserContext } from './context/usercontext';

const adminMenu = [
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    {
        label: 'Parameter',
        items: [
            { label: 'Rekening', icon: 'pi pi-fw pi-database', to: '/parameter/rekening' },
            { label: 'Instansi', icon: 'pi pi-fw pi-database', to: '/parameter/instansi' },
            { label: 'Bidang', icon: 'pi pi-fw pi-database', to: '/parameter/bidang' },
            { label: 'Pegawai', icon: 'pi pi-fw pi-database', to: '/parameter/pegawai' },
            { label: 'Pejabat', icon: 'pi pi-fw pi-database', to: '/parameter/pejabat' },
            { label: 'Program', icon: 'pi pi-fw pi-database', to: '/parameter/program' },
            { label: 'Kegiatan', icon: 'pi pi-fw pi-database', to: '/parameter/kegiatan' },
            { label: 'Sub Kegiatan', icon: 'pi pi-fw pi-database', to: '/parameter/subkegiatan' },
        ]
    },
    {
        label: 'Proses Surat',
        items: [
            { label: 'Surat Perintah Tugas', icon: 'pi pi-fw pi-file', to: '/surat/spt' },
            { label: 'Surat Perintah Perjalanan Dinas', icon: 'pi pi-fw pi-file', to: '/surat/sppd' },
        ]
    },
];

const bidangMenu = [
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    {
        label: 'Parameter',
        items: [
            { label: 'Rekening', icon: 'pi pi-fw pi-database', to: '/parameter/rekening' },
            { label: 'Pegawai', icon: 'pi pi-fw pi-database', to: '/parameter/pegawai' },
            { label: 'Pejabat', icon: 'pi pi-fw pi-database', to: '/parameter/pejabat' },
            { label: 'Program', icon: 'pi pi-fw pi-database', to: '/parameter/program' },
            { label: 'Kegiatan', icon: 'pi pi-fw pi-database', to: '/parameter/kegiatan' },
            { label: 'Sub Kegiatan', icon: 'pi pi-fw pi-database', to: '/parameter/subkegiatan' },
        ]
    },
    {
        label: 'Proses Surat',
        items: [
            { label: 'Surat Perintah Tugas', icon: 'pi pi-fw pi-file', to: '/surat/spt' },
            { label: 'Surat Perintah Perjalanan Dinas', icon: 'pi pi-fw pi-file', to: '/surat/sppd' },
        ]
    },
];

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const model = adminMenu

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
