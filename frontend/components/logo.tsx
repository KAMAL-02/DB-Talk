import { FaDatabase } from "react-icons/fa";
import clsx from "clsx";

type LogoProps = {
  iconSize?: number;
  textSize?: string;
  color?: string;
  gap?: string;
  className?: string;
  showText?: boolean;
};

const Logo = ({
  iconSize = 64,
  textSize = "text-3xl",
  color = "text-orange-500",
  gap = "gap-2",
  className,
  showText = true,
}: LogoProps) => {
  return (
    <div
      className={clsx(
        "flex items-center font-semibold select-none",
        gap,
        color,
        className
      )}
    >
      <FaDatabase size={iconSize} />
      {showText && <span className={textSize}>- TALK</span>}
    </div>
  );
};

export default Logo;

