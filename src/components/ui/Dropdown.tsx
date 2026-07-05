import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight } from '../../lib/icons';

export interface DropdownItem {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  items?: DropdownItem[]; // Nested sub-list items
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  
  // Submenu states
  const [activeSubIndex, setActiveSubIndex] = useState<number | null>(null);
  const [subCoords, setSubCoords] = useState({ top: 0, left: 0 });
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const subMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (subMenuTimeoutRef.current) clearTimeout(subMenuTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const top = rect.bottom + 4; // 4px gap
      
      const menuWidth = 180;
      let left = align === 'right' 
        ? rect.right - menuWidth
        : rect.left;

      // Keep it within screen boundaries
      if (left < 10) left = 10;
      if (left + menuWidth > window.innerWidth - 10) {
        left = window.innerWidth - menuWidth - 10;
      }

      // Check if it goes off bottom of screen; if so, open upwards
      const estimatedHeight = items.length * 36 + 8; // 36px per item + 8px padding
      let finalTop = top;
      if (top + estimatedHeight > window.innerHeight - 10) {
        finalTop = rect.top - estimatedHeight - 4;
      }

      setCoords({ top: finalTop, left });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, align, items.length]);

  useEffect(() => {
    if (!open) {
      setActiveSubIndex(null);
      return;
    }
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (triggerRef.current && triggerRef.current.contains(target)) ||
        (menuRef.current && menuRef.current.contains(target)) ||
        document.getElementById('dropdown-portal-submenu')?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleItemMouseEnter = (index: number, item: DropdownItem) => {
    if (subMenuTimeoutRef.current) {
      clearTimeout(subMenuTimeoutRef.current);
      subMenuTimeoutRef.current = null;
    }
    
    if (item.items) {
      setActiveSubIndex(index);
      const btn = itemRefs.current[index];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        let left = rect.right + 2;
        const subMenuWidth = 180;
        
        if (left + subMenuWidth > window.innerWidth - 10) {
          left = rect.left - subMenuWidth - 2;
        }
        
        const subEstimatedHeight = item.items.length * 36 + 8;
        let finalTop = rect.top - 4;
        if (finalTop + subEstimatedHeight > window.innerHeight - 10) {
          finalTop = rect.bottom - subEstimatedHeight + 4;
          if (finalTop < 10) finalTop = 10;
        }

        setSubCoords({ top: finalTop, left });
      }
    } else {
      setActiveSubIndex(null);
    }
  };

  const handleMenuMouseLeave = () => {
    subMenuTimeoutRef.current = setTimeout(() => {
      setActiveSubIndex(null);
    }, 200);
  };

  const handleSubMenuMouseEnter = () => {
    if (subMenuTimeoutRef.current) {
      clearTimeout(subMenuTimeoutRef.current);
      subMenuTimeoutRef.current = null;
    }
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div 
        className="cursor-pointer flex items-center" 
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {trigger}
      </div>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          className="z-50 min-w-[180px] bg-surface border border-outline-variant rounded-xl shadow-lg py-1 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={handleMenuMouseLeave}
        >
          {items.map((item, i) => (
            <button
              key={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              type="button"
              onMouseEnter={() => handleItemMouseEnter(i, item)}
              onClick={(e) => {
                e.stopPropagation();
                if (item.items) return;
                item.onClick?.();
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-body-md transition-colors text-left
                ${item.danger ? 'text-error hover:bg-red-50' : 'text-on-surface hover:bg-surface-container-low'}
                ${activeSubIndex === i ? 'bg-surface-container-low' : ''}`}
            >
              <div className="flex items-center gap-2">
                {item.icon && <span className="h-4 w-4 shrink-0 flex items-center justify-center">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
              {item.items && <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant" />}
            </button>
          ))}
        </div>,
        document.body
      )}

      {open && activeSubIndex !== null && items[activeSubIndex]?.items && createPortal(
        <div
          id="dropdown-portal-submenu"
          style={{
            position: 'fixed',
            top: `${subCoords.top}px`,
            left: `${subCoords.left}px`,
          }}
          className="z-[60] min-w-[180px] bg-surface border border-outline-variant rounded-xl shadow-lg py-1 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={handleSubMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          {items[activeSubIndex].items!.map((subItem, j) => (
            <button
              key={j}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                subItem.onClick?.();
                setOpen(false);
                setActiveSubIndex(null);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-body-md transition-colors text-left
                ${subItem.danger ? 'text-error hover:bg-red-50' : 'text-on-surface hover:bg-surface-container-low'}`}
            >
              {subItem.icon && <span className="h-4 w-4 shrink-0 flex items-center justify-center">{subItem.icon}</span>}
              <span>{subItem.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
