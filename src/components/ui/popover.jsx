import * as React from "react"
import { cn } from "@/lib/utils"

const Popover = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(open !== undefined ? open : false);

  const toggle = () => {
    if (onOpenChange) onOpenChange(!isOpen);
    else setIsOpen(!isOpen);
  };

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  const active = onOpenChange ? open : isOpen;

  return (
    <div className="relative inline-block w-full">
      {React.Children.map(children, child => {
        if (child.type.displayName === "PopoverTrigger") {
          return React.cloneElement(child, { onClick: toggle, active });
        }
        if (child.type.displayName === "PopoverContent" && active) {
          return child;
        }
        return null;
      })}
      {active && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => onOpenChange ? onOpenChange(false) : setIsOpen(false)} 
        />
      )}
    </div>
  );
};

const PopoverTrigger = React.forwardRef(({ children, className, asChild, onClick, active, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e);
        if (onClick) onClick(e);
      },
      ref,
    });
  }

  return (
    <div 
      ref={ref} 
      className={cn("cursor-pointer", className)} 
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = ({ children, className, align = "center" }) => {
  const alignClass = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2";
  
  return (
    <div className={cn(
      "absolute z-50 top-full mt-2 w-auto bg-card border border-border rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 min-w-[280px] max-h-[80vh] overflow-y-auto scrollbar-hide",
      alignClass,
      className
    )}>
      {children}
    </div>
  );
};
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent }
