import { useMemo, useState } from 'react'
import { forumPosts as initialPosts } from '../data/forumPosts.js'
import '../Forum.css'

const categories = ['Investing', 'Budgeting', 'Retirement', 'Real Estate', 'Career & Income', 'Family Finances']

const sortOptions = ['Newest', 'Most replies', 'Most liked']

const ANSWERER_TIERS = [
  { min: 10, label: 'Veteran Answerer', className: 'badgeVeteran' },
  { min: 5, label: 'Trusted Voice', className: 'badgeTrusted' },
  { min: 2, label: 'Active Member', className: 'badgeActive' },
]

function getAnswererBadge(answerCount) {
  return ANSWERER_TIERS.find((tier) => answerCount >= tier.min) ?? null
}

function AuthorName({ name, answerCount }) {
  const badge = getAnswererBadge(answerCount)
  return (
    <span className="authorName">
      {name}
      {badge && <span className={`answererBadge ${badge.className}`}>{badge.label}</span>}
    </span>
  )
}

function Forum() {
  const [posts, setPosts] = useState(initialPosts)
  const [category, setCategory] = useState('All categories')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Newest')
  const [activePostId, setActivePostId] = useState(null)
  const [showNewPost, setShowNewPost] = useState(false)
  const [likedPosts, setLikedPosts] = useState([])

  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newCategory, setNewCategory] = useState(categories[0])
  const [replyDraft, setReplyDraft] = useState('')

  const activePost = posts.find((post) => post.id === activePostId) ?? null

  const answerCountsByAuthor = useMemo(() => {
    const counts = {}
    posts.forEach((post) => {
      post.replies.forEach((reply) => {
        counts[reply.author] = (counts[reply.author] ?? 0) + 1
      })
    })
    return counts
  }, [posts])

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = posts.filter((post) => {
      const matchesCategory = category === 'All categories' || post.category === category
      const matchesSearch =
        term === '' || post.title.toLowerCase().includes(term) || post.body.toLowerCase().includes(term)
      return matchesCategory && matchesSearch
    })

    if (sort === 'Most replies') {
      result = [...result].sort((a, b) => b.replies.length - a.replies.length)
    } else if (sort === 'Most liked') {
      result = [...result].sort((a, b) => b.likes - a.likes)
    } else {
      result = [...result].sort((a, b) => b.id - a.id)
    }

    return result
  }, [posts, category, search, sort])

  function handleToggleLike(postId) {
    const alreadyLiked = likedPosts.includes(postId)
    setLikedPosts((prev) => (alreadyLiked ? prev.filter((id) => id !== postId) : [...prev, postId]))
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + (alreadyLiked ? -1 : 1) } : post,
      ),
    )
  }

  function handleSubmitNewPost(event) {
    event.preventDefault()
    if (!newTitle.trim() || !newBody.trim()) return

    const post = {
      id: Math.max(...posts.map((p) => p.id)) + 1,
      author: 'You',
      category: newCategory,
      title: newTitle.trim(),
      body: newBody.trim(),
      timestamp: 'Just now',
      likes: 0,
      replies: [],
    }

    setPosts((prev) => [post, ...prev])
    setNewTitle('')
    setNewBody('')
    setNewCategory(categories[0])
    setShowNewPost(false)
  }

  function handleSubmitReply(event) {
    event.preventDefault()
    if (!replyDraft.trim() || activePostId === null) return

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== activePostId) return post
        const reply = {
          id: Math.max(0, ...post.replies.map((r) => r.id)) + 1,
          author: 'You',
          body: replyDraft.trim(),
          timestamp: 'Just now',
          likes: 0,
        }
        return { ...post, replies: [...post.replies, reply] }
      }),
    )
    setReplyDraft('')
  }

  if (activePost) {
    return (
      <div className="forum">
        <button className="backLink" onClick={() => setActivePostId(null)}>
          ← Back to forum
        </button>

        <article className="postDetail">
          <div className="postDetailHeader">
            <span className="categoryPill">{activePost.category}</span>
            <span className="timestamp">{activePost.timestamp}</span>
          </div>
          <h1>{activePost.title}</h1>
          <p className="author">
            Posted by <AuthorName name={activePost.author} answerCount={answerCountsByAuthor[activePost.author] ?? 0} />
          </p>
          <p className="body">{activePost.body}</p>

          <button
            className={`likeButton ${likedPosts.includes(activePost.id) ? 'liked' : ''}`}
            onClick={() => handleToggleLike(activePost.id)}
          >
            ♥ {activePost.likes}
          </button>
        </article>

        <section className="replies" aria-label="Replies">
          <h2>{activePost.replies.length} {activePost.replies.length === 1 ? 'Reply' : 'Replies'}</h2>

          {activePost.replies.map((reply) => (
            <div className="replyCard" key={reply.id}>
              <div className="replyHeader">
                <strong>
                  <AuthorName name={reply.author} answerCount={answerCountsByAuthor[reply.author] ?? 0} />
                </strong>
                <span className="timestamp">{reply.timestamp}</span>
              </div>
              <p>{reply.body}</p>
            </div>
          ))}

          <form className="replyForm" onSubmit={handleSubmitReply}>
            <label htmlFor="reply">Add a reply</label>
            <textarea
              id="reply"
              placeholder="Share your experience or advice..."
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              rows={3}
            />
            <button type="submit" disabled={!replyDraft.trim()}>
              Post reply
            </button>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="forum">
      <section className="hero">
        <p className="eyebrow">Community Forum</p>
        <h1>Ask, Share, Grow</h1>
        <p className="heroText">
          A space for women to ask questions and swap real experiences about investing, budgeting, and building
          financial confidence together.
        </p>
      </section>

      <section className="controls" aria-label="Forum controls">
        <div className="controlsRow">
          <label>
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>All categories</option>
              {categories.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="searchLabel">
            Search
            <input
              type="search"
              placeholder="Search questions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <button className="newPostButton" onClick={() => setShowNewPost((prev) => !prev)}>
          {showNewPost ? 'Cancel' : '+ Ask a question'}
        </button>
      </section>

      {showNewPost && (
        <form className="newPostForm" onSubmit={handleSubmitNewPost}>
          <label htmlFor="newCategory">Category</label>
          <select id="newCategory" value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
            {categories.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <label htmlFor="newTitle">Question</label>
          <input
            id="newTitle"
            type="text"
            placeholder="What do you want to ask the community?"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
          />

          <label htmlFor="newBody">Details</label>
          <textarea
            id="newBody"
            placeholder="Add context so others can give you a helpful answer..."
            value={newBody}
            onChange={(event) => setNewBody(event.target.value)}
            rows={4}
          />

          <button type="submit" disabled={!newTitle.trim() || !newBody.trim()}>
            Post question
          </button>
        </form>
      )}

      <section className="postList" aria-label="Forum posts">
        {filteredPosts.length === 0 && <p className="empty">No questions match your filters yet.</p>}

        {filteredPosts.map((post) => (
          <article className="postCard" key={post.id} onClick={() => setActivePostId(post.id)}>
            <div className="postCardHeader">
              <span className="categoryPill">{post.category}</span>
              <span className="timestamp">{post.timestamp}</span>
            </div>
            <h2>{post.title}</h2>
            <p className="preview">{post.body}</p>
            <div className="postCardFooter">
              <span>
                Posted by <AuthorName name={post.author} answerCount={answerCountsByAuthor[post.author] ?? 0} />
              </span>
              <div className="postCardStats">
                <span>♥ {post.likes}</span>
                <span>{post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default Forum
