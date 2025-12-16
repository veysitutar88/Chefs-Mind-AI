'use client';

import React from 'react';
import { Button } from './button';
import { Card } from './card';

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

interface AlertDialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({
  children,
  className = ""
}) => {
  return (
    <Card className={`w-full max-w-lg mx-4 ${className}`}>
      {children}
    </Card>
  );
};

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ children }) => {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
};

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ children }) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
      {children}
    </div>
  );
};

const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({
  children,
  className = ""
}) => {
  return (
    <h3 className={`text-lg font-semibold ${className}`}>
      {children}
    </h3>
  );
};

const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({
  children,
  className = ""
}) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
};

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({
  children,
  onClick,
  className = "",
  disabled = false
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`bg-red-600 hover:bg-red-700 focus:ring-red-500 ${className}`}
    >
      {children}
    </Button>
  );
};

const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({
  children,
  asChild = false,
  className = ""
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: `${(children.props as { className?: string }).className || ''} ${className}`.trim()
    });
  }

  return (
    <Button
      className={className}
    >
      {children}
    </Button>
  );
};

const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({
  children,
  onClick,
  className = "",
  disabled = false
}) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={`mt-2 sm:mt-0 ${className}`}
    >
      {children}
    </Button>
  );
};

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
};