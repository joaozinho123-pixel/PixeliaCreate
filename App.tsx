
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  ToolType, 
  ShapeType, 
  CanvasElement, 
  Point, 
  PathElement, 
  NoteElement, 
  TextElement, 
  ShapeElement,
  ViewportTransform,
  ImageElement,
  TableElement,
  CodeElement,
  CheckboxElement,
  StickerElement,
  ChartElement,
  ChartType,
  ResizeHandle,
  CanvasConfig,
  ProjectType,
  Project,
  Page,
  AlignmentGuide,
  BackgroundPattern,
  RulerGuide
} from './types';
import { COLORS, NOTE_COLORS, HIGHLIGHTER_COLORS } from './constants';
import Toolbar from './components/Toolbar';
import PropertyBar from './components/PropertyBar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import PageList from './components/PageList';
import Ruler from './components/Ruler';
import { Trash2, GripHorizontal, X, ChevronLeft, ChevronRight, RefreshCcw, Move, CheckCircle2, Loader2, Menu, Plus, Table as TableIcon } from 'lucide-react';

// --- NEW Floating Action Menu (The Pill) ---
const FloatingActionMenu = ({ 
    onMoveStart, 
    onRotateStart, 
    onDelete 
}: { 
    onMoveStart: (e: React.PointerEvent) => void,
    onRotateStart: (e: React.PointerEvent) => void,
    onDelete: () => void
}) => {
    return (
        <div 
            className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 p-1 z-[60] animate-in zoom-in-95 fade-in duration-200 select-none"
            onPointerDown={(e) => e.stopPropagation()} 
        >
             {/* Move Handle */}
             <div 
                className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center cursor-move text-gray-600 hover:text-purple-600 transition-colors active:bg-purple-50"
                onPointerDown={onMoveStart}
                title="Move"
             >
                <Move size={16} />
             </div>
             
             {/* Divider */}
             <div className="w-px h-5 bg-gray-200 mx-1" />
             
             {/* Rotate Handle */}
             <div 
                className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center cursor-ew-resize text-gray-600 hover:text-purple-600 transition-colors active:bg-purple-50"
                onPointerDown={onRotateStart}
                title="Rotate"
             >
                <RefreshCcw size={16} />
             </div>

             {/* Divider */}
             <div className="w-px h-5 bg-gray-200 mx-1" />

             {/* Delete Button */}
             <button 
                className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center cursor-pointer text-gray-600 hover:text-red-500 transition-colors active:bg-red-100"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                title="Delete"
             >
                <Trash2 size={16} />
             </button>
        </div>
    );
}

// Helper to render Resize Handles ONLY
const ResizeHandles = ({ id, onResizeStart }: { 
    id: string, 
    onResizeStart: (id: string, h: ResizeHandle, e: React.PointerEvent) => void
}) => {
  const handles: ResizeHandle[] = ['nw', 'ne', 'sw', 'se'];
  return (
      <>
        {handles.map(h => (
            <div
                key={h}
                onPointerDown={(e) => onResizeStart(id, h, e)}
                className={`absolute w-3.5 h-3.5 bg-white border border-purple-600 z-50 rounded-full hover:bg-purple-600 transition-colors shadow-sm ${
                    h === 'nw' ? '-top-1.5 -left-1.5 cursor-nw-resize' :
                    h === 'ne' ? '-top-1.5 -right-1.5 cursor-ne-resize' :
                    h === 'sw' ? '-bottom-1.5 -left-1.5 cursor-sw-resize' :
                    '-bottom-1.5 -right-1.5 cursor-se-resize'
                }`}
            />
        ))}
      </>
  )
};

const renderShape = (type: ShapeType, color: string) => {
    switch (type) {
        case ShapeType.RECTANGLE:
            return <div className="w-full h-full border-2 border-gray-800 transition-colors duration-200" style={{backgroundColor: color, borderRadius: '4px'}} />;
        case ShapeType.CIRCLE:
            return <div className="w-full h-full border-2 border-gray-800 transition-colors duration-200" style={{backgroundColor: color, borderRadius: '50%'}} />;
        case ShapeType.TRIANGLE:
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
                    <polygon points="50,2 98,98 2,98" fill={color} stroke="#1f2937" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
            );
        case ShapeType.STAR:
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
                    <polygon points="50,2 63,38 98,38 71,59 81,96 50,75 19,96 29,59 2,38 37,38" fill={color} stroke="#1f2937" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
            );
        case ShapeType.DIAMOND:
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
                    <polygon points="50,0 100,50 50,100 0,50" fill={color} stroke="#1f2937" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
            );
        case ShapeType.HEXAGON:
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
                    <polygon points="25,2 75,2 98,50 75,98 25,98 2,50" fill={color} stroke="#1f2937" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
            );
        case ShapeType.BUBBLE:
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
                    <path d="M10,10 H90 A10,10 0 0 1 100,20 V70 A10,10 0 0 1 90,80 H40 L20,98 L25,80 H10 A10,10 0 0 1 0,70 V20 A10,10 0 0 1 10,10 Z" fill={color} stroke="#1f2937" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
            );
        case ShapeType.ARROW:
             return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
                    <polygon points="20,30 60,30 60,10 98,50 60,90 60,70 20,70" fill={color} stroke="#1f2937" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
            );
        default: return null;
    }
}

// Chart Renderer
const renderChart = (chart: ChartElement) => {
    const { chartType, data, labels, color } = chart;
    const maxVal = Math.max(...data, 1); // Prevent division by zero

    if (chartType === ChartType.BAR) {
        return (
            <div className="w-full h-full bg-white p-4 rounded-xl border border-gray-200 flex items-end justify-between gap-2 shadow-sm">
                {data.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group/bar">
                        <div 
                            style={{ height: `${(val / maxVal) * 80}%`, backgroundColor: color }} 
                            className="w-full rounded-t-md opacity-90 group-hover/bar:opacity-100 transition-opacity min-h-[4px]"
                        />
                        <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">{labels[i]}</span>
                    </div>
                ))}
            </div>
        )
    }

    if (chartType === ChartType.PIE) {
        // Simple conic gradient for Pie Chart approximation
        const total = data.reduce((a, b) => a + b, 0);
        let accumulated = 0;
        const gradients = data.map((val, i) => {
            const start = (accumulated / total) * 100;
            accumulated += val;
            const end = (accumulated / total) * 100;
            // Generate variations of the base color
            const shade = i % 2 === 0 ? color : '#9ca3af'; // Alternate colors properly would be better, but simple toggle for now
            return `${shade} ${start}% ${end}%`;
        }).join(', ');

        return (
            <div className="w-full h-full bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-center shadow-sm relative">
                <div 
                    style={{ background: `conic-gradient(${gradients})` }}
                    className="w-[80%] h-[80%] rounded-full border-4 border-white shadow-inner"
                />
                <div className="absolute bottom-2 left-2 flex flex-col gap-0.5 pointer-events-none">
                     {data.slice(0,3).map((d, i) => <div key={i} className="text-[8px] text-gray-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: i % 2 === 0 ? color : '#9ca3af'}}/>{labels[i]}</div>)}
                </div>
            </div>
        )
    }

    if (chartType === ChartType.LINE) {
        // SVG Line Chart
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((val / maxVal) * 80); // 80% height usage
            return `${x},${y}`;
        }).join(' ');

        return (
             <div className="w-full h-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                 <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                     <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     {/* Dots */}
                     {data.map((val, i) => {
                         const x = (i / (data.length - 1)) * 100;
                         const y = 100 - ((val / maxVal) * 80);
                         return <circle key={i} cx={x} cy={y} r="2" fill="white" stroke={color} strokeWidth="1" />
                     })}
                 </svg>
                 <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4">
                     {labels.map((l, i) => (
                         <span key={i} className="text-[8px] text-gray-400 truncate max-w-[20px]">{l}</span>
                     ))}
                 </div>
             </div>
        )
    }

    return null;
}

