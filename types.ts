
export enum ToolType {
  SELECT = 'SELECT',
  HAND = 'HAND',
  PEN = 'PEN',
  HIGHLIGHTER = 'HIGHLIGHTER',
  ERASER = 'ERASER',
  NOTE = 'NOTE',
  TEXT = 'TEXT',
  SHAPE = 'SHAPE',
  TABLE = 'TABLE',
  CHART = 'CHART', // New
  IMAGE = 'IMAGE',
  LINE = 'LINE',
  CODE = 'CODE',
  CHECKBOX = 'CHECKBOX',
  STICKER = 'STICKER'
}

export enum ShapeType {
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  TRIANGLE = 'TRIANGLE',
  STAR = 'STAR',
  DIAMOND = 'DIAMOND',
  HEXAGON = 'HEXAGON',
  BUBBLE = 'BUBBLE',
  ARROW = 'ARROW'
}

export enum ChartType {
    BAR = 'BAR',
    PIE = 'PIE',
    LINE = 'LINE'
}

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  x: number;
  y: number;
  rotation: number;
  isSelected?: boolean;
}

export interface PathElement extends BaseElement {
  type: 'path';
  points: Point[];
  color: string;
  strokeWidth: number;
  isEraser?: boolean;
  isHighlighter?: boolean;
}

export interface NoteElement extends BaseElement {
  type: 'note';
  text: string;
  color: string;
  width: number;
  height: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight?: string; // 'normal' | 'bold'
  fontStyle?: string; // 'normal' | 'italic'
  textDecoration?: string; // 'none' | 'underline'
  align?: 'left' | 'center' | 'right';
  width: number;
  height: number;
}

export interface CodeElement extends BaseElement {
  type: 'code';
  text: string;
  language: string;
  width: number;
  height: number;
  fontSize: number;
}

export interface CheckboxItem {
    id: string;
    text: string;
    checked: boolean;
}

export interface CheckboxElement extends BaseElement {
  type: 'checkbox';
  items: CheckboxItem[];
  width: number;
  height: number;
  color: string; // Background color of the list container
}

export interface StickerElement extends BaseElement {
  type: 'sticker';
  content: string; // The emoji or svg path
  width: number;
  height: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  color: string;
  width: number;
  height: number;
}

export interface ChartElement extends BaseElement {
    type: 'chart';
    chartType: ChartType;
    data: number[];
    labels: string[];
    color: string;
    width: number;
    height: number;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  data: string[][];
  width: number;
  height: number;
  borderColor: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  width: number;
  height: number;
}

export type CanvasElement = PathElement | NoteElement | TextElement | ShapeElement | ImageElement | TableElement | CodeElement | CheckboxElement | StickerElement | ChartElement;

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

export type ProjectType = 'FREEHAND' | 'PRESENTATION' | 'BANNER' | 'POST' | 'A4';

export interface CanvasConfig {
    type: ProjectType;
    width?: number; 
    height?: number; 
    name: string;
}

export interface Project {
    id: number | string;
    title: string;
    type: ProjectType;
    displayType: string; 
    date: string;
    owner: string;
    thumbnail: string;
    starred: boolean;
}

export type BackgroundPattern = 'NONE' | 'GRID' | 'DOTS' | 'LINES';

export interface Page {
    id: string;
    elements: CanvasElement[];
    backgroundColor: string;
    backgroundPattern: BackgroundPattern;
    guides?: RulerGuide[]; // Persisted manual guides
}

// Better structure for manual guides
export interface RulerGuide {
    type: 'horizontal' | 'vertical';
    pos: number;
}

export interface AlignmentGuide {
    type: 'vertical' | 'horizontal' | 'gap-x' | 'gap-y';
    pos: number; // For vertical/horizontal: the axis position. For gaps: the perpendicular axis position.
    min: number; // Start of the guide line
    max: number; // End of the guide line
    gapSize?: number; // The numeric value of the gap to display
    start?: number; // Optional start for visualization
    end?: number; // Optional end for visualization
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
}
