export const growthStages = [
  {
    name: 'Paper Trade',
    title: 'Paper Trade',
    copy: 'Invest without spending real money. Practice buying and selling women-led stocks with $10,000 in practice cash.',
    path: '/paper-trading',
  },
  {
    name: 'Mock Fidelity',
    title: 'Mock Fidelity',
    copy: 'See a real brokerage account synced into Rooted, and get comfortable reading real holdings and balances.',
    path: '/mock-fidelity',
  },
  {
    name: 'AI Assistant',
    title: 'AI Assistant',
    copy: 'Ask questions about your portfolio, startups, and the market, and get answers grounded in your real data.',
    path: '/investment-chatbot',
  },
  {
    name: 'Salary Negotiation',
    title: 'Salary Negotiation',
    copy: 'Practice negotiating a real job offer with an AI hiring manager, and get coaching feedback after every reply.',
    path: '/salary-negotiation',
  },
  {
    name: 'Startups',
    title: 'Startups',
    copy: 'Discover women-founded startups looking for support, or bring your own idea to the community.',
    path: '/startups',
  },
  {
    name: 'Forum',
    title: 'Forum',
    copy: 'Connect with a community of investors further along the path, and share what you have learned.',
    path: '/forum',
  },
]

export const stats = [
  {
    target: 1,
    decimals: 0,
    suffix: '%',
    label: 'of U.S. VC funding in 2024 went to startups with all-women founding teams.',
    source: 'PitchBook, 2024 US All In Report',
  },
  {
    target: 15,
    decimals: 0,
    suffix: '%',
    label: "of Y Combinator's Summer 2022 batch had a woman founder.",
    source: 'Y Combinator / TechCrunch, 2022',
  },
  {
    target: 19.9,
    decimals: 1,
    suffix: '%',
    label: 'of U.S. VC deal value went to startups with at least one female founder in 2024.',
    source: 'PitchBook, 2024 US All In Report',
  },
  {
    target: 85,
    decimals: 0,
    suffix: '%',
    label: 'of the average hourly earnings of men is what women earn on average.',
    source: 'Pew Research Center, 2024',
  },
  {
    target: 30,
    decimals: 0,
    suffix: '%',
    label: 'of women feel very confident in their investment decisions, compared to 45% of men.',
    source: 'National Financial Capability Study, 2025',
  },
  {
    target: 43,
    decimals: 0,
    suffix: '%',
    label: 'of combined retirement savings held by average male and female 401(k) savers is held by women.',
    source: 'Vanguard 401(k) data via CNBC, 2025',
  },
]

export const startupStages = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Growth']

export const startups = [
  {
    name: 'Verdant Health',
    tag: 'Biotech',
    one: "Diagnostics for conditions under-researched in women's health.",
    meta: 'Seed - raising $500K',
    stage: 'Seed',
    detail: 'Building cheaper diagnostic panels for clinics that need faster answers and fewer referral delays.',
    people: ['Priya Anand - CEO', 'Mina Chow - Clinical Lead', 'Rachel Kim - Product'],
    jobs: [{ title: 'Clinical Research Intern', req: 'Biology background, 6 hrs/week' }],
    evaluation: {
      score: 8,
      verdict: 'Strong',
      upside: 'Clear clinical need with focused early customers.',
      risk: 'Clinical validation may slow sales.',
      next: 'Pilot with 3 local clinics.',
    },
  },
  {
    name: 'Ledger & Loom',
    tag: 'Fintech',
    one: 'Payroll infrastructure for independent and gig-economy earners.',
    meta: 'Pre-seed - raising $250K',
    stage: 'Pre-seed',
    detail: 'Turning irregular gig payments into clear pay stubs, tax buckets, and simple savings flows.',
    people: ['Dana Okafor - Founder', 'Sofia Chen - Engineering', 'Nora Patel - Design'],
    jobs: [{ title: 'Frontend Fellow', req: 'React basics, fintech curiosity' }],
    evaluation: {
      score: 7,
      verdict: 'Promising',
      upside: 'Large worker base with repeat weekly use.',
      risk: 'Needs trust and compliance from day one.',
      next: 'Launch beta with 50 gig workers.',
    },
  },
  {
    name: 'Canopy Climate',
    tag: 'Climate',
    one: 'Carbon accounting software for small manufacturers.',
    meta: 'Series A - closed',
    stage: 'Series A',
    detail: 'Helping small manufacturers track emissions without needing a full sustainability team.',
    people: ['Lucia Reyes - CEO', 'Samira Evans - Data', 'Talia Stone - Sales'],
    jobs: [],
    evaluation: {
      score: 9,
      verdict: 'High conviction',
      upside: 'Strong regulation tailwinds and paid customers.',
      risk: 'Crowded carbon software market.',
      next: 'Expand into supplier reporting.',
    },
  },
  {
    name: 'Marrow Materials',
    tag: 'Hardware',
    one: 'Biodegradable packaging from mycelium composites.',
    meta: 'Seed - raising $400K',
    stage: 'Seed',
    detail: 'Growing protective packaging that can replace foam inserts for local shipping partners.',
    people: ['Mei Tanaka - Founder', 'Iris Cole - Lab Ops', 'Hannah Wu - Supply Chain'],
    jobs: [{ title: 'Materials Lab Assistant', req: 'Lab safety training preferred' }],
    evaluation: {
      score: 7,
      verdict: 'Promising',
      upside: 'Physical product with clear sustainability appeal.',
      risk: 'Manufacturing scale and unit cost.',
      next: 'Secure one recurring packaging buyer.',
    },
  },
  {
    name: 'Fieldnote',
    tag: 'AI',
    one: 'Voice-to-structured-data tool for fieldwork researchers.',
    meta: 'Pre-seed - raising $150K',
    stage: 'Pre-seed',
    detail: 'Converting messy field recordings into clean notes, tags, and datasets for research teams.',
    people: ['Amara Bello - Founder', 'June Ellis - ML', 'Riya Singh - Research'],
    jobs: [{ title: 'Research Ops Intern', req: 'Comfort organizing interviews' }],
    evaluation: {
      score: 8,
      verdict: 'Strong',
      upside: 'Clear workflow pain for research teams.',
      risk: 'Accuracy needs to beat general AI tools.',
      next: 'Ship export integrations.',
    },
  },
  {
    name: 'Harbor Supply Co.',
    tag: 'Consumer',
    one: 'Direct-trade sourcing platform connecting small farms to retailers.',
    meta: 'Seed - raising $300K',
    stage: 'Seed',
    detail: 'Making it easier for small farms to sell directly into neighborhood grocers and cafes.',
    people: ['Ines Duarte - CEO', 'Marta Ruiz - Partnerships', 'Leah Brooks - Operations'],
    jobs: [],
    evaluation: {
      score: 6,
      verdict: 'Early',
      upside: 'Useful local supply network if liquidity grows.',
      risk: 'Marketplace growth is slow without dense supply.',
      next: 'Concentrate on one city.',
    },
  },
]

