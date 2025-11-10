import React, { useState } from 'react';

function Quickaccess() {

    // Quick access links (top bar icons)
    const [quickLinks] = useState([
        { id: 'github', name: 'GitHub', url: 'https://github.com', icon: '⚫' },
        { id: 'twitter', name: 'X', url: 'https://twitter.com', icon: '✕' },
        { id: 'dribbble', name: 'Dribbble', url: 'https://dribbble.com', icon: '🎨' },
        { id: 'notion', name: 'Notion', url: 'https://notion.so', icon: '📝' },
        { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', icon: '💎' },
        { id: 'spotify', name: 'Spotify', url: 'https://spotify.com', icon: '🎵' },
    ]);

    return (
        <>
           {/* Quick Access Icons */}
            <div className='flex justify-center mt-12'>
                <div className='flex items-center gap-8 bg-white px-12 py-4 rounded-2xl border border-gray-200 shadow-sm'>
                {quickLinks.map((link) => (
                    <a
                    key={link.id}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex flex-col items-center gap-2 group'
                    title={link.name}
                    >
                    <div className='w-12 h-12 flex items-center justify-center bg-gray-900 rounded-xl text-white text-2xl hover:scale-110 transition-transform'>
                        {link.icon}
                    </div>
                    </a>
                ))}
                </div>
            </div>
        </>
    )
}

export default Quickaccess