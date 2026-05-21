import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  href: string;
  label: string;
  download?: string;
  className?: string;
}

export function AnimatedButton({
  href,
  label,
  download,
  className,
}: AnimatedButtonProps) {
  return (
    <a
      href={href}
      download={download}
      className={cn(
        "relative inline-flex items-center justify-start px-12 py-4 overflow-hidden font-medium transition-all bg-white rounded hover:bg-white group outline outline-1 outline-[#0D1B2A]",
        className,
      )}
    >
      <span className="w-72 h-72 rounded rotate-[-40deg] bg-[#0D1B2A] absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0" />
      <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white text-sm tracking-widest font-mono">
        {label}
      </span>
    </a>
  );
}
