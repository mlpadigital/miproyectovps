// Default configurations for themes when switching or starting fresh

export const getDefaultConfig = (themeId) => {
    const baseConfig = {
        themeId: themeId,
        colors: {
            primary: '#000000',
            secondary: '#ffffff',
            text: '#333333',
            background: '#f9f9f9',
            headerBg: '#ffffff',
            headerText: '#000000',
            footerBg: '#111111',
            footerText: '#ffffff'
        },
        pageSections: {
            'index.html': [
                {
                    id: 'default-hero',
                    type: 'banners',
                    title: 'Banners',
                    visible: true,
                    settings: {
                        banners: [
                            {
                                id: 'banner-1',
                                imageDesktop: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
                                imageMobile: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
                                link: '#'
                            }
                        ]
                    }
                },
                {
                    id: 'default-products',
                    type: 'product_list',
                    title: 'Nuestros Productos',
                    visible: true,
                    settings: {
                        limit: 8
                    }
                }
            ]
        }
    };

    // Personalizaciones por tema
    switch (themeId) {
        case 'darktech':
            baseConfig.colors = {
                primary: '#3b82f6', // blue-500
                secondary: '#1f2937', // gray-800
                text: '#f3f4f6', // gray-100
                background: '#111827', // gray-900
                headerBg: '#1f2937',
                headerText: '#ffffff',
                footerBg: '#030712',
                footerText: '#9ca3af'
            };
            baseConfig.pageSections['index.html'][0].settings.banners[0].imageDesktop = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop';
            baseConfig.pageSections['index.html'][0].settings.banners[0].imageMobile = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop';
            break;
        case 'restaurant':
            baseConfig.colors = {
                primary: '#ef4444', // red-500
                secondary: '#fffbeb', // amber-50
                text: '#1f2937',
                background: '#ffffff',
                headerBg: '#ef4444',
                headerText: '#ffffff',
                footerBg: '#1c1917',
                footerText: '#d6d3d1'
            };
            baseConfig.pageSections['index.html'][0].settings.banners[0].imageDesktop = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop';
            baseConfig.pageSections['index.html'][0].settings.banners[0].imageMobile = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop';
            break;
        case 'marketplace':
            baseConfig.colors = {
                primary: '#facc15', // yellow-400 (ML style)
                secondary: '#2563eb', // blue-600
                text: '#333333',
                background: '#ebebeb', // gray background
                headerBg: '#fff159',
                headerText: '#333333',
                footerBg: '#ffffff',
                footerText: '#666666'
            };
            baseConfig.pageSections['index.html'][0].settings.banners[0].imageDesktop = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop';
            baseConfig.pageSections['index.html'][0].settings.banners[0].imageMobile = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop';
            break;
    }

    return baseConfig;
};
