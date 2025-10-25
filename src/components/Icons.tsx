import React from 'react';

// A simple logo - can be replaced with a more complex SVG
export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
    </svg>
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19 11h-1.7c0-.94-.47-1.78-1.21-2.32.39-.23.83-.34 1.31-.34.48 0 .92.11 1.31.34C19.53 9.22 20 10.06 20 11h-1zM4 11c0-1.2.66-2.25 1.63-2.82.3-.18.63-.29.97-.34v2.54c-.1.02-.19.05-.28.08-.6.21-1.02.76-1.02 1.46V12h2v-1c0-.94.47-1.78 1.21-2.32C8.13 8.1 7.6 8 7 8c-2.21 0-4 1.79-4 4h1z" opacity=".3"/>
        <path d="M12 4c-3.31 0-6 2.69-6 6v2c0 1.2.66 2.25 1.63 2.82.3-.18.63-.29.97-.34V12c0-2.21 1.79-4 4-4s4 1.79 4 4v2.54c.34.05.67.16.97.34C17.34 14.25 18 13.2 18 12V10c0-3.31-2.69-6-6-6zm-5 7H4v1c0 1.2.66 2.25 1.63 2.82.3-.18.63-.29.97-.34V12c0-.7-.42-1.25-1.02-1.46-.09-.03-.18-.06-.28-.08zM19 11h-1c0-.94-.47-1.78-1.21-2.32.39-.23.83-.34 1.31-.34.48 0 .92.11 1.31.34C19.53 9.22 20 10.06 20 11zm-8 3c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-2.5 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 16 14.5 16s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
);

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
);

export const CitationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}>
        <path d="M4.743 2.256A1.25 1.25 0 0 0 3.5 1H2.75a.75.75 0 0 0 0 1.5h.19l1.21 2.422a1.25 1.25 0 0 0-.25 2.21l-1.08.27a.75.75 0 0 0-.52 1.01l1 2.5a.75.75 0 0 0 1.01.52l2.36-1.417a1.25 1.25 0 0 0 2.16 0l2.36 1.417a.75.75 0 0 0 1.01-.52l1-2.5a.75.75 0 0 0-.52-1.01l-1.08-.27a1.25 1.25 0 0 0-.25-2.21L13.06 2.5H13.25a.75.75 0 0 0 0-1.5h-.75a1.25 1.25 0 0 0-1.243 1.256l-.16.638a1.25 1.25 0 0 0-2.19 0l-.16-.638ZM5.48 4.904a2.75 2.75 0 0 1 5.04 0l.48 1.922a.75.75 0 0 0 .15.43l1.08.27.18.45-1-2.5a.75.75 0 0 0-.15-.43L9.04 3.125a2.75 2.75 0 0 1-2.08 0L3.79 5.047a.75.75 0 0 0-.15.43l-1 2.5.18-.45 1.08-.27a.75.75 0 0 0 .15-.43l.48-1.922Z" />
    </svg>
);

export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
);
