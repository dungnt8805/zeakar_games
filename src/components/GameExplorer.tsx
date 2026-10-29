import React, { useMemo, useState } from 'react';
import type { Game } from '../data/games';
import type { Locale } from '../i18n/ui';
import { UI_TRANSLATIONS } from '../i18n/ui';
import { StoreButtons } from './StoreButtons';
import { GameDetailModal } from './GameDetailModal';
import { FeaturedShowcase } from './FeaturedShowcase';

interface GameExplorerProps { games: Game[]; lang?: Locale; }
const normalize = (value: string) => value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();

export const GameExplorer: React.FC<GameExplorerProps> = ({ games, lang = 'en' }) => {
  const t = UI_TRANSLATIONS[lang].explorer;
  const page = UI_TRANSLATIONS[lang].page;
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const categories = [{ id: 'All', label: t.all }, { id: 'Puzzle', label: t.puzzle }, { id: 'Shooter', label: t.shooter }, { id: 'Casual', label: t.casual }, { id: 'Brain', label: t.brain }];
  const filtered = useMemo(() => games.filter(game => (category === 'All' || game.category === category) && normalize(`${game.title} ${game.description} ${game.tagline}`).includes(normalize(query))), [games, category, query]);
  const reset = () => { setCategory('All'); setQuery(''); };
  return <div className="space-y-16 sm:space-y-24">
    <section id="featured"><FeaturedShowcase games={games} lang={lang} onOpenDetail={setActiveGame} /></section>
    <section id="games" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div><span className="section-kicker">{page.catalogKicker}</span><h2 id="catalog-title" className="section-title">{page.catalogTitle}</h2><p className="section-description">{page.catalogSubtitle}</p></div>
        <label className="catalog-search"><span className="sr-only">{t.searchPlaceholder}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input type="search" placeholder={t.searchPlaceholder} value={query} onChange={event => setQuery(event.target.value)} />{query && <button onClick={() => setQuery('')} aria-label={page.clearSearch}>×</button>}</label>
      </div>
      <div className="catalog-toolbar"><div className="category-list" role="group" aria-label={page.filter}>{categories.map(cat => <button className="category-button" key={cat.id} aria-pressed={category === cat.id} onClick={() => setCategory(cat.id)}>{cat.label}<span>{cat.id === 'All' ? games.length : games.filter(game => game.category === cat.id).length}</span></button>)}</div><p className="catalog-count" role="status">{new Intl.NumberFormat(lang).format(filtered.length)} {page.count}</p></div>
      {filtered.length ? <div className="game-grid">{filtered.map(game => <article className="game-card" key={game.id}>
        <button className="game-preview" onClick={() => setActiveGame(game)} aria-label={`${page.details} ${game.title}`}><img src={game.banner} alt="" loading="lazy" width="160" height="285" /><img src={game.screenshots.find(shot => shot !== game.banner) || game.banner} alt="" loading="lazy" width="160" height="285" /></button>
        <div className="game-card-body"><div className="game-card-heading"><img src={game.icon} alt="" loading="lazy" width="48" height="48" /><div><h3><button onClick={() => setActiveGame(game)}>{game.title.split(':')[0]}</button></h3><span className="game-category">{game.categoryLabel}</span></div></div><p className="game-card-description">{game.description}</p><div className="game-card-actions"><StoreButtons lang={lang} googlePlayUrl={game.googlePlayUrl} appStoreUrl={game.appStoreUrl} size="sm" /><button className="game-detail-link" onClick={() => setActiveGame(game)}>{page.details} <span aria-hidden="true">↗</span></button></div></div>
      </article>)}</div> : <div className="empty-catalog"><p>{t.noResults}</p><button className="primary-action" onClick={reset}>{t.clearFilter} <span aria-hidden="true">↗</span></button></div>}
    </section>
    <GameDetailModal game={activeGame} lang={lang} onClose={() => setActiveGame(null)} />
  </div>;
};
