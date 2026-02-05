
import React, { useRef, useState } from 'react';
import { TOOL_GROUPS } from '../constants';
import { ToolType } from '../types';
import { ChevronRight, X } from 'lucide-react';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMobile?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  onSelectTool, 
  onImageUpload,
  isMobile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const handleToolClick = (toolId: ToolType) => {
    if (toolId === ToolType.IMAGE) {
        fileInputRef.current?.click();
    } else {
        onSelectTool(toolId);
    }
    // Group remains open until explicitly closed
  };

  const handleGroupClick = (groupId: string) => {
      if (activeGroup === groupId) {
          setActiveGroup(null);
      } else {
          setActiveGroup(groupId);
      }
  };

  const handleCloseGroup = (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveGroup(null);
  }

  return (
    <div 
        id="toolbar-container"
        className={`
            ${isMobile ? 'w-full h-auto px-4 py-2 flex-row bottom-0 fixed border-t' : 'w-[72px] h-full flex-col py-6 left-0 absolute border-r'} 
            bg-white border-gray-200 flex items-center justify-start z-[60] shadow-xl shrink-0 transition-all duration-300
        `}
    >
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={onImageUpload}
      />

      <div className={`flex ${isMobile ? 'flex-row w-full justify-between gap-2' : 'flex-col gap-6 w-full items-center'}`}>
        {TOOL_GROUPS.map((group) => {
            // Check if any tool in this group is active
            const isGroupActive = group.tools.some(t => t.id === activeTool);
            // Get the active tool icon if one is active, otherwise default to group icon
            const ActiveToolObj = group.tools.find(t => t.id === activeTool);
            const DisplayIcon = isGroupActive && ActiveToolObj ? ActiveToolObj.icon : (group.icon || group.tools[0].icon);
            
            const isEssentials = group.id === 'essential';
            const showFlyout = activeGroup === group.id;

            // Essentials (Select/Hand) are rendered directly without grouping in the UI for speed
            if (isEssentials) {
                return (
                    <div key={group.id} className={`flex ${isMobile ? 'gap-2' : 'flex-col gap-4'} pb-2 border-b border-gray-100 w-full items-center justify-center`}>
                        {group.tools.map(tool => {
                            const Icon = tool.icon;
                            const isActive = activeTool === tool.id;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => handleToolClick(tool.id)}
                                    title={tool.label}
                                    className={`
                                        flex items-center justify-center p-3 rounded-xl transition-all duration-200
                                        ${isActive 
                                            ? 'text-purple-600 bg-purple-50 ring-2 ring-purple-100' 
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </button>
                            )
                        })}
                    </div>
                )
            }

            return (
                <div 
                    key={group.id} 
                    className="relative flex items-center justify-center w-full group/item"
                >
                    <button
                        onClick={() => handleGroupClick(group.id)}
                        className={`
                            flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 relative
                            ${isGroupActive 
                                ? 'text-purple-600 bg-purple-50 ring-2 ring-purple-100 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }
                        `}
                    >
                        <DisplayIcon size={20} strokeWidth={isGroupActive ? 2.5 : 2} />
                        {/* Indicator dot if group active but collapsed */}
                        {!showFlyout && isGroupActive && (
                            <div className="absolute right-1 top-1 w-1.5 h-1.5 bg-purple-600 rounded-full" />
                        )}
                        {!isMobile && !showFlyout && (
                            <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] shadow-md">
                                {group.label}
                            </div>
                        )}
                    </button>

                    {/* Persistent Menu */}
                    <div 
                        className={`
                            absolute ${isMobile ? 'bottom-full left-1/2 -translate-x-1/2 mb-4 w-64' : 'left-full ml-4 top-0 min-w-[220px]'}
                            bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-[70]
                            transition-all duration-200 origin-center
                            ${showFlyout ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
                            flex flex-col gap-1
                        `}
                    >
                        {isMobile && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-gray-100" />}
                        {!isMobile && <div className="absolute top-4 -left-2 w-4 h-4 bg-white rotate-45 border-b border-l border-gray-100" />}

                        {/* Menu Header */}
                        <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-gray-100">
                            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">{group.label}</span>
                            <button 
                                onClick={handleCloseGroup}
                                className="p-1.5 -mr-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Close Menu"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Tools List */}
                        <div className="flex flex-col gap-1">
                            {group.tools.map(tool => {
                                const SubIcon = tool.icon;
                                const isSubActive = activeTool === tool.id;
                                return (
                                    <button
                                        key={tool.id}
                                        onClick={(e) => { e.stopPropagation(); handleToolClick(tool.id); }}
                                        className={`
                                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all w-full text-left group/tool
                                            ${isSubActive ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                        `}
                                    >
                                        <SubIcon size={18} className={isSubActive ? 'text-purple-600' : 'text-gray-400 group-hover/tool:text-gray-700'} />
                                        <span className="text-sm">{tool.label}</span>
                                        {isSubActive && <div className="ml-auto w-1.5 h-1.5 bg-purple-600 rounded-full" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default Toolbar;
