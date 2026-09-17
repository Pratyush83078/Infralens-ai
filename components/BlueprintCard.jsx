export default function BlueprintCard({
  title,
  meta,
  index,
  children,
  className = '',
}) {
  return (
    <div className={`sm-card ${className}`}>
      {/* Precision Drafting Corner Registration Brackets ┌ ┐ └ ┘ */}
      <span className="sm-corner-bracket sm-corner-tl" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-tr" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-bl" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-br" aria-hidden="true" />

      {/* Card Header Strip */}
      {(title || meta || index) && (
        <div className="sm-card-top-strip">
          <div className="sm-card-eyebrow-wrap">
            {title && <div className="sm-card-title">{title}</div>}
            {meta && <div className="sm-card-meta">{meta}</div>}
          </div>
          {index && <div className="sm-card-index">{index}</div>}
        </div>
      )}

      {children}
    </div>
  );
}
