import logoPath from "@assets/logo (2)_1759082671508.png";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-10 h-10" }: LogoProps) {
  return (
    <img 
      src={logoPath} 
      alt="Chef's Mind AI Logo" 
      className={className}
      data-testid="img-logo"
    />
  );
}
