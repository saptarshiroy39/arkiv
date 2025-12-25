function SnowEffect({ enabled }) {
    const [snowflakes, setSnowflakes] = React.useState([]);
    
    React.useEffect(() => {
        if (!enabled) {
            setSnowflakes([]);
            return;
        }
        
        const createSnowflake = () => {
            const depth = Math.random();
            return {
                id: Math.random(),
                x: Math.random() * 100,
                size: 2 + depth * 4,
                opacity: 0.3 + depth * 0.7,
                duration: 12 - depth * 8,
                blur: 2 - depth * 1.5,
                drift: (Math.random() - 0.5) * 30,
                delay: Math.random() * 5
            };
        };
        
        const initial = Array.from({ length: 100 }, createSnowflake);
        setSnowflakes(initial);
        
        const interval = setInterval(() => {
            setSnowflakes(prev => {
                if (prev.length < 150) {
                    return [...prev, createSnowflake()];
                }
                return prev;
            });
        }, 150);
        
        return () => clearInterval(interval);
    }, [enabled]);
    
    if (!enabled) return null;
    
    return (
        <div className="snow-container">
            {snowflakes.map(flake => (
                <div
                    key={flake.id}
                    className="snowflake"
                    style={{
                        left: `${flake.x}%`,
                        width: `${flake.size}px`,
                        height: `${flake.size}px`,
                        opacity: flake.opacity,
                        filter: `blur(${flake.blur}px)`,
                        animationDuration: `${flake.duration}s`,
                        animationDelay: `${flake.delay}s`,
                        '--drift': `${flake.drift}px`
                    }}
                />
            ))}
        </div>
    );
}
