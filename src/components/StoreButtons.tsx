import React from 'react';
import { UI_TRANSLATIONS, type Locale } from '../i18n/ui';

interface StoreButtonsProps {
	lang?: Locale;
	googlePlayUrl?: string;
	appStoreUrl?: string;
	className?: string;
	size?: 'sm' | 'md' | 'lg';
}

export const StoreButtons: React.FC<StoreButtonsProps> = ({
	lang = 'en',
	googlePlayUrl = 'https://play.google.com/store/apps/developer?id=Milaan',
	appStoreUrl,
	className = '',
	size = 'md'
}) => {
	const sizeClasses = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2.5 text-xs sm:text-sm',
		lg: 'px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base'
	};

	const iconSizes = {
		sm: 'w-4 h-4',
		md: 'w-4 sm:w-5 h-4 sm:h-5',
		lg: 'w-5 sm:w-6 h-5 sm:h-6'
	};

	return (
		<div className={`flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}>
			{/* Google Play Button */}
			<a
				href={googlePlayUrl}
				target="_blank"
				rel="noopener noreferrer"
				className={`group cursor-pointer select-none inline-flex items-center gap-2.5 sm:gap-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-white transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 ${sizeClasses[size]}`}
			>
				{/* Google Play Vector Icon */}
				<svg
					className={`${iconSizes[size]} shrink-0`}
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill="#EA4335"
						d="M4.3 2.7l10.8 10.8-2.6 2.6L3.2 3.6c.3-.5.7-.8 1.1-.9z"
					/>
					<path
						fill="#FBBC04"
						d="M17.7 10.9L15.1 8.3 4.3 2.7c-.4-.1-.7-.1-1.1.2L15.1 13.5l2.6-2.6z"
					/>
					<path
						fill="#34A853"
						d="M15.1 13.5L3.2 21.6c.4.3.7.3 1.1.2l10.8-5.6 2.6-2.7z"
					/>
					<path
						fill="#4285F4"
						d="M20.2 11.2l-3.3-1.7-2.6 2.6 2.6 2.6 3.3-1.7c.9-.5.9-1.3 0-1.8z"
					/>
				</svg>
				<div className="flex flex-col text-left leading-none">
					<span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-slate-300">
						{UI_TRANSLATIONS[lang].page.getOn}
					</span>
					<span className="font-semibold text-white tracking-wide mt-0.5">Google Play</span>
				</div>
			</a>

			{appStoreUrl && /^https:\/\/apps\.apple\.com\/[^?#]*id\d+/.test(appStoreUrl) && (<>
			<a
				href={appStoreUrl}
				target="_blank"
				rel="noopener noreferrer"
				className={`group cursor-pointer select-none inline-flex items-center gap-2.5 sm:gap-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 text-white transition-all duration-300 shadow-lg hover:shadow-sky-500/20 hover:-translate-y-0.5 active:translate-y-0 ${sizeClasses[size]}`}
			>
				{/* Apple Vector Icon */}
				<svg
					className={`${iconSizes[size]} shrink-0 fill-current text-white`}
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.64-.78 1.08-1.86.96-2.95-1 .04-2.19.67-2.88 1.47-.61.71-1.13 1.83-.99 2.9 1.12.09 2.26-.59 2.91-1.42z" />
				</svg>
				<div className="flex flex-col text-left leading-none">
					<span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-slate-300">
						Download on the
					</span>
					<span className="font-semibold text-white tracking-wide mt-0.5">App Store</span>
				</div>
			</a>
			</>)}
		</div>
	);
};
