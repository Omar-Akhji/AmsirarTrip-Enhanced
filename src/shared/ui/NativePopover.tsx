import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type NativePopoverProperties = {
  children: React.ReactNode;
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  id?: string;
  ariaLabel?: string;
};

export function NativePopover({
  children,
  trigger,
  isOpen,
  onOpenChange,
  className,
  id: preferredId,
  ariaLabel,
}: NativePopoverProperties) {
  const generatedId = useId().replaceAll(":", "");
  const popoverId = preferredId || generatedId;
  const popoverReference = useRef<HTMLDialogElement>(null);
  const triggerReference = useRef<HTMLButtonElement>(null);
  const onOpenChangeReference = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeReference.current = onOpenChange;
  }, [onOpenChange]);

  const positionPopover = () => {
    const popover = popoverReference.current;
    const triggerElement = triggerReference.current;
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

  const positionPopoverHandlerReference = useRef(positionPopover);

  useEffect(() => {
    positionPopoverHandlerReference.current = positionPopover;
  });

  useEffect(() => {
    const popover = popoverReference.current;
    if (!popover) return;

    if (isOpen) {
      try {
        if (!popover.matches(":popover-open")) {
          popover.showPopover();
          positionPopoverHandlerReference.current();
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
    const popover = popoverReference.current;
    if (!popover) return;

    const handleToggle = (event: Event) => {
      const toggleEvent = event as ToggleEvent;
      const isNewState = toggleEvent.newState === "open";
      if (isNewState !== isOpen) {
        onOpenChangeReference.current(isNewState);
      }
    };

    popover.addEventListener("toggle", handleToggle);
    return () => popover.removeEventListener("toggle", handleToggle);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const popover = popoverReference.current;
    if (!popover) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusableElements = popover.querySelectorAll<HTMLElement>(focusableSelector);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    firstFocusable?.focus();
    popover.addEventListener("keydown", handleKeyDown);
    return () => popover.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = () => positionPopoverHandlerReference.current();

    window.addEventListener("resize", handler, { passive: true });
    window.addEventListener("scroll", handler, { capture: true, passive: true });

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, { capture: true });
    };
  }, [isOpen]);

  const labelledBy = ariaLabel ? undefined : popoverId;

  return (
    <div className="relative inline-block inline-full">
      <button
        type="button"
        ref={triggerReference}
        className="cursor-pointer border-none bg-transparent p-0 inline-full"
        aria-expanded={isOpen}
        aria-controls={popoverId}
        onClick={() => onOpenChange(!isOpen)}
      >
        {trigger}
      </button>

      <dialog
        ref={popoverReference}
        id={popoverId}
        popover="auto"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy ? popoverId : undefined}
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
