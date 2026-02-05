
import { ToolType, ShapeType, ChartType } from './types';
import { MousePointer2, Hand, Pen, Eraser, StickyNote, Type, Square, Image as ImageIcon, Table, Slash, Highlighter, Layers, PlusSquare, Pencil, Code, CheckSquare, Smile, FileText, PieChart } from 'lucide-react';

export const COLORS = {
  // Classic
  BLACK: '#000000',
  GRAY: '#6b7280',
  WHITE: '#ffffff',
  // Vibrant
  RED: '#ef4444',
  ORANGE: '#f97316',
  AMBER: '#f59e0b',
  YELLOW: '#eab308',
  LIME: '#84cc16',
  GREEN: '#22c55e',
  EMERALD: '#10b981',
  TEAL: '#14b8a6',
  CYAN: '#06b6d4',
  SKY: '#0ea5e9',
  BLUE: '#3b82f6',
  INDIGO: '#6366f1',
  VIOLET: '#8b5cf6',
  PURPLE: '#a855f7',
  FUCHSIA: '#d946ef',
  PINK: '#ec4899',
  ROSE: '#f43f5e',
};

export const NOTE_COLORS = {
  YELLOW: '#fef3c7',
  BLUE: '#dbeafe',
  GREEN: '#dcfce7',
  PINK: '#fce7f3',
  PURPLE: '#f3e8ff',
  ORANGE: '#ffedd5',
  RED: '#fee2e2',
  GRAY: '#f3f4f6',
};

// Semi-transparent colors for highlighter
export const HIGHLIGHTER_COLORS = {
    YELLOW: 'rgba(253, 224, 71, 0.5)',
    GREEN: 'rgba(134, 239, 172, 0.5)',
    BLUE: 'rgba(147, 197, 253, 0.5)',
    PINK: 'rgba(249, 168, 212, 0.5)',
    ORANGE: 'rgba(253, 186, 116, 0.5)',
    PURPLE: 'rgba(216, 180, 254, 0.5)',
};

export const STICKERS = [
    '👍', '👎', '🔥', '❤️', '✅', '❌', '⭐', '💡', 
    '🎉', '🚀', '⚠️', '❓', '1️⃣', '2️⃣', '3️⃣', '💯',
    '😊', '🤔', '😎', '🎓', '📚', '✏️', '💻', '⏰'
];

export const FONTS = [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Kalam', value: 'Kalam, cursive' },
    { label: 'Roboto Slab', value: '"Roboto Slab", serif' },
    { label: 'Playfair', value: '"Playfair Display", serif' },
    { label: 'Oswald', value: 'Oswald, sans-serif' },
    { label: 'Merriweather', value: 'Merriweather, serif' },
    { label: 'Monospace', value: '"Fira Code", monospace' },
    { label: 'Comic', value: '"Comic Sans MS", "Chalkboard SE", sans-serif' },
    { label: 'System', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
];

export const BACKGROUND_COLORS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Paper', value: '#f9f9f7' },
  { label: 'Graph', value: '#f0f4f8' },
  { label: 'Dark', value: '#1a1a1a' },
  { label: 'Mint', value: '#ecfdf5' },
  { label: 'Rose', value: '#fff1f2' },
  { label: 'Blue', value: '#eff6ff' },
];

export const BACKGROUND_GRADIENTS = [
    { label: 'Sunset', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
    { label: 'Ocean', value: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)' },
    { label: 'Cool', value: 'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)' },
    { label: 'Warm', value: 'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)' },
    { label: 'Neon', value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
    { label: 'Dusk', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
];

export const PATTERNS = [
    { label: 'None', value: 'NONE' },
    { label: 'Grid', value: 'GRID' },
    { label: 'Dots', value: 'DOTS' },
    { label: 'Lines', value: 'LINES' },
];

// Organized Tool Groups
export const TOOL_GROUPS = [
    {
        id: 'essential',
        label: 'Basics',
        tools: [
            { id: ToolType.SELECT, icon: MousePointer2, label: 'Select' },
            { id: ToolType.HAND, icon: Hand, label: 'Pan' },
        ]
    },
    {
        id: 'draw',
        label: 'Ink & Eraser',
        icon: Pencil,
        tools: [
            { id: ToolType.PEN, icon: Pen, label: 'Pen' },
            { id: ToolType.HIGHLIGHTER, icon: Highlighter, label: 'Highlighter' },
            { id: ToolType.ERASER, icon: Eraser, label: 'Eraser' },
        ]
    },
    {
        id: 'content',
        label: 'Text & Lists',
        icon: Type,
        tools: [
            { id: ToolType.TEXT, icon: Type, label: 'Text' },
            { id: ToolType.NOTE, icon: StickyNote, label: 'Sticky Note' },
            { id: ToolType.CHECKBOX, icon: CheckSquare, label: 'To-do List' },
            { id: ToolType.CODE, icon: Code, label: 'Code Block' },
        ]
    },
    {
        id: 'visual',
        label: 'Elements',
        icon: Square,
        tools: [
            { id: ToolType.SHAPE, icon: Square, label: 'Shapes' },
            { id: ToolType.CHART, icon: PieChart, label: 'Charts' },
            { id: ToolType.STICKER, icon: Smile, label: 'Stickers' },
            { id: ToolType.LINE, icon: Slash, label: 'Line' },
            { id: ToolType.IMAGE, icon: ImageIcon, label: 'Image' },
            { id: ToolType.TABLE, icon: Table, label: 'Table' },
        ]
    }
];

export const STROKE_WIDTHS = [2, 4, 8, 12, 16, 24];
export const FONT_SIZES = [16, 24, 32, 48, 64, 96, 128, 160, 200];

export const SHAPES = [
    { id: ShapeType.RECTANGLE, label: 'Rectangle' },
    { id: ShapeType.CIRCLE, label: 'Circle' },
    { id: ShapeType.TRIANGLE, label: 'Triangle' },
    { id: ShapeType.STAR, label: 'Star' },
    { id: ShapeType.DIAMOND, label: 'Diamond' },
    { id: ShapeType.HEXAGON, label: 'Hexagon' },
    { id: ShapeType.BUBBLE, label: 'Speech' },
    { id: ShapeType.ARROW, label: 'Arrow' },
];

export const CHARTS = [
    { id: ChartType.BAR, label: 'Bar Chart' },
    { id: ChartType.PIE, label: 'Pie Chart' },
    { id: ChartType.LINE, label: 'Line Chart' },
];
