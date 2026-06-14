import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type NativePopoverProps = {
  children: React.ReactNode;
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  id?: string;
};

export function NativePopover({
  children,
  trigger,
  isOpen,
  onOpenChange,
  className,
  id: preferredId,
}: NativePopoverProps) {
  const generatedId = useId().replaceAll(":", "");
  const popoverId = preferredId || generatedId;
  const popoverRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const positionPopover = () => {
    const popover = popoverRef.current;
    const triggerElement = triggerRef.current;
    if (!popover || !triggerElement || !isOpen) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.bottom + 8;
    let left = triggerRect.left;

    const popoverWidth = 340;
    const popoverHeight = 400;

    if (left + popoverWidth > viewportWidth) {
      left = Math.max(8, viewportWidth - popoverWidth - 16);
    }

    if (top + popoverHeight > viewportHeight && triggerRect.top > popoverHeight) {
      top = triggerRect.top - popoverHeight - 8;
    }

    Object.assign(popover.style, {
      position: "fixed",
      margin: "0",
      top: `${top}px`,
      left: `${left}px`,
    });
  };

  const positionPopoverHandlerRef = useRef(positionPopover);

  useEffect(() => {
    positionPopoverHandlerRef.current = positionPopover;
  });

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    if (isOpen) {
      try {
        if (!popover.matches(":popover-open")) {
          popover.showPopover();
          positionPopoverHandlerRef.current();
        }
      } catch (error) {
        console.warn("Popover error:", error);
      }
    } else {
      try {
        if (popover.matches(":popover-open")) {
          popover.hidePopover();
        }
      } catch {}
    }
  }, [isOpen]);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    const handleToggle = (event: Event) => {
      const toggleEvent = event as ToggleEvent;
      const newState = toggleEvent.newState === "open";
      if (newState !== isOpen) {
        onOpenChangeRef.current(newState);
      }
    };

    popover.addEventListener("toggle", handleToggle);
    return () => popover.removeEventListener("toggle", handleToggle);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = () => positionPopoverHandlerRef.current();

    window.addEventListener("resize", handler, { passive: true });
    window.addEventListener("scroll", handler, { capture: true, passive: true });

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, { capture: true });
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block inline-full">
      <button
        type="button"
        ref={triggerRef}
        className="cursor-pointer border-none bg-transparent p-0 inline-full"
        onClick={() => onOpenChange(!isOpen)}
      >
        {trigger}
      </button>

      <dialog
        ref={popoverRef}
        id={popoverId}
        popover="auto"
        className={cn(
          "m-0 border-none bg-transparent p-0 outline-hidden backdrop:bg-black/20",
          "fixed inset-auto",
          className,
        )}
      >
        {isOpen ?
          <div className="animate-in fade-in zoom-in-95 duration-200">{children}</div>
        : null}
      </dialog>
    </div>
  );
}
