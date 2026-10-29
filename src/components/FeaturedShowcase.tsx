import React, { useState } from 'react';
import type { Game } from '../data/games';
import type { Locale } from '../i18n/ui';
import { UI_TRANSLATIONS } from '../i18n/ui';
import { StoreButtons } from './StoreButtons';

interface FeaturedShowcaseProps {
	games: Game[];
	lang?: Locale;
	onOpenDetail: (game: Game) => void;
}

export const FeaturedShowcase: React.FC<FeaturedShowcaseProps> = ({ games, lang = 'en', onOpenDetail }) => {
	const t = UI_TRANSLATIONS[lang]?.showcase || UI_TRANSLATIONS.vi.showcase;
	const featuredGames = games.filter((g) => g.featured);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const currentGame = featuredGames[selectedIndex] || games[0];
	const [activeImage, setActiveImage] = useState<string>(currentGame?.banner);

	const handleSelectGame = (idx: number) => {
		setSelectedIndex(idx);
		setActiveImage(featuredGames[idx].banner);
	};

	if (!currentGame) return null;

	return (
		<div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#111520] p-4 sm:p-8 lg:p-10 ">
			{/* Ambient background glow */}
			<div className="absolute -top-32 -right-32 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-amber-500/10 blur-[100px] sm:blur-[120px] pointer-events-none" />
			<div className="absolute -bottom-32 -left-32 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-rose-500/10 blur-[100px] sm:blur-[120px] pointer-events-none" />

			{/* Section Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
				<div>
					<div className="inline-flex items-center gap-2 text-[10px] tracking-[.16em] font-semibold text-amber-400 mb-3">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
						</span>
						{t.badge}
					</div>
					<h2 className="section-title">
						{t.title}
					</h2>
				</div>

				{/* Quick tabs to switch featured games */}
				<div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto p-1.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 max-w-full no-scrollbar">
					{featuredGames.map((game, idx) => (
						<button
							key={game.id}
							onClick={() => handleSelectGame(idx)}
							aria-pressed={selectedIndex === idx}
							className={`cursor-pointer flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
								selectedIndex === idx
									? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
									: 'text-slate-400 hover:text-white hover:bg-slate-800/60'
							}`}
						>
							<img src={game.icon} alt="" className="w-4 h-4 sm:w-5 sm:h-5 rounded-md object-cover" />
							<span>{game.title.split(':')[0]}</span>
						</button>
					))}
				</div>
			</div>

			{/* Main Showcase Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
				{/* Left Column: Visual Media with Dual-Layer Phone Showcase */}
				<div className="lg:col-span-7 space-y-3 sm:space-y-4">
					<div className="relative h-80 sm:h-[440px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center group">
						{/* Background ambient blur */}
						<img
							src={activeImage || currentGame.banner}
							alt=""
							aria-hidden="true"
							className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-40 scale-110"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />

						{/* Phone Device Mockup Bezel */}
						<div className="relative z-10 h-[90%] aspect-[9/16] rounded-[1.75rem] sm:rounded-[2rem] border-2 sm:border-4 border-slate-800 bg-black p-1 shadow-2xl drop-shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
							{/* Notch / Speaker bar */}
							<div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 h-1 sm:h-1.5 w-8 sm:w-12 rounded-full bg-slate-700/80 z-20"></div>
							<img
								src={activeImage || currentGame.banner}
								alt={currentGame.title}
								className="h-full w-full object-cover rounded-[1.4rem] sm:rounded-[1.7rem]"
							/>
						</div>

						{/* Badge */}
						{currentGame.badge && (
							<div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-bold text-slate-950 shadow-lg">
								{currentGame.badge}
							</div>
						)}

						{/* Action Button overlay */}
						<div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20">
							<button
								onClick={() => onOpenDetail(currentGame)}
								className="cursor-pointer rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-white px-3 sm:px-3.5 py-1.5 sm:py-2 border border-slate-700 transition backdrop-blur-md shadow-lg"
							>
								{t.viewDetail}
							</button>
						</div>
					</div>

					{/* Thumbnail Bar */}
					<div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80 no-scrollbar">
						<button
							onClick={() => setActiveImage(currentGame.banner)}
							className={`cursor-pointer h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
								activeImage === currentGame.banner
									? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
									: 'border-slate-800 opacity-60 hover:opacity-100'
							}`}
							aria-label={UI_TRANSLATIONS[lang].page.cover}
						>
							<img src={currentGame.banner} alt="" className="h-full w-full object-cover" />
						</button>
						{currentGame.screenshots.map((s, idx) => (
							<button
								key={idx}
								onClick={() => setActiveImage(s)}
								className={`cursor-pointer h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
									activeImage === s
										? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
										: 'border-slate-800 opacity-60 hover:opacity-100'
								}`}
								aria-label={`${UI_TRANSLATIONS[lang].page.screenshot} ${idx + 1}`}
							>
								<img src={s} alt="" className="h-full w-full object-cover" />
							</button>
						))}
					</div>
				</div>

				{/* Right Column: Game Pitch & Store Badges */}
				<div className="lg:col-span-5 space-y-4 sm:space-y-6">
					<div className="flex items-center gap-3.5 sm:gap-4">
						<img
							src={currentGame.icon}
							alt={currentGame.title}
							className="h-14 w-14 sm:h-18 sm:w-18 rounded-2xl object-cover shadow-xl border border-slate-700/80 shrink-0"
						/>
						<div>
							<h3 className="text-lg sm:text-2xl font-bold text-white font-display">{currentGame.title}</h3>
							<div className="flex flex-wrap items-center gap-2 mt-1">
								<span className="flex items-center text-amber-400 text-xs sm:text-sm font-semibold">
									★ {currentGame.rating}
								</span>
								<span className="text-xs text-slate-400">({currentGame.reviewsCount})</span>
								<span className="text-xs text-emerald-400 font-medium">
									• {currentGame.downloads}
								</span>
							</div>
						</div>
					</div>

					<p className="text-slate-300 text-sm leading-relaxed">{currentGame.description}</p>

					{/* Feature checklist */}
					<div className="space-y-1.5 sm:space-y-2 rounded-2xl bg-slate-950/60 p-3.5 sm:p-4 border border-slate-800/80">
						<h4 className="text-[11px] sm:text-xs uppercase tracking-wider text-amber-400 font-bold mb-1.5 sm:mb-2">
							{t.featuresTitle}
						</h4>
						{currentGame.features.slice(0, 3).map((feat, i) => (
							<div key={i} className="flex items-start gap-2 text-xs text-slate-300">
								<span className="text-amber-400 font-bold">✦</span>
								<span>{feat}</span>
							</div>
						))}
					</div>

					{/* Direct Download Call To Action */}
					<div>
						<p className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2.5 sm:mb-3">
							{t.downloadFree}
						</p>
						<StoreButtons
							lang={lang}
							googlePlayUrl={currentGame.googlePlayUrl}
							appStoreUrl={currentGame.appStoreUrl}
							size="md"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
