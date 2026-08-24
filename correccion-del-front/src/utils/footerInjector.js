export const manageDynamicFooterElements = (doc, themeConfig) => {
    if (!doc || !themeConfig) return;
    
    const footerCfg = themeConfig.footer || {};
    let dynamicFooter = doc.querySelector('#mlpa-dynamic-footer-features');
    
    // Siempre remover y reconstruir para reaccionar a los cambios
    if (dynamicFooter) {
        dynamicFooter.remove();
    }
    
    const featuresToInject = [];
    
    // 1. Newsletter
    const hasNativeNewsletter = doc.querySelector('.newsletter-form, .newsletter-area, footer form input[type="email"]');
    if (footerCfg.showNewsletter !== false && !hasNativeNewsletter) {
        featuresToInject.push(`
            <div style="flex: 1 1 300px; min-width: 250px;">
                <h4 style="color: var(--primary-text-color, #333) !important; font-weight: 700; margin-bottom: 12px; font-size: 16px;">Suscribite a nuestro Newsletter</h4>
                <div style="display: flex; gap: 8px;">
                    <input type="email" placeholder="Tu correo" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                    <button style="padding: 10px 16px; background-color: var(--button-color, #8cc63f) !important; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Enviar</button>
                </div>
            </div>
        `);
    }
    
    // 2. Medios de pago
    const hasNativePayment = doc.querySelector('.payment-methods, .payment-icons');
    if (footerCfg.showPaymentMethods !== false && !hasNativePayment) {
        featuresToInject.push(`
            <div style="flex: 1 1 200px; min-width: 150px;">
                <h4 style="color: var(--primary-text-color, #333) !important; font-weight: 700; margin-bottom: 12px; font-size: 16px;">Medios de Pago</h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <img src="https://logospng.org/download/visa/logo-visa-2048.png" style="height: 25px; object-fit: contain;">
                    <img src="https://logospng.org/download/mastercard/logo-mastercard-2048.png" style="height: 25px; object-fit: contain;">
                    <img src="https://logospng.org/download/mercado-pago/logo-mercado-pago-2048.png" style="height: 25px; object-fit: contain;">
                </div>
            </div>
        `);
    }
    
    // 3. Medios de envío
    const hasNativeShipping = doc.querySelector('.shipping-methods, .shipping-icons');
    if (footerCfg.showShippingMethods !== false && !hasNativeShipping) {
        featuresToInject.push(`
            <div style="flex: 1 1 200px; min-width: 150px;">
                <h4 style="color: var(--primary-text-color, #333) !important; font-weight: 700; margin-bottom: 12px; font-size: 16px;">Medios de Envío</h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <img src="https://logospng.org/download/correo-argentino/logo-correo-argentino-2048.png" style="height: 30px; object-fit: contain;">
                    <img src="https://logospng.org/download/oca/logo-oca-2048.png" style="height: 30px; object-fit: contain;">
                </div>
            </div>
        `);
    }
    
    // 4. Contacto y Redes (solo si faltan)
    const hasNativeContact = doc.querySelector('footer .single-contact, footer address, footer .contact-info');
    const hasNativeSocial = doc.querySelector('footer .footer-social-info, footer .social-links, footer .social-info');
    
    let contactSocialHtml = '';
    if (footerCfg.showContactInfo !== false && !hasNativeContact) {
        contactSocialHtml += `
            <h4 style="color: var(--primary-text-color, #333) !important; font-weight: 700; margin-bottom: 12px; font-size: 16px;">Contacto</h4>
            <p style="margin: 4px 0; color: var(--secondary-text-color, #666) !important; font-size: 14px;">Email: hola@tutienda.com</p>
            <p style="margin: 4px 0; color: var(--secondary-text-color, #666) !important; font-size: 14px;">Tel: +54 11 1234 5678</p>
        `;
    }
    if (footerCfg.showSocialMedia !== false && !hasNativeSocial) {
        contactSocialHtml += `
            <div style="display: flex; gap: 12px; margin-top: ${contactSocialHtml ? '12px' : '0'};">
                <a href="#" style="color: var(--primary-color, #000) !important; font-size: 24px; text-decoration: none;">📘</a>
                <a href="#" style="color: var(--primary-color, #000) !important; font-size: 24px; text-decoration: none;">📸</a>
                <a href="#" style="color: var(--primary-color, #000) !important; font-size: 24px; text-decoration: none;">🐦</a>
            </div>
        `;
    }
    if (contactSocialHtml) {
        featuresToInject.push(`
            <div style="flex: 1 1 200px; min-width: 150px;">
                ${contactSocialHtml}
            </div>
        `);
    }
    
    // Logo de la plataforma (siempre visible)
    featuresToInject.push(`
        <div style="flex: 1 1 100%; width: 100%; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.1);">
            <p style="font-size: 13px; color: var(--secondary-text-color, #666) !important; margin: 0; display: flex; align-items: center; justify-content: center; gap: 6px;">
                Desarrollado por MlpaDigital 
                <img src="/image/icono%20mlpadigital.jpg" alt="MlpaDigital Logo" style="height: 18px; width: auto; object-fit: contain; border-radius: 2px;" />
            </p>
        </div>
    `);
    
    if (featuresToInject.length > 0) {
        dynamicFooter = document.createElement('div');
        dynamicFooter.id = 'mlpa-dynamic-footer-features';
        dynamicFooter.style.backgroundColor = 'var(--footer-color, #fff)';
        dynamicFooter.style.padding = '40px 0';
        dynamicFooter.style.borderTop = '1px solid rgba(0,0,0,0.05)';
        
        dynamicFooter.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px; display: flex; flex-wrap: wrap; gap: 30px; justify-content: space-between;">
                ${featuresToInject.join('')}
            </div>
        `;
        
        const footer = doc.querySelector('footer') || doc.querySelector('.footer-area');
        if (footer) {
            // Buscamos si existe .bottom-footer-area y lo insertamos antes para que se vea más integrado
            const bottom = footer.querySelector('.bottom-footer-area') || footer.querySelector('.footer-bottom');
            if (bottom) {
                footer.insertBefore(dynamicFooter, bottom);
            } else {
                footer.appendChild(dynamicFooter);
            }
        } else {
            const targetNode = doc.body || doc.documentElement || doc;
            targetNode.appendChild(dynamicFooter);
        }
    }
};
