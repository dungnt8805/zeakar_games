import type { Locale } from '../i18n/ui';
import GAME_MEDIA from './game-media.json';
import GAME_TEXT from '../i18n/game-texts.json';
import { UI_TRANSLATIONS } from '../i18n/ui';

export interface Game {
	id: string;
	title: string;
	tagline: string;
	description: string;
	longDescription: string;
	category: 'Arcade' | 'Puzzle' | 'Brain' | 'Casual' | 'Shooter';
	categoryLabel: string;
	rating: number;
	reviewsCount: string;
	downloads: string;
	ageRating: string;
	featured: boolean;
	badge?: string;
	icon: string;
	banner: string;
	screenshots: string[];
	features: string[];
	privacyUrl: string;
	googlePlayUrl: string;
	appStoreUrl: string;
	releaseDate: string;
	size: string;
}

interface RawGame {
	id: keyof typeof GAME_MEDIA;
	category: 'Arcade' | 'Puzzle' | 'Brain' | 'Casual' | 'Shooter';
	rating: number;
	downloads: string;
	ageRating: string;
	featured: boolean;
	privacyUrl: string;
	googlePlayUrl: string;
	appStoreUrl: string;
	releaseDate: string;
	size: string;
	vi: {
		title: string;
		tagline: string;
		description: string;
		longDescription: string;
		categoryLabel: string;
		reviewsCount: string;
		badge?: string;
		features: string[];
	};
	en: {
		title: string;
		tagline: string;
		description: string;
		longDescription: string;
		categoryLabel: string;
		reviewsCount: string;
		badge?: string;
		features: string[];
	};
}

