function AboutTab() {
    const version = '1.0.0';
    
    const sections = [
        {
            title: 'Support',
            items: [
                { icon: 'mail-opened', label: 'Email Us', href: 'mailto:saptarshiroy404@gmail.com' },
                { icon: 'brand-github', label: 'GitHub Repo', href: 'https://github.com/saptarshiroy39/Arkiv' },
                { icon: 'bug', label: 'Report Bug', href: 'https://github.com/saptarshiroy39/Arkiv/issues' }
            ]
        },
        {
            title: 'Social',
            items: [
                { icon: 'brand-x', label: 'X', href: 'https://x.com/saptarshiroy39' },
                { icon: 'brand-instagram', label: 'Instagram', href: 'https://www.instagram.com/saptarshiroy39/' },
                { icon: 'brand-linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/saptarshiroy39/' },
                { icon: 'brand-discord', label: 'Discord', href: 'https://discordapp.com/users/rishi_39' }
            ]
        }
    ];

    const open = (url) => window.open(url, '_blank', 'noopener,noreferrer');

    return (
        <div className="settings-tab">
            {sections.map((s, i) => (
                <div className="settings-section" key={i}>
                    <h2 className="settings-section-title">{s.title}</h2>
                    <div className="about-links-list">
                        {s.items.map((item, j) => (
                            <button key={j} className="about-link-item" onClick={() => open(item.href)}>
                                <div className="about-link-left">
                                    <i className={`ti ti-${item.icon}`} style={{fontSize: 18}}></i>
                                    <span>{item.label}</span>
                                </div>
                                <i className="ti ti-external-link" style={{fontSize: 16, color: '#525252'}}></i>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
