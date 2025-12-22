// About Tab Component - Contact, Links, App Info
// 1. Displays contact information, social links, and app version


function AboutTab() {
    const appVersion = '1.0.0';
    
    const links = [
        {
            title: 'Contact & Support',
            items: [
                { icon: 'mail-opened', label: 'Email Us', href: 'mailto:saptarshiroy404@gmail.com', external: true },
                { icon: 'brand-github', label: 'GitHub Repo', href: 'https://github.com/saptarshiroy39/Arkiv', external: true },
                { icon: 'bug', label: 'Report Bug', href: 'https://github.com/saptarshiroy39/Arkiv/issues', external: true }
            ]
        },
        {
            title: 'Social',
            items: [
                { icon: 'brand-x', label: 'Twitter / X', href: 'https://x.com/saptarshiroy39', external: true },
                { icon: 'brand-instagram', label: 'Instagram', href: 'https://www.instagram.com/saptarshiroy39/', external: true },
                { icon: 'brand-linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/saptarshiroy39/', external: true },
                { icon: 'brand-discord', label: 'Discord', href: 'https://discordapp.com/users/rishi_39', external: true }
            ]
        }
    ];

    const handleLinkClick = (item) => {
        if (item.external) {
            window.open(item.href, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = item.href;
        }
    };

    return (
        <div className="settings-tab">
            {/* App Info */}
            <div className="settings-section">
                <div className="about-app-header">
                    <div className="about-app-icon lava-lamp-bg">
                        <i className="ti ti-brain" style={{fontSize: 32}}></i>
                    </div>
                    <div className="about-app-info">
                        <h2 className="about-app-name">Arkiv</h2>
                        <p className="about-app-tagline">AI-powered RAG for documents</p>
                        <span className="about-app-version">Version {appVersion}</span>
                    </div>
                </div>
            </div>

            {/* Links Sections */}
            {links.map((section, idx) => (
                <div className="settings-section" key={idx}>
                    <h2 className="settings-section-title">{section.title}</h2>
                    <div className="about-links-list">
                        {section.items.map((item, itemIdx) => (
                            <button 
                                key={itemIdx}
                                className="about-link-item"
                                onClick={() => handleLinkClick(item)}
                            >
                                <div className="about-link-left">
                                    <i className={`ti ti-${item.icon}`} style={{fontSize: 18}}></i>
                                    <span>{item.label}</span>
                                </div>
                                <i className={`ti ti-${item.external ? 'external-link' : 'chevron-right'}`} style={{fontSize: 16, color: '#525252'}}></i>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Made with love */}
            <div className="settings-section">
                <div className="about-footer">
                    <p>Made with <i className="ti ti-heart-filled" style={{color: '#3b82f6', fontSize: 14}}></i> by Saptarshi Roy</p>
                    <p className="about-copyright">© 2025 Arkiv. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
