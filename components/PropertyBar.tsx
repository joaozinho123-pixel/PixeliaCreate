
import React, { useState } from 'react';
import { COLORS, NOTE_COLORS, STROKE_WIDTHS, FONT_SIZES, SHAPES, BACKGROUND_COLORS, BACKGROUND_GRADIENTS, FONTS, PATTERNS, CHARTS } from '../constants';
import { ToolType, ShapeType, CanvasElement, BackgroundPattern, TextElement, StickerElement, ChartType, ChartElement } from '../types';
import { Trash2, Copy, BringToFront, SendToBack, Bold, Italic, Underline, Palette, Type, Layout, MousePointerClick, ChevronDown, Smile, ChevronRight, PieChart } from 'lucide-react';

interface PropertyBarProps {
  activeTool: ToolType;
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  currentShapeType: ShapeType;
  onShapeTypeChange: (type: ShapeType) => void;
  
  // Sticker Selection
  onStickerSelect?: (sticker: string) => void;

  // Page Properties
  pageColor: string;
  onPageColorChange: (color: string) => void;
  pagePattern: BackgroundPattern;
  onPagePatternChange: (pattern: BackgroundPattern) => void;

  // Layer & Arrangement
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

const STICKER_CATEGORIES = {
    'Faces': ['😊', '😂', '😍', '🤔', '😎', '😭', '🤯', '🥳', '😡', '😱', '👍', '👎', '👋', '🙏', '👻', '👽', '🤖', '💩', '🤡', '👺'],
    'Nature': ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🌲', '🌵', '🌹', '🌻', '🍁', '🍃'],
    'Food': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍔', '🍕', '🌭', '🍿', '🍩', '🍪', '🍺', '☕', '🍦'],
    'Objects': ['🔥', '💡', '🎉', '🚀', '⭐', '❤️', '✅', '❌', '⚠️', '❓', '🔔', '🎁', '🏆', '💎', '🔑', '🔓', '🔎', '📷', '💣', '🎈'],
    'Places': ['🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕋', '⛲'],
    'Symbols': ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎'],
    'Office': ['📅', '📊', '📈', '📌', '📎', '📁', '✏️', '💻', '📱', '🗑️', '🔒', '✉️', '📞', '✂️', '📏', '📐', '📕', '💾', '💿', '📼']
};

// Modern Section Component with Entry Animation & Mobile Optimization
const Section = ({ title, icon: Icon, children, delay = 0 }: { title: string, icon?: any, children?: React.ReactNode, delay?: number }) => (
  <div 
    className="flex flex-col justify-center gap-1.5 px-3 md:px-5 py-1 border-r border-gray-100/50 last:border-0 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500 fill-mode-backwards group/section hover:bg-white/40 transition-colors rounded-xl mx-1"
    style={{ animationDelay: `${delay}ms` }}
  >
      <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-extrabold text-gray-400 group-hover/section:text-purple-400 uppercase tracking-widest opacity-80 transition-colors">
          {Icon && <Icon size={10} />}
          {title}
      </div>
      <div className="flex items-center gap-2 md:gap-3 h-8 md:h-9">
          {children}
      </div>
  </div>
);

const PropertyBar: React.FC<PropertyBarProps> = ({
  activeTool,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  currentColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fontSize,
  onFontSizeChange,
  currentShapeType,
  onShapeTypeChange,
  onStickerSelect,
  pageColor,
  onPageColorChange,
  pagePattern,
  onPagePatternChange,
  onBringToFront,
  onSendToBack
}) => {
  
  const isSelectMode = activeTool === ToolType.SELECT;
  const hasSelection = isSelectMode && selectedElement;
  
  // States
  const [activeStickerCategory, setActiveStickerCategory] = useState<keyof typeof STICKER_CATEGORIES>('Faces');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);