// Extracted Component to prevent re-mounting and focus loss
const CanvasObject = memo(({ 
    el, 
    isSelected, 
    onSelect, 
    onUpdate, 
    onDelete, 
    onResizeStart,
    onRotateStart
}: { 
    el: CanvasElement, 
    isSelected: boolean,
    onSelect: (id: string, e: React.PointerEvent) => void,
    onUpdate: (id: string, updates: Partial<CanvasElement>) => void,
    onDelete: () => void,
    onResizeStart: (id: string, h: ResizeHandle, e: React.PointerEvent) => void,
    onRotateStart: (id: string, e: React.PointerEvent) => void
}) => {

    const [isEditingChart, setIsEditingChart] = useState(false);

    const wrapperStyle: React.CSSProperties = {
        transform: `translate(${el.x}px, ${el.y}px) rotate(${el.rotation}deg)`,
        width: (el as any).width,
        height: (el as any).height,
    };

    const commonClasses = `absolute group touch-auto transition-all duration-75 ${isSelected ? 'ring-2 ring-purple-600 z-10' : 'z-1 hover:ring-1 hover:ring-purple-300'}`;

    return (
        <div
            onPointerDown={(e) => onSelect(el.id, e)}
            style={wrapperStyle}
            className={`${commonClasses} cursor-move ${el.type === 'note' ? 'flex flex-col' : ''}`}
        >
            {/* Render Specific Content based on Type */}
            {el.type === 'note' && (
                <>
                    <div className="absolute inset-0 w-full h-full shadow-md pointer-events-none transition-colors duration-200" style={{ backgroundColor: (el as NoteElement).color }} />
                    <textarea
                        className={`relative w-full h-full p-4 bg-transparent resize-none outline-none font-hand text-xl text-gray-800 placeholder-gray-500/50 ${isSelected ? 'cursor-text pointer-events-auto' : 'cursor-move pointer-events-none'}`}
                        value={(el as NoteElement).text}
                        onChange={(e) => onUpdate(el.id, { text: e.target.value })}
                        placeholder="Write..."
                        onPointerDown={(e) => e.stopPropagation()} 
                    />
                </>
            )}

            {el.type === 'text' && (
                <textarea
                    className={`w-full h-full bg-transparent resize-none outline-none overflow-hidden p-1 transition-all duration-200 ${isSelected ? 'cursor-text pointer-events-auto' : 'cursor-move pointer-events-none'}`}
                    style={{ 
                        color: (el as TextElement).color, 
                        fontSize: (el as TextElement).fontSize,
                        fontFamily: (el as TextElement).fontFamily || 'Inter, sans-serif',
                        fontWeight: (el as TextElement).fontWeight || 'normal',
                        fontStyle: (el as TextElement).fontStyle || 'normal',
                        textDecoration: (el as TextElement).textDecoration || 'none',
                        lineHeight: 1.2
                    }}
                    value={(el as TextElement).text}
                    onChange={(e) => onUpdate(el.id, { text: e.target.value })}
                    placeholder="Type here..."
                    onPointerDown={(e) => e.stopPropagation()}
                />
            )}

            {el.type === 'code' && (
                <div className="w-full h-full bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <div className="h-6 w-full bg-[#2d2d2d] flex items-center px-2 gap-1.5 border-b border-[#3e3e3e]">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                         <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                         <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <textarea
                        className={`w-full h-full bg-transparent text-gray-200 font-mono resize-none outline-none p-3 ${isSelected ? 'cursor-text pointer-events-auto' : 'cursor-move pointer-events-none'}`}
                        style={{ fontSize: (el as CodeElement).fontSize || 14 }}
                        value={(el as CodeElement).text}
                        onChange={(e) => onUpdate(el.id, { text: e.target.value })}
                        placeholder="// Type code here..."
                        spellCheck={false}
                        onPointerDown={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {el.type === 'checkbox' && (
                <div className="w-full h-full bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">To-do List</span>
                         <button 
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 pointer-events-auto" 
                            onClick={(e) => {
                                e.stopPropagation();
                                const newItems = [...(el as CheckboxElement).items, { id: uuidv4(), text: '', checked: false }];
                                onUpdate(el.id, { items: newItems });
                            }}
                         >
                            <Plus size={14} />
                         </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {(el as CheckboxElement).items.map((item, index) => (
                             <div key={item.id} className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    checked={item.checked} 
                                    onChange={(e) => {
                                        const newItems = [...(el as CheckboxElement).items];
                                        newItems[index] = { ...item, checked: e.target.checked };
                                        onUpdate(el.id, { items: newItems });
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer pointer-events-auto"
                                    onPointerDown={(e) => e.stopPropagation()}
                                  />
                                  <input 
                                    type="text" 
                                    value={item.text}
                                    onChange={(e) => {
                                        const newItems = [...(el as CheckboxElement).items];
                                        newItems[index] = { ...item, text: e.target.value };
                                        onUpdate(el.id, { items: newItems });
                                    }}
                                    className={`flex-1 bg-transparent border-none outline-none text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'} ${isSelected ? 'pointer-events-auto' : 'pointer-events-none'}`}
                                    placeholder="Task..."
                                    onPointerDown={(e) => e.stopPropagation()}
                                  />
                                  <button 
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         const newItems = (el as CheckboxElement).items.filter((_, i) => i !== index);
                                         onUpdate(el.id, { items: newItems });
                                     }}
                                     className={`text-gray-300 hover:text-red-500 pointer-events-auto ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                                     onPointerDown={(e) => e.stopPropagation()}
                                  >
                                      <X size={12} />
                                  </button>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {el.type === 'sticker' && (
                <div className="w-full h-full flex items-center justify-center text-[100px] leading-none select-none">
                     <div style={{ fontSize: Math.min((el as any).width, (el as any).height) * 0.8 }}>{(el as StickerElement).content}</div>
                </div>
            )}

            {el.type === 'shape' && renderShape((el as ShapeElement).shapeType, (el as ShapeElement).color)}

            {el.type === 'chart' && (
                <div className="w-full h-full relative">
                    {renderChart(el as ChartElement)}
                    {isSelected && (
                        <div className="absolute top-2 right-2 pointer-events-auto" onPointerDown={e => e.stopPropagation()}>
                            <button 
                                onClick={() => setIsEditingChart(!isEditingChart)}
                                className="bg-white/90 backdrop-blur border border-gray-200 shadow-md p-1.5 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors text-xs font-bold flex items-center gap-1"
                            >
                                <TableIcon size={14} /> Edit Data
                            </button>
                        </div>
                    )}
                    {isEditingChart && isSelected && (
                        <div 
                            className="absolute top-[110%] left-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] p-3 pointer-events-auto animate-in slide-in-from-top-2 fade-in"
                            onPointerDown={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Chart Data</span>
                                <button onClick={() => setIsEditingChart(false)}><X size={14} className="text-gray-400 hover:text-red-500" /></button>
                            </div>
                            <div className="max-h-[160px] overflow-y-auto custom-scrollbar space-y-1.5 mb-2">
                                {(el as ChartElement).data.map((val, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={(el as ChartElement).labels[i] || ''}
                                            onChange={(e) => {
                                                const newLabels = [...(el as ChartElement).labels];
                                                newLabels[i] = e.target.value;
                                                onUpdate(el.id, { labels: newLabels });
                                            }}
                                            className="w-20 p-1 text-xs border border-gray-200 rounded focus:border-purple-400 outline-none"
                                            placeholder="Label"
                                        />
                                        <input 
                                            type="number" 
                                            value={val}
                                            onChange={(e) => {
                                                const newData = [...(el as ChartElement).data];
                                                newData[i] = Number(e.target.value);
                                                onUpdate(el.id, { data: newData });
                                            }}
                                            className="w-16 p-1 text-xs border border-gray-200 rounded focus:border-purple-400 outline-none"
                                        />
                                        <button 
                                            onClick={() => {
                                                const newData = (el as ChartElement).data.filter((_, idx) => idx !== i);
                                                const newLabels = (el as ChartElement).labels.filter((_, idx) => idx !== i);
                                                onUpdate(el.id, { data: newData, labels: newLabels });
                                            }}
                                            className="text-gray-300 hover:text-red-500"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => {
                                    onUpdate(el.id, { 
                                        data: [...(el as ChartElement).data, 10], 
                                        labels: [...(el as ChartElement).labels, 'New'] 
                                    });
                                }}
                                className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-600 flex items-center justify-center gap-1 border border-gray-200 border-dashed"
                            >
                                <Plus size={12} /> Add Item
                            </button>
                        </div>
                    )}
                </div>
            )}

            {el.type === 'table' && (
                <div className="w-full h-full bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="h-4 w-full bg-gray-50 border-b border-gray-200 flex items-center justify-center cursor-move">
                        <GripHorizontal size={12} className="text-gray-400" />
                    </div>
                    <div className="w-full h-[calc(100%-1rem)] flex flex-col">
                        {(el as TableElement).data.map((row, rIndex) => (
                            <div key={rIndex} className="flex flex-1 w-full border-b border-gray-300 last:border-b-0">
                                {row.map((cell, cIndex) => (
                                    <div key={`${rIndex}-${cIndex}`} className="flex-1 border-r border-gray-300 last:border-r-0 relative min-w-0">
                                        <input
                                            type="text"
                                            value={cell}
                                            onChange={(e) => {
                                                const newData = [...(el as TableElement).data];
                                                newData[rIndex] = [...newData[rIndex]];
                                                newData[rIndex][cIndex] = e.target.value;
                                                onUpdate(el.id, { data: newData });
                                            }}
                                            className={`w-full h-full p-1 bg-transparent border-none outline-none text-sm text-center focus:bg-purple-50 ${isSelected ? 'pointer-events-auto' : 'pointer-events-none'}`}
                                            onPointerDown={(e) => e.stopPropagation()} 
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {el.type === 'image' && (
                <img 
                    src={(el as ImageElement).src} 
                    alt="Uploaded content" 
                    className="w-full h-full object-contain pointer-events-none select-none" 
                    draggable={false}
                />
            )}

            {/* Selection Controls */}
            {isSelected && (
                <>
                    <ResizeHandles id={el.id} onResizeStart={onResizeStart} />
                    <FloatingActionMenu 
                        onMoveStart={(e) => onSelect(el.id, e)} 
                        onRotateStart={(e) => onRotateStart(el.id, e)} 
                        onDelete={onDelete} 
                    />
                </>
            )}
        </div>
    );
});

export default function App() {
  // ... (Standard Setup)
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'EDITOR'>('DASHBOARD');
  const [isPresenting, setIsPresenting] = useState(false);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({ type: 'FREEHAND', name: 'Untitled Design' });
  const [currentProjectId, setCurrentProjectId] = useState<string | number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPageSidebar, setShowPageSidebar] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setShowPageSidebar(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [toast, setToast] = useState<{ message: string, type: 'info' | 'success' } | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [projects, setProjects] = useState<Project[]>(() => {
      try {
          const saved = localStorage.getItem('pixelia_projects');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  useEffect(() => { localStorage.setItem('pixelia_projects', JSON.stringify(projects)); }, [projects]);

  const [pages, setPages] = useState<Page[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  useEffect(() => {
      if (currentProjectId && pages.length > 0) {
          localStorage.setItem(`pixelia_content_${currentProjectId}`, JSON.stringify(pages));
      }
  }, [pages, currentProjectId]);

  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tool, setTool] = useState<ToolType>(ToolType.SELECT);
  const [color, setColor] = useState(COLORS.BLACK);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fontSize, setFontSize] = useState(24);
  const [shapeType, setShapeType] = useState<ShapeType>(ShapeType.RECTANGLE);
  const [viewport, setViewport] = useState<ViewportTransform>({ x: 0, y: 0, scale: 1 });
  const [currentPath, setCurrentPath] = useState<Point[] | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ start: Point, current: Point } | null>(null);
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);
  const [tempGuide, setTempGuide] = useState<RulerGuide | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const isDraggingViewportRef = useRef(false);
  const isMovingElementRef = useRef(false);
  const isResizingElementRef = useRef(false);
  const isRotatingElementRef = useRef(false); 
  const isDraggingGuideRef = useRef(false);
  
  const resizeHandleRef = useRef<ResizeHandle | null>(null);
  const activeElementIdRef = useRef<string | null>(null);
  const startPosRef = useRef<Point>({ x: 0, y: 0 });
  const originalElementSnapshotRef = useRef<CanvasElement | null>(null);
  const initialRotationRef = useRef<number>(0);
  const initialAngleRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const selectedStickerRef = useRef<string>('👍');

  useEffect(() => {
      if (containerRef.current) {
          const obs = new ResizeObserver((entries) => {
              const { width, height } = entries[0].contentRect;
              setContainerSize({ width, height });
          });
          obs.observe(containerRef.current);
          return () => obs.disconnect();
      }
  }, [containerRef.current, currentView]);

  const activePage = pages[activePageIndex];
  const elements = activePage?.elements || [];
  const bgColor = activePage?.backgroundColor || '#ffffff';
  const bgPattern = activePage?.backgroundPattern || 'NONE';
  const rulerGuides = activePage?.guides || [];

  const getPathBounds = (points: Point[]): { x: number, y: number, width: number, height: number } | null => {
      if (points.length === 0) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of points) {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  // --- Handlers ---
  const handleSelectMode = (type: ProjectType) => {
      const config: CanvasConfig = { type: 'FREEHAND', name: 'Infinite Whiteboard' };
      const newProjectId = uuidv4();
      const newProject: Project = {
          id: newProjectId,
          title: config.name,
          type: 'FREEHAND',
          displayType: 'Infinite Board',
          date: 'Just now',
          owner: 'You',
          thumbnail: getRandomThumbnailColor(),
          starred: false
      };
      setProjects(prev => [newProject, ...prev]);
      setCurrentProjectId(newProjectId);
      setCanvasConfig(config);
      initializeEditor(config); 
  };
  
  const handleOpenProject = (project: Project) => {
      let config: CanvasConfig = { type: project.type, name: project.title };
      setCurrentProjectId(project.id);
      setCanvasConfig(config);
      const savedContent = localStorage.getItem(`pixelia_content_${project.id}`);
      if (savedContent) {
          try {
              const loadedPages = JSON.parse(savedContent);
              setPages(loadedPages);
              setActivePageIndex(0);
              setHistory([]);
              setHistoryIndex(-1);
              setViewport({ x: isMobile ? 50 : 300, y: 100, scale: 1 }); 
              setCurrentView('EDITOR');
          } catch(e) {
              initializeEditor(config);
          }
      } else {
          initializeEditor(config);
      }
  }

  const handleDeleteProject = (projectId: string | number) => {
    setProjects(prev => prev.filter(p => String(p.id) !== String(projectId)));
    localStorage.removeItem(`pixelia_content_${projectId}`);
  };

  const handleRenameProject = (projectId: string | number, newTitle: string) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, title: newTitle } : p));
  };

  const handleToggleStar = (projectId: string | number) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, starred: !p.starred } : p));
  };

  const handleBackToDashboard = () => {
      if (currentProjectId) {
          setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, date: 'Just now' } : p));
      }
      setCurrentView('DASHBOARD');
      setCurrentProjectId(null);
  }

  const initializeEditor = (config: CanvasConfig) => {
      const initialPage: Page = {
          id: uuidv4(),
          elements: [],
          backgroundColor: '#ffffff',
          backgroundPattern: 'NONE',
          guides: []
      };
      setPages([initialPage]);
      setActivePageIndex(0);
      setHistory([]);
      setHistoryIndex(-1);
      setViewport({ x: isMobile ? 20 : 300, y: 100, scale: isMobile ? 0.8 : 1 });
      setCurrentView('EDITOR');
  };

  const updateCurrentPage = (updates: Partial<Page>) => {
      setPages(prev => prev.map((p, i) => i === activePageIndex ? { ...p, ...updates } : p));
  };

  const updateElements = (newElements: CanvasElement[]) => {
      updateCurrentPage({ elements: newElements });
  };
  
  const addRulerGuide = (guide: RulerGuide) => {
      updateCurrentPage({ guides: [...rulerGuides, guide] });
  }

  const handleAddPage = () => {
      const newPage: Page = {
          id: uuidv4(),
          elements: [],
          backgroundColor: '#ffffff',
          backgroundPattern: 'NONE',
          guides: []
      };
      setPages(prev => [...prev, newPage]);
      setActivePageIndex(prev => prev + 1);
      setHistory([]); 
      setHistoryIndex(-1);
  };

  const handleDeletePage = (index: number) => {
      if (pages.length <= 1) return; 
      const newPages = pages.filter((_, i) => i !== index);
      setPages(newPages);
      if (activePageIndex >= newPages.length) {
          setActivePageIndex(newPages.length - 1);
      } else if (activePageIndex > index) {
          setActivePageIndex(prev => prev - 1);
      }
      setHistory([]);
      setHistoryIndex(-1);
  };

  const handleDuplicatePage = (index: number) => {
      const pageToClone = pages[index];
      const newPage: Page = {
          ...pageToClone,
          id: uuidv4(),
          elements: pageToClone.elements.map(el => ({ ...el, id: uuidv4() })) 
      };
      const newPages = [...pages];
      newPages.splice(index + 1, 0, newPage);
      setPages(newPages);
      setActivePageIndex(index + 1);
      setHistory([]);
      setHistoryIndex(-1);
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === pages.length - 1) return;
      const newPages = [...pages];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
      setPages(newPages);
      if (activePageIndex === index) setActivePageIndex(targetIndex);
      else if (activePageIndex === targetIndex) setActivePageIndex(index);
  };

  const handleExport = (format: 'PNG' | 'PDF') => {
      setToast({ message: `Exporting as ${format}...`, type: 'info' });
      setTimeout(() => {
          setToast({ message: `Export Successful!`, type: 'success' });
          setTimeout(() => setToast(null), 3000);
      }, 1500);
  };

  const handleShare = async () => {
      try {
          await navigator.clipboard.writeText(window.location.href);
          setToast({ message: "Link copied to clipboard!", type: 'success' });
          setTimeout(() => setToast(null), 3000);
      } catch (err) {
          setToast({ message: "Failed to copy link", type: 'info' });
          setTimeout(() => setToast(null), 3000);
      }
  };

  const handleClearCanvas = () => {
      if (window.confirm("Are you sure you want to clear the canvas? This cannot be undone easily.")) {
          updateElements([]);
          saveHistory([]);
          setToast({ message: "Canvas Cleared", type: 'success' });
          setTimeout(() => setToast(null), 3000);
      }
  };

  const handleBringToFront = () => {
      const selectedEl = elements.find(el => el.isSelected);
      if (!selectedEl) return;
      
      const newElements = elements.filter(el => el.id !== selectedEl.id);
      newElements.push(selectedEl);
      
      updateElements(newElements);
      saveHistory(newElements);
  };

  const handleSendToBack = () => {
      const selectedEl = elements.find(el => el.isSelected);
      if (!selectedEl) return;
      
      const newElements = elements.filter(el => el.id !== selectedEl.id);
      newElements.unshift(selectedEl);
      
      updateElements(newElements);
      saveHistory(newElements);
  };

  const handleToggleGrid = () => {
      updateCurrentPage({ backgroundPattern: bgPattern === 'GRID' ? 'NONE' : 'GRID' });
  };
  
  // FIX: Make sticker selection automatically switch tool
  const handleStickerSelect = (sticker: string) => {
     selectedStickerRef.current = sticker;
     setTool(ToolType.STICKER);
  };

  const getCanvasPoint = (e: React.PointerEvent | React.MouseEvent): Point => {
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - viewport.x) / viewport.scale,
            y: (e.clientY - rect.top - viewport.y) / viewport.scale
        };
    }
    return { x: 0, y: 0 };
  };

  const saveHistory = useCallback((newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      updateElements(history[historyIndex - 1]);
    } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        updateElements([]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      updateElements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const addElement = (element: CanvasElement) => {
    const newElements = [...elements, element];
    updateElements(newElements);
    saveHistory(newElements);
  };

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...updates } as any as CanvasElement : el);
    updateElements(newElements);
  }, [elements]);

  const deleteSelected = useCallback(() => {
    const newElements = elements.filter(el => !el.isSelected);
    updateElements(newElements);
    saveHistory(newElements);
  }, [elements, saveHistory]);

  const duplicateSelected = useCallback(() => {
    const selectedElements = elements.filter(el => el.isSelected);
    if (selectedElements.length === 0) return;
    const newElements: CanvasElement[] = selectedElements.map((el) => {
        const newEl = { ...el, id: uuidv4(), x: el.x + 20, y: el.y + 20, isSelected: true } as any; 
        if (newEl.type === 'path') newEl.points = (el as PathElement).points.map((p: Point) => ({...p}));
        if (newEl.type === 'table') newEl.data = (el as TableElement).data.map((row: string[]) => [...row]);
        if (newEl.type === 'checkbox') newEl.items = (el as CheckboxElement).items.map((item: any) => ({...item, id: uuidv4()}));
        if (newEl.type === 'chart') {
            newEl.data = [...(el as ChartElement).data];
            newEl.labels = [...(el as ChartElement).labels];
        }
        return newEl as CanvasElement;
    });
    const currentElements = elements.map((el) => ({ ...el, isSelected: false } as any as CanvasElement));
    const nextElements = [...currentElements, ...newElements];
    updateElements(nextElements);
    saveHistory(nextElements);
  }, [elements, saveHistory]);

  const handleZoom = (delta: number, center?: { x: number, y: number }) => {
    const newScale = Math.min(Math.max(0.1, viewport.scale + delta), 5);
    let clientX = center ? center.x : (window.innerWidth / 2);
    let clientY = center ? center.y : (window.innerHeight / 2);
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        const worldX = (mouseX - viewport.x) / viewport.scale;
        const worldY = (mouseY - viewport.y) / viewport.scale;
        const newViewportX = mouseX - worldX * newScale;
        const newViewportY = mouseY - worldY * newScale;
        setViewport({ x: newViewportX, y: newViewportY, scale: newScale });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const src = event.target?.result as string;
          const pos = getCanvasPoint({ clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
          addElement({ id: uuidv4(), type: 'image', x: pos.x - 150, y: pos.y - 150, width: 300, height: 300, rotation: 0, src: src, isSelected: true });
          setTool(ToolType.SELECT);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
  };
  
  // Ruler Handlers
  const handleRulerDragStart = (type: 'horizontal' | 'vertical', e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingGuideRef.current = true;
      const point = getCanvasPoint(e);
      setTempGuide({ type, pos: type === 'horizontal' ? point.y : point.x });
  }

  const calculateSnap = (activeEl: CanvasElement, allElements: CanvasElement[], totalDx: number, totalDy: number) => {
      // Snap Logic (Simplified)
      return { dx: totalDx, dy: totalDy, guides: [] };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).id === "canvas-container") {
         updateElements(elements.map((el): CanvasElement => ({ ...el, isSelected: false } as any as CanvasElement)));
    }
    const pos = getCanvasPoint(e);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    if (tool === ToolType.HAND || e.button === 1 || isSpacePressed) {
       isDraggingViewportRef.current = true;
       e.currentTarget.setPointerCapture(e.pointerId);
       return;
    }
    if (isResizingElementRef.current || isRotatingElementRef.current) return;
    if (tool === ToolType.PEN || tool === ToolType.HIGHLIGHTER || tool === ToolType.ERASER || tool === ToolType.LINE) {
        setCurrentPath(tool === ToolType.LINE ? [{...pos}, {...pos}] : [{...pos}]);
        e.currentTarget.setPointerCapture(e.pointerId);
    } 
    else if (tool === ToolType.NOTE) {
      addElement({ id: uuidv4(), type: 'note', x: pos.x - 100, y: pos.y - 75, width: 200, height: 150, text: '', color: color === COLORS.BLACK ? NOTE_COLORS.YELLOW : color, rotation: 0, isSelected: true });
      setTool(ToolType.SELECT);
    } 
    else if (tool === ToolType.TEXT) {
      addElement({ id: uuidv4(), type: 'text', x: pos.x, y: pos.y, text: '', color: color, fontSize: fontSize, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', width: 300, height: 100, rotation: 0, isSelected: true });
      setTool(ToolType.SELECT);
    } 
    else if (tool === ToolType.CODE) {
        addElement({ id: uuidv4(), type: 'code', x: pos.x - 150, y: pos.y - 75, width: 300, height: 150, text: '', language: 'javascript', fontSize: 14, rotation: 0, isSelected: true });
        setTool(ToolType.SELECT);
    }
    else if (tool === ToolType.CHECKBOX) {
        addElement({ id: uuidv4(), type: 'checkbox', x: pos.x - 100, y: pos.y - 100, width: 250, height: 200, items: [{id: uuidv4(), text: 'Task 1', checked: false}], color: '#ffffff', rotation: 0, isSelected: true });
        setTool(ToolType.SELECT);
    }
    else if (tool === ToolType.STICKER) {
        addElement({ id: uuidv4(), type: 'sticker', x: pos.x - 25, y: pos.y - 25, width: 64, height: 64, content: selectedStickerRef.current, rotation: 0, isSelected: true });
        setTool(ToolType.SELECT);
    }
    else if (tool === ToolType.SHAPE) {
       addElement({ id: uuidv4(), type: 'shape', x: pos.x - 50, y: pos.y - 50, width: 100, height: 100, color: color === COLORS.BLACK ? '#e2e8f0' : color, shapeType: shapeType, rotation: 0, isSelected: true });
       setTool(ToolType.SELECT);
    } 
    else if (tool === ToolType.CHART) {
        addElement({ 
            id: uuidv4(), 
            type: 'chart', 
            chartType: ChartType.BAR, 
            x: pos.x - 150, y: pos.y - 100, width: 300, height: 200, 
            data: [10, 25, 15, 30, 20], 
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], 
            color: color === COLORS.BLACK ? '#3b82f6' : color, 
            rotation: 0, 
            isSelected: true 
        });
        setTool(ToolType.SELECT);
    }
    else if (tool === ToolType.TABLE) {
        const data = Array(3).fill(null).map(() => Array(3).fill(''));
        addElement({ id: uuidv4(), type: 'table', x: pos.x - 150, y: pos.y - 75, width: 300, height: 150, rotation: 0, rows: 3, cols: 3, data, borderColor: '#e5e7eb', isSelected: true });
        setTool(ToolType.SELECT);
    }
    else if (tool === ToolType.SELECT) {
        if ((e.target as HTMLElement).id === "canvas-container" || e.target === canvasRef.current) {
            setSelectionBox({ start: pos, current: pos });
            e.currentTarget.setPointerCapture(e.pointerId);
        }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Check for Trash Hover
    if (isMovingElementRef.current && activeElementIdRef.current) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        // Trash zone is bottom right
        if (e.clientX > windowWidth - 120 && e.clientY > windowHeight - 120) {
            setIsOverTrash(true);
        } else {
            setIsOverTrash(false);
        }
    }
    
    // Ruler Guide Dragging
    if (isDraggingGuideRef.current && tempGuide) {
        const pos = getCanvasPoint(e);
        setTempGuide({ ...tempGuide, pos: tempGuide.type === 'horizontal' ? pos.y : pos.x });
        return;
    }

    if (isDraggingViewportRef.current) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;
        setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        startPosRef.current = { x: e.clientX, y: e.clientY };
        return;
    }
    if (isMovingElementRef.current && activeElementIdRef.current) {
         const totalDx = (e.clientX - startPosRef.current.x) / viewport.scale;
         const totalDy = (e.clientY - startPosRef.current.y) / viewport.scale;
         const activeEl = elements.find(el => el.id === activeElementIdRef.current);
         if (activeEl) {
             const { dx: snapDx, dy: snapDy, guides: newGuides } = calculateSnap(activeEl, elements, totalDx, totalDy);
             setGuides(newGuides);
             const orig = originalElementSnapshotRef.current as any;
             if (orig) updateElement(activeElementIdRef.current, { x: orig.x + snapDx, y: orig.y + snapDy });
         }
         return;
    }
    if (isResizingElementRef.current && activeElementIdRef.current && originalElementSnapshotRef.current) {
         const totalDx = (e.clientX - startPosRef.current.x) / viewport.scale;
         const totalDy = (e.clientY - startPosRef.current.y) / viewport.scale;
         const handle = resizeHandleRef.current;
         const orig = originalElementSnapshotRef.current as any;
         updateElements(elements.map((item): CanvasElement => {
             if (item.id === activeElementIdRef.current) {
                 let { x, y, width, height } = orig;
                 if (handle?.includes('e')) width = Math.max(20, width + totalDx);
                 if (handle?.includes('w')) { width = Math.max(20, width - totalDx); x += (orig.width - width); }
                 if (handle?.includes('s')) height = Math.max(20, height + totalDy);
                 if (handle?.includes('n')) { height = Math.max(20, height - totalDy); y += (orig.height - height); }
                 return { ...item, x, y, width, height } as any as CanvasElement;
             }
             return item;
         }));
         return;
    }
    if (isRotatingElementRef.current && activeElementIdRef.current && originalElementSnapshotRef.current) {
        const orig = originalElementSnapshotRef.current as any;
        const cx = orig.x + orig.width / 2;
        const cy = orig.y + orig.height / 2;
        const mousePos = getCanvasPoint(e);
        const angle = Math.atan2(mousePos.y - cy, mousePos.x - cx) * (180 / Math.PI);
        const initialAngle = initialAngleRef.current * (180 / Math.PI);
        let rotationDiff = angle - initialAngle;
        let newRotation = (initialRotationRef.current + rotationDiff);
        updateElement(activeElementIdRef.current, { rotation: newRotation });
        return;
    }
    if ((tool === ToolType.PEN || tool === ToolType.HIGHLIGHTER || tool === ToolType.ERASER) && currentPath) setCurrentPath([...currentPath, getCanvasPoint(e)]);
    else if (tool === ToolType.LINE && currentPath) setCurrentPath([currentPath[0], getCanvasPoint(e)]);
    else if (tool === ToolType.SELECT && selectionBox) setSelectionBox({ ...selectionBox, current: getCanvasPoint(e) });
  };

  const handlePointerUp = () => {
    isDraggingViewportRef.current = false;
    
    // Ruler Guide Commit
    if (isDraggingGuideRef.current && tempGuide) {
        addRulerGuide(tempGuide);
        setTempGuide(null);
        isDraggingGuideRef.current = false;
    }

    // Handle Drop to Trash
    if (isOverTrash && isMovingElementRef.current) {
        deleteSelected();
        setIsOverTrash(false);
    }

    if ((tool === ToolType.PEN || tool === ToolType.HIGHLIGHTER || tool === ToolType.ERASER || tool === ToolType.LINE) && currentPath) {
      if (tool === ToolType.LINE && currentPath.length === 2) addElement({ id: uuidv4(), type: 'path', points: currentPath, color: color, strokeWidth: strokeWidth, isEraser: false, x: 0, y: 0, rotation: 0 });
      else if (tool !== ToolType.LINE) {
          // Determine color for highlighter
          let pathColor = tool === ToolType.ERASER ? 'black' : color;
          if (tool === ToolType.HIGHLIGHTER) {
              // Default highlighter color if current is black
              pathColor = color === COLORS.BLACK ? HIGHLIGHTER_COLORS.YELLOW : (color + '80'); 
              if (color === COLORS.BLACK) pathColor = HIGHLIGHTER_COLORS.YELLOW;
              else if (color === COLORS.BLUE) pathColor = HIGHLIGHTER_COLORS.BLUE;
              else if (color === COLORS.GREEN) pathColor = HIGHLIGHTER_COLORS.GREEN;
              else if (color === COLORS.RED || color === COLORS.ROSE) pathColor = HIGHLIGHTER_COLORS.PINK;
              else if (color === COLORS.PURPLE) pathColor = HIGHLIGHTER_COLORS.PURPLE;
              else pathColor = HIGHLIGHTER_COLORS.YELLOW;
          }

          addElement({ 
              id: uuidv4(), 
              type: 'path', 
              points: currentPath, 
              color: pathColor, 
              strokeWidth: tool === ToolType.ERASER ? strokeWidth * 5 : (tool === ToolType.HIGHLIGHTER ? 24 : strokeWidth), 
              isEraser: tool === ToolType.ERASER, 
              isHighlighter: tool === ToolType.HIGHLIGHTER,
              x: 0, y: 0, rotation: 0 
          });
      }
      setCurrentPath(null);
    } 
    else if (tool === ToolType.SELECT && selectionBox) {
        const x1 = Math.min(selectionBox.start.x, selectionBox.current.x);
        const y1 = Math.min(selectionBox.start.y, selectionBox.current.y);
        const x2 = Math.max(selectionBox.start.x, selectionBox.current.x);
        const y2 = Math.max(selectionBox.start.y, selectionBox.current.y);
        updateElements(elements.map((el): CanvasElement => {
            let elX = el.x, elY = el.y;
            
            // For Paths, calculate bounding box to check selection
            if (el.type === 'path' && el.points.length > 0) {
                 const bounds = getPathBounds(el.points);
                 if (bounds) {
                     elX = bounds.x + el.x;
                     elY = bounds.y + el.y;
                     return { ...el, isSelected: elX + bounds.width >= x1 && elX <= x2 && elY + bounds.height >= y1 && elY <= y2 && !(el as PathElement).isEraser } as any as CanvasElement;
                 }
            }

            // Prevent eraser paths from being selected
            if (el.type === 'path' && (el as PathElement).isEraser) return { ...el, isSelected: false } as any as CanvasElement;

            return { ...el, isSelected: elX >= x1 && elX <= x2 && elY >= y1 && elY <= y2 } as any as CanvasElement;
        }));
        setSelectionBox(null);
    }
    if (isMovingElementRef.current || isResizingElementRef.current || isRotatingElementRef.current) saveHistory(elements);
    isMovingElementRef.current = false; isResizingElementRef.current = false; isRotatingElementRef.current = false; resizeHandleRef.current = null; activeElementIdRef.current = null; originalElementSnapshotRef.current = null; setGuides([]);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleZoom(-e.deltaY * 0.001, { x: e.clientX, y: e.clientY });
    } else setViewport(prev => ({...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY}));
  };

  const handleElementPointerDown = useCallback((id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      if (tool !== ToolType.SELECT && !isSpacePressed) return;
      if (isSpacePressed) return; 
      updateElements(elements.map(el => ({ ...el, isSelected: el.id === id } as unknown as CanvasElement)));
      isMovingElementRef.current = true;
      activeElementIdRef.current = id;
      originalElementSnapshotRef.current = elements.find(el => el.id === id) || null;
      startPosRef.current = { x: e.clientX, y: e.clientY };
  }, [tool, isSpacePressed, elements]);

  const handleResizePointerDown = useCallback((id: string, handle: ResizeHandle, e: React.PointerEvent) => {
      e.stopPropagation(); e.preventDefault(); 
      isResizingElementRef.current = true;
      resizeHandleRef.current = handle;
      activeElementIdRef.current = id;
      originalElementSnapshotRef.current = elements.find(el => el.id === id) || null;
      startPosRef.current = { x: e.clientX, y: e.clientY };
  }, [elements]);

  const handleRotatePointerDown = useCallback((id: string, e: React.PointerEvent) => {
      e.stopPropagation(); e.preventDefault();
      isRotatingElementRef.current = true;
      activeElementIdRef.current = id;
      const el = elements.find(el => el.id === id);
      originalElementSnapshotRef.current = el || null;
      if (el) {
          initialRotationRef.current = el.rotation;
          const cx = el.x + (el as any).width / 2;
          const cy = el.y + (el as any).height / 2;
          const mousePos = getCanvasPoint(e);
          initialAngleRef.current = Math.atan2(mousePos.y - cy, mousePos.x - cx);
      }
  }, [elements]);

  // ... (keeping useEffects for keyboard events) ...
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === 'Space' && !isSpacePressed) setIsSpacePressed(true);
          const target = e.target as HTMLElement;
          const isTyping = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable;
          if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping && elements.some(el => el.isSelected)) deleteSelected();
          if ((e.ctrlKey || e.metaKey) && e.key === 'z') { if (e.shiftKey) redo(); else undo(); }
          if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); duplicateSelected(); }
          if (e.key === 'Escape' && isPresenting) setIsPresenting(false);
      };
      const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePressed(false); };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [elements, isSpacePressed, deleteSelected, undo, redo, duplicateSelected, isPresenting]);


  // ... (keeping renderPath) ...
  const renderPath = (points: Point[], color: string, width: number, key?: string) => {
      if (points.length < 2) return null;
      const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      const style: React.CSSProperties = color.startsWith('rgba') ? { mixBlendMode: 'multiply' } : {};
      return <path key={key} d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" style={style} />;
  };
  
  const selectedElement = elements.find(el => el.isSelected) || null;
  const isFixedSize = canvasConfig.type !== 'FREEHAND';

  const renderCanvasContent = (forPresentation = false) => (
      <>
        {/* ... (keeping SVG background defs) ... */}
        <svg className="absolute top-0 left-0 overflow-visible pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
            <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ddd" strokeWidth="1"/></pattern>
                <pattern id="dots-pattern" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ccc" /></pattern>
                <pattern id="lines-pattern" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 0 40 L 40 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/></pattern>
            </defs>
            
            {bgPattern !== 'NONE' && (
                <rect 
                    x="-50000" y="-50000" width="100000" height="100000" 
                    fill={bgPattern === 'GRID' ? 'url(#grid-pattern)' : bgPattern === 'DOTS' ? 'url(#dots-pattern)' : bgPattern === 'LINES' ? 'url(#lines-pattern)' : 'none'} 
                    style={{ pointerEvents: 'none' }} 
                />
            )}
            
            {!forPresentation && rulerGuides.map((guide, i) => {
                 if (guide.type === 'vertical') {
                    return <line key={`r-guide-v-${i}`} x1={guide.pos} y1="-50000" x2={guide.pos} y2="50000" stroke="#06b6d4" strokeWidth="1" />;
                 } else {
                    return <line key={`r-guide-h-${i}`} x1="-50000" y1={guide.pos} x2="50000" y2={guide.pos} stroke="#06b6d4" strokeWidth="1" />;
                 }
            })}
            
            {!forPresentation && tempGuide && (
                 tempGuide.type === 'vertical' ? 
                 <line x1={tempGuide.pos} y1="-50000" x2={tempGuide.pos} y2="50000" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 2" /> :
                 <line x1="-50000" y1={tempGuide.pos} x2="50000" y2={tempGuide.pos} stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 2" />
            )}

            {elements.map(el => {
                if (el.type !== 'path') return null;
                const p = el as PathElement;
                const isGradient = bgColor.startsWith('linear') || bgColor.startsWith('radial');
                const strokeColor = p.isEraser ? (isGradient ? '#ffffff' : (bgColor === '#ffffff' ? '#ffffff' : bgColor)) : p.color;
                const strokeWidth = p.isEraser ? (p.strokeWidth || 20) : p.strokeWidth;
                
                // Calculate center of path for menu positioning
                const bounds = getPathBounds(p.points);
                
                return (
                    <g key={el.id} className={!forPresentation && !p.isEraser ? "pointer-events-auto cursor-move" : ""} style={{ transform: `translate(${el.x}px, ${el.y}px)` }} onPointerDown={(e) => !forPresentation && !p.isEraser && handleElementPointerDown(el.id, e)}>
                         {/* Selection Halo for Paths */}
                         {el.isSelected && !forPresentation && renderPath(p.points, 'rgba(139, 92, 246, 0.3)', strokeWidth + 10)}
                         {renderPath(p.points, strokeColor, strokeWidth)}
                        
                         {/* Invisible hit area */}
                         {!p.isEraser && !forPresentation && (
                            <path d={`M ${p.points[0].x} ${p.points[0].y} ` + p.points.slice(1).map(pt => `L ${pt.x} ${pt.y}`).join(' ')} stroke="transparent" strokeWidth={Math.max(10, strokeWidth + 10)} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        )}

                        {/* ForeignObject to render the FloatingMenu for SVG paths */}
                         {el.isSelected && !forPresentation && bounds && (
                             <foreignObject x={bounds.x} y={bounds.y - 60} width={bounds.width} height="60" style={{overflow: 'visible'}}>
                                 <div className="w-full h-full relative">
                                    <FloatingActionMenu 
                                        onMoveStart={(e) => handleElementPointerDown(el.id, e)} 
                                        onRotateStart={(e) => {}} // Paths don't rotate easily in this SVG logic yet, placeholder
                                        onDelete={deleteSelected} 
                                    />
                                 </div>
                             </foreignObject>
                         )}
                    </g>
                )
            })}
            
            {/* ... (currentPath logic) ... */}
            {!forPresentation && currentPath && (
                renderPath(
                    currentPath, 
                    tool === ToolType.ERASER 
                        ? (bgColor.startsWith('linear') || bgColor.startsWith('radial') ? '#ffffff' : (bgColor === '#ffffff' ? '#ffffff' : bgColor)) 
                        : (tool === ToolType.HIGHLIGHTER ? HIGHLIGHTER_COLORS.YELLOW : color), 
                    tool === ToolType.ERASER ? strokeWidth * 5 : (tool === ToolType.HIGHLIGHTER ? 24 : strokeWidth)
                )
            )}

            {/* ... (Guides logic) ... */}
            {!forPresentation && guides.map((guide, i) => {
                // ... same as before
                if (guide.type === 'vertical') {
                    return <line key={i} x1={guide.pos} y1={guide.min} x2={guide.pos} y2={guide.max} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />;
                } else if (guide.type === 'horizontal') {
                    return <line key={i} x1={guide.min} y1={guide.pos} x2={guide.max} y2={guide.pos} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />;
                } 
                return null;
            })}
        </svg>

        {elements.map((el) => { 
            if (el.type === 'path') return null; 
            return (
                <div key={el.id} style={{ pointerEvents: forPresentation ? 'none' : 'auto' }}>
                    {forPresentation ? (
                        // Simplified render
                        <div style={{ position: 'absolute', left: el.x, top: el.y, width: (el as any).width, height: (el as any).height, transform: `rotate(${el.rotation}deg)` }}>
                             {el.type === 'text' && <div style={{ fontSize: (el as TextElement).fontSize, color: (el as TextElement).color, fontFamily: (el as TextElement).fontFamily, fontWeight: (el as TextElement).fontWeight, fontStyle: (el as TextElement).fontStyle, textDecoration: (el as TextElement).textDecoration, whiteSpace: 'pre-wrap', lineHeight: 1.2 }}>{(el as TextElement).text}</div>}
                            {el.type === 'sticker' && <div style={{ fontSize: Math.min((el as any).width, (el as any).height) * 0.8, lineHeight: 1 }}>{(el as StickerElement).content}</div>}
                             {el.type === 'image' && <img src={(el as ImageElement).src} alt="" className="w-full h-full object-contain" />}
                             {el.type === 'shape' && renderShape((el as ShapeElement).shapeType, (el as ShapeElement).color)}
                             {el.type === 'chart' && renderChart(el as ChartElement)}
                        </div>
                    ) : (
                        <CanvasObject 
                            el={el} 
                            isSelected={!!el.isSelected} 
                            onSelect={handleElementPointerDown} 
                            onUpdate={updateElement} 
                            onDelete={deleteSelected} 
                            onResizeStart={handleResizePointerDown} 
                            onRotateStart={handleRotatePointerDown} 
                        />
                    )}
                </div>
            ); 
        })}

        {!forPresentation && selectionBox && (<div className="absolute border border-purple-500 bg-purple-500/10 pointer-events-none" style={{ left: Math.min(selectionBox.start.x, selectionBox.current.x) + 'px', top: Math.min(selectionBox.start.y, selectionBox.current.y) + 'px', width: Math.abs(selectionBox.current.x - selectionBox.start.x) + 'px', height: Math.abs(selectionBox.current.y - selectionBox.start.y) + 'px' }} />)}
      </>
  );

  if (currentView === 'DASHBOARD') {
      return (
        <Dashboard 
            projects={projects} onSelectMode={handleSelectMode} onOpenProject={handleOpenProject} onDeleteProject={handleDeleteProject}
            onRenameProject={handleRenameProject} onToggleStar={handleToggleStar} isMobile={isMobile}
        />
      );
  }

  // ... (Presenting View) ...
    if (isPresenting) {
      return (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
               {/* ... (Presenting UI) ... */}
               <div 
                   className="relative shadow-2xl overflow-hidden"
                   style={{ 
                       width: canvasConfig.width || 1920, 
                       height: canvasConfig.height || 1080, 
                       background: bgColor || '#ffffff', 
                       transform: `scale(${Math.min(window.innerWidth / (canvasConfig.width || 1920), window.innerHeight / (canvasConfig.height || 1080)) * 0.9})` 
                   }}
               >
                   {renderCanvasContent(true)}
               </div>
               <button onClick={() => setIsPresenting(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><X size={24} /></button>
          </div>
      )
  }

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#e5e5e5] select-none touch-none">
      <TopBar 
        canUndo={historyIndex >= -1} canRedo={historyIndex < history.length - 1} onUndo={undo} onRedo={redo}
        zoom={viewport.scale} onZoomIn={() => handleZoom(0.1)} onZoomOut={() => handleZoom(-0.1)}
        projectName={canvasConfig.name} onBackToDashboard={handleBackToDashboard}
        onPresent={() => setIsPresenting(true)} showGrid={bgPattern === 'GRID'} onToggleGrid={handleToggleGrid} onExport={handleExport}
        isMobile={isMobile} onTogglePages={() => setShowPageSidebar(!showPageSidebar)} onShare={handleShare} onClearCanvas={handleClearCanvas}
      />

      <PropertyBar 
        activeTool={tool} selectedElement={selectedElement} onUpdateElement={updateElement} onDeleteElement={deleteSelected} onDuplicateElement={duplicateSelected}
        currentColor={color} onColorChange={setColor} strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth} fontSize={fontSize} onFontSizeChange={setFontSize} 
        currentShapeType={shapeType} onShapeTypeChange={setShapeType} pageColor={bgColor} onPageColorChange={(c) => updateCurrentPage({ backgroundColor: c })}
        pagePattern={bgPattern} onPagePatternChange={(p) => updateCurrentPage({ backgroundPattern: p })}
        onStickerSelect={handleStickerSelect}
        onBringToFront={handleBringToFront} onSendToBack={handleSendToBack}
      />

      <div className={`flex flex-1 ${isMobile ? 'h-[calc(100vh-136px)]' : 'h-[calc(100vh-112px)]'} overflow-hidden relative ${isMobile ? 'flex-col-reverse' : 'flex-row'}`}>
          <Toolbar activeTool={tool} onSelectTool={setTool} onImageUpload={handleImageUpload} isMobile={isMobile} />
          
          <div className="flex-1 relative bg-[#e9e9eb] overflow-hidden flex" ref={containerRef}>
             {/* RULERS */}
             <div className="absolute top-0 left-0 w-6 h-6 bg-[#f3f4f6] z-30 border-r border-b border-gray-200" /> {/* Corner */}
             <div className="absolute top-0 left-6 right-0 h-6 bg-[#f3f4f6] z-20 border-b border-gray-200 cursor-ns-resize" onPointerDown={(e) => handleRulerDragStart('horizontal', e)}>
                 <Ruler orientation="horizontal" zoom={viewport.scale} offset={viewport.x} length={containerSize.width} />
             </div>
             <div className="absolute top-6 left-0 bottom-0 w-6 bg-[#f3f4f6] z-20 border-r border-gray-200 cursor-ew-resize" onPointerDown={(e) => handleRulerDragStart('vertical', e)}>
                 <Ruler orientation="vertical" zoom={viewport.scale} offset={viewport.y} length={containerSize.height} />
             </div>

             <div 
                ref={canvasRef}
                className={`absolute top-6 left-6 right-0 bottom-0 overflow-hidden ${isSpacePressed || tool === ToolType.HAND ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
                style={{ background: !isFixedSize ? (bgColor !== '#ffffff' ? bgColor : '#ffffff') : undefined }}
            >
                <div 
                    id="canvas-container"
                    style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`, transformOrigin: '0 0', width: isFixedSize ? canvasConfig.width : '100%', height: isFixedSize ? canvasConfig.height : '100%', background: isFixedSize ? bgColor : 'transparent', boxShadow: isFixedSize ? '0 0 50px rgba(0,0,0,0.1)' : 'none' }}
                    className="absolute top-0 left-0"
                >
                    {renderCanvasContent()}
                </div>
            </div>
            
            {showPageSidebar && (
                <div className={`${isMobile ? 'fixed inset-0 z-50 bg-white' : 'relative z-40'}`}>
                    <PageList 
                        pages={pages} activePageIndex={activePageIndex} onSelectPage={(i) => { setActivePageIndex(i); setHistory([]); setHistoryIndex(-1); if(isMobile) setShowPageSidebar(false); }}
                        onAddPage={handleAddPage} onDeletePage={handleDeletePage} onDuplicatePage={handleDuplicatePage} onMovePage={handleMovePage} config={canvasConfig}
                        onClose={() => setShowPageSidebar(false)} isMobile={isMobile}
                    />
                </div>
            )}

            {isMovingElementRef.current && (
                <div className={`absolute bottom-6 right-6 p-6 rounded-2xl border-2 transition-all duration-300 z-50 flex flex-col items-center justify-center gap-2 ${isOverTrash ? 'bg-red-100 border-red-500 scale-110 shadow-2xl' : 'bg-white/90 border-gray-200 backdrop-blur shadow-lg'}`}>
                    <Trash2 size={32} className={`transition-colors ${isOverTrash ? 'text-red-600 animate-bounce' : 'text-gray-400'}`} />
                    <span className={`text-xs font-bold ${isOverTrash ? 'text-red-600' : 'text-gray-400'}`}>Drop to Delete</span>
                </div>
            )}
          </div>
          {toast && (<div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-[100] whitespace-nowrap">{toast.type === 'info' ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} className="text-green-400" />}<span className="font-medium text-sm">{toast.message}</span></div>)}
      </div>
    </div>
  );
}

function getRandomThumbnailColor() {
    const colors = ['bg-orange-100', 'bg-blue-100', 'bg-pink-100', 'bg-purple-100', 'bg-green-100', 'bg-yellow-100'];
    return colors[Math.floor(Math.random() * colors.length)];
}