const RAW_GAMES: RawGame[] = [
	{
		id: 'aster-strike',
		privacyUrl: 'https://game.lamian.dev/aster-privacy-policy.html',
		category: 'Shooter',
		rating: 4.8,
		downloads: '10K+',
		ageRating: '3+',
		featured: true,
		googlePlayUrl: 'https://play.google.com/store/apps/details?id=dev.lamian.games.asterstrike',
		appStoreUrl: 'https://apps.apple.com',
		releaseDate: '2024',
		size: '65 MB',
		vi: {
			title: 'Aster Strike: Galaxy Shooter',
			tagline: 'Game bắn phi thuyền không gian cổ điển với chiến dịch 30 màn kịch tính',
			description:
				'Lái phi thuyền, né mưa đạn và phản công trong Aster Strike. Game bắn máy bay, bắn phi thuyền offline với chiến dịch 30 màn. Phá đội hình địch, nâng cấp trang bị và chiến đấu để giành lại Aster-01 từ SENTINEL.',
			longDescription:
				'Aster Strike mang lại cảm giác hoài niệm của những tựa game bắn ruồi không gian cổ điển kết hợp đồ họa hiện đại.\n\n• Kéo để lái, tự động khai hỏa: Luồn qua khe đạn, đối phó tên lửa tự dẫn và tiêu diệt kẻ địch trên không lẫn mặt đất.\n• Chiến dịch 30 màn: Vượt qua các khu vực không gian hiểm trở, đối đầu với trùm cơ khí SENTINEL hùng mạnh.\n• Hệ thống nâng cấp phi thuyền: Tăng cường hỏa lực, lá chắn năng lượng Mega Shield và vũ khí hủy diệt.\n• Chơi offline hoàn toàn mọi lúc mọi nơi.',
			categoryLabel: 'Bắn phi thuyền',
			reviewsCount: 'Đánh giá tích cực',
			badge: '🔥 Game Mới Đỉnh Cao',
			features: [
				'Kéo để di chuyển mượt mà, khai hỏa tự động liên thanh',
				'Chiến dịch 30 màn thử thách với boss SENTINEL hoành tráng',
				'Nâng cấp Laser, Mega Shield, Tên lửa tầm nhiệt',
				'Chơi Offline 100% không cần kết nối mạng'
			]
		},
		en: {
			title: 'Aster Strike: Galaxy Shooter',
			tagline: 'Classic arcade space shooter with an intense 30-stage campaign',
			description:
				'Pilot your starship, dodge bullet hell, and counterattack in Aster Strike. Blast through enemy formations, upgrade weapons, and reclaim Aster-01 from SENTINEL.',
			longDescription:
				'Aster Strike captures the golden age of vertical scrolling arcade shooters infused with fluid modern effects.\n\n• Drag to Steer, Auto-Fire: Dodge dense bullet patterns, navigate around homing missiles, and eliminate air & ground hostiles.\n• 30-Mission Campaign: Travel across treacherous orbital sectors and confront the colossal robotic SENTINEL fleet.\n• Deep Starship Upgrades: Enhance lasers, unleash energy Mega Shields, and fire devastating thermal rockets.\n• 100% Offline Play: Enjoy seamless arcade action without an internet connection.',
			categoryLabel: 'Galaxy Shooter',
			reviewsCount: 'Positive Reviews',
			badge: '🔥 Hot New Release',
			features: [
				'Fluid drag-to-steer controls with auto-firing laser cannons',
				'30-mission campaign with epic SENTINEL boss battles',
				'Upgrade Lasers, Mega Shields, and Heat-seeking Missiles',
				'Play 100% Offline with zero internet required'
			]
		}
	},
	{
		id: 'blokito-puzzle',
		privacyUrl: 'https://game.lamian.dev/blokito-puzzle-privacy.html',
		category: 'Puzzle',
		rating: 4.8,
		downloads: '50K+',
		ageRating: '3+',
		featured: true,
		googlePlayUrl: 'https://play.google.com/store/apps/details?id=dev.lamian.games.blockblast',
		appStoreUrl: 'https://apps.apple.com',
		releaseDate: '2024',
		size: '48 MB',
		vi: {
			title: 'Blokito Puzzle: Block Blast',
			tagline: 'Game xếp khối đầy màu sắc thư giãn và thử thách săn điểm kỷ lục',
			description:
				'Kéo khối vào bàn cờ 8x8, lấp đầy hàng hoặc cột để xóa ô. Chọn chế độ Classic để lập kỷ lục hoặc khám phá hơn 300 màn Adventure hấp dẫn.',
			longDescription:
				'Blokito Puzzle là tựa game xếp hình khối mang phong cách hiện đại, giúp bạn thư giãn sau những giờ làm việc căng thẳng:\n\n• Dễ làm quen, thú vị khi tính toán: Đặt các khối vào ô trống để xóa hàng hoặc cột.\n• Chế độ Classic: Nối các chuỗi combo liên tiếp để đạt điểm số cao nhất.\n• Chế độ Adventure: Vượt qua hơn 300 màn chơi độc đáo với chướng ngại vật sáng tạo.\n• Hiệu ứng nổ khối mãn nhãn, âm thanh sống động kích thích não bộ.',
			categoryLabel: 'Giải đố (Puzzle)',
			reviewsCount: 'Yêu thích hàng đầu',
			badge: '⭐ Top Puzzle Game',
			features: [
				'Bàn cờ 8x8 với cơ chế xếp khối trực quan',
				'Hơn 300 màn Adventure đa dạng thử thách',
				'Hệ thống Combo điểm nhân bội số cực kỳ kích thích',
				'Không giới hạn thời gian, chơi thư thái'
			]
		},
		en: {
			title: 'Blokito Puzzle: Block Blast',
			tagline: 'Relaxing colorful block puzzle & high-score combo challenge',
			description:
				'Drag blocks onto an 8x8 grid, fill rows or columns to clear lines, and play classic mode or journey through 300+ adventure levels.',
			longDescription:
				'Blokito Puzzle combines intuitive block-fitting with satisfying board clears to keep your brain sharp:\n\n• Easy to Learn, Fun to Master: Place pieces into empty spaces. When a row or column fills up, it blasts away.\n• Classic Mode: Keep clearing lines and chaining streaks to achieve record-shattering high scores.\n• Adventure Mode: Progress through 300+ distinct handcrafted levels with exciting layout twists.\n• Beautiful Block Visuals: Crisp haptic audio and vibrant explosions for true relaxation.',
			categoryLabel: 'Block Puzzle',
			reviewsCount: 'Top Player Favorite',
			badge: '⭐ Top Puzzle Game',
			features: [
				'Classic 8x8 grid with intuitive drag-and-drop gameplay',
				'Over 300 handcrafted adventure challenges',
				'Exciting streak & multiplier combo scoring system',
				'No pressure or time limits, pure puzzle fun'
			]
		}
	},
	{
		id: 'grill-pop',
		privacyUrl: 'https://game.lamian.dev/grillpop-privacy.html',
		category: 'Casual',
		rating: 4.8,
		downloads: '20K+',
		ageRating: '3+',
		featured: true,
		googlePlayUrl: 'https://play.google.com/store/apps/details?id=dev.lamian.games.grillpop',
		appStoreUrl: 'https://apps.apple.com',
		releaseDate: '2024',
		size: '72 MB',
		vi: {
			title: 'Foodie: Grill Pop - 3D Match',
			tagline: 'Game giải đố xếp xiên đồ ăn 3D độc đáo và ngon mắt',
			description:
				'Gom những xiên đồ ăn giống nhau và tạo chỗ cho mẻ tiếp theo! Di chuyển xiên nướng giữa các bếp để ghép bộ ba và phục vụ khách hàng.',
			longDescription:
				'Grill Pop là tựa game giải đố sắp xếp ẩm thực 3D sáng tạo:\n\n• Xếp xiên, ghép ba, phục vụ: Di chuyển các que xiên nướng thịt, rau củ qua lại giữa các bếp nướng có vị trí giới hạn.\n• Khay nhiều lớp & băng chuyền: Càng lên màn cao, các món ăn nhiều tầng và cơ chế băng chuyền đòi hỏi tính toán nước đi khéo léo.\n• Đồ họa 3D bắt mắt: Những món nướng thơm lừng, đồ họa sống động tạo cảm giác thư giãn tuyệt đối.',
			categoryLabel: 'Xếp hình 3D',
			reviewsCount: 'Rất được yêu thích',
			badge: '🍢 Cực Kỳ Cuốn Hút',
			features: [
				'Mô hình ẩm thực 3D ngon miệng, sắc nét',
				'Cơ chế giải đố Match 3 kết hợp quản lý chỗ trống thông minh',
				'Hàng trăm cấp độ từ đơn giản đến phức tạp',
				'Âm thanh xèo xèo nướng đồ ăn chân thực vui nhộn'
			]
		},
		en: {
			title: 'Foodie: Grill Pop - 3D Match',
			tagline: 'Unique & appetizing 3D BBQ food matching puzzle',
			description:
				'Group matching food skewers to make room for the next batch! Move skewers between grills to match triplets and serve happy customers.',
			longDescription:
				'Grill Pop is a fresh 3D culinary sorting puzzle that satisfies both the eyes and the mind:\n\n• Sort, Match 3, Serve: Move skewers between limited grill slots. Match three of the same type on one grill to serve them.\n• Layered Grills & Conveyors: Manage multi-tier racks and shifting trays that require smart, forward-thinking moves.\n• Scrumptious 3D Art: Sizzling grilled meats, skewers, and veggies brought to life with mouthwatering visual detail.',
			categoryLabel: '3D Casual Match',
			reviewsCount: 'Fan Favorite',
			badge: '🍢 Sizzling Fun',
			features: [
				'Crisp, mouthwatering 3D food models and textures',
				'Clever Match-3 mechanics blended with spatial sorting',
				'Hundreds of levels from casual warmth to brain-stretching',
				'Realistic BBQ sizzle sound effects for deep immersion'
			]
		}
	},
	{
		id: 'mochi-tiles',
		privacyUrl: 'https://game.lamian.dev/mochi-tiles-policy.html',
		category: 'Puzzle',
		rating: 4.8,
		downloads: '15K+',
		ageRating: '3+',
		featured: false,
		googlePlayUrl: 'https://play.google.com/store/apps/details?id=dev.lamian.games.tilematchpuzzle',
		appStoreUrl: 'https://apps.apple.com',
		releaseDate: '2024',
		size: '56 MB',
		vi: {
			title: 'Mochi Tiles: Triple Match',
			tagline: 'Ghép ba ô thư giãn lấy cảm hứng từ khu vườn Á Đông thanh tịnh',
			description:
				'Dành khoảng nghỉ nhẹ nhàng với Mochi Tiles. Ghép 3 ô giống nhau, dọn sạch bàn chơi và cùng Mochi khám phá phong cảnh thơ mộng.',
			longDescription:
				'Mochi Tiles đưa bạn vào một chuyến dạo chơi thư thái qua những khu vườn thiền định và sông nước êm đềm:\n\n• Chạm để xếp ô vào khay 7 vị trí: Ghép 3 ô hoa văn giống nhau để làm biến mất.\n• Tính toán lớp ô xếp chồng: Cân nhắc thứ tự lấy ô để không làm đầy khay chứa.\n• Nhạc nền thiền định êm ái, xóa tan mọi căng thẳng mệt mỏi.',
			categoryLabel: 'Giải đố (Puzzle)',
			reviewsCount: 'Đánh giá cao',
			badge: '🌸 Thư Giãn Thiền Định',
			features: [
				'Nghệ thuật hoa văn truyền thống tinh tế',
				'Hệ thống gợi ý & xáo bài hỗ trợ khi gặp thế bí',
				'Âm nhạc du dương mộc mạc',
				'Chơi ngoại tuyến tiện lợi'
			]
		},
		en: {
			title: 'Mochi Tiles: Triple Match',
			tagline: 'Relaxing Zen garden-inspired triple tile matching journey',
			description:
				'Take a calm break with Mochi Tiles. Match 3 identical tiles, clear the board, and explore serene landscapes.',
			longDescription:
				'Mochi Tiles invites you on a mindful, peaceful journey through Asian-inspired botanical gardens:\n\n• Tap to Move Tiles: Collect three identical tiles to clear them from your 7-slot bar.\n• Navigate Multi-Tier Layers: Strategize your picks so your tray never overflows.\n• Calming Zen Soundtracks: Soft acoustic melodies designed to melt everyday stress away.',
			categoryLabel: 'Triple Tile Match',
			reviewsCount: 'Highly Rated',
			badge: '🌸 Zen Relaxation',
			features: [
				'Delicate traditional garden patterns and visual aesthetics',
				'Helpful Hint & Shuffle boosters for tricky stacked boards',
				'Gentle, melodic acoustic Zen background music',
				'Convenient offline play anytime'
			]
		}
	},
	{
		id: 'memory-pairs',
		privacyUrl: 'https://game.lamian.dev/privacy',
		category: 'Brain',
		rating: 4.8,
		downloads: '10K+',
		ageRating: '3+',
		featured: false,
		googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.zeakar.games.matchingcard',
		appStoreUrl: 'https://apps.apple.com',
		releaseDate: '2023',
		size: '28 MB',
		vi: {
			title: 'Memory Pairs: Card Match',
			tagline: 'Ghép thẻ hình và rèn luyện trí nhớ não bộ mỗi ngày',
			description:
				'Trò chơi ghép cặp hình ảnh tuyệt vời để rèn luyện trí nhớ, khả năng tập trung, độ chính xác và phản xạ nhanh của mắt với 7 chế độ chơi.',
			longDescription:
				'Memory Pairs là bài tập thể dục não bộ thú vị và hiệu quả dành cho mọi lứa tuổi:\n\n• 7 chế độ chơi đa dạng: Cổ điển, Phiêu lưu, Nhớ tất cả, Giới hạn nước đi, v.v.\n• Rèn luyện sự tập trung: Giữ cho trí óc luôn minh mẫn, tăng cường phản xạ thị giác.\n• Hàng trăm gói thẻ chủ đề rực rỡ sắc màu.',
			categoryLabel: 'Luyện trí não',
			reviewsCount: 'Yêu thích',
			badge: '🧠 Rèn Luyện Trí Não',
			features: [
				'7 chế độ rèn luyện trí nhớ khoa học',
				'Giao diện trực quan, dễ thao tác',
				'Theo dõi tiến bộ ghi nhớ mỗi ngày',
				'Phù hợp cho cả trẻ nhỏ và người lớn'
			]
		},
		en: {
			title: 'Memory Pairs: Card Match',
			tagline: 'Match card pairs and train your brain memory daily',
			description:
				'Brain training picture matching game to improve focus, accuracy, visual reaction speed with 7 diverse game modes.',
			longDescription:
				'Memory Pairs is a workout for your brain that fits right into your pocket:\n\n• 7 Rich Modes: Classic Memory, Adventure, Remember All, Move Limit, and more.\n• Sharpen Attention: Boost visual cognitive speed, focus, and short-term memory recall.\n• Colorful Themes: Beautiful card packs ranging from playful icons to intricate symbols.',
			categoryLabel: 'Brain Trainer',
			reviewsCount: 'Top Rated',
			badge: '🧠 Brain Fitness',
			features: [
				'7 scientifically crafted memory workout modes',
				'Clean, responsive and distraction-free interface',
				'Daily memory progress and score tracker',
				'Fun and beneficial for both children and adults'
			]
		}
	},
	{
		id: 'math-challenge',
		privacyUrl: 'https://game.lamian.dev/math_privacy',
		category: 'Brain',
		rating: 4.5,
		downloads: '10K+',
		ageRating: '3+',
		featured: false,
		googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.zeakar.games.mathgame',
		appStoreUrl: 'https://apps.apple.com',
		releaseDate: '2023',
		size: '22 MB',
		vi: {
			title: 'Math Challenge: Brain Game',
			tagline: 'Cải thiện kỹ năng toán học và tư duy logic phản xạ',
			description:
				'Trò chơi giáo dục hiệu quả kết hợp giải toán cộng, trừ, nhân, chia, căn bậc hai và thách thức bảng xếp hạng toàn cầu.',
			longDescription:
				'Math Challenge mang đến cách tiếp cận toán học sinh động, biến những phép tính khô khan thành các thử thách tốc độ nghẹt thở:\n\n• Đầy đủ các phép tính: Cộng, trừ, nhân, chia, lũy thừa, căn bậc hai.\n• Thi đấu điểm số: Thách thức tốc độ tính nhẩm của bạn với bạn bè và người chơi quốc tế.\n• Thói quen tích cực: Chỉ 5-10 phút mỗi ngày để tăng vọt khả năng nhẩm nhanh.',
			categoryLabel: 'Luyện trí não',
			reviewsCount: 'Giáo dục xuất sắc',
			badge: '📐 Toán Học Vui',
			features: [
				'Nhiều cấp độ từ tính nhẩm cơ bản đến phức tạp',
				'Chế độ tính giờ tăng tính kịch tính',
				'Giao diện trực quan rõ ràng',
				'Giúp cải thiện kết quả học tập và tư duy số học'
			]
		},
		en: {
			title: 'Math Challenge: Brain Game',
			tagline: 'Sharpen your math arithmetic skills and logical reflexes',
			description:
				'Effective educational math puzzle game covering addition, subtraction, multiplication, division, and global leaderboards.',
			longDescription:
				'Math Challenge turns rapid arithmetic into an exhilarating reflex game:\n\n• Comprehensive Operations: Addition, subtraction, multiplication, division, powers, and square roots.\n• Time Trials: Race against the ticking clock and climb global leaderboards.\n• Daily Brain Habit: Just 5-10 minutes each morning accelerates mental math speed dramatically.',
			categoryLabel: 'Math & Logic',
			reviewsCount: 'Great Educational',
			badge: '📐 Fun Math',
			features: [
				'Progressive difficulty from elementary drill to math wizardry',
				'Timed sprint challenges to test mental calculation speed',
				'Distraction-free, high-legibility interface',
				'Clinically proven to improve mental agility and focus'
			]
		}
	},
	{
		id: 'sudoku-challenge',
		privacyUrl: 'https://game.lamian.dev/sudoku_policy',
		category: 'Puzzle',
		rating: 4.6,
		downloads: '10K+',
		ageRating: '3+',
		featured: false,
		googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.zeakar.games.sudoku',
		appStoreUrl: 'https://apps.apple.com',
		releaseDate: '2023',
		size: '25 MB',
		vi: {
			title: 'Sudoku Challenge: Classic Logic',
			tagline: 'Chơi Sudoku logic kinh điển từ cấp độ Dễ đến Chuyên gia',
			description:
				'Hàng ngàn câu đố Sudoku kinh điển. Rèn luyện trí não, tư duy logic và thư giãn giải đố mọi lúc mọi nơi hoàn toàn offline.',
			longDescription:
				'Tựa game Sudoku chuẩn xác và hoàn thiện nhất dành cho người yêu thích các con số logic:\n\n• Cấp độ phong phú: Dễ, Trung bình, Khó và Chuyên gia (Expert).\n• Tính năng thông minh: Ghi chú nháp (Pencil notes), kiểm tra lỗi trùng lặp tự động, gợi ý khi gặp câu đố khó.\n• Giao diện tối giản sang trọng, bảo vệ mắt khi chơi vào ban đêm.',
			categoryLabel: 'Giải đố (Puzzle)',
			reviewsCount: 'Yêu thích cổ điển',
			badge: '🔢 Logic Kinh Điển',
			features: [
				'Hàng ngàn bảng số Sudoku logic độc nhất',
				'4 cấp độ cân não: Easy, Medium, Hard, Expert',
				'Hệ thống ghi chú (Note) và tự động tô sáng số trùng',
				'Hỗ trợ chế độ nền tối (Dark mode) dịu mắt'
			]
		},
		en: {
			title: 'Sudoku Challenge: Classic Logic',
			tagline: 'Classic number logic puzzles from Easy to Expert',
			description:
				'Thousands of classic logic number grids. Train your brain, boost logical reasoning, and unwind with offline Sudoku.',
			longDescription:
				'The definitive Sudoku experience tailored for purity and deep focus:\n\n• 4 Balanced Difficulties: Easy, Medium, Hard, and Expert.\n• Smart Assisting Tools: Pencil mark draft mode, duplicate highlight warnings, and intelligent hints.\n• Clean Dark Aesthetics: Sleek, high-contrast dark board design to prevent eye strain during night play.',
			categoryLabel: 'Classic Sudoku',
			reviewsCount: 'Timeless Classic',
			badge: '🔢 Number Logic',
			features: [
				'Thousands of unique, verifiable single-solution puzzles',
				'4 balanced skill levels: Easy, Medium, Hard, Expert',
				'Smart Pencil Notes & auto-highlight duplicate digits',
				'Eye-friendly Dark Mode built for hours of relaxing focus'
			]
		}
	}
];