  // Effective Values Calculation
  const effectiveColor = hasSelection ? (selectedElement as any).color : currentColor;
  const effectiveFontSize = (hasSelection && (selectedElement.type === 'text' || selectedElement.type === 'code')) ? (selectedElement as any).fontSize : fontSize;
  const effectiveFontFamily = (hasSelection && selectedElement.type === 'text') ? (selectedElement as TextElement).fontFamily : 'Inter, sans-serif';
  const effectiveStrokeWidth = (hasSelection && selectedElement.type === 'path') ? (selectedElement as any).strokeWidth : strokeWidth;
  
  // Chart Values
  const effectiveChartType = (hasSelection && selectedElement.type === 'chart') ? (selectedElement as ChartElement).chartType : ChartType.BAR;

  // Text Styles
  const isBold = hasSelection && selectedElement.type === 'text' && (selectedElement as TextElement).fontWeight === 'bold';
  const isItalic = hasSelection && selectedElement.type === 'text' && (selectedElement as TextElement).fontStyle === 'italic';
  const isUnderline = hasSelection && selectedElement.type === 'text' && (selectedElement as TextElement).textDecoration === 'underline';

  // Handlers
  const handleColorChange = (hex: string) => hasSelection ? onUpdateElement(selectedElement.id, { color: hex }) : onColorChange(hex);
  const handleFontSizeChange = (size: number) => hasSelection ? onUpdateElement(selectedElement.id, { fontSize: size } as any) : onFontSizeChange(size);
  const handleFontFamilyChange = (font: string) => hasSelection && selectedElement.type === 'text' && onUpdateElement(selectedElement.id, { fontFamily: font } as any);
  const handleStrokeWidthChange = (width: number) => hasSelection ? onUpdateElement(selectedElement.id, { strokeWidth: width } as any) : onStrokeWidthChange(width);
  const handleChartTypeChange = (type: ChartType) => hasSelection && selectedElement.type === 'chart' && onUpdateElement(selectedElement.id, { chartType: type } as any);

  // Toggle Text Styles
  const toggleBold = () => hasSelection && selectedElement.type === 'text' && onUpdateElement(selectedElement.id, { fontWeight: isBold ? 'normal' : 'bold' } as any);
  const toggleItalic = () => hasSelection && selectedElement.type === 'text' && onUpdateElement(selectedElement.id, { fontStyle: isItalic ? 'normal' : 'italic' } as any);
  const toggleUnderline = () => hasSelection && selectedElement.type === 'text' && onUpdateElement(selectedElement.id, { textDecoration: isUnderline ? 'none' : 'underline' } as any);

  // Conditionals
  const showColorPicker = activeTool !== ToolType.ERASER && activeTool !== ToolType.STICKER; 
  const showStrokeWidth = activeTool === ToolType.PEN || activeTool === ToolType.LINE || activeTool === ToolType.ERASER || (selectedElement?.type === 'path');
  const showTextControls = activeTool === ToolType.TEXT || (selectedElement?.type === 'text');
  const showShapeSelector = activeTool === ToolType.SHAPE;
  const showStickers = activeTool === ToolType.STICKER;
  const showCodeControls = activeTool === ToolType.CODE || (selectedElement?.type === 'code');
  const showChartControls = activeTool === ToolType.CHART || (selectedElement?.type === 'chart');
  const showArrangement = hasSelection;

  const isNote = activeTool === ToolType.NOTE || (selectedElement?.type === 'note') || activeTool === ToolType.CHECKBOX || (selectedElement?.type === 'checkbox');
  const colorsToUse = isNote ? NOTE_COLORS : COLORS;

  // Shared classes for container
  const containerClasses = "h-auto min-h-[64px] md:h-[72px] bg-white/90 backdrop-blur-md border-b border-gray-200/50 flex items-center px-2 md:px-6 overflow-x-auto overflow-y-hidden shadow-sm transition-all duration-300 w-full no-scrollbar py-2 md:py-0";
  const styleHideScrollbar = { msOverflowStyle: 'none' as any, scrollbarWidth: 'none' as any };

