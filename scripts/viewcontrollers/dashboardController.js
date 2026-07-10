import { startups } from '../../src/data/rootedData.js';
import { getInvestments, onAuthChange, signOutUser, syncUserProfile } from '../services/supabaseService.js';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

function text(id, value) {
  document.getElementById(id).textContent = value;
}

function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value) element.textContent = value;
  return element;
}

function budUrl(prompt) {
  return `/investment-chatbot?prompt=${encodeURIComponent(prompt)}`;
}

function portfolioRows(investments = []) {
  return investments
    .map((row) => ({
      symbol: row.symbol,
      name: row.name,
      type: row.asset_type,
      value: Number(row.value) || 0,
      allocation: Number(row.allocation_percent) || 0,
    }))
    .filter((row) => row.type !== 'cash');
}

function chooseStartup(profile = {}) {
  const text = `${profile.goals || ''} ${profile.occupation || ''}`.toLowerCase();
  if (text.includes('health')) return startups.find((startup) => startup.tag === 'Biotech') || startups[0];
  if (text.includes('climate')) return startups.find((startup) => startup.tag === 'Climate') || startups[0];
  if (text.includes('tech') || text.includes('ai')) return startups.find((startup) => startup.tag === 'AI') || startups[0];
  return startups.find((startup) => startup.evaluation?.score >= 9) || startups[0];
}

function buildRecommendations(profile = {}, investments = []) {
  const salary = Number(profile.salary) || 0;
  const spending = Number(profile.monthlySpending) || 0;
  const monthlyIncome = salary / 12;
  const leftover = monthlyIncome - spending;
  const goal = String(profile.goals || '').toLowerCase();
  const isLongTerm = goal.includes('long');
  const monthlyRoom = Math.max(0, leftover * (isLongTerm ? 0.35 : 0.2));
  const rows = portfolioRows(investments);
  const symbols = new Set(rows.map((row) => row.symbol));
  const hasBroadFund = ['VOO', 'VTI', 'FSKAX'].some((symbol) => symbols.has(symbol));
  const startup = chooseStartup(profile);
  const leftoverText = money.format(Math.max(0, leftover));
  const monthlyText = money.format(monthlyRoom);

  const summary = leftover > 0
    ? `Based on salary, monthly spending, and linked Fidelity holdings, about ${monthlyText}/mo could be reviewed for investing after bills and cash reserves.`
    : 'Based on salary and monthly spending, focus on freeing up cash before adding new investments.';

  return {
    summary,
    cards: [
      {
        type: hasBroadFund ? 'Stocks' : 'ETF / stocks',
        title: hasBroadFund ? 'Small stock watchlist' : 'Build a broad ETF core',
        body: hasBroadFund
          ? `Your linked portfolio already has broad funds, so individual stock ideas should stay smaller than the core.`
          : `With ${leftoverText} left after monthly spending, a broad ETF can diversify before single-stock picks.`,
        picks: hasBroadFund ? ['AMD', 'ELV', 'C'] : ['VOO', 'VTI', 'FSKAX'],
        path: '/trade',
        prompt: hasBroadFund
          ? 'Explain how to add individual stocks as a small satellite around broad funds.'
          : 'Explain what a broad ETF is and why it can be a beginner-friendly core holding.',
      },
      {
        type: 'Crypto',
        title: isLongTerm ? 'Crypto watchlist' : 'Keep crypto small',
        body: isLongTerm
          ? `If crypto fits your risk tolerance, keep it a small slice and start by learning BTC and ETH.`
          : `For short-term goals, crypto is better as a watchlist than a place for money you may need soon.`,
        picks: ['BTC', 'ETH', 'SOL'],
        path: '/crypto',
        prompt: 'Explain beginner crypto risk, BTC vs ETH, and how small crypto allocations are usually sized.',
      },
      {
        type: 'Startups',
        title: `${startup.name} watchlist`,
        body: `${startup.one} Startup investing is illiquid, so treat it as a high-risk learning list before committing cash.`,
        picks: [startup.name, startup.tag, startup.evaluation?.verdict || startup.stage],
        path: '/startups',
        prompt: `Explain the risk and upside of ${startup.name} compared with public stocks and ETFs.`,
      },
    ],
  };
}

