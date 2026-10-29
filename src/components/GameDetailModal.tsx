import React, { useState, useEffect, useRef } from 'react';
import type { Game } from '../data/games';
import type { Locale } from '../i18n/ui';
import { localizedPolicyPath, UI_TRANSLATIONS } from '../i18n/ui';
import { StoreButtons } from './StoreButtons';

interface GameDetailModalProps {
	game: Game | null;
	lang?: Locale;
	onClose: () => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, lang = 'en', onClose }) => {
	const t = UI_TRANSLATIONS[lang]?.modal || UI_TRANSLATIONS.vi.modal;
	const [activeImage, setActiveImage] = useState<string>('');
	const dialogRef = useRef<HTMLDialogElement>(null);

	// Update activeImage whenever the selected game changes
	useEffect(() => {
		if (game) {
			setActiveImage(game.banner);
		}
	}, [game]);

	// Native modal dialogs contain keyboard focus and restore it to the opener.
	useEffect(() => {
		if (!game || !dialogRef.current) return;
		const dialog = dialogRef.current;
		const originalOverflow = document.body.style.overflow;
		const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		document.body.style.overflow = 'hidden';
		dialog.showModal();
		dialog.querySelector<HTMLButtonElement>('button')?.focus();
		return () => {
			dialog.close();
			document.body.style.overflow = originalOverflow;
			if (opener?.isConnected) opener.focus();
		};
	}, [game]);

	if (!game) return null;

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="game-dialog-title"
			onCancel={(event) => { event.preventDefault(); onClose(); }}
			className="game-dialog fixed inset-0 m-auto h-dvh max-h-none w-screen max-w-none items-center justify-center p-3 sm:p-6 bg-transparent backdrop:bg-black/85 backdrop:backdrop-blur-md"
			onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
		>
			<div
				className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-5 sm:p-8"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className="cursor-pointer absolute top-4 right-4 sm:top-5 sm:right-5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition shadow-lg active:scale-95"
					aria-label={t.close}
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				{/* Preview Banner / Screenshot with Dual Layer */}
				<div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-slate-800 mb-6 bg-slate-950 flex items-center justify-center">
					{/* Blurred Ambient Backdrop */}
					<img
						src={activeImage || game.banner}
						alt=""
						aria-hidden="true"
						className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-40 scale-110"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30" />

					{/* Sharp Full Screenshot */}
					<img
						src={activeImage || game.banner}
						alt={game.title}
						className="relative z-10 max-h-full max-w-full object-contain p-2 rounded-xl drop-shadow-2xl transition-all duration-300"
					/>

					{/* Badge */}
					{game.badge && (
						<div className="absolute top-3 left-3 z-20 rounded-full bg-amber-500/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-950 shadow-lg">
							{game.badge}
						</div>
					)}

					{/* Thumbnail preview bar */}
					<div className="absolute bottom-3 left-3 right-3 z-20 flex gap-2 overflow-x-auto pb-1 bg-slate-950/60 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/80 no-scrollbar">
						<button
							onClick={() => setActiveImage(game.banner)}
							className={`cursor-pointer h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
								activeImage === game.banner
									? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30'
									: 'border-transparent opacity-60 hover:opacity-100'
							}`}
							aria-label={UI_TRANSLATIONS[lang].page.cover}
						>
							<img src={game.banner} alt={UI_TRANSLATIONS[lang].page.cover} className="h-full w-full object-cover" />
						</button>
						{game.screenshots.map((shot, idx) => (
							<button
								key={idx}
								onClick={() => setActiveImage(shot)}
								className={`cursor-pointer h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
									activeImage === shot
										? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30'
										: 'border-transparent opacity-60 hover:opacity-100'
								}`}
								aria-label={`${UI_TRANSLATIONS[lang].page.screenshot} ${idx + 1}`}
							>
								<img src={shot} alt={`${UI_TRANSLATIONS[lang].page.screenshot} ${idx + 1}`} className="h-full w-full object-cover" />
							</button>
						))}
					</div>
				</div>

				{/* Header Info */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
					<div className="flex items-center gap-4">
						<img
							src={game.icon}
							alt={game.title}
							className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover shadow-xl border border-slate-700/80 shrink-0"
						/>
						<div>
							<h3 id="game-dialog-title" className="text-xl sm:text-2xl font-bold text-white font-display">{game.title}</h3>
							<p className="text-xs sm:text-sm text-amber-400 font-medium mt-0.5">{game.tagline}</p>
							<div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-slate-400">
								<span className="flex items-center text-amber-400 font-semibold gap-1">
									★ {game.rating}
								</span>
								<span>•</span>
								<span className="text-emerald-400 font-medium">📥 {game.downloads}</span>
								<span>•</span>
								<span className="rounded bg-slate-800 px-2 py-0.5 font-medium">{game.categoryLabel}</span>
								<span>•</span>
								<span className="text-slate-400">{t.size} {game.size}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Download Buttons Section */}
				<div className="py-6 border-b border-slate-800">
					<p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">{t.freeDownload}</p>
					<StoreButtons lang={lang} googlePlayUrl={game.googlePlayUrl} appStoreUrl={game.appStoreUrl} size="md" />
					<a href={game.privacyUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs text-slate-300 underline underline-offset-4 hover:text-amber-400">
						{UI_TRANSLATIONS[lang].policy.original}<span aria-hidden="true">↗</span>
					</a>
                    <a href={localizedPolicyPath(lang,game.id)} className="mt-4 ml-5 inline-flex text-xs text-amber-400 underline underline-offset-4">{UI_TRANSLATIONS[lang].policy.read} →</a>
                </div>

                {/* Description & Features */}
				<div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2 space-y-4">
						<h4 className="text-base sm:text-lg font-semibold text-white">{t.aboutGame}</h4>
						<p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
							{game.longDescription || game.description}
						</p>
					</div>

					<div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
						<h4 className="text-xs uppercase tracking-wider text-amber-400 font-bold">{t.highlights}</h4>
						<ul className="space-y-2.5 text-xs text-slate-300">
							{game.features.map((feat, idx) => (
								<li key={idx} className="flex items-start gap-2">
									<span className="text-emerald-400 font-bold shrink-0">✓</span>
									<span>{feat}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</dialog>
	);
};
