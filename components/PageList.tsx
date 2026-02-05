
import React from 'react';
import { Plus, Trash2, Copy, Layers, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Page, CanvasElement, CanvasConfig, ShapeType, NoteElement, TextElement } from '../types';

interface PageListProps {
    pages: Page[];
    activePageIndex: number;
    onSelectPage: (index: number) => void;
    onAddPage: () => void;
    onDeletePage: (index: number) => void;
    onDuplicatePage: (index: number) => void;
    onMovePage: (index: number, direction: 'up' | 'down') => void;
    config: CanvasConfig;
    onClose?: () => void;
    isMobile?: boolean;
}

// Thumbnail Renderer
const ThumbnailRenderer = ({ elements, width, height, bg }: { elements: CanvasElement[], width: number, height: number, bg: string }) => {
    const safeWidth = width || 1920;
    const safeHeight = height || 1080;
    return (
        <div className="w-full h-full absolute inset-0 overflow-hidden select-none pointer-events-none" style={{ background: bg }}>
             <svg viewBox={`0 0 ${safeWidth} ${safeHeight}`} className="absolute inset-0 w-full h-full z-10">
                 {elements.filter(el => el.type === 'path' && !(el as any).isEraser).map((el: any) => (
                    <path key={el.id} d={`M ${el.points[0].x} ${el.points[0].y} ` + el.points.slice(1).map((p:any) => `L ${p.x} ${p.y}`).join(' ')} stroke={el.color} strokeWidth={el.strokeWidth * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                 ))}
             </svg>
             {elements.filter(el => el.type !== 'path').map(el => {
                 const left = (el.x / safeWidth) * 100, top = (el.y / safeHeight) * 100, w = ((el as any).width / safeWidth) * 100, h = ((el as any).height / safeHeight) * 100;
                 const commonStyle: React.CSSProperties = { position: 'absolute', left: `${left}%`, top: `${top}%`, width: `${w}%`, height: `${h}%`, transform: `rotate(${el.rotation}deg)`, zIndex: 20 };
                 if (el.type === 'shape') {
                    const shapeEl = el as any;
                    if (shapeEl.shapeType === ShapeType.TRIANGLE) return (<div key={el.id} style={commonStyle}><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full"><polygon points="50,2 98,98 2,98" fill={shapeEl.color} /></svg></div>);
                    return (<div key={el.id} style={{ ...commonStyle, backgroundColor: shapeEl.color, borderRadius: shapeEl.shapeType === ShapeType.CIRCLE ? '50%' : '4px' }} />);
                 }
                 if (el.type === 'note') return (<div key={el.id} style={{ ...commonStyle, backgroundColor: (el as NoteElement).color }} className="shadow-sm p-[2px] overflow-hidden flex flex-col"><div className="text-[4px] leading-tight font-hand text-gray-800 break-words w-full h-full overflow-hidden">{(el as NoteElement).text || "..."}</div></div>);
                 if (el.type === 'text') return (<div key={el.id} style={{ ...commonStyle, color: (el as TextElement).color, fontSize: `${Math.max(2, ((el as TextElement).fontSize / safeWidth) * 100 * 3)}px`, lineHeight: 1.2, overflow: 'hidden' }}>{(el as TextElement).text || "Text"}</div>);
                 if (el.type === 'image') return (<img key={el.id} src={(el as any).src} style={{ ...commonStyle, objectFit: 'contain' }} />);
                 if (el.type === 'table') return (<div key={el.id} style={{...commonStyle, backgroundColor: 'white', border: '0.5px solid #ccc', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '0.5px', background: '#ccc'}}><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div></div>);
                 return null;
             })}
        </div>
    )
}

const PageList: React.FC<PageListProps> = ({ 
    pages, activePageIndex, onSelectPage, onAddPage, onDeletePage, onDuplicatePage, onMovePage, config, onClose, isMobile 
}) => {
  const displayWidth = config.width || 1920, displayHeight = config.height || 1080, aspectRatio = displayWidth / displayHeight;
  return (
    <div className={`
        ${isMobile ? 'w-full' : 'w-[260px]'} bg-white border-l border-gray-200 flex flex-col h-full z-30 shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.05)]
    `}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
                <Layers size={18} className="text-purple-600" />
                <span className="text-sm font-black text-gray-800 uppercase tracking-tight">Pages</span>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{pages.length}</span>
            </div>
            {onClose && (
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                </button>
            )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar bg-gray-50/50">
            {pages.map((page, index) => (
                <div key={page.id} className="group relative">
                     <div className="flex items-center justify-between mb-2 px-1">
                        <span className={`text-xs font-bold ${activePageIndex === index ? 'text-purple-600' : 'text-gray-400'}`}>PAGE {index + 1}</span>
                        <div className={`flex items-center gap-1 transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <button onClick={(e) => { e.stopPropagation(); onMovePage(index, 'up'); }} disabled={index === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-20 p-1"><ChevronUp size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onMovePage(index, 'down'); }} disabled={index === pages.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-20 p-1 mr-2"><ChevronDown size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDuplicatePage(index); }} className="text-gray-400 hover:text-purple-600 p-1"><Copy size={14} /></button>
                            {pages.length > 1 && (<button onClick={(e) => { e.stopPropagation(); onDeletePage(index); }} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>)}
                        </div>
                     </div>
                    <div 
                        onClick={() => onSelectPage(index)}
                        className={`relative rounded-xl cursor-pointer transition-all duration-300 border-2 ${activePageIndex === index ? 'border-purple-500 shadow-xl shadow-purple-500/10 scale-[1.02]' : 'border-transparent hover:border-purple-200 bg-white shadow-sm'}`}
                        style={{ aspectRatio: `${aspectRatio}` }}
                    >
                        <div className="absolute inset-0 w-full h-full rounded-[10px] overflow-hidden bg-white">
                            <ThumbnailRenderer elements={page.elements} bg={page.backgroundColor} width={displayWidth} height={displayHeight} />
                            {activePageIndex !== index && <div className="absolute inset-0 bg-white/5 hover:bg-transparent transition-colors" />}
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={onAddPage} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50/50 transition-all flex flex-col items-center justify-center gap-2 group shrink-0 mt-2 mb-8">
                <Plus size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wide">New Page</span>
            </button>
        </div>
    </div>
  );
};

export default PageList;
