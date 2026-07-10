import { useMemo, useState } from 'react'
import '../Forum.css'

const categories = ['Investing', 'Budgeting', 'Retirement', 'Real Estate', 'Career & Income', 'Family Finances']

const initialPosts = [
  {
    id: 5,
    author: 'Priya M.',
    category: 'Investing',
    title: "How do you decide between index funds and picking individual stocks?",
    body: "I just opened my first brokerage account and I'm overwhelmed by the options. I keep hearing 'just buy an index fund' but I also want to learn how to evaluate individual companies. Is it okay to do a mix as a beginner, or should I wait until I know more?",
    timestamp: '2 hours ago',
    likes: 14,
    replies: [
      {
        id: 1,
        author: 'Devon R.',
        body: "A mix is totally fine! I keep about 90% in index funds and use the other 10% as a 'learning fund' for individual stocks I've researched. Low stakes, high learning.",
        timestamp: '1 hour ago',
        likes: 6,
      },
      {
        id: 2,
        author: 'Aisha K.',
        body: 'Seconding this. Just make sure the individual picks are money you can afford to lose while you learn.',
        timestamp: '45 min ago',
        likes: 3,
      },
      {
        id: 3,
        author: 'Maya P.',
        body: "Adding on: pick 2-3 sectors you already understand from your job or hobbies. It makes the research so much less abstract.",
        timestamp: '30 min ago',
        likes: 5,
      },
    ],
  },
  {
    id: 4,
    author: 'Sofia C.',
    category: 'Budgeting',
    title: 'What budgeting method actually stuck for you long-term?',
    body: "I've tried zero-based budgeting, the 50/30/20 rule, and a dozen apps. Nothing sticks past a month. If you've kept a system going for over a year, what does it look like?",
    timestamp: '5 hours ago',
    likes: 22,
    replies: [
      {
        id: 1,
        author: 'Nora W.',
        body: "50/30/20 but automated — I have transfers set up the day my paycheck lands so I never have to 'decide' anything. Removing the willpower step was the fix for me.",
        timestamp: '4 hours ago',
        likes: 9,
      },
      {
        id: 2,
        author: 'Maya P.',
        body: 'Same principle here, just with envelopes in a budgeting app instead of separate accounts. Automation is the real trick.',
        timestamp: '3 hours ago',
        likes: 4,
      },
    ],
  },
  {
    id: 3,
    author: 'Elena G.',
    category: 'Real Estate',
    title: 'Anyone invested in a women-led real estate fund instead of buying property directly?',
    body: "Buying a rental property feels out of reach right now, but I keep seeing REITs and smaller funds focused on women-led development projects. Has anyone actually done this and been happy with the returns?",
    timestamp: '1 day ago',
    likes: 11,
    replies: [
      {
        id: 1,
        author: 'Nora W.',
        body: 'Yes! Started with a small REIT position two years ago specifically to avoid the landlord responsibilities. Returns have been steady, not flashy.',
        timestamp: '20 hours ago',
        likes: 3,
      },
      {
        id: 2,
        author: 'Maya P.',
        body: "Same experience. It's a good on-ramp if direct ownership feels too risky right now.",
        timestamp: '18 hours ago',
        likes: 2,
      },
    ],
  },
  {
    id: 2,
    author: 'Jasmine R.',
    category: 'Family Finances',
    title: 'How much of an emergency fund do you keep with young kids?',
    body: "The standard advice is 3-6 months of expenses, but with two kids and unpredictable medical costs I never feel like it's enough. What's realistic?",
    timestamp: '2 days ago',
    likes: 18,
    replies: [
      {
        id: 1,
        author: 'Maya P.',
        body: "We keep 6 months as a floor and treat anything above that as the start of our next investment bucket, so it still feels like progress.",
        timestamp: '2 days ago',
        likes: 5,
      },
      {
        id: 2,
        author: 'Amara O.',
        body: "Same, 6 months minimum. It took us almost two years to build but it changed how we sleep at night.",
        timestamp: '1 day ago',
        likes: 4,
      },
      {
        id: 3,
        author: 'Nora W.',
        body: "6 months here too, kept in a high-yield savings account so it's still earning something while it sits.",
        timestamp: '1 day ago',
        likes: 2,
      },
    ],
  },
  {
    id: 1,
    author: 'Nora W.',
    category: 'Career & Income',
    title: 'Negotiated a raise this week — happy to share what worked',
    body: "Wanted to share in case it helps someone else: I brought a one-page summary of my impact for the year plus 3 comparable market salary sources. Got 12% more than the original offer. Ask me anything!",
    timestamp: '3 days ago',
    likes: 31,
    replies: [
      {
        id: 1,
        author: 'Priya M.',
        body: 'This is amazing, congrats! Did you ask for the raise in the room or over email?',
        timestamp: '3 days ago',
        likes: 2,
      },
      {
        id: 2,
        author: 'Maya P.',
        body: 'Love this breakdown. Saving the market-sources idea for my review next month.',
        timestamp: '2 days ago',
        likes: 1,
      },
    ],
  },
]

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
