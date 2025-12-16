'use client';

import React from 'react';
import { cn } from '../../lib/utils.ts';

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
    onClick?: () => void;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div
                className="fixed inset-0"
                onClick={() => onOpenChange?.(false)}
            />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

const DialogContent: React.FC<DialogContentProps> = ({
    children,
    className = ""
}) => {
    return (
        <div className={cn(
            "w-full max-w-lg mx-4 bg-background rounded-lg border border-border p-6 shadow-xl",
            className
        )}>
            {children}
        </div>
    );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({
    children,
    className = ""
}) => {
    return (
        <div className={cn("flex flex-col space-y-1.5 mb-4", className)}>
            {children}
        </div>
    );
};

const DialogFooter: React.FC<DialogFooterProps> = ({
    children,
    className = ""
}) => {
    return (
        <div className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
            className
        )}>
            {children}
        </div>
    );
};

const DialogTitle: React.FC<DialogTitleProps> = ({
    children,
    className = ""
}) => {
    return (
        <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
            {children}
        </h2>
    );
};

const DialogDescription: React.FC<DialogDescriptionProps> = ({
    children,
    className = ""
}) => {
    return (
        <p className={cn("text-sm text-muted-foreground", className)}>
            {children}
        </p>
    );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({
    children,
    asChild = false,
    className = "",
    onClick
}) => {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{ className?: string; onClick?: () => void }>, {
            className: cn((children.props as { className?: string }).className, className),
            onClick
        });
    }

    return (
        <button onClick={onClick} className={className}>
            {children}
        </button>
    );
};

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
};
