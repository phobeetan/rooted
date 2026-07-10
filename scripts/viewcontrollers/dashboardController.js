import { onAuthChange, signOutUser, syncUserProfile } from '../services/supabaseService.js';

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

class DashboardController {
  constructor() {
    this.newsForm = document.getElementById('market-news-form');
    this.newsInput = document.getElementById('market-news-query');
    this.newsStatus = document.getElementById('market-news-status');
    this.newsList = document.getElementById('market-news-list');
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
        this.render(user, await syncUserProfile(user));
      } catch {
        this.render(user, { email: user.email });
      }
    });
  }

  render(user, profile) {
    const salary = Number(profile.salary) || 0;
    const spending = Number(profile.monthlySpending) || 0;
    const monthlyIncome = salary / 12;
    const leftover = monthlyIncome - spending;
    const savingsRate = monthlyIncome ? (leftover / monthlyIncome) * 100 : 0;
    const title = profile.name ? `${profile.name.split(' ')[0]}'s dashboard` : 'Your dashboard';

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
    text('database-status', profile.databaseStatus || `Synced to Supabase profiles/${user.id}`);
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
