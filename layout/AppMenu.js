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
        label: 'upload file',
        items: [
            {
                label: 'Dokumen Pelaksanaan Anggaran',
                icon: 'pi pi-fw pi-book',
                items: [
                    {
                        label: 'Halaman Persetujuan DPA',
                        icon: 'pi pi-fw pi-file',
                        to: '/dpa/hal-persetujuan'
                    },
                    {
                        label: 'Halaman Depan DPA',
                        icon: 'pi pi-fw pi-file',
                        to: '/dpa/hal-depan'
                    },
                    {
                        label: 'DPA SKPD',
                        icon: 'pi pi-fw pi-file',
                        to: '/dpa/skpd'
                    },
                    {
                        label: 'DPA Pendapatan',
                        icon: 'pi pi-fw pi-file',
                        to: '/dpa/pendapatan'
                    },
                    {
                        label: 'DPA Belanja',
                        icon: 'pi pi-fw pi-file',
                        to: '/dpa/belanja'
                    },
                    {
                        label: 'DPA Rincian Belanja',
                        icon: 'pi pi-fw pi-file',
                        to: '/dpa/rincian-belanja'
                    }
                ]
            },
            {
                label: 'Dokumen Perubahan Pelaksanaan Anggaran',
                icon: 'pi pi-fw pi-book',
                items: [
                    {
                        label: 'Halaman Persetujuan DPPA',
                        icon: 'pi pi-fw pi-file',
                        to: '/dppa/hal-persetujuan'
                    },
                    {
                        label: 'Halaman Depan DPPA',
                        icon: 'pi pi-fw pi-file',
                        to: '/dppa/hal-depan'
                    },
                    {
                        label: 'DPPA SKPD',
                        icon: 'pi pi-fw pi-file',
                        to: '/dppa/skpd'
                    },
                    {
                        label: 'DPPA Pendapatan',
                        icon: 'pi pi-fw pi-file',
                        to: '/dppa/pendapatan'
                    },
                    {
                        label: 'DPPA Belanja',
                        icon: 'pi pi-fw pi-file',
                        to: '/dppa/belanja'
                    },
                    {
                        label: 'DPPA Rincian Belanja',
                        icon: 'pi pi-fw pi-file',
                        to: '/dppa/rincian-belanja'
                    }
                ]
            },
            {
                label : "LKIP",
                icon : "pi pi-fw pi-book",
                to : "/file/lkip"
            },
            {
                label : "RKPD",
                icon : "pi pi-fw pi-book",
                to : "/rkpd"
            },
            {
                label : "RKA",
                icon : "pi pi-fw pi-book",
                to : "/rka"
            },
            {
                label : "RENJA",
                icon : "pi pi-fw pi-book",
                to : "/renja"
            },
        ]
    }
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
