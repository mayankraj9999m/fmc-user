import { forwardRef } from "react"; // 1. Import forwardRef
import { navigate } from "./navigate";

const Link = forwardRef(({ className, href, children, style, onClick }, ref) => {
    const handleClick = (event) => {
        if (event.metaKey || event.ctrlKey) {
            return;
        }

        event.preventDefault();
        navigate(href);

        if (onClick) {
            onClick(event);
        }
    };

    return (
        <a
            ref={ref}
            className={className}
            href={href}
            onClick={handleClick}
            style={style}
        >
            {children}
        </a>
    );
});

// Optional: Set a display name for debugging tools
// Link.displayName = "Link";

export default Link;
