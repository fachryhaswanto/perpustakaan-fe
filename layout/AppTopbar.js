import getConfig from 'next/config';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { LayoutContext } from './context/layoutcontext';
import { Menu } from 'primereact/menu';
import axios from 'axios';
import { useState } from 'react';

const AppTopbar = forwardRef((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const router = useRouter()

    const [session, setSession] = useState(null)

    // const menu = useRef(null)
    // const items = [
    //     {label : "Logout", icon: 'pi pi-fw pi-plus'}
    // ]

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));
    
    const logout = async () => {
        const config = {
            headers : {
                "Content-Type" : "application/json"
            },
            withCredentials : true
        }

        const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/logout`, {username : "test1", password : "test2"}, config)
        router.push("/")
    }

    const getSession = async () => {
        const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
        if (responseSession.data) {
            setSession(responseSession.data.username)
        }
    }

    useEffect(() => {
        getSession()
    }, [])

    return (
        <div className="layout-topbar">
            <Link href="/">
                <a className="layout-topbar-logo">
                    <>
                        <img src={`${contextPath}/logo sulteng.png`} width="47,22px" height={'35px'} widt={'true'} alt="logo" />
                        {/* <img src={`${contextPath}/logo sulteng.png`} width="47.22px" height={'70px'} widt={'true'} alt="logo" /> */}
                        <span>SI PROPERT - BETA</span>
                        <br></br>
                    </>
                </a>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                {/* <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-calendar"></i>
                    <span>Calendar</span>
                </button> */}

                {/* <Menu model={items} popup ref={menu} />
                <button type="button" className="p-link layout-topbar-button" onClick={(event) => menu.current.toggle(event)} aria-controls="popup_menu" aria-haspopups>
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button> */}
                <button type="button" className="p-link layout-topbar-button" onClick={logout}>
                    <i className="pi pi-sign-out"></i>
                    <span>Logout</span>
                </button>


                {/* <Link href="/documentation">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-cog"></i>
                        <span>Settings</span>
                    </button>
                </Link> */}
            </div>
        </div>
    );
});

export default AppTopbar;
