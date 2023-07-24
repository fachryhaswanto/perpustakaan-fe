import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React, { useContext, useState, useEffect, useRef } from 'react';
import AppConfig from '../../layout/AppConfig';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import Head from 'next/head';
import axios from 'axios';

const LoginPage = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', {'p-input-filled': layoutConfig.inputStyle === 'filled'});

    const toast = useRef(null);
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [typeInput, setTypeInput] = useState("password")

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                console.log("test")
                router.push("/dashboard")
            } else {

            }
        } catch (error) {
            
        }
    }

    useEffect(() => {
        getSession()
    }, [])

    const login = async () => {
        setSubmitted(true)
        
        if (username && password) {
            setLoading(true)
            try {
                const config = {
                    headers : {
                        "Content-Type" : "application/json"
                    },
                    withCredentials : true
                }


                const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/login`, {username : username, password : password}, config)
                if (response.status === 200){
                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Berhasil Login', life: 4000 });
                    router.push("/dashboard")
                }
            } catch (error) {
                console.clear()
                if (error.message === "Network Error") {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Gagal mengecek data', life: 3000 });
                }
                else if (error.response.status === 400) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data user tidak ditemukan', life: 3000 });
                }

                setLoading(false)
            }
        }

        // setSubmitted(false)
    }

    const handleKeyUp = (event) => {
        if (event.key === "Enter") {
            login()
        }
    }

    return (
        <React.Fragment>
        <Head>
            <title>SPPD - App</title>
            <link rel="icon" href={`${contextPath}/Logo-Kabupaten-Banggai-Kepulauan.ico`} type="image/x-icon"></link>
        </Head>

        <Toast ref={toast} />

        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`${contextPath}/Logo-Kabupaten-Banggai-Kepulauan.png`} alt="Banggai Kepulauan logo" className="mt-5 mb-5 w-6rem flex-shrink-0"/>
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            {/* <img src={`${contextPath}/demo/images/login/avatar.png`} alt="Image" height="50" className="mb-3" /> */}
                            <div className="text-900 text-3xl font-medium mb-3">APLIKASI SPPD</div>
                            <div className="text-900 text-3xl font-medium mb-3">BANGGAI KEPULAUAN</div>
                            <div className="text-600 font-medium">Log In untuk masuk ke aplikasi</div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">Username</label>
                            <InputText inputid="username" type="text" value={username} placeholder="Masukkan username" required onChange={(e) => setUsername(e.target.value)} className={classNames({'p-invalid': submitted && !username}, 'w-full', 'mb-5')} style={{ padding: '1rem'}} />

                            <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">Password</label>
                            <Password value={password} onChange={(e) => setPassword(e.target.       value)} placeholder="Masukkan password" required toggleMask feedback={false} className={classNames({'p-invalid': submitted && !password})} inputClassName='w-full p-3 md:w-30rem' onKeyUp={handleKeyUp}></Password>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                
                            </div>
                            <Button label="Log In" loading={loading} className="w-full p-3 text-xl" onClick={login}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </React.Fragment>
    );
};

LoginPage.getLayout = function getLayout(page) {
    return (
        <React.Fragment>
            {page}
            <AppConfig simple />
        </React.Fragment>
    );
};
export default LoginPage;
