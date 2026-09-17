export default function EqualizerSparkline({ bars = 24 }) {
  // Pre-calibrated heights simulating high-volume infrastructure telemetry
  const pattern = [
    30, 45, 60, 40, 75, 90, 50, 65, 80, 40, 35, 70, 
    85, 95, 60, 45, 55, 70, 85, 65, 40, 50, 75, 90
  ];

  return (
    <div className="sm-equalizer-wrap" aria-label="Surveillance activity sparkline">
      {pattern.slice(0, bars).map((height, i) => {
        const isMuted = i % 3 === 0;
        return (
          <div
            key={i}
            className={`sm-equalizer-bar ${isMuted ? 'dim' : ''}`}
            style={{
              height: `${height}%`,
              opacity: 0.4 + (height / 100) * 0.6,
            }}
          />
        );
      })}
    </div>
  );
}
