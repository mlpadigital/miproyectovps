                    {themeConfig.homeSections.find(s => s.id === editingSectionId)?.type === 'banners' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Banners</h4>

                        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-[10px] text-amber-800">
                          Para que tu tienda sea más rápida para tus usuarios, te recomendamos que antes de subir las imágenes las comprimas <a href="https://www.iloveimg.com/es/comprimir-imagen?ref=tiendanegocio.com" target="_blank" rel="noreferrer" className="font-bold underline text-amber-900">en este link.</a>
                        </div>

                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-3">
                          <h5 className="text-xs font-bold text-slate-700">Imágenes</h5>
                          <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50">
                              <Upload className="w-3 h-3" /> Subir imagen
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50">
                              <ImageIcon className="w-3 h-3" /> Imágenes gratis
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="font-bold text-slate-700 block mb-1">Tamaño recomendado: 1200px x 450px</span>
                            Te sugerimos ubicar el contenido principal de la imagen de forma central en un ancho menor a 400px, para que en dispositivos móviles se vea de forma completa.
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <h5 className="text-xs font-bold text-slate-700">Configuración</h5>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Altura del banner</label>
                            <select className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={themeConfig.bannerConfig?.height || 'auto'}
                              onChange={(e) => updateConfig('bannerConfig', { ...(themeConfig.bannerConfig || {}), height: e.target.value })}
                            >
                              <option value="small">Pequeño</option>
                              <option value="large">Grande</option>
                              <option value="auto">Automático</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Autoplay</label>
                            <select className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={themeConfig.bannerConfig?.autoplay !== false ? 'yes' : 'no'}
                              onChange={(e) => updateConfig('bannerConfig', { ...(themeConfig.bannerConfig || {}), autoplay: e.target.value === 'yes' })}
                            >
                              <option value="yes">Sí</option>
                              <option value="no">No</option>
                            </select>
                          </div>

                          {(themeConfig.bannerConfig?.autoplay !== false) && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Tiempo de cambio ({themeConfig.bannerConfig?.interval || 5} segundos)</label>
                              <input
                                type="range"
                                min="0"
                                max="9"
                                className="w-full"
                                value={themeConfig.bannerConfig?.interval || 5}
                                onChange={(e) => updateConfig('bannerConfig', { ...(themeConfig.bannerConfig || {}), interval: parseInt(e.target.value) })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-200">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">Listado de secciones</h4>

                    {(!themeConfig.homeSections || themeConfig.homeSections.length === 0) ? (
                      <div className="text-center py-6 bg-white border border-slate-200 border-dashed rounded mb-4">
                        <p className="text-sm text-slate-500">No tienes secciones.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mb-4">
                        {themeConfig.homeSections.map((section, index) => (
                          <div key={section.id} className="bg-white border border-slate-200 rounded p-2 flex items-center justify-between group shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button onClick={() => moveSection(index, 'down')} disabled={index === themeConfig.homeSections.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                              <span className={`text-sm font-medium ${!section.visible ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{section.title}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => toggleSectionVisibility(index)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title={section.visible ? "Ocultar" : "Mostrar"}>
                                {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button onClick={() => setEditingSectionId(section.id)} className="p-1.5 hover:bg-slate-100 rounded text-blue-500" title="Editar">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => removeSection(index)} className="p-1.5 hover:bg-slate-100 rounded text-red-500" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] text-slate-400 mt-1 italic">Usa las flechas para ordenar las secciones en tu página de inicio.</p>
                      </div>
                    )}

                    <button onClick={() => setIsAddingSection(true)} className="w-full py-2 bg-white border border-[#311b92] text-[#311b92] rounded font-bold text-sm hover:bg-[#311b92] hover:text-white transition-colors mb-6 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Añadir nueva sección
                    </button>

                    <div className="border-t border-slate-200 pt-4">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recomendaciones para vos:</h5>
                      <div className="flex flex-col gap-3">
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded cursor-pointer hover:border-blue-300" onClick={() => addSection(CATALOG_SECTIONS.find(s => s.id === 'banners'))}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-blue-900">Opción 1: Banners</span>
                            <Plus className="w-3 h-3 text-blue-600" />
                          </div>
                          <p className="text-[10px] text-blue-700 leading-tight">Sirve para dar a conocer tu marca, promociones y beneficios.</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded cursor-pointer hover:border-emerald-300" onClick={() => addSection(CATALOG_SECTIONS.find(s => s.id === 'purchase_info'))}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-emerald-900">Opción 2: Información de compra</span>
                            <Plus className="w-3 h-3 text-emerald-600" />
                          </div>
                          <p className="text-[10px] text-emerald-700 leading-tight">Podrás incluir información básica sobre el proceso de compra.</p>
                        </div>
                      </div>
                      <a href="https://blog.mlpadigital.com/ayuda/pagina-de-inicio/" target="_blank" rel="noreferrer" className="block mt-4 text-xs text-blue-600 hover:underline text-center">
                        [Página de Inicio] Ayuda y Tutoriales
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </SidebarSection>
            <SidebarSection icon={ArrowDownToLine} title="Pie de página" isOpen={activeSection === 'footer'} onClick={() => toggleSection('footer')}>
              <div className="space-y-6">
                {/* Imagen del footer */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#311b92] uppercase tracking-wider border-b border-slate-200 pb-1">Imagen</h4>
                  <div>
