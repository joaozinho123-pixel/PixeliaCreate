
import React, { useState } from 'react';
import { Undo2, Redo2, Minus, Plus, Share2, Play, Home, Monitor, Download, Grid, Type, File as FileIcon, Check, Layers, Menu, Trash2 } from 'lucide-react';

interface TopBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  projectName: string;
  onBackToDashboard: () => void;
  onPresent: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onExport: (format: 'PNG' | 'PDF') => void;
  isMobile?: boolean;
  onTogglePages?: () => void;
  onShare: () => void;
  onClearCanvas: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  projectName,
  onBackToDashboard,
  onPresent,
  showGrid,
  onToggleGrid,
  onExport,
  isMobile,
  onTogglePages,
  onShare,
  onClearCanvas
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const MenuDropdown: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div className={`absolute top-full ${isMobile ? 'left-1/2 -translate-x-1/2' : 'left-0'} mt-2 min-w-[220px] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-[60] py-2 animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-200 flex flex-col overflow-hidden`}>
          {children}
      </div>
  );

  const MenuItem: React.FC<{ icon?: any, label: string, onClick?: () => void, shortcut?: string, checked?: boolean, danger?: boolean }> = ({ icon: Icon, label, onClick, shortcut, checked, danger }) => (
      <button 
        onClick={() => { onClick?.(); setActiveMenu(null); }}
        className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100/50 text-left text-sm w-full transition-all duration-200 group relative ${danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700'}`}
      >
          {Icon && <Icon size={16} className={`transition-colors ${danger ? 'text-red-400 group-hover:text-red-600' : 'text-gray-400 group-hover:text-purple-600'} ${checked ? 'text-purple-600' : ''}`} />}
          <span className="flex-1 font-medium">{label}</span>
          {checked && <Check size={14} className="text-purple-600" />}
          {!isMobile && shortcut && <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{shortcut}</span>}
      </button>
  );

  return (
    <div className="h-14 bg-[#1e1e1e] text-white flex items-center justify-between px-2 md:px-4 z-50 w-full relative shrink-0 shadow-md">
      
      {/* Left: Branding & File Info */}
      <div className="flex items-center gap-1 md:gap-4">
        <button 
            onClick={onBackToDashboard} 
            className="p-1.5 md:p-2 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors hover:scale-105 active:scale-95"
            title="Back to Dashboard"
        >
            <Home size={18} />
        </button>

        {!isMobile && <div className="h-6 w-px bg-white/10" />}

        <div className="flex flex-col">
            <input 
                value={isMobile ? (projectName.length > 10 ? projectName.substring(0, 10) + '...' : projectName) : projectName}
                readOnly
                className="bg-transparent text-sm font-semibold text-white focus:outline-none hover:bg-white/10 px-2 rounded cursor-default transition-colors w-24 md:w-auto"
            />
            <div className="flex gap-2 text-[11px] text-gray-400 px-2 mt-0.5 select-none relative z-[70]">
                <div className="relative">
                    <button onClick={() => toggleMenu('FILE')} className={`hover:text-white transition-colors ${activeMenu === 'FILE' ? 'text-white font-bold' : ''}`}>File</button>
                    {activeMenu === 'FILE' && (
                        <MenuDropdown>
                            <MenuItem icon={FileIcon} label="New Design" onClick={onBackToDashboard} />
                            <div className="h-px bg-gray-200 my-1 mx-2" />
                            <MenuItem icon={Download} label="Export as PNG" onClick={() => onExport('PNG')} />
                            <MenuItem icon={Download} label="Export as PDF" onClick={() => onExport('PDF')} />
                            <div className="h-px bg-gray-200 my-1 mx-2" />
                            <MenuItem icon={Trash2} label="Clear Canvas" onClick={onClearCanvas} danger />
                        </MenuDropdown>
                    )}
                </div>

                <div className="relative">
                    <button onClick={() => toggleMenu('VIEW')} className={`hover:text-white transition-colors ${activeMenu === 'VIEW' ? 'text-white font-bold' : ''}`}>View</button>
                    {activeMenu === 'VIEW' && (
                        <MenuDropdown>
                            <MenuItem icon={Grid} label="Show Grid" onClick={onToggleGrid} checked={showGrid} />
                            <MenuItem icon={Monitor} label="Fullscreen" onClick={onPresent} />
                            {isMobile && <MenuItem icon={Layers} label="Pages" onClick={onTogglePages} />}
                        </MenuDropdown>
                    )}
                </div>
            </div>
        </div>

        {!isMobile && (
            <div className="flex items-center gap-1 ml-4">
                <button 
                    onClick={onUndo} 
                    disabled={!canUndo}
                    className="p-1.5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
                >
                    <Undo2 size={16} />
                </button>
                <button 
                    onClick={onRedo} 
                    disabled={!canRedo}
                    className="p-1.5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
                >
                    <Redo2 size={16} />
                </button>
            </div>
        )}
      </div>

      {/* Right: Actions, Zoom */}
      <div className="flex items-center gap-1 md:gap-4">
        
        <div className="flex items-center gap-1 md:gap-2">
             {!isMobile && (
                 <button 
                    onClick={onPresent}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-md font-medium text-xs hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                 >
                    <Play size={14} fill="currentColor" />
                    Present
                 </button>
             )}
             
             <button 
                onClick={onTogglePages}
                className={`p-1.5 md:p-2 rounded-lg transition-all ${isMobile ? 'text-purple-400 bg-white/5' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                title="Toggle Pages"
             >
                <Layers size={18} />
             </button>

             {!isMobile && (
                <button 
                    onClick={onShare}
                    className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md font-medium text-xs hover:opacity-90 transition-all shadow-sm"
                >
                    <Share2 size={14} />
                    Share
                </button>
             )}
        </div>

        {!isMobile && <div className="h-6 w-px bg-white/10" />}

        {/* Zoom */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/5">
            <button onClick={onZoomOut} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                <Minus size={14} />
            </button>
            <span className="w-8 md:w-10 text-center text-[10px] md:text-xs font-mono text-gray-300 select-none">
                {Math.round(zoom * 100)}%
            </span>
            <button onClick={onZoomIn} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                <Plus size={14} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