export const founders = [
  { name: 'Priya Anand', tag: 'Biotech', one: 'Ex-Genentech researcher, 2 patents pending in diagnostics.', meta: 'Austin, TX' },
  { name: 'Dana Okafor', tag: 'Fintech', one: 'Former Stripe engineer building payroll tools for gig workers.', meta: 'Brooklyn, NY' },
  { name: 'Lucia Reyes', tag: 'Climate', one: 'Environmental engineer turned founder and MIT Climate fellow.', meta: 'Boston, MA' },
  { name: 'Mei Tanaka', tag: 'Hardware', one: 'Materials scientist with a patent in composite biomaterials.', meta: 'Seattle, WA' },
  { name: 'Amara Bello', tag: 'AI', one: 'NLP researcher, previously at a Series B applied-AI startup.', meta: 'San Francisco, CA' },
  { name: 'Ines Duarte', tag: 'Consumer', one: 'Second-time founder who exited a DTC brand in 2023.', meta: 'Chicago, IL' },
]

export const starterPrompts = [
  'What is an ETF?',
  'How should a beginner start investing?',
  'What is the difference between stocks and index funds?',
  'How do I understand risk in my portfolio?',
  'How can investing support career independence?',
  'How should I think about saving vs investing?',
]

export const mockCareerProfile = {
  name: 'Demo User',
  currentRole: 'Marketing Coordinator',
  currentSalary: 58000,
  yearsExperience: 2,
  offer: {
    company: 'Brightline Analytics',
    role: 'Senior Marketing Coordinator',
    hiringManagerName: 'Jordan',
    baseSalary: 64000,
    signingBonus: 1500,
    equity: '0.02% RSUs vesting over 4 years',
    benefits: '401(k) with 4% match, health/dental/vision, unlimited PTO',
    startDate: 'in 3 weeks',
  },
  marketBenchmark: 71000,
}

export const mockFidelity = {
  provider: 'mock_fidelity',
  accountHolder: 'Demo User',
  accounts: [
    {
      type: 'Individual Brokerage',
      value: 42850.75,
      cash: 2355.87,
      positions: [
        ['AAPL', 'Apple', 'stock', 2622, 6.12],
        ['MSFT', 'Microsoft', 'stock', 8949.6, 20.89],
        ['VOO', 'Vanguard S&P 500 ETF', 'etf', 11328.8, 26.44],
        ['FSKAX', 'Fidelity Total Market Index', 'mutual fund', 9099.23, 21.23],
      ],
    },
    {
      type: 'Roth IRA',
      value: 18425.12,
      cash: 1100,
      positions: [
        ['VOO', 'Vanguard S&P 500 ETF', 'etf', 10195.92, 55.34],
        ['FSKAX', 'Fidelity Total Market Index', 'mutual fund', 7131.08, 38.7],
      ],
    },
  ],
}
