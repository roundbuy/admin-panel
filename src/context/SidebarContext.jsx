import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export const SidebarProvider = ({ children }) => {
    const [isMinimized, setIsMinimized] = useState(false);

    const DRAWER_WIDTH = 240;
    const DRAWER_WIDTH_MINIMIZED = 70;

    const currentWidth = isMinimized ? DRAWER_WIDTH_MINIMIZED : DRAWER_WIDTH;

    return (
        <SidebarContext.Provider
            value={{
                isMinimized,
                setIsMinimized,
                DRAWER_WIDTH,
                DRAWER_WIDTH_MINIMIZED,
                currentWidth,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};
