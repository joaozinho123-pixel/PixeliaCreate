
import React, { useEffect, useRef } from 'react';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  zoom: number;
  offset: number; // Viewport X for horizontal, Y for vertical
  length: number; // Width or Height of the container
}

const RULER_THICKNESS = 24;
const TICK_COLOR = '#9ca3af';
const TEXT_COLOR = '#6b7280';
const BG_COLOR = '#f3f4f6';

const Ruler: React.FC<RulerProps> = ({ orientation, zoom, offset, length }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const width = orientation === 'horizontal' ? length : RULER_THICKNESS;
    const height = orientation === 'horizontal' ? RULER_THICKNESS : length;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);

    // Calculate grid step
    // We want visually ~50-100px between major numbers
    const baseStep = 50; 
    const step = baseStep / zoom; 
    
    // Find nice round number for step (10, 25, 50, 100, etc)
    const log2 = Math.log2(step);
    const roundStep = Math.pow(2, Math.ceil(log2));
    
    // Determine start coordinate in world space
    // Screen 0 = (0 - viewport.x) / zoom
    // We iterate in screen pixels to be safe, then convert to world
    
    const startWorld = -offset / zoom;
    const endWorld = startWorld + (orientation === 'horizontal' ? width : height) / zoom;

    // Snap start to grid
    const startGrid = Math.floor(startWorld / roundStep) * roundStep;

    ctx.fillStyle = TEXT_COLOR;
    ctx.strokeStyle = TICK_COLOR;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    for (let pos = startGrid; pos < endWorld; pos += roundStep) {
        // Convert world pos back to screen pos
        const screenPos = (pos * zoom) + offset;
        
        // Don't draw if off screen (padding included)
        if (screenPos < -50 || screenPos > (orientation === 'horizontal' ? width : height) + 50) continue;

        const val = Math.round(pos);

        if (orientation === 'horizontal') {
            // Major Tick
            ctx.beginPath();
            ctx.moveTo(screenPos, 0);
            ctx.lineTo(screenPos, RULER_THICKNESS);
            ctx.stroke();
            ctx.fillText(val.toString(), screenPos + 4, 2);
            
            // Subdivisions (4 per step)
            const subStep = roundStep / 4;
            for(let i=1; i<4; i++) {
                const subPos = (pos + subStep*i) * zoom + offset;
                ctx.beginPath();
                ctx.moveTo(subPos, RULER_THICKNESS - 6);
                ctx.lineTo(subPos, RULER_THICKNESS);
                ctx.stroke();
            }

        } else {
            // Vertical
            ctx.save();
            ctx.translate(0, screenPos);
            
            // Major Tick
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(RULER_THICKNESS, 0);
            ctx.stroke();
            
            // Rotate text for vertical ruler
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(val.toString(), 4, 2);
            ctx.restore();

            // Subdivisions
            const subStep = roundStep / 4;
            for(let i=1; i<4; i++) {
                const subPos = (pos + subStep*i) * zoom + offset;
                ctx.beginPath();
                ctx.moveTo(RULER_THICKNESS - 6, subPos);
                ctx.lineTo(RULER_THICKNESS, subPos);
                ctx.stroke();
            }
        }
    }
    
    // Corner line
    ctx.strokeStyle = '#d1d5db';
    if(orientation === 'horizontal') {
        ctx.beginPath(); ctx.moveTo(0, RULER_THICKNESS-0.5); ctx.lineTo(width, RULER_THICKNESS-0.5); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.moveTo(RULER_THICKNESS-0.5, 0); ctx.lineTo(RULER_THICKNESS-0.5, height); ctx.stroke();
    }

  }, [orientation, zoom, offset, length]);

  return <canvas ref={canvasRef} className="pointer-events-none block" />;
};

export default Ruler;
