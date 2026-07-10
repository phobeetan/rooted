function CardGrid({ items, onSelect }) {
  return (
    <div className="card-grid">
      {items.map((item) => {
        const body = (
          <>
            <span className="tag">{item.tag}</span>
            <h3>{item.name}</h3>
            <p>{item.one}</p>
            <div className="meta">{item.meta}</div>
            {(item.email || item.linkedin) && (
              <div className="contact-row">
                {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
                {item.linkedin && (
                  <a className="linkedin-icon" href={item.linkedin} aria-label={`${item.name} LinkedIn`}>
                    in
                  </a>
                )}
              </div>
            )}
          </>
        )

        return onSelect ? (
          <button className="info-card" key={item.name} type="button" onClick={() => onSelect(item)}>
            {body}
          </button>
        ) : (
          <article className="info-card" key={item.name}>
            {body}
          </article>
        )
      })}
    </div>
  )
}

export default CardGrid
