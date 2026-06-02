import React from 'react';
import { Github } from 'lucide-react';
import InteractiveHoverButton from './interactive-hover-button';

interface ViewSourceButtonProps {
    className?: string;
    href?: string;
}

const ViewSourceButton: React.FC<ViewSourceButtonProps> = ({
    className = "",
    href = "https://github.com/jainil224/UI-HUB-"
}) => {
    return (
        <InteractiveHoverButton
            variant="dark"
            text="View Source"
            loadingText="Fetching..."
            successText="Fetched!"
            classes={className}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            icon={<Github className="h-4 w-4" />}
        />
    );
};

export default ViewSourceButton;