  // 1. GLOBAL / PAGE SETTINGS (No Selection)
  if (!hasSelection && isSelectMode) {
      return (
          <div className={containerClasses} style={styleHideScrollbar}>
             <Section title="Canvas Background" icon={Layout} delay={0}>
                {/* ... (Background controls remain same) ... */}
                <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50 hover:border-purple-200/50 transition-colors">
                   {BACKGROUND_COLORS.map((bg) => (
                       <button
                           key={bg.value}
                           onClick={() => onPageColorChange(bg.value)}
                           className={`w-6 h-6 rounded-full border border-black/5 transition-all duration-300 transform ${pageColor === bg.value ? 'ring-2 ring-purple-500 ring-offset-2 scale-110 shadow-md' : 'hover:scale-125 hover:-translate-y-0.5 hover:shadow-sm'}`}
                           style={{ backgroundColor: bg.value }}
                           title={bg.label}
                       />
                   ))}
                   
                   <div className="w-px h-5 bg-gray-300 mx-1 opacity-50" />
                   
                   {BACKGROUND_GRADIENTS.map((grad) => (
                        <button
                           key={grad.value}
                           onClick={() => onPageColorChange(grad.value)}
                           className={`w-6 h-6 rounded-full border border-black/5 transition-all duration-300 transform ${pageColor === grad.value ? 'ring-2 ring-purple-500 ring-offset-2 scale-110 shadow-md' : 'hover:scale-125 hover:-translate-y-0.5 hover:shadow-sm'}`}
                           style={{ background: grad.value }}
                           title={grad.label}
                       />
                   ))}

                   <div className="w-px h-5 bg-gray-300 mx-1 opacity-50" />
                   
                   <div className="relative group">
                        <input type="color" value={pageColor.startsWith('#') ? pageColor : '#ffffff'} onChange={(e) => onPageColorChange(e.target.value)} className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 overflow-hidden opacity-0 absolute inset-0 z-20" title="Custom Color" />
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                            <Palette size={14} />
                        </div>
                   </div>
                </div>
             </Section>
             
             <Section title="Pattern" delay={100}>
                 <div className="flex bg-gray-100/80 rounded-xl p-1 gap-1">
                     {PATTERNS.map(p => (
                         <button
                            key={p.value}
                            onClick={() => onPagePatternChange(p.value as BackgroundPattern)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${pagePattern === p.value ? 'bg-white text-purple-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 hover:scale-105'}`}
                         >
                            {p.label}
                         </button>
                     ))}
                 </div>
             </Section>

             <div className="flex-1 min-w-[20px]" />
             <div className="text-xs text-gray-400 font-medium italic pr-4 animate-pulse shrink-0 hidden md:block">Pixelia Editor 2.0</div>
          </div>
      )
  }

  // 2. CONTEXTUAL EDITOR
  return (
    <div className={`${containerClasses} gap-2 divide-x divide-gray-100/0`} style={styleHideScrollbar}>
      
      {/* 2a. STYLE SECTION (Color) */}
      {showColorPicker && (
          <Section title="Style" icon={Palette} delay={0}>
             {/* ... (Color picker code remains same) ... */}
            <div className="flex items-center gap-2 p-1">
                {Object.entries(colorsToUse).slice(0, 8).map(([name, hex]) => (
                <button
                    key={name}
                    onClick={() => handleColorChange(hex)}
                    className={`w-6 h-6 rounded-full border border-black/5 transition-all duration-300 transform ${effectiveColor === hex ? 'ring-2 ring-purple-500 ring-offset-2 scale-110 shadow-md' : 'hover:scale-125 hover:-translate-y-1 hover:shadow-lg'}`}
                    style={{ backgroundColor: hex }}
                    title={name}
                />
                ))}
                {!isNote && (
                    <div className="relative group ml-1">
                        <input type="color" value={effectiveColor} onChange={(e) => handleColorChange(e.target.value)} className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 opacity-0 absolute inset-0 z-20" />
                         <div className="w-7 h-7 rounded-full bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-red-500 via-green-500 to-blue-500 shadow-sm group-hover:scale-110 group-hover:rotate-180 transition-transform duration-500 border border-gray-200" />
                    </div>
                )}
            </div>
          </Section>
      )}

      {/* 2b. TEXT CONTROLS - REFACTORED WITH CUSTOM DROPDOWN PREVIEW */}
      {showTextControls && (
          <Section title="Typography" icon={Type} delay={100}>
               <div className="relative group">
                    <button 
                        onClick={() => setShowFontPicker(!showFontPicker)}
                        className="flex items-center justify-between h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-white hover:shadow-md transition-all min-w-[120px]"
                    >
                         <span style={{ fontFamily: effectiveFontFamily }}>
                             {FONTS.find(f => f.value === effectiveFontFamily)?.label || 'Font'}
                         </span>
                         <ChevronDown size={14} className="text-gray-400 ml-2" />
                    </button>

                    {showFontPicker && (
                         <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-[80] animate-in fade-in zoom-in-95 max-h-[300px] overflow-y-auto custom-scrollbar">
                             {FONTS.map(f => (
                                 <button
                                     key={f.value}
                                     onClick={() => {
                                         handleFontFamilyChange(f.value);
                                         setShowFontPicker(false);
                                     }}
                                     className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center justify-between ${effectiveFontFamily === f.value ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}`}
                                     style={{ fontFamily: f.value }}
                                 >
                                     {f.label}
                                     {effectiveFontFamily === f.value && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                                 </button>
                             ))}
                         </div>
                    )}
               </div>

                <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

                <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1 shadow-sm shrink-0">
                    <button onClick={toggleBold} className={`p-1.5 rounded-lg transition-all duration-200 active:scale-90 hover:-translate-y-0.5 ${isBold ? 'text-purple-600 bg-purple-100 shadow-inner' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm'}`}><Bold size={16} /></button>
                    <button onClick={toggleItalic} className={`p-1.5 rounded-lg transition-all duration-200 active:scale-90 hover:-translate-y-0.5 ${isItalic ? 'text-purple-600 bg-purple-100 shadow-inner' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm'}`}><Italic size={16} /></button>
                    <button onClick={toggleUnderline} className={`p-1.5 rounded-lg transition-all duration-200 active:scale-90 hover:-translate-y-0.5 ${isUnderline ? 'text-purple-600 bg-purple-100 shadow-inner' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm'}`}><Underline size={16} /></button>
                </div>

                <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />
                
                <div className="relative group shrink-0">
                    <select 
                        value={effectiveFontSize} 
                        onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                        className="appearance-none h-9 pl-3 pr-7 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none cursor-pointer hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm w-16"
                    >
                        {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400 font-bold group-hover:text-purple-500">A</div>
                </div>
          </Section>
      )}
      
