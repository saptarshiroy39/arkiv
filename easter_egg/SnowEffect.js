// Snow Effect Easter Egg Component
// 1. Creates falling snowflakes animation overlay


function SnowEffect({ enabled }) {
    const [snowflakes, setSnowflakes] = React.useState([]);
    
    React.useEffect(() => {
        if (!enabled) {
            setSnowflakes([]);
            return;
        }
        
        // Create snowflake with depth-based properties (parallax effect)
        const createSnowflake = () => {
            const depth = Math.random(); // 0 = far/slow, 1 = near/fast
            return {
                id: Math.random(),
                x: Math.random() * 100,
                // Size based on depth: far = tiny (2px), near = larger (6px)
                size: 2 + depth * 4,
                // Opacity based on depth: far = faint, near = bright
                opacity: 0.3 + depth * 0.7,
                // Speed based on depth: far = slow (4s), near = fast (8s)
                duration: 12 - depth * 8,
                // Blur based on depth: far = blurry, near = sharp
                blur: 2 - depth * 1.5,
                // Random horizontal drift amount
                drift: (Math.random() - 0.5) * 30,
                // Animation delay for staggered start
                delay: Math.random() * 5
            };
        };
        
        // Initialize with more snowflakes for density
        const initial = Array.from({ length: 100 }, createSnowflake);
        setSnowflakes(initial);
        
        // Add new snowflakes to maintain density
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