export function getGames(lang: Locale = 'en'): Game[] {
	return RAW_GAMES.map((game) => {
		const localeData = lang === 'en' || lang === 'vi' ? game[lang] : GAME_TEXT[lang][game.id];
		return {
			id: game.id,
			title: localeData.title,
			tagline: localeData.tagline,
			description: localeData.description,
			longDescription: localeData.longDescription,
			category: game.category,
			categoryLabel: localeData.categoryLabel,
			rating: game.rating,
			reviewsCount: localeData.reviewsCount,
			downloads: game.downloads,
			ageRating: game.ageRating,
			featured: game.featured,
			badge: localeData.badge,
			...GAME_MEDIA[game.id][lang === 'vi' ? 'vi' : 'en'],
			features: localeData.features,
			privacyUrl: game.privacyUrl,
			googlePlayUrl: game.googlePlayUrl,
			appStoreUrl: game.appStoreUrl,
			releaseDate: game.releaseDate,
			size: game.size
		};
	});
}

export function getStudioInfo(lang: Locale = 'en') {
	const t = UI_TRANSLATIONS[lang].studio;
	return { name: 'Milaan (Lamian Games)', description: t.description, stats: [ {value:'7+',label:t.games}, {value:'100K+',label:t.downloads}, {value:'4.8 ★',label:t.rating}, {value:'100%',label:t.offline} ], milestones: [ {year:'2023',title:t.milestone1,desc:t.milestone1Desc}, {year:'2024',title:t.milestone2,desc:t.milestone2Desc}, {year:'2024',title:t.milestone3,desc:t.milestone3Desc}, {year:'2025+',title:t.milestone4,desc:t.milestone4Desc} ] };
}

// Backward compatibility
export const GAMES = getGames('en');
export const STUDIO_INFO = getStudioInfo('en');