      {/* 2c. STICKERS - IMPROVED */}
      {showStickers && (
          <Section title="Pick a Sticker" icon={Smile} delay={0}>
              <div className="relative group">
                  <button 
                    onClick={() => setShowStickerPicker(!showStickerPicker)}
                    className={`flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-white border ${showStickerPicker ? 'border-purple-400 ring-2 ring-purple-100' : 'border-gray-200'} hover:border-purple-200 rounded-xl transition-all shadow-sm`}
                  >
                      <Smile size={18} className="text-purple-600" />
                      <span className="text-sm font-bold text-gray-700">Choose Sticker</span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${showStickerPicker ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Sticker Popover */}
                  {showStickerPicker && (
                      <div className="absolute top-full left-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-[340px] z-[80] animate-in slide-in-from-top-4 fade-in">
                          {/* Categories */}
                          <div className="flex gap-1 mb-3 overflow-x-auto pb-2 border-b border-gray-100 no-scrollbar mask-gradient-right">
                              {Object.keys(STICKER_CATEGORIES).map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => setActiveStickerCategory(cat as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${activeStickerCategory === cat ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                          
                          {/* Grid */}
                          <div className="grid grid-cols-6 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar p-1">
                                {STICKER_CATEGORIES[activeStickerCategory].map((sticker) => (
                                    <button
                                        key={sticker}
                                        onClick={() => {
                                            onStickerSelect?.(sticker);
                                            setShowStickerPicker(false);
                                        }}
                                        className="text-2xl p-2 hover:bg-gray-100 rounded-xl hover:scale-110 transition-transform active:scale-95 flex items-center justify-center aspect-square"
                                    >
                                        {sticker}
                                    </button>
                                ))}
                          </div>
                      </div>
                  )}
              </div>
          </Section>
      )}

      {/* 2d. CODE CONTROLS */}
      {showCodeControls && (
          <Section title="Code Settings" delay={100}>
              <div className="relative group shrink-0">
                    <select 
                        value={effectiveFontSize} 
                        onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                        className="appearance-none h-9 pl-3 pr-7 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none cursor-pointer hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm w-16"
                    >
                        {[12, 14, 16, 18, 20, 24].map(s => <option key={s} value={s}>{s}px</option>)}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400 font-bold group-hover:text-purple-500">A</div>
                </div>
          </Section>
      )}

      {/* 2e. CHART CONTROLS */}
      {showChartControls && (
          <Section title="Chart Type" icon={PieChart} delay={100}>
               <div className="flex items-center gap-1.5 p-1 shrink-0">
                   {CHARTS.map(c => (
                       <button
                           key={c.id}
                           onClick={() => handleChartTypeChange(c.id)}
                           className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 ${effectiveChartType === c.id ? 'bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 hover:shadow-sm hover:-translate-y-0.5'}`}
                       >
                           {c.label}
                       </button>
                   ))}
               </div>
          </Section>
      )}

      {/* 2f. STROKE / LINE */}
      {showStrokeWidth && (
           <Section title="Stroke" delay={100}>
               <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200 shadow-sm shrink-0">
                {STROKE_WIDTHS.map((width) => (
                    <button
                        key={width}
                        onClick={() => handleStrokeWidthChange(width)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90 ${effectiveStrokeWidth === width ? 'bg-white text-purple-600 shadow-md scale-105' : 'text-gray-300 hover:bg-white hover:text-gray-600 hover:shadow-sm hover:-translate-y-0.5'}`}
                        title={`${width}px`}
                    >
                    <div className="bg-current rounded-full transition-all" style={{ width: Math.min(16, width + 2), height: Math.min(16, width + 2) }} />
                    </button>
                ))}
               </div>
           </Section>
      )}

      {/* 2g. SHAPE SELECTOR */}
      {showShapeSelector && (
          <Section title="Geometry" delay={100}>
               <div className="flex items-center gap-1.5 p-1 shrink-0">
                   {SHAPES.map(s => (
                       <button
                           key={s.id}
                           onClick={() => onShapeTypeChange(s.id)}
                           className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 ${currentShapeType === s.id ? 'bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 hover:shadow-sm hover:-translate-y-0.5'}`}
                       >
                           {s.label}
                       </button>
                   ))}
               </div>
          </Section>
      )}

      {/* 2h. ARRANGEMENT & ACTIONS (Only show if not selecting stickers, to avoid clutter) */}
      {showArrangement && !showStickers && (
           <Section title="Actions" icon={MousePointerClick} delay={200}>
               <div className="flex items-center gap-3 shrink-0">
                   <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200 shadow-sm">
                        <button onClick={onBringToFront} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-white rounded-lg transition-all active:scale-90 hover:shadow-sm hover:-translate-y-0.5" title="Bring to Front"><BringToFront size={18} /></button>
                        <div className="w-px h-full bg-gray-200 mx-0.5" />
                        <button onClick={onSendToBack} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-white rounded-lg transition-all active:scale-90 hover:shadow-sm hover:-translate-y-0.5" title="Send to Back"><SendToBack size={18} /></button>
                   </div>
                   
                   <button onClick={onDuplicateElement} className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-xs font-bold hover:bg-purple-100 hover:shadow-md transition-all active:scale-95 hover:-translate-y-0.5">
                       <Copy size={14} /> Duplicate
                   </button>
                   
                   <button onClick={onDeleteElement} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 hover:shadow-md transition-all active:scale-95 hover:-translate-y-0.5">
                       <Trash2 size={14} /> Delete
                   </button>
               </div>
           </Section>
      )}
    </div>
  );
};

export default PropertyBar;
