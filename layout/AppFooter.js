import getConfig from 'next/config';
import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const year = new Date().getFullYear()
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    return (
        <div className="layout-footer">
            <img src={`${contextPath}/Logo-Kabupaten-Banggai-Kepulauan.png`} alt="Logo" height="20" className="mr-2" />
            {year} for
            <span className="font-medium ml-1">Banggai Kepulauan</span>
        </div>
    );
};

export default AppFooter;