class DashboardController {
  constructor() {
    this.newsForm = document.getElementById('market-news-form');
    this.newsInput = document.getElementById('market-news-query');
    this.newsStatus = document.getElementById('market-news-status');
    this.newsList = document.getElementById('market-news-list');
    this.recommendationSummary = document.getElementById('recommendation-summary');
    this.recommendationList = document.getElementById('recommendation-list');
    this.newsTimer = null;

    document.getElementById('signout-btn')?.addEventListener('click', async () => {
      await signOutUser();
      window.location.href = '/';
    });

    this.newsForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.loadNews();
    });

    this.newsInput?.addEventListener('input', () => {
      clearTimeout(this.newsTimer);
      this.newsTimer = setTimeout(() => this.loadNews(), 450);
    });

    this.loadNews();

    onAuthChange(async (user) => {
      if (!user) {
        window.location.href = '/login.html?mode=login';
        return;
      }
      try {
        const profile = await syncUserProfile(user);
        let investments = [];
        try {
          investments = await getInvestments(user);
        } catch {}
        this.render(user, profile, investments);
      } catch {
        this.render(user, { email: user.email }, []);
      }
    });
  }

  render(user, profile, investments = []) {
    const salary = Number(profile.salary) || 0;
    const spending = Number(profile.monthlySpending) || 0;
    const monthlyIncome = salary / 12;
    const leftover = monthlyIncome - spending;
    const savingsRate = monthlyIncome ? (leftover / monthlyIncome) * 100 : 0;
    const title = profile.name ? `${profile.name.split(' ')[0]}'s Dashboard` : 'Your Dashboard';

    text('dashboard-title', title);
    text('dashboard-email', profile.email || user.email || '');
    text('salary', money.format(salary));
    text('monthly-income', money.format(monthlyIncome));
    text('monthly-spending', money.format(spending));
    text('monthly-leftover', money.format(leftover));
    text('savings-rate', `${percent.format(savingsRate)}%`);
    text('profile-name', profile.name || '-');
    text('profile-birthday', profile.birthday || '-');
    text('profile-occupation', profile.occupation || '-');
    text('profile-goals', profile.goals || '-');
    text('profile-knowledge', profile.financialKnowledge || '-');
    this.renderRecommendations(profile, investments);
  }

  renderRecommendations(profile, investments) {
    if (!this.recommendationList) return;

    const recommendations = buildRecommendations(profile, investments);
    this.recommendationSummary.textContent = recommendations.summary;
    this.recommendationList.replaceChildren();

    recommendations.cards.forEach((item) => {
      const card = node('article', 'recommendation-card');
      const picks = node('div', 'recommendation-picks');
      item.picks.forEach((pick) => picks.append(node('span', '', pick)));

      const actions = node('div', 'recommendation-actions');
      const open = node('a', '', 'Open section');
      open.href = item.path;
      const ask = node('a', '', 'Learn more with Bud');
      ask.href = budUrl(item.prompt);
      actions.append(open, ask);

      card.append(
        node('span', 'tag', item.type),
        node('strong', '', item.title),
        node('p', '', item.body),
        picks,
        actions,
      );
      this.recommendationList.append(card);
    });
  }

  async loadNews() {
    if (!this.newsList) return;

    const query = this.newsInput?.value.trim() || '';
    const params = new URLSearchParams();
    if (query) params.set('q', query);

    this.newsStatus.textContent = 'Loading market news...';

    try {
      const response = await fetch(`/api/market-news${params.size ? `?${params}` : ''}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Market news unavailable.');

      this.renderNews(data.articles || []);
      this.newsStatus.textContent = data.message || (data.articles?.length ? '' : 'No Marketaux stories found.');
    } catch (error) {
      this.newsList.replaceChildren();
      this.newsStatus.textContent = error.message || 'Market news unavailable.';
    }
  }

  renderNews(articles) {
    this.newsList.replaceChildren();

    articles.forEach((article) => {
      const card = node('a', 'news-card');
      card.href = article.url;
      card.target = '_blank';
      card.rel = 'noreferrer';

      if (article.imageUrl) {
        const image = node('img');
        image.src = article.imageUrl;
        image.alt = '';
        image.loading = 'lazy';
        image.addEventListener('error', () => image.remove());
        card.append(image);
      }

      const body = node('div', 'news-body');
      const published = article.publishedAt ? date.format(new Date(article.publishedAt)) : '';
      const meta = [article.source, article.symbol, published].filter(Boolean).join(' - ');
      body.append(
        node('span', 'news-meta', meta),
        node('strong', '', article.title),
        node('p', '', article.description || article.snippet || ''),
      );
      card.append(body);
      this.newsList.append(card);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new DashboardController());
