import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { ShoppingBag, MessageCircle, ArrowRight, User, LogOut, Download, FileText, X, Plus, Minus, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2, Sparkles, Instagram, Facebook, Youtube, Twitter, Music2, Pin, Trash2 } from 'lucide-react';
import { applyThemeConfigToDocument } from '../utils/themeInjector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import DynamicSectionRenderer from '../templates/components/DynamicSectionRenderer';
import { TEMPLATES } from '../templates/Registry';
import NewsletterSubscriptionForm from '@/components/NewsletterSubscriptionForm';

const DynamicFonts = ({ typography }) => {
    if (!typography) return null;
    const fonts = [typography.bodyFont, typography.headingFont].filter(Boolean);
    if (fonts.length === 0) return null;

    const fontFamilies = Array.from(new Set(fonts)).map(f => f.replace(/ /g, '+')).join('&family=');
    return (
        <Helmet>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={`https://fonts.googleapis.com/css2?family=${fontFamilies}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap`} rel="stylesheet" />
        </Helmet>
    );
};

const DynamicStore = ({ subdomain, customDomain, previewStoreId, previewConfig, isPreview }) => {
    const { toast } = useToast();
    const [storeData, setStoreData] = useState(null);
    const [previewConfigOverride, setPreviewConfigOverride] = useState(null);
    const [digitalProducts, setDigitalProducts] = useState([]);
    const [physicalProducts, setPhysicalProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cart State
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    // Checkout State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', zipcode: '' });
    const [isFetchingRates, setIsFetchingRates] = useState(false);
    const [dynamicRates, setDynamicRates] = useState([]);
    const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
    const [availableShippingZones, setAvailableShippingZones] = useState([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [selectedShippingId, setSelectedShippingId] = useState(null);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

    // Discount State
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

    // Catalog & Modal State
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Auth & Navigation State
    const [currentView, setCurrentView] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        let pageParam = params.get('page');
        if (pageParam && pageParam.endsWith('.html')) {
            // we keep it as .html if the templates expect it
            return pageParam;
        }
        return pageParam || 'store';
    }); // 'store', 'login', 'register', 'portal', or a custom page slug
    const [currentUser, setCurrentUser] = useState(null);
    const [myResources, setMyResources] = useState([]);

    // Form states
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    
    useEffect(() => {
        const handleNavigation = (e) => {
            if (e.detail && e.detail.page) {
                let page = e.detail.page;
                // remove leading slash if any
                if (page.startsWith('/')) page = page.substring(1);
                
                // Map HTML template pages to internal views
                if (page === 'shop.html') page = 'catalog';
                if (page === 'index.html') page = 'store';
                
                setCurrentView(page);
                window.scrollTo(0, 0);
            }
        };
        window.addEventListener('mlpa-navigate', handleNavigation);
        return () => window.removeEventListener('mlpa-navigate', handleNavigation);
    }, []);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setCurrentUser(session?.user || null);
            if (session?.user) {
                fetchMyResources(session.user.id);
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setCurrentUser(session?.user || null);
            if (session?.user) {
                fetchMyResources(session.user.id);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'UPDATE_PREVIEW_CONFIG') {
                setPreviewConfigOverride(event.data.config);
            }
            if (event.data && event.data.type === 'UPDATE_THEME_CONFIG') {
                setStoreData(prev => {
                    if (!prev) return prev;
                    const newConfig = event.data.payload;
                    // Aplicar en vivo los estilos
                    applyThemeConfigToDocument(document, newConfig);
                    return { 
                        ...prev, 
                        theme_config: newConfig,
                        logo_url: newConfig.logoUrl || prev.logo_url,
                        favicon_url: newConfig.faviconUrl || prev.favicon_url,
                        browser_title: newConfig.tabName || prev.browser_title
                    };
                });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        async function fetchStore() {
            try {
                let query = supabase.from('stores').select('*');
                
                if (previewStoreId) {
                    query = query.eq('id', previewStoreId);
                } else if (subdomain) {
                    query = query.eq('subdomain', subdomain);
                } else if (customDomain) {
                    // Fallback to checking subdomain
                    const potentialSubdomain = customDomain.split('.')[0];
                    query = query.eq('subdomain', potentialSubdomain);
                }

                const { data, error: sbError } = await query.limit(1).single();

                if (sbError) throw sbError;
                setStoreData(data);

                if (!isPreview) {
                    // Force Favicon update in DOM
                    const faviconUrl = data.favicon_url || data.logo_url || '/favicon.ico';
                    let link = document.querySelector("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.getElementsByTagName('head')[0].appendChild(link);
                    }
                    link.type = 'image/x-icon';
                    link.href = faviconUrl;
                }


                // Fetch Digital Products
                const { data: resData } = await supabase
                    .from('store_resources')
                    .select('*')
                    .eq('store_id', data.id);
                
                if (resData) setDigitalProducts(resData);

                // Fetch Physical Products
                const { data: prodData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('store_id', data.id)
                    .eq('is_active', true);
                if (prodData) {
                    const normalizedProds = prodData.map(prod => ({
                        ...prod,
                        images: Array.isArray(prod.images) ? prod.images.map(img => (typeof img === 'object' && img !== null) ? img.url : img).filter(Boolean) : []
                    }));
                    setPhysicalProducts(normalizedProds);
                }

                // Fetch Cart Config, Payments, and Shipping
                const { data: cartConfig } = await supabase
                    .from('cart_config')
                    .select('id')
                    .eq('store_id', data.id)
                    .maybeSingle();

                if (cartConfig) {
                    const { data: payments } = await supabase
                        .from('payment_methods')
                        .select('*')
                        .eq('cart_config_id', cartConfig.id)
                        .eq('enabled', true);
                    
                    if (payments && payments.length > 0) {
                        setAvailablePaymentMethods(payments);
                        setSelectedPaymentId(payments[0].id);
                    }

                    const { data: shippings } = await supabase
                        .from('shipping_zones')
                        .select('*')
                        .eq('cart_config_id', cartConfig.id);
                    
                    if (shippings) {
                        const enabledShippings = shippings.filter(s => s.cost >= 0);
                        if (enabledShippings.length > 0) {
                            setAvailableShippingZones(enabledShippings);
                            const visibleShippings = enabledShippings.filter(z => !['correo_argentino', 'oca', 'andreani'].includes(z.name));
                            if (visibleShippings.length > 0) {
                                setSelectedShippingId(visibleShippings[0].id);
                            } else {
                                setSelectedShippingId('');
                            }
                        }
                    }
                }

                // CSS Variables
                const config = data.design_config || {};
                const colors = config.colors || {};
                const root = document.documentElement;

                root.style.setProperty('--primary-color', colors.primary || '#4f46e5');
                root.style.setProperty('--secondary-color', colors.secondary || '#10b981');
                root.style.setProperty('--bg-color', colors.background || '#ffffff');
                root.style.setProperty('--text-color', colors.text || '#1f2937');
                root.style.setProperty('--accent-color', colors.accent || '#f59e0b');

            } catch (err) {
                console.error('Error fetching store:', err);
                setError('No pudimos encontrar esta tienda o no está disponible.');
            } finally {
                setLoading(false);
            }
        }

        if (subdomain || customDomain || previewStoreId) {
            fetchStore();
        }
    }, [subdomain, customDomain, previewStoreId, isPreview]);

    // Apply global styles and DOM manipulations AFTER the store layout is mounted
    useEffect(() => {
        if (!loading && storeData && storeData.theme_config) {
            // Un pequeño timeout asegura que los componentes React hijos (como Native Templates) ya se hayan montado en el DOM
            setTimeout(() => {
                applyThemeConfigToDocument(document, storeData.theme_config);
            }, 100);
        }
    }, [storeData, loading]);

    const fetchMyResources = async (userId) => {
        if (!storeData) return;
        
        // This query assumes resource_access links to store_resources
        // For MVP, we'll fetch all resource_access for this user
        // and filter manually if no foreign key exists.
        const { data, error } = await supabase
            .from('resource_access')
            .select('*, store_resources(*)')
            .eq('user_id', userId);
            
        if (!error && data) {
            // filter resources that belong to this store
            const storeRes = data.filter(r => r.store_resources?.store_id === storeData.id);
            setMyResources(storeRes);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: authEmail,
                password: authPassword,
            });
            if (error) throw error;
            toast({ title: 'Bienvenido de nuevo' });
            setCurrentView('portal');
        } catch (err) {
            toast({ title: 'Error al iniciar sesión', description: err.message, variant: 'destructive' });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!authEmail) {
            toast({ title: 'Atención', description: 'Por favor, ingresa tu correo electrónico para restablecer la contraseña.', variant: 'destructive' });
            return;
        }
        setAuthLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(authEmail);
            if (error) throw error;
            toast({ title: 'Correo enviado', description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.' });
        } catch (err) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: authEmail,
                password: authPassword,
            });
            if (error) throw error;
            
            // Optionally, create a store_customer record here
            if (data.user && storeData) {
                await supabase.from('store_customers').insert({
                    store_id: storeData.id,
                    user_id: data.user.id,
                    email: authEmail,
                    name: authEmail.split('@')[0]
                });
            }

            toast({ title: 'Registro exitoso', description: 'Ya puedes acceder a tus descargas.' });
            setCurrentView('portal');
        } catch (err) {
            toast({ title: 'Error en el registro', description: err.message, variant: 'destructive' });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentView('store');
    };

    const addToCart = (product, variant = null) => {
        const hasVariants = product.variants && product.variants.length > 0;
        if (hasVariants && !variant) {
            toast({ title: 'Atención', description: 'Por favor selecciona una opción antes de agregar al carrito.', variant: 'destructive' });
            return;
        }

        const cartItemId = variant ? `${product.id}_${variant.id}` : product.id;
        const existing = cartItems.find(item => item.cartItemId === cartItemId);
        const currentQ = existing ? existing.quantity : 0;
        
        const stockToCheck = variant ? variant.stock : product.stock;

        if (stockToCheck !== null && stockToCheck !== undefined && currentQ >= stockToCheck) {
            toast({ title: 'Stock insuficiente', description: `Solo hay ${stockToCheck} unidades disponibles${variant ? ' de esta opción' : ''}.`, variant: 'destructive' });
            return;
        }

        setCartItems(prev => {
            const itemInPrev = prev.find(item => item.cartItemId === cartItemId);
            if (itemInPrev) {
                return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, cartItemId, selectedVariant: variant, quantity: 1 }];
        });
        toast({ title: 'Producto agregado', description: `${product.name} ${variant ? `(${variant.name})` : ''} se agregó al carrito.` });
    };

    const updateCartItem = (cartItemId, delta) => {
        if (delta > 0) {
            const item = cartItems.find(i => i.cartItemId === cartItemId);
            const stockToCheck = item?.selectedVariant ? item.selectedVariant.stock : item?.stock;
            if (item && stockToCheck !== null && stockToCheck !== undefined && item.quantity >= stockToCheck) {
                toast({ title: 'Stock insuficiente', description: `Solo hay ${stockToCheck} unidades disponibles.`, variant: 'destructive' });
                return;
            }
        }
        setCartItems(prev => {
            return prev.map(item => {
                if (item.cartItemId === cartItemId) {
                    const newQ = item.quantity + delta;
                    return newQ > 0 ? { ...item, quantity: newQ } : item;
                }
                return item;
            });
        });
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const cartTotal = cartItems.reduce((acc, item) => {
        const priceToUse = (item.sale_price > 0 && (item.price === null || item.sale_price < item.price)) ? item.sale_price : (item.price || 0);
        return acc + (priceToUse * item.quantity);
    }, 0);

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        setIsApplyingDiscount(true);
        setDiscountError('');
        
        try {
            const { data, error } = await supabase
                .from('discounts')
                .select('*')
                .eq('store_id', storeData.id)
                .eq('code', discountCode.trim().toUpperCase())
                .eq('is_active', true)
                .maybeSingle();
                
            if (error) throw error;
            
            if (!data) {
                setDiscountError('Cupón inválido o inactivo.');
                setAppliedDiscount(null);
                return;
            }
            
            if (data.min_purchase_amount > 0 && cartTotal < data.min_purchase_amount) {
                setDiscountError(`Compra mínima de $${data.min_purchase_amount}.`);
                setAppliedDiscount(null);
                return;
            }
            
            setAppliedDiscount(data);
            setDiscountError('');
            toast({ title: 'Cupón Aplicado', description: 'El descuento se ha aplicado a tu carrito.' });
        } catch (err) {
            console.error('Error applying discount:', err);
            setDiscountError('Error al validar el cupón.');
        } finally {
            setIsApplyingDiscount(false);
        }
    };
    
    useEffect(() => {
        if (appliedDiscount && appliedDiscount.min_purchase_amount > 0 && cartTotal < appliedDiscount.min_purchase_amount) {
            setAppliedDiscount(null);
            setDiscountError(`El cupón fue removido (compra mínima de $${appliedDiscount.min_purchase_amount}).`);
        }
    }, [cartTotal, appliedDiscount]);

    useEffect(() => {
        const handleAddToCartEvent = (e) => {
            if (e.detail) {
                addToCart(e.detail);
                setIsCartOpen(true);
            }
        };
        const handleSelectProductEvent = (e) => {
            if (e.detail) {
                setSelectedProduct(e.detail);
                setSelectedVariant(null);
                setCurrentImageIndex(0);
            }
        };
        window.addEventListener('ADD_TO_CART', handleAddToCartEvent);
        window.addEventListener('SELECT_PRODUCT', handleSelectProductEvent);
        return () => {
            window.removeEventListener('ADD_TO_CART', handleAddToCartEvent);
            window.removeEventListener('SELECT_PRODUCT', handleSelectProductEvent);
        };
    }, [cartItems]);

    let discountAmount = 0;
    if (appliedDiscount) {
        if (appliedDiscount.type === 'percentage') {
            discountAmount = cartTotal * (appliedDiscount.value / 100);
        } else if (appliedDiscount.type === 'fixed') {
                            discountAmount = Math.min(cartTotal, appliedDiscount.value);
        }
    }

    const selectedShipping = [...availableShippingZones, ...dynamicRates].find(z => String(z.id) === String(selectedShippingId));
    const selectedPayment = availablePaymentMethods.find(p => String(p.id) === String(selectedPaymentId));
    const finalTotal = Math.max(0, cartTotal - discountAmount) + (selectedShipping && Number(selectedShipping.cost) > 0 ? Number(selectedShipping.cost) : 0);

    // Fetch Dynamic Rates Effect
    useEffect(() => {
        const fetchRates = async () => {
            if (!checkoutForm.zipcode || checkoutForm.zipcode.length < 4 || !storeData?.origin_zipcode) {
                setDynamicRates([]);
                return;
            }

            // check if there are physical items
            const physicalItems = cartItems.filter(item => item.category !== 'Digital' && item.category !== 'digital');
            if (physicalItems.length === 0) {
                setDynamicRates([]);
                return;
            }

            // Calculate consolidated single package for all items in cart
            const totalWeight = physicalItems.reduce((acc, item) => {
                const w = Number(item.weight) > 0 ? Number(item.weight) : 0.5;
                const q = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
                return acc + (w * q);
            }, 0);

            const maxLength = Math.max(10, ...physicalItems.map(item => Number(item.length) || 10));
            const maxWidth = Math.max(10, ...physicalItems.map(item => Number(item.width) || 10));
            const totalHeight = physicalItems.reduce((acc, item) => {
                const h = Number(item.height) > 0 ? Number(item.height) : 5;
                const q = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
                return acc + (h * q);
            }, 0);

            const consolidatedPackage = {
                weight: Math.max(0.1, Number(totalWeight.toFixed(2))),
                length: Math.max(10, Math.min(100, Math.round(maxLength))),
                width: Math.max(10, Math.min(100, Math.round(maxWidth))),
                height: Math.max(10, Math.min(100, Math.round(totalHeight))),
                amount: 1
            };

            setIsFetchingRates(true);
            try {
                const { data, error } = await supabase.functions.invoke('shipping-rates', {
                    body: {
                        originZip: storeData.origin_zipcode,
                        destinationZip: checkoutForm.zipcode,
                        packages: [consolidatedPackage],
                        enabledCarriers: availableShippingZones.map(z => z.name)
                    }
                });

                if (error) throw error;
                if (data && data.data) {
                    // map envia response to our format
                    const rates = data.data.map((rate, i) => ({
                        id: `envia_${rate.carrier}_${rate.serviceId || rate.service || i}`,
                        name: `envia_${rate.carrier}`,
                        states: `${rate.serviceDescription || rate.service || rate.carrierDescription} (${rate.deliveryEstimate || ''})`,
                        cost: rate.totalPrice,
                        dynamic: true
                    }));
                    setDynamicRates(rates);
                }
            } catch (err) {
                console.error("Error fetching rates:", err);
                toast({ title: "Error cotizando envío", description: "No se pudieron obtener tarifas en vivo.", variant: "destructive" });
            } finally {
                setIsFetchingRates(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchRates();
        }, 800);
        return () => clearTimeout(timeoutId);
    }, [checkoutForm.zipcode, storeData?.origin_zipcode, cartItems, availableShippingZones]);

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        const whatsappNumber = storeData?.design_config?.widgets?.whatsappNumber;
        if (!whatsappNumber) {
            toast({ title: 'Atención', description: 'Esta tienda no tiene configurado un número de WhatsApp para recibir pedidos.', variant: 'destructive' });
            return;
        }

        setIsSubmittingOrder(true);
        try {
            // Guardar la orden en la BD
            const orderData = {
                store_id: storeData.id,
                customer_name: checkoutForm.name.trim(),
                customer_email: 'whatsapp-customer@example.com',
                customer_phone: checkoutForm.phone.trim(),
                subtotal: cartTotal,
                discount_amount: discountAmount || 0,
                coupon_code: appliedDiscount ? appliedDiscount.code : null,
                user_id: currentUser?.id || null,
                items: cartItems.map(item => {
                    const itemPrice = (item.sale_price > 0 && (item.price === null || item.sale_price < item.price)) ? item.sale_price : (item.price || 0);
                    return {
                        product_id: item.id,
                        name: item.name,
                        price: itemPrice,
                        quantity: item.quantity
                    };
                }),
                total: finalTotal,
                status: 'pending',
                payment_status: 'pending',
                payment_method: selectedPayment?.display_name || 'A convenir',
                shipping_address: selectedShipping?.name || 'Retiro o a convenir'
            };

            const { data: newOrder, error } = await supabase
                .from('orders')
                .insert([orderData])
                .select('id')
                .single();
            
            if (error) {
                console.error('Error saving order:', error);
            }

            if (selectedPayment && selectedPayment.provider === 'mercadopago_auto' && newOrder) {
                try {
                    const response = await fetch('https://mlpadigital.com/api/create-store-preference', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            storeId: storeData.id,
                            orderId: newOrder.id,
                            items: [
                                {
                                    id: 'order_total',
                                    name: `Compra en ${storeData.name}`,
                                    price: finalTotal,
                                    sale_price: finalTotal,
                                    quantity: 1
                                }
                            ],
                            payerEmail: currentUser?.email || 'cliente@tienda.com',
                            payerName: checkoutForm.name,
                            total: finalTotal
                        })
                    });
                    
                    const data = await response.json();
                    if (data.init_point) {
                        setCartItems([]);
                        setIsCheckoutOpen(false);
                        setIsCartOpen(false);
                        window.location.href = data.init_point;
                        return; // Terminamos, no enviamos WhatsApp si se redirige
                    } else {
                        throw new Error(data.error || 'No init_point');
                    }
                } catch (err) {
                    console.error('Error con MP Auto:', err);
                    toast({ title: 'Aviso', description: 'Hubo un problema iniciando el pago automático. Continuaremos por WhatsApp.', variant: 'destructive' });
                }
            }

            const orderIdStr = newOrder ? `\n*Orden #:* ${newOrder.id.slice(0,8)}` : '';
            let msg = `¡Hola! Quiero hacer el siguiente pedido:${orderIdStr}\n\n*A nombre de:* ${checkoutForm.name}\n*Teléfono:* ${checkoutForm.phone}\n\n*Detalle del pedido:*\n`;
            
            cartItems.forEach(item => {
                let variantStr = item.selectedVariant ? ` (${item.selectedVariant.name})` : '';
                let skuStr = item.selectedVariant?.sku ? ` [SKU: ${item.selectedVariant.sku}]` : '';
                const itemPrice = (item.sale_price > 0 && (item.price === null || item.sale_price < item.price)) ? item.sale_price : (item.price || 0);
                msg += `- ${item.quantity}x ${item.name}${variantStr}${skuStr} ($${(itemPrice * item.quantity).toLocaleString()})\n`;
            });
            
            msg += `\n*Subtotal:* $${cartTotal.toLocaleString()}`;
            if (appliedDiscount) {
                msg += `\n*Descuento (${appliedDiscount.code}):* -$${discountAmount.toLocaleString()}`;
            }
            if (selectedShipping) {
                let shippingLabel = '';
                if (selectedShipping.name === 'pickup') shippingLabel = 'Retiro en Local';
                else if (selectedShipping.name === 'delivery') shippingLabel = 'Envío a Domicilio';
                else if (selectedShipping.name === 'oca') shippingLabel = 'Envío por OCA';
                else if (selectedShipping.name === 'correo_argentino') shippingLabel = 'Envío por Correo Argentino';
                else if (selectedShipping.name === 'andreani') shippingLabel = 'Envío por Andreani';
                else if (selectedShipping.name === 'other') shippingLabel = selectedShipping.states || 'Otro Envío';
                else shippingLabel = selectedShipping.name;
                
                msg += `\n*Envío (${shippingLabel}):* $${Number(selectedShipping.cost).toLocaleString()}`;
            }
            msg += `\n*TOTAL FINAL: $${finalTotal.toLocaleString()}*`;
            
            if (selectedPayment) {
                msg += `\n\n*Método de Pago Elegido:* ${selectedPayment.display_name}`;
                if (selectedPayment.provider === 'transfer' && selectedPayment.config?.value) {
                    msg += `\n*Abonaré mediante Alias/CBU:* ${selectedPayment.config.value}`;
                    msg += `\n(Enviaré el comprobante por acá en unos minutos)`;
                } else if (selectedPayment.provider === 'paypal' && selectedPayment.config?.value) {
                    msg += `\n*Abonaré mediante PayPal:* ${selectedPayment.config.value}`;
                } else if (selectedPayment.provider === 'payoneer' && selectedPayment.config?.value) {
                    msg += `\n*Abonaré mediante Payoneer:* ${selectedPayment.config.value}`;
                }
            }

            const encodedMsg = encodeURIComponent(msg);
            const waLink = `https://wa.me/${String(whatsappNumber).replace(/[^0-9]/g, '')}?text=${encodedMsg}`;
            
            // Limpiar y redirigir
            setCartItems([]);
            setIsCheckoutOpen(false);
            setIsCartOpen(false);
            
            window.open(waLink, '_blank');
        } catch (err) {
            console.error('Checkout error:', err);
            toast({ title: 'Error', description: 'Ocurrió un error al procesar el pedido.', variant: 'destructive' });
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    // Simulated purchase logic for MVP
    const simulatePurchase = async (resource) => {
        if (!currentUser) {
            toast({ title: 'Debes iniciar sesión', description: 'Por favor, ingresa a tu cuenta para comprar este producto.' });
            setCurrentView('login');
            return;
        }

        try {
            // Check if already purchased
            const { data: existing } = await supabase
                .from('resource_access')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('resource_id', resource.id)
                .single();
            
            if (existing) {
                toast({ title: 'Ya tienes este producto', description: 'Ve a Mi Portal para descargarlo.' });
                setCurrentView('portal');
                return;
            }

            // Grant access
            const { error } = await supabase
                .from('resource_access')
                .insert({
                    user_id: currentUser.id,
                    resource_id: resource.id
                });
            
            if (error) throw error;

            toast({ title: '¡Compra exitosa!', description: 'El archivo ya está disponible en tu portal.' });
            fetchMyResources(currentUser.id);
            setCurrentView('portal');

        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo procesar la compra', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !storeData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-400">{error || 'Tienda no encontrada'}</p>
            </div>
        );
    }

    const design = previewConfig || previewConfigOverride || storeData.design_config || {};
    const colors = design.colors || { primary: '#4f46e5', background: '#ffffff', text: '#1f2937' };
    const sections = design.sections || { header: true, hero: true, featured: true, footer: true };
    const widgets = design.widgets || { showCart: true, showWhatsapp: false };
    const whatsappUrl = widgets.whatsappNumber ? `https://wa.me/${String(widgets.whatsappNumber).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(widgets.whatsappMessage || '¡Hola!')}` : '#';

    // RENDER: PORTAL
    if (currentView === 'portal') {
        return (
            <div className="min-h-screen font-sans bg-slate-50 text-slate-900">
                <header className="px-6 py-4 bg-white border-b flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold" style={{ color: colors.primary }}>{storeData.name} - Portal</h1>
                    <div className="flex gap-4 items-center">
                        <Button variant="ghost" onClick={() => setCurrentView('store')}>Volver a la Tienda</Button>
                        <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <LogOut className="w-4 h-4 mr-2" /> Salir
                        </Button>
                    </div>
                </header>
                <main className="max-w-5xl mx-auto px-6 py-12">
                    <h2 className="text-3xl font-black mb-2">Mis Archivos Descargables</h2>
                    <p className="text-slate-500 mb-8">Aquí tienes acceso a todos los productos digitales que compraste.</p>
                    
                    {myResources.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-2xl border shadow-sm">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">Aún no tienes productos</h3>
                            <p className="text-slate-500 mb-6">Explora nuestra tienda para adquirir contenido digital.</p>
                            <Button onClick={() => setCurrentView('store')} style={{ backgroundColor: colors.primary, color: 'white' }}>
                                Ir a la tienda
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myResources.map(access => {
                                const res = access.store_resources;
                                if(!res) return null;
                                return (
                                    <div key={res.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                                        <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                                            {res.thumbnail_url ? (
                                                <img src={res.thumbnail_url} alt={res.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText className="w-12 h-12 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg mb-1">{res.name}</h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{res.description}</p>
                                            <Button 
                                                className="w-full"
                                                style={{ backgroundColor: colors.primary, color: 'white' }}
                                                onClick={() => window.open(res.file_url, '_blank')}
                                            >
                                                <Download className="w-4 h-4 mr-2" /> Descargar Archivo
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // RENDER: LOGIN / REGISTER
    if (currentView === 'login' || currentView === 'register') {
        const isLogin = currentView === 'login';
        return (
            <div className="min-h-screen font-sans bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black mb-2" style={{ color: colors.primary }}>{storeData.name}</h1>
                        <p className="text-slate-500">
                            {isLogin ? 'Ingresa a tu cuenta para ver tus compras.' : 'Crea una cuenta para acceder a tus archivos.'}
                        </p>
                    </div>
                    
                    <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Correo Electrónico</label>
                            <Input 
                                type="email" 
                                required 
                                value={authEmail} 
                                onChange={e => setAuthEmail(e.target.value)} 
                                placeholder="tu@email.com"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium">Contraseña</label>
                                {isLogin && (
                                    <button 
                                        type="button" 
                                        onClick={handleResetPassword} 
                                        className="text-xs font-medium hover:underline"
                                        style={{ color: colors.primary }}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                )}
                            </div>
                            <Input 
                                type="password" 
                                required 
                                value={authPassword} 
                                onChange={e => setAuthPassword(e.target.value)} 
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full py-6 text-lg font-bold mt-4"
                            style={{ backgroundColor: colors.primary, color: 'white' }}
                            disabled={authLoading}
                        >
                            {authLoading ? 'Cargando...' : (isLogin ? 'Ingresar a mi portal' : 'Crear mi cuenta')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                        <button 
                            className="font-bold hover:underline" 
                            style={{ color: colors.primary }}
                            onClick={() => setCurrentView(isLogin ? 'register' : 'login')}
                        >
                            {isLogin ? 'Regístrate aquí' : 'Ingresa aquí'}
                        </button>
                    </div>
                    
                    <div className="mt-8 text-center">
                        <button onClick={() => setCurrentView('store')} className="text-xs text-slate-400 hover:underline">
                            Volver a la tienda
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const searchParams = new URLSearchParams(window.location.search);
    const urlThemeId = isPreview ? searchParams.get('theme_id') : null;
    
    const activeThemeId = urlThemeId || storeData.theme_config?.themeId || storeData.theme_id || 'minimal';
    const CurrentTemplate = TEMPLATES[activeThemeId] || TEMPLATES['minimal'];

    const isExternalTemplate = activeThemeId && activeThemeId !== 'default';

    const mergedThemeConfig = { ...design, ...storeData.theme_config };
    // Prioritize global store fields over legacy theme_config fields without breaking backward compatibility
    if (storeData.logo_url) mergedThemeConfig.logoUrl = storeData.logo_url;
    if (storeData.favicon_url) mergedThemeConfig.faviconUrl = storeData.favicon_url;
    if (storeData.browser_title) mergedThemeConfig.tabName = storeData.browser_title;

    // Determine layout mode based on the new isOnePage setting or fallback to old catalogMode
    const catalogMode = mergedThemeConfig.isOnePage !== undefined 
        ? (mergedThemeConfig.isOnePage ? 'one-page' : 'separate-page') 
        : (design.layout?.catalogMode || 'one-page');
    const categoryLayout = design.layout?.categoryLayout || 'buttons';

    const hasCustomPageSections = Boolean(
        (mergedThemeConfig?.pageSections && Object.values(mergedThemeConfig.pageSections).some(arr => Array.isArray(arr) && arr.length > 0)) ||
        (mergedThemeConfig?.homeSections && Array.isArray(mergedThemeConfig.homeSections) && mergedThemeConfig.homeSections.length > 0)
    );

    const typography = design.typography || { bodyFont: 'Inter', headingFont: 'Inter', scale: 'medium' };
    const fontScale = typography.scale === 'small' ? '0.875rem' : typography.scale === 'large' ? '1.125rem' : '1rem';

    // Helper to render product card cleanly
    const renderProductCard = (prod) => (
        <div key={prod.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col cursor-pointer text-left" onClick={() => { setSelectedProduct(prod); setSelectedVariant(null); setCurrentImageIndex(0); }}>
            <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {prod.image_url || (prod.images && prod.images.length > 0) ? (() => {
                    const cover = prod.image_url || prod.images[0];
                    const isVideo = cover.toLowerCase().endsWith('.mp4') || cover.toLowerCase().endsWith('.webm');
                    return isVideo ? (
                        <video src={cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" autoPlay muted loop playsInline />
                    ) : (
                        <img src={cover} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    );
                })() : (
                    <ImageIcon className="w-12 h-12 text-slate-300" />
                )}
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h4 className="font-bold text-lg mb-1 line-clamp-2 leading-tight" style={{ color: colors.text }}>{prod.name}</h4>
                {prod.stock !== null && prod.stock !== undefined && (
                    <div className="mb-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prod.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {prod.stock > 0 ? `${prod.stock} disponibles` : 'Agotado'}
                        </span>
                    </div>
                )}
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">{prod.description}</p>
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        {prod.price === 0 || prod.price === '0' || prod.price === null ? (
                            <span className="font-black text-xl" style={{ color: colors.primary }}>Consultar</span>
                        ) : (
                            prod.sale_price > 0 && prod.sale_price < prod.price ? (
                                <>
                                    <span className="text-xs text-slate-400 line-through">${Number(prod.price || 0).toLocaleString()}</span>
                                    <span className="font-black text-xl text-green-600">${prod.sale_price.toLocaleString()}</span>
                                </>
                            ) : (
                                <span className="font-black text-xl" style={{ color: colors.primary }}>
                                    ${prod.price?.toLocaleString()}
                                </span>
                            )
                        )}
                    </div>
                    <Button 
                        size="sm"
                        style={{ backgroundColor: (prod.stock !== null && prod.stock <= 0) ? '#cbd5e1' : colors.primary, color: 'white' }}
                        disabled={prod.stock !== null && prod.stock <= 0}
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (prod.price === 0 || prod.price === '0' || prod.price === null) {
                                const waNumber = widgets.whatsappNumber;
                                if (waNumber) {
                                    const msg = `¡Hola! Me interesa consultar el precio de: ${prod.name}`;
                                    window.open(`https://wa.me/${String(waNumber).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                } else {
                                    toast({ title: 'Atención', description: 'La tienda no tiene WhatsApp configurado para consultas.', variant: 'destructive' });
                                }
                            } else {
                                addToCart(prod); 
                            }
                        }}
                    >
                        {(prod.stock !== null && prod.stock <= 0) ? 'Agotado' : (prod.price === 0 || prod.price === '0' || prod.price === null ? 'Consultar' : 'Agregar')}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div
            className={`min-h-screen flex flex-col transition-colors duration-200 storefront-container theme-${activeThemeId}`}
            style={{ 
                backgroundColor: colors.background, 
                color: colors.text,
                fontFamily: typography.bodyFont,
                fontSize: fontScale
            }}
        >
            {isExternalTemplate && (
                <>
                    <CurrentTemplate 
                        themeConfig={mergedThemeConfig}
                        storeData={storeData}
                        physicalProducts={physicalProducts}
                        digitalProducts={digitalProducts}
                        enableDigitalProducts={storeData.theme_config?.enableDigitalProducts}
                        currentUser={currentUser}
                        setCurrentView={setCurrentView}
                        simulatePurchase={simulatePurchase}
                        activePage={currentView === 'catalog' ? 'shop.html' : (currentView === 'store' ? 'index.html' : (currentView.endsWith('.html') ? currentView : `${currentView}.html`))}
                        onOpenCart={() => setIsCartOpen(true)}
                    />

                    {/* BOTÓN DE CARRITO FLOTANTE PARA PLANTILLAS EXTERNAS */}
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
                        style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                    >
                        <ShoppingBag className="w-6 h-6" />
                        {cartItems.length > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </button>
                </>
            )}

            {!isPreview && (() => {
                const isCatSelected = selectedCategory && selectedCategory !== 'all';
                const catSeo = isCatSelected ? (storeData.seo_categories || {})[selectedCategory] : null;
                
                let finalTitle = storeData.browser_title || storeData.seo_title || storeData.name || (design.sections?.logoTitle && design.sections.logoTitle.toLowerCase() !== 'mi tienda' ? design.sections.logoTitle : 'Mi Tienda');
                let finalDescription = catSeo?.description || storeData.seo_description;
                let ogImage = storeData.logo_url || storeData.favicon_url;
                let currentUrl = window.location.href;
                let schemaData = null;

                if (selectedProduct) {
                    finalTitle = `${selectedProduct.name} | ${storeData.name}`;
                    finalDescription = selectedProduct.description ? selectedProduct.description.substring(0, 150) + '...' : finalDescription;
                    ogImage = selectedProduct.image_url || (selectedProduct.images && selectedProduct.images[0]) || ogImage;
                    
                    schemaData = {
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": selectedProduct.name,
                        "image": ogImage,
                        "description": selectedProduct.description || selectedProduct.name,
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "ARS",
                            "price": selectedProduct.sale_price || selectedProduct.price || "0",
                            "availability": (selectedProduct.stock === null || selectedProduct.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                        }
                    };
                }

                return (
                    <Helmet>
                        <title>{finalTitle}</title>
                        <meta name="description" content={finalDescription || 'Tienda online oficial. Conocé todos nuestros productos y promociones.'} />
                        
                        {/* Open Graph / Facebook */}
                        <meta property="og:type" content={selectedProduct ? "product" : "website"} />
                        <meta property="og:url" content={currentUrl} />
                        <meta property="og:title" content={finalTitle} />
                        <meta property="og:description" content={finalDescription || 'Tienda online oficial.'} />
                        {ogImage && <meta property="og:image" content={ogImage} />}

                        {/* Twitter */}
                        <meta property="twitter:card" content="summary_large_image" />
                        <meta property="twitter:url" content={currentUrl} />
                        <meta property="twitter:title" content={finalTitle} />
                        <meta property="twitter:description" content={finalDescription || 'Tienda online oficial.'} />
                        {ogImage && <meta property="twitter:image" content={ogImage} />}

                        {/* Structured Data (JSON-LD) */}
                        {schemaData && (
                            <script type="application/ld+json">
                                {JSON.stringify(schemaData)}
                            </script>
                        )}
                    </Helmet>
                );
            })()}

            {/* Inyección de fuentes dinámicas vía Google Fonts */}
            <DynamicFonts typography={typography} />

            <style>{`
                .storefront-container {
                    font-family: '${typography.bodyFont}', sans-serif !important;
                }
                .storefront-container h1, 
                .storefront-container h2, 
                .storefront-container h3, 
                .storefront-container h4, 
                .storefront-container h5, 
                .storefront-container h6, 
                .storefront-container .font-heading {
                    font-family: '${typography.headingFont}', sans-serif !important;
                }
            `}</style>

            {sections.header && (
                <header className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-40">
                    <div className="flex items-center gap-3">
                        {storeData.logo_url ? (
                            <img src={storeData.logo_url} alt={storeData.name || 'Logo'} className="h-10 object-contain" />
                        ) : (
                            <h1 className="text-2xl font-black tracking-tight" style={{ color: colors.primary }}>
                                {storeData.name || (design.sections?.logoTitle && design.sections.logoTitle.toLowerCase() !== 'mi tienda' ? design.sections.logoTitle : 'Mi Tienda')}
                            </h1>
                        )}
                        {((design.sections?.logoSubtitle && design.sections.logoSubtitle.toLowerCase() !== 'la mejor') || (storeData.logo_url && design.sections?.logoTitle && design.sections.logoTitle.toLowerCase() !== 'mi tienda')) && (
                            <div className="flex flex-col justify-center">
                                {storeData.logo_url && design.sections?.logoTitle && design.sections.logoTitle.toLowerCase() !== 'mi tienda' && (
                                    <span className="font-bold text-sm leading-tight" style={{ color: colors.text }}>
                                        {design.sections.logoTitle}
                                    </span>
                                )}
                                {design.sections?.logoSubtitle && design.sections.logoSubtitle.toLowerCase() !== 'la mejor' && (
                                    <span className="text-xs opacity-75 leading-tight" style={{ color: colors.text }}>
                                        {design.sections.logoSubtitle}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <nav className="flex items-center gap-6">
                        <a 
                            href="#inicio" 
                            onClick={(e) => {
                                if (catalogMode === 'separate-page') {
                                    e.preventDefault();
                                    setCurrentView('store');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    const el = document.getElementById('inicio') || document.getElementById('index');
                                    if (el) {
                                        e.preventDefault();
                                        el.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }
                            }} 
                            className="text-sm font-medium hover:opacity-75 transition-opacity"
                        >
                            Inicio
                        </a>
                        {physicalProducts.length > 0 && (
                            <a 
                                href="#productos" 
                                onClick={(e) => {
                                    if (catalogMode === 'separate-page') {
                                        e.preventDefault();
                                        setCurrentView('catalog');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    } else {
                                        const el = document.getElementById('productos') || document.getElementById('shop');
                                        if (el) {
                                            e.preventDefault();
                                            el.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }
                                }} 
                                className="text-sm font-medium hover:opacity-75 transition-opacity"
                            >
                                Catálogo
                            </a>
                        )}
                        {digitalProducts.length > 0 && (
                            <a 
                                href="#digital" 
                                onClick={(e) => {
                                    if (catalogMode === 'separate-page') {
                                        e.preventDefault();
                                        setCurrentView('store');
                                        setTimeout(() => {
                                            const el = document.getElementById('digital');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    } else {
                                        const el = document.getElementById('digital');
                                        if (el) {
                                            e.preventDefault();
                                            el.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }
                                }} 
                                className="text-sm font-medium hover:opacity-75 transition-opacity"
                            >
                                Descargables
                            </a>
                        )}
                        
                        <div className="border-l pl-6 flex items-center gap-4">
                            <button 
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-slate-700 hover:text-black transition"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {cartItems.length > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {cartItems.length}
                                    </span>
                                )}
                            </button>
                            {currentUser ? (
                                <button 
                                    onClick={() => setCurrentView('portal')}
                                    className="flex items-center gap-2 text-sm font-bold bg-slate-100 text-slate-900 px-4 py-2 rounded-full hover:bg-slate-200 transition"
                                >
                                    <User className="w-4 h-4" /> Mi Portal
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setCurrentView('login')}
                                    className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-full transition hover:opacity-90 shadow-sm"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    <User className="w-4 h-4" /> Ingresar
                                </button>
                            )}
                        </div>
                    </nav>
                </header>
            )}

            {/* Custom pageSections from the Builder injected into Classic theme */}
            {!isExternalTemplate && hasCustomPageSections && (
                <div className="w-full">
                    {(() => {
                        if (catalogMode === 'one-page' && mergedThemeConfig?.pageSections) {
                            const defaultPages = [
                                { id: 'index.html' },
                                { id: 'shop.html' },
                                { id: 'contact.html' }
                            ].filter(p => !mergedThemeConfig?.hiddenDefaultPages?.includes(p.id));
                            const allPages = [...defaultPages, ...(mergedThemeConfig?.customPages || [])];

                            let hasRenderedProductSection = false;

                            const renderedPages = allPages.map(page => {
                                let sectionsList = mergedThemeConfig?.pageSections?.[page.id] || [];
                                
                                if (page.id === 'shop.html' && (!sectionsList || sectionsList.length === 0) && physicalProducts?.length > 0) {
                                    sectionsList = [
                                        {
                                            id: 'fallback-catalog-onepage',
                                            type: 'product_list',
                                            title: 'Catálogo de Productos',
                                            visible: true,
                                            settings: { limit: 100, enableSearch: true, categoryStyle: 'horizontal' }
                                        }
                                    ];
                                }

                                if (!sectionsList || sectionsList.length === 0) return null;

                                const visibleSections = sectionsList.filter(s => s.visible !== false);
                                if (visibleSections.some(s => s.type === 'product_list' || s.type === 'product_group' || s.type === 'selected_products')) {
                                    hasRenderedProductSection = true;
                                }

                                return (
                                    <div key={page.id} id={page.id.split('.')[0]}>
                                        {sectionsList.map((section, idx) => (
                                            <DynamicSectionRenderer 
                                                key={section.id || idx} 
                                                section={section} 
                                                themeConfig={mergedThemeConfig} 
                                                physicalProducts={physicalProducts} 
                                            />
                                        ))}
                                    </div>
                                );
                            });

                            return (
                                <>
                                    {renderedPages}
                                    {!hasRenderedProductSection && physicalProducts?.length > 0 && (
                                        <div id="shop">
                                            <DynamicSectionRenderer 
                                                section={{
                                                    id: 'fallback-auto-catalog',
                                                    type: 'product_list',
                                                    title: 'Nuestros Productos',
                                                    visible: true,
                                                    settings: { limit: 100, enableSearch: true, categoryStyle: 'horizontal' }
                                                }}
                                                themeConfig={mergedThemeConfig}
                                                physicalProducts={physicalProducts}
                                            />
                                        </div>
                                    )}
                                </>
                            );
                        }

                        const activePageKey = currentView === 'catalog' ? 'shop.html' : 
                                              currentView === 'contact' ? 'contact.html' : 
                                              (currentView.endsWith('.html') ? currentView : 'index.html');
                        let pageSections = mergedThemeConfig?.pageSections?.[activePageKey] || 
                                             (activePageKey === 'index.html' ? mergedThemeConfig?.homeSections : []) || [];

                        if ((activePageKey === 'shop.html' || currentView === 'catalog') && (!pageSections || pageSections.length === 0)) {
                            pageSections = [
                                {
                                    id: 'fallback-catalog-classic',
                                    type: 'product_list',
                                    title: 'Catálogo de Productos',
                                    visible: true,
                                    settings: { limit: 100, enableSearch: true, categoryStyle: 'horizontal' }
                                }
                            ];
                        }

                        const visibleSections = pageSections.filter(s => s.visible !== false);
                        const hasProductSection = visibleSections.some(s => s.type === 'product_list' || s.type === 'product_group' || s.type === 'selected_products');

                        return (
                            <div id={activePageKey.split('.')[0]}>
                                {pageSections.map((section, idx) => (
                                    <DynamicSectionRenderer 
                                        key={section.id || idx} 
                                        section={section} 
                                        themeConfig={mergedThemeConfig} 
                                        physicalProducts={physicalProducts} 
                                    />
                                ))}
                                {!hasProductSection && (activePageKey === 'shop.html' || activePageKey === 'index.html') && physicalProducts?.length > 0 && (
                                    <DynamicSectionRenderer 
                                        section={{
                                            id: 'fallback-auto-catalog-page',
                                            type: 'product_list',
                                            title: activePageKey === 'shop.html' ? 'Catálogo de Productos' : 'Nuestros Productos',
                                            visible: true,
                                            settings: { limit: 100, enableSearch: true, categoryStyle: 'horizontal' }
                                        }}
                                        themeConfig={mergedThemeConfig}
                                        physicalProducts={physicalProducts}
                                    />
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Fallback Classic Layout (only rendered if no custom builder sections exist) */}
            {!isExternalTemplate && !hasCustomPageSections && (
                <>
            {sections.hero && currentView === 'store' && (
                <main id="inicio" className="flex flex-col items-center justify-center px-4 pt-20 pb-12 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                            {sections.heroTitle !== undefined ? sections.heroTitle : (
                                <>Bienvenido a <span style={{ color: colors.primary }}>{storeData.name}</span></>
                            )}
                        </h2>
                        <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
                            {sections.heroSubtitle !== undefined ? sections.heroSubtitle : (storeData.description || 'Explora nuestra colección exclusiva de productos físicos y digitales.')}
                        </p>
                    </div>
                </main>
            )}

            {/* FEATURED PRODUCTS (Inicio) */}
            {sections.hero && physicalProducts.length > 0 && currentView === 'store' && (
                <section className="max-w-7xl mx-auto px-6 pb-16 w-full">
                    <h3 className="text-2xl font-black mb-6 text-center">{sections.featuredTitle !== undefined ? sections.featuredTitle : 'Productos Destacados'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(physicalProducts.filter(p => p.is_featured).length > 0 
                            ? physicalProducts.filter(p => p.is_featured).slice(0, 4)
                            : physicalProducts.slice(0, 4)
                        ).map(prod => (
                            <div key={prod.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col cursor-pointer" onClick={() => { setSelectedProduct(prod); setSelectedVariant(null); setCurrentImageIndex(0); }}>
                                <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                                    {prod.image_url || (prod.images && prod.images.length > 0) ? (() => {
                                        const cover = prod.image_url || prod.images[0];
                                        const isVideo = cover.toLowerCase().endsWith('.mp4') || cover.toLowerCase().endsWith('.webm');
                                        return isVideo ? (
                                            <video src={cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" autoPlay muted loop playsInline />
                                        ) : (
                                            <img src={cover} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        );
                                    })() : (
                                        <ImageIcon className="w-12 h-12 text-slate-300" />
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <h4 className="font-bold text-lg mb-1 line-clamp-2 leading-tight">{prod.name}</h4>
                                    <div className="mt-auto flex items-center justify-between pt-4">
                                        <span className="font-black text-xl" style={{ color: colors.primary }}>${prod.price?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PHYSICAL PRODUCTS SECTION (Catalog) */}
            {physicalProducts.length > 0 && (catalogMode === 'one-page' || currentView === 'catalog') && (
                <section id="productos" className="max-w-7xl mx-auto px-6 py-16 w-full">
                    <h3 className="text-3xl font-black mb-6">{currentView === 'catalog' ? 'Catálogo Completu' : 'Catálogo de Productos'}</h3>
                    
                    {(() => {
                        const categories = ['all', ...new Set(physicalProducts.map(p => p.category).filter(Boolean))];
                        const showSidebar = categoryLayout === 'sidebar' && categories.length > 1;

                        return (
                            <div className={showSidebar ? "flex flex-col md:flex-row gap-8" : ""}>
                                {/* Category Filter (Sidebar) */}
                                {showSidebar && (
                                    <div className="w-full md:w-64 shrink-0">
                                        <div className="sticky top-24 bg-slate-50 border rounded-2xl p-4">
                                            <h4 className="font-bold mb-4">Categorías</h4>
                                            <div className="flex flex-col gap-1">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            selectedCategory === cat 
                                                                ? 'bg-slate-200 text-slate-900 font-bold' 
                                                                : 'text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        {cat === 'all' ? 'Todas' : cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1">
                                    {/* Category Filter (Dropdown / Buttons) */}
                                    {!showSidebar && categories.length > 1 && (
                                        <div className="mb-8">
                                            {categoryLayout === 'dropdown' ? (
                                                <select 
                                                    className="w-full max-w-xs p-3 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-slate-200"
                                                    value={selectedCategory}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat === 'all' ? 'Todas las categorías' : cat}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {categories.map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setSelectedCategory(cat)}
                                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                                                                selectedCategory === cat 
                                                                    ? 'text-white' 
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            }`}
                                                            style={selectedCategory === cat ? { backgroundColor: colors.primary } : {}}
                                                        >
                                                            {cat === 'all' ? 'Todos' : cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Product Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {physicalProducts
                                            .filter(prod => selectedCategory === 'all' || prod.category === selectedCategory)
                                            .map(prod => (
                                            <div key={prod.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col cursor-pointer" onClick={() => { setSelectedProduct(prod); setSelectedVariant(null); setCurrentImageIndex(0); }}>
                                                <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                                                    {prod.image_url || (prod.images && prod.images.length > 0) ? (() => {
                                                        const cover = prod.image_url || prod.images[0];
                                                        const isVideo = cover.toLowerCase().endsWith('.mp4') || cover.toLowerCase().endsWith('.webm');
                                                        return isVideo ? (
                                                            <video src={cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" autoPlay muted loop playsInline />
                                                        ) : (
                                                            <img src={cover} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        );
                                                    })() : (
                                                        <ImageIcon className="w-12 h-12 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="p-4 flex flex-col flex-1">
                                                    <h4 className="font-bold text-lg mb-1 line-clamp-2 leading-tight">{prod.name}</h4>
                                                    {prod.stock !== null && prod.stock !== undefined && (
                                                        <div className="mb-2">
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prod.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {prod.stock > 0 ? `${prod.stock} disponibles` : 'Agotado'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">{prod.description}</p>
                                                    <div className="mt-auto flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            {prod.price === 0 || prod.price === '0' || prod.price === null ? (
                                                                <span className="font-black text-xl" style={{ color: colors.primary }}>Consultar</span>
                                                            ) : (
                                                                prod.sale_price > 0 && prod.sale_price < prod.price ? (
                                                                    <>
                                                                        <span className="text-xs text-slate-400 line-through">${Number(prod.price || 0).toLocaleString()}</span>
                                                                        <span className="font-black text-xl text-green-600">${prod.sale_price.toLocaleString()}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="font-black text-xl" style={{ color: colors.primary }}>
                                                                        ${prod.price?.toLocaleString()}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="sm"
                                                            style={{ backgroundColor: (prod.stock !== null && prod.stock <= 0) ? '#cbd5e1' : colors.primary, color: 'white' }}
                                                            disabled={prod.stock !== null && prod.stock <= 0}
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                if (prod.price === 0 || prod.price === '0' || prod.price === null) {
                                                                    const waNumber = widgets.whatsappNumber;
                                                                    if (waNumber) {
                                                                        const msg = `¡Hola! Me interesa consultar el precio de: ${prod.name}`;
                                                                        window.open(`https://wa.me/${String(waNumber).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                                                    } else {
                                                                        toast({ title: 'Atención', description: 'La tienda no tiene WhatsApp configurado para consultas.', variant: 'destructive' });
                                                                    }
                                                                } else {
                                                                    addToCart(prod); 
                                                                }
                                                            }}
                                                        >
                                                            {(prod.stock !== null && prod.stock <= 0) ? 'Agotado' : (prod.price === 0 || prod.price === '0' || prod.price === null ? 'Consultar' : 'Agregar')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </section>
            )}

            {digitalProducts.length > 0 && (catalogMode === 'one-page' || currentView === 'store') && (
                <section id="digital" className="max-w-7xl mx-auto px-6 py-16 w-full bg-black/5 rounded-3xl my-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                        <div>
                            <h3 className="text-3xl font-black mb-2">Archivos Digitales</h3>
                            <p className="opacity-70">Ebooks, guías y recursos descargables al instante.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {digitalProducts.map(res => (
                            <div key={res.id} className="bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                    {res.thumbnail_url ? (
                                        <img src={res.thumbnail_url} alt={res.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                            <FileText className="w-16 h-16 text-white/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg font-black text-lg shadow-lg" style={{ color: colors.primary }}>
                                        {res.price > 0 ? `$${res.price.toLocaleString()}` : 'GRATIS'}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-bold text-xl mb-2 line-clamp-1">{res.name}</h4>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">{res.description}</p>
                                    <Button 
                                        className="w-full py-6 text-base font-bold shadow-md hover:shadow-lg transition-shadow"
                                        style={{ backgroundColor: colors.primary, color: 'white' }}
                                        onClick={() => simulatePurchase(res)}
                                    >
                                        Comprar y Descargar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

                </>
            )}

            {/* WIDGETS FLOTANTES: WhatsApp (izquierda) y Carrito (derecha) */}
            {widgets.showWhatsapp && (
                <div className="fixed bottom-6 left-6 z-50">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                        title="Contactar por WhatsApp"
                    >
                        <MessageCircle className="w-7 h-7 fill-current" />
                    </a>
                </div>
            )}

            {/* CART DRAWER */}
            {isCartOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-[60] transition-opacity backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
                        <div className="flex items-center justify-between p-6 border-b bg-white">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" /> Tu Carrito
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="font-medium text-lg">Tu carrito está vacío</p>
                                    <p className="text-sm mt-2">¡Agregá productos para comenzar!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map(item => (
                                        <div key={item.cartItemId} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl items-center shadow-sm">
                                            <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                                {item.image_url || (item.images && item.images.length > 0) ? (
                                                    <img src={item.image_url || item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-slate-300 m-auto mt-6" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-tight mb-1">{item.name}</h4>
                                                {item.selectedVariant && (
                                                    <div className="flex items-center gap-1.5 mb-1 text-xs text-slate-500">
                                                        {item.selectedVariant.color_hex && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.selectedVariant.color_hex }}></div>}
                                                        <span>{item.selectedVariant.name}</span>
                                                    </div>
                                                )}
                                                <div className="text-sm font-black" style={{ color: colors.primary }}>${Number((item.sale_price > 0 && (item.price === null || item.sale_price < item.price)) ? item.sale_price : (item.price || 0)).toLocaleString()}</div>
                                                
                                                <div className="flex items-center gap-3 mt-3">
                                                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                                        <button onClick={() => updateCartItem(item.cartItemId, -1)} className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-slate-50 shadow-sm transition-colors"><Minus className="w-3 h-3 text-slate-600" /></button>
                                                        <span className="text-sm font-bold w-8 text-center text-slate-700">{item.quantity}</span>
                                                        <button onClick={() => updateCartItem(item.cartItemId, 1)} className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-slate-50 shadow-sm transition-colors"><Plus className="w-3 h-3 text-slate-600" /></button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.cartItemId)} className="ml-auto text-xs font-semibold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-3 py-1.5 rounded-lg">Quitar</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Productos Relacionados Inteligentes */}
                                    {(() => {
                                        const cartCategories = [...new Set(cartItems.map(item => item.category).filter(Boolean))];
                                        const cartIds = cartItems.map(item => item.id);
                                        let related = physicalProducts.filter(p => cartCategories.includes(p.category) && !cartIds.includes(p.id));
                                        if (related.length === 0) related = physicalProducts.filter(p => !cartIds.includes(p.id));
                                        related = related.slice(0, 2);

                                        if (related.length === 0) return null;

                                        return (
                                            <div className="mt-8 pt-6 border-t border-slate-200">
                                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-amber-500" /> 
                                                    También te podría interesar...
                                                </h3>
                                                <div className="space-y-3">
                                                    {related.map(prod => (
                                                        <div key={`rel-${prod.id}`} className="flex gap-3 p-3 bg-white rounded-xl items-center shadow-sm border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer" onClick={() => { addToCart(prod); }}>
                                                            <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                <img src={prod.image_url || (prod.images && prod.images[0])} alt={prod.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-xs text-slate-700 line-clamp-1">{prod.name}</h4>
                                                                <div className="text-xs font-black mt-1" style={{ color: colors.primary }}>${Number((prod.sale_price > 0 && (prod.price === null || prod.sale_price < prod.price)) ? prod.sale_price : (prod.price || 0)).toLocaleString()}</div>
                                                            </div>
                                                            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700">
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="p-6 bg-white border-t shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-10">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="font-bold text-slate-500 text-sm uppercase tracking-wider">Total a Pagar</span>
                                    <span className="text-3xl font-black" style={{ color: colors.primary }}>${cartTotal.toLocaleString()}</span>
                                </div>
                                <Button 
                                    className="w-full py-6 text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]" 
                                    style={{ backgroundColor: colors.primary, color: 'white', boxShadow: `0 10px 25px -5px ${colors.primary}60` }}
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        setIsCheckoutOpen(true);
                                    }}
                                >
                                    Continuar Compra
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* CHECKOUT MODAL */}
            {isCheckoutOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-sm transition-opacity" onClick={() => setIsCheckoutOpen(false)} />
                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b bg-slate-50/50">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-2xl font-black text-slate-800">Casi listo!</h2>
                                    <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-slate-500 text-sm">Necesitamos un par de datos para enviarle tu pedido al vendedor por WhatsApp.</p>
                            </div>
                            
                            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Tu Nombre y Apellido</label>
                                    <Input 
                                        required 
                                        placeholder="Ej: Juan Pérez" 
                                        className="h-12 bg-slate-50 border-slate-200"
                                        value={checkoutForm.name}
                                        onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Teléfono de Contacto</label>
                                    <Input 
                                        required 
                                        type="tel" 
                                        placeholder="Ej: 1123456789" 
                                        className="h-12 bg-slate-50 border-slate-200"
                                        value={checkoutForm.phone}
                                        onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Código Postal</label>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Ej: 1000" 
                                            className="h-12 bg-slate-50 border-slate-200"
                                            value={checkoutForm.zipcode}
                                            onChange={e => setCheckoutForm({...checkoutForm, zipcode: e.target.value})}
                                        />
                                        {isFetchingRates && <Loader2 className="w-5 h-5 animate-spin text-violet-500 self-center" />}
                                    </div>
                                    <p className="text-xs text-slate-500">Ingrésalo para calcular los costos de envío a domicilio.</p>
                                </div>

                                {(availableShippingZones.length > 0 || dynamicRates.length > 0) && (
                                    <div className="space-y-2 pt-2">
                                        <label className="text-sm font-bold text-slate-700">Método de Envío</label>
                                        <select 
                                            value={selectedShippingId || ''} 
                                            onChange={(e) => setSelectedShippingId(e.target.value)}
                                            className="w-full h-12 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                        >
                                            <option value="" disabled>Selecciona un método de envío</option>
                                            {[...availableShippingZones.filter(z => !['correo_argentino', 'oca', 'andreani'].includes(z.name)), ...dynamicRates].map(zone => {
                                                let label = '';
                                                if (zone.dynamic) label = zone.states || zone.name;
                                                else if (zone.name === 'pickup') label = 'Retiro en Local';
                                                else if (zone.name === 'delivery') label = 'Envío a Domicilio';
                                                else if (zone.name === 'oca') label = 'Envío por OCA';
                                                else if (zone.name === 'correo_argentino') label = 'Envío por Correo Arg.';
                                                else if (zone.name === 'andreani') label = 'Envío por Andreani';
                                                else if (zone.name === 'other') label = zone.states || 'Otro Envío';
                                                else label = zone.name;

                                                const price = zone.cost === 0 ? 'Gratis' : `$${zone.cost}`;
                                                
                                                return (
                                                    <option key={zone.id} value={zone.id}>
                                                        {label} - {price}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}

                                {availablePaymentMethods.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <label className="text-sm font-bold text-slate-700">Medio de Pago</label>
                                        <div className="grid gap-2">
                                            {availablePaymentMethods.map(method => {
                                                const isSelected = selectedPaymentId === method.id;
                                                return (
                                                    <div 
                                                        key={method.id}
                                                        onClick={() => setSelectedPaymentId(method.id)}
                                                        className={`p-3 rounded-xl border cursor-pointer flex flex-col transition-all ${isSelected ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className={`text-sm font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>{method.provider === 'mercadopago_auto' ? 'Pagar con Tarjeta de Debito o credito' : method.display_name}</span>
                                                        </div>
                                                        {isSelected && method.provider === 'transfer' && method.config?.value && (
                                                            <div className="mt-2 text-xs text-emerald-700 bg-white p-2 rounded-lg border border-emerald-100 text-center relative group">
                                                                Transfiere al Alias/CBU: <br/>
                                                                <span className="font-mono font-bold text-slate-800 text-sm tracking-wider">{method.config.value}</span>
                                                                <div className="absolute inset-0 bg-emerald-100/0 group-hover:bg-emerald-100/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg cursor-pointer" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(method.config.value); toast({ title: 'Copiado', description: 'Alias/CBU copiado.' }); }}>
                                                                    <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-1 rounded-full shadow-sm">Copiar</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {isSelected && method.provider === 'paypal' && method.config?.value && (
                                                            <div className="mt-2 text-xs text-emerald-700">
                                                                Link de pago: <a href={method.config.value} target="_blank" rel="noreferrer" className="font-bold underline" onClick={e => e.stopPropagation()}>{method.config.value}</a>
                                                            </div>
                                                        )}
                                                        {isSelected && method.provider === 'mercadopago_auto' && (
                                                            <div className="mt-2 text-xs text-emerald-700">
                                                                Para abonar de forma segura al confirmar el pedido.
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Discount Section */}
                                <div className="space-y-2 pt-2">
                                    <label className="text-sm font-bold text-slate-700">Cupón de Descuento</label>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Ingresa tu código" 
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            className="h-12 bg-slate-50 border-slate-200 uppercase font-mono"
                                            disabled={!!appliedDiscount || isApplyingDiscount}
                                        />
                                        {!appliedDiscount ? (
                                            <Button 
                                                type="button" 
                                                onClick={handleApplyDiscount}
                                                disabled={!discountCode.trim() || isApplyingDiscount}
                                                className="h-12 px-6 bg-slate-800 hover:bg-slate-700 text-white"
                                            >
                                                {isApplyingDiscount ? '...' : 'Aplicar'}
                                            </Button>
                                        ) : (
                                            <Button 
                                                type="button" 
                                                onClick={() => {
                                                    setAppliedDiscount(null);
                                                    setDiscountCode('');
                                                    setDiscountError('');
                                                }}
                                                className="h-12 px-4 bg-red-100 hover:bg-red-200 text-red-600"
                                            >
                                                Quitar
                                            </Button>
                                        )}
                                    </div>
                                    {discountError && <p className="text-xs text-red-500 font-medium">{discountError}</p>}
                                    {appliedDiscount && <p className="text-xs text-emerald-600 font-medium">¡Cupón {appliedDiscount.code} aplicado exitosamente!</p>}
                                </div>

                                <div className="pt-4 border-t mt-6 mb-4 flex flex-col gap-1">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Subtotal</span>
                                        <span>${Number(cartTotal || 0).toLocaleString()}</span>
                                    </div>
                                    {appliedDiscount && (
                                        <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                            <span>Descuento ({appliedDiscount.code})</span>
                                            <span>-${Number(discountAmount || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {(() => {
                                        const selectedShipping = [...availableShippingZones, ...dynamicRates].find(s => String(s.id) === String(selectedShippingId));
                                        return selectedShipping && Number(selectedShipping.cost) > 0 && (
                                            <div className="flex justify-between text-sm text-slate-500">
                                                <span>Costo de Envío</span>
                                                <span>${Number(selectedShipping.cost || 0).toLocaleString()}</span>
                                            </div>
                                        );
                                    })()}
                                    <div className="flex justify-between text-xl font-black text-slate-900 mt-2">
                                        <span>Total a Pagar</span>
                                        <span style={{ color: colors.primary }}>${Number(finalTotal || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={isSubmittingOrder}
                                    className="w-full h-14 text-lg font-bold rounded-xl mt-4 shadow-lg transition-all hover:scale-[1.02]"
                                    style={{ backgroundColor: selectedPaymentId && availablePaymentMethods.find(p => p.id === selectedPaymentId)?.provider === 'mercadopago_auto' ? '#009ee3' : '#25D366', color: 'white', boxShadow: selectedPaymentId && availablePaymentMethods.find(p => p.id === selectedPaymentId)?.provider === 'mercadopago_auto' ? '0 10px 25px -5px rgba(0, 158, 227, 0.4)' : '0 10px 25px -5px rgba(37, 211, 102, 0.4)' }}
                                >
                                    {isSubmittingOrder ? <Loader2 className="w-6 h-6 animate-spin" /> : (selectedPaymentId && availablePaymentMethods.find(p => p.id === selectedPaymentId)?.provider === 'mercadopago_auto' ? 'Pagar con Tarjeta de Debito o credito' : 'Pedir por WhatsApp')}
                                </Button>
                                <p className="text-center text-xs text-slate-400 font-medium">
                                    {selectedPaymentId && availablePaymentMethods.find(p => p.id === selectedPaymentId)?.provider === 'mercadopago_auto' ? 'Pago protegido por Mercado Pago.' : 'Serás redirigido de forma segura a WhatsApp.'}
                                </p>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* PRODUCT DETAILS MODAL */}
            {selectedProduct && (() => {
                // Ensure we have an array of images to show
                const allImages = [];
                if (selectedProduct.image_url) allImages.push(selectedProduct.image_url);
                if (selectedProduct.images && Array.isArray(selectedProduct.images)) {
                    selectedProduct.images.forEach(img => {
                        if (!allImages.includes(img)) allImages.push(img);
                    });
                }
                const hasImages = allImages.length > 0;

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setSelectedProduct(null); setSelectedVariant(null); }}></div>
                        <div className="bg-white rounded-3xl overflow-y-auto md:overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row relative shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
                            <button 
                                onClick={() => { setSelectedProduct(null); setSelectedVariant(null); }} 
                                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full hover:bg-slate-100 text-slate-700 hover:text-black transition z-50 shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Gallery Side */}
                            <div className="w-full md:w-1/2 bg-slate-100 flex flex-col relative">
                                <div className="aspect-square flex items-center justify-center relative bg-white">
                                    {hasImages ? (() => {
                                        const currentMedia = allImages[currentImageIndex];
                                        const isVideo = currentMedia.toLowerCase().endsWith('.mp4') || currentMedia.toLowerCase().endsWith('.webm');
                                        return isVideo ? (
                                            <video src={currentMedia} className="w-full h-full object-contain" autoPlay muted loop playsInline />
                                        ) : (
                                            <img src={currentMedia} alt={selectedProduct.name} className="w-full h-full object-contain" />
                                        );
                                    })() : (
                                        <ImageIcon className="w-20 h-20 text-slate-300" />
                                    )}
                                    
                                    {allImages.length > 1 && (
                                        <>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1); }}
                                                className="absolute left-4 p-2 bg-white/80 rounded-full hover:bg-white shadow-md transition"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1); }}
                                                className="absolute right-4 p-2 bg-white/80 rounded-full hover:bg-white shadow-md transition"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                                {allImages.length > 1 && (
                                    <div className="flex gap-2 p-4 overflow-x-auto bg-slate-50 border-t">
                                        {allImages.map((img, idx) => {
                                            const isVideo = img.toLowerCase().endsWith('.mp4') || img.toLowerCase().endsWith('.webm');
                                            return (
                                            <button 
                                                key={idx} 
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${currentImageIndex === idx ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            >
                                                {isVideo ? (
                                                    <video src={img} className="w-full h-full object-cover" muted />
                                                ) : (
                                                    <img src={img} className="w-full h-full object-cover" />
                                                )}
                                                {isVideo && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                                                            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-black border-b-[4px] border-b-transparent ml-0.5"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        )})}
                                    </div>
                                )}
                            </div>

                            {/* Info Side */}
                            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col md:overflow-y-auto">
                                {selectedProduct.category && (
                                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">{selectedProduct.category}</span>
                                )}
                                <h2 className="text-3xl font-black text-slate-900 mb-4">{selectedProduct.name}</h2>
                                {selectedProduct.stock !== null && selectedProduct.stock !== undefined && (
                                    <div className="mb-4">
                                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${selectedProduct.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades disponibles` : 'Producto Agotado'}
                                        </span>
                                    </div>
                                )}
                                <div className="mb-6 flex flex-col">
                                    {selectedProduct.price === 0 || selectedProduct.price === '0' || selectedProduct.price === null ? (
                                        <p className="text-4xl font-black" style={{ color: colors.primary }}>Consultar precio</p>
                                    ) : (
                                        selectedProduct.sale_price > 0 && selectedProduct.sale_price < selectedProduct.price ? (
                                            <>
                                                <p className="text-lg font-bold text-slate-400 line-through">${Number(selectedProduct.price).toLocaleString()}</p>
                                                <p className="text-4xl font-black text-green-600">${Number(selectedProduct.sale_price).toLocaleString()}</p>
                                            </>
                                        ) : (
                                            <p className="text-4xl font-black" style={{ color: colors.primary }}>${selectedProduct.price?.toLocaleString()}</p>
                                        )
                                    )}
                                </div>
                                
                                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Opciones</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedProduct.variants.map((variant) => {
                                                const isSelected = selectedVariant?.id === variant.id;
                                                const isOutOfStock = variant.stock <= 0;
                                                return (
                                                    <button
                                                        key={variant.id}
                                                        disabled={isOutOfStock}
                                                        onClick={() => setSelectedVariant(variant)}
                                                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                                                            isOutOfStock 
                                                                ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed' 
                                                                : isSelected 
                                                                    ? 'border-violet-500 bg-violet-50 shadow-md scale-105' 
                                                                    : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {variant.color_hex && (
                                                            <div 
                                                                className="w-4 h-4 rounded-full border border-black/10 shadow-sm" 
                                                                style={{ backgroundColor: variant.color_hex }}
                                                            />
                                                        )}
                                                        <span className={`font-semibold text-sm ${isOutOfStock ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                            {variant.name}
                                                        </span>
                                                        {isOutOfStock && <span className="absolute -top-2 -right-2 bg-slate-200 text-slate-500 text-[9px] font-black px-1.5 py-0.5 rounded-full">Agotado</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="prose prose-slate mb-8">
                                    <p className="text-slate-600 leading-relaxed">{selectedProduct.description || 'Sin descripción detallada.'}</p>
                                </div>

                                <div className="mt-auto pt-6 border-t">
                                    <Button 
                                        className="w-full py-6 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                                        style={{ backgroundColor: (selectedProduct.stock !== null && selectedProduct.stock <= 0) ? '#cbd5e1' : colors.primary, color: 'white' }}
                                        disabled={selectedProduct.stock !== null && selectedProduct.stock <= 0}
                                        onClick={() => { 
                                            if (selectedProduct.price === 0 || selectedProduct.price === '0' || selectedProduct.price === null) {
                                                const waNumber = widgets.whatsappNumber;
                                                if (waNumber) {
                                                    const msg = `¡Hola! Me interesa consultar el precio de: ${selectedProduct.name}`;
                                                    window.open(`https://wa.me/${String(waNumber).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                                } else {
                                                    toast({ title: 'Atención', description: 'La tienda no tiene WhatsApp configurado para consultas.', variant: 'destructive' });
                                                }
                                                return;
                                            }

                                            if (selectedProduct.variants && selectedProduct.variants.length > 0 && !selectedVariant) {
                                                toast({ title: 'Atención', description: 'Por favor selecciona una opción (color, talle, etc.)', variant: 'destructive' });
                                                return;
                                            }
                                            addToCart(selectedProduct, selectedVariant);
                                            setSelectedProduct(null);
                                            setSelectedVariant(null);
                                            setIsCartOpen(true);
                                        }}
                                    >
                                        {(selectedProduct.stock !== null && selectedProduct.stock <= 0) ? 'Agotado' : (selectedProduct.price === 0 || selectedProduct.price === '0' || selectedProduct.price === null ? 'Consultar precio por WhatsApp' : 'Agregar al carrito')}
                                    </Button>

                                    <Button 
                                        variant="outline"
                                        className="w-full mt-3 py-6 text-sm font-bold shadow-sm"
                                        onClick={() => {
                                            const url = new URL(window.location.href);
                                            url.searchParams.set('product', selectedProduct.id);
                                            if (!selectedProduct.variants || selectedProduct.variants.length === 0) {
                                                url.searchParams.set('buy', 'true');
                                            }
                                            navigator.clipboard.writeText(url.toString());
                                            toast({ title: '¡Enlace copiado!', description: 'El enlace de compra directa se ha copiado al portapapeles.' });
                                        }}
                                    >
                                        <Pin className="w-4 h-4 mr-2" /> Copiar link de compra directa
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
            {/* Footer */}
            {!isExternalTemplate && sections.footer && (
               <footer 
                 className="mt-auto py-12 px-6 border-t w-full"
                 style={{ 
                    backgroundColor: colors.primary, 
                    color: '#ffffff',
                    borderColor: 'transparent'
                 }}
               >
                  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                     <div>
                        <div className="font-bold text-2xl mb-4">{storeData.name || 'Mi Tienda'}</div>
                        <p className="opacity-70 max-w-xs text-sm">
                           {sections.footerText !== undefined ? sections.footerText : 'Creamos productos de calidad para personas que valoran el diseño y la funcionalidad.'}
                        </p>
                     </div>
                     <div>
                        <h4 className="font-bold mb-4">Enlaces</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                           <li>
                              <a 
                                 href="#inicio" 
                                 onClick={(e) => {
                                    if (catalogMode === 'separate-page') {
                                       e.preventDefault();
                                       setCurrentView('store');
                                       window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                 }} 
                                 className="hover:text-white hover:underline transition-all"
                              >
                                 Inicio
                              </a>
                           </li>
                           <li>
                              <a 
                                 href="#productos" 
                                 onClick={(e) => {
                                    if (catalogMode === 'separate-page') {
                                       e.preventDefault();
                                       setCurrentView('catalog');
                                       window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                 }} 
                                 className="hover:text-white hover:underline transition-all"
                              >
                                 Catálogo
                              </a>
                           </li>
                        </ul>
                     </div>
                     <div>
                        <h4 className="font-bold mb-4">Contacto</h4>
                        <ul className="space-y-2 text-sm opacity-80 mb-4">
                           {storeData.support_email && <li>{storeData.support_email}</li>}
                           {storeData.address && <li>{storeData.address}</li>}
                           {!storeData.support_email && !storeData.address && <li>Contacto disponible próximamente.</li>}
                        </ul>
                        
                        {/* Redes Sociales */}
                        {storeData.social_links && Object.values(storeData.social_links).some(link => link) && (
                            <div>
                                <h4 className="font-bold mb-3 text-sm">Síguenos</h4>
                                <div className="flex flex-wrap gap-3">
                                    {storeData.social_links.instagram && (
                                        <a href={storeData.social_links.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity"><Instagram className="w-5 h-5" /></a>
                                    )}
                                    {storeData.social_links.facebook && (
                                        <a href={storeData.social_links.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity"><Facebook className="w-5 h-5" /></a>
                                    )}
                                    {storeData.social_links.tiktok && (
                                        <a href={storeData.social_links.tiktok} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" title="TikTok"><Music2 className="w-5 h-5" /></a>
                                    )}
                                    {storeData.social_links.youtube && (
                                        <a href={storeData.social_links.youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity"><Youtube className="w-5 h-5" /></a>
                                    )}
                                    {storeData.social_links.x && (
                                        <a href={storeData.social_links.x} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity"><Twitter className="w-5 h-5" /></a>
                                    )}
                                    {storeData.social_links.pinterest && (
                                        <a href={storeData.social_links.pinterest} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" title="Pinterest"><Pin className="w-5 h-5" /></a>
                                    )}
                                </div>
                            </div>
                        )}
                     </div>
                     <div>
                        <h4 className="font-bold mb-4">Newsletter</h4>
                        <p className="text-xs opacity-75 mb-3">Recibí ofertas y novedades en tu correo.</p>
                        <NewsletterSubscriptionForm 
                            storeId={storeData.id}
                            buttonStyle="px-4 py-2.5 bg-white text-slate-900 font-bold rounded-lg text-xs hover:bg-slate-100 transition"
                            inputStyle="w-full px-3 py-2 rounded-lg border border-white/20 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none"
                            className="flex flex-col gap-2"
                        />
                     </div>
                  </div>
                  <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs opacity-50">
                     &copy; {new Date().getFullYear()} {storeData.name}. Todos los derechos reservados.
                  </div>
               </footer>
            )}
        </div>
    );
};

export default DynamicStore;
