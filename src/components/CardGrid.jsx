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
