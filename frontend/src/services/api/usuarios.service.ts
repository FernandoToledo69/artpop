import { ArtisanProfile, PublicArtisanProfile } from '../../types/usuario';
import { getUserScopedStorageKey, getUserStorageKeyForId, readSessionStorageUser } from './user-storage';

const PROFILE_STORAGE_KEY = 'origem:artisan-profile';

function getProfileStorageKey(): string {
	const user = readSessionStorageUser();
	return user
		? getUserStorageKeyForId(PROFILE_STORAGE_KEY, user.artisanId || user.id)
		: getUserScopedStorageKey(PROFILE_STORAGE_KEY);
}

export function formatPhone(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 11);
	if (!digits) return '';

	const areaCode = digits.slice(0, 2);
	if (digits.length <= 2) return `(${areaCode}`;

	const isMobile = digits.length > 10 || digits[2] === '9';
	const subscriber = digits.slice(2);
	const firstPartLength = isMobile ? 5 : 4;
	const firstPart = subscriber.slice(0, firstPartLength);
	const secondPart = subscriber.slice(firstPartLength);

	return `(${areaCode}) ${firstPart}${secondPart ? `-${secondPart}` : ''}`;
}

const defaultProfile: ArtisanProfile = {
	name: '',
	email: '',
	phone: '',
	address: '',
	addressNumber: '',
	addressComplement: '',
	city: '',
	state: '',
	bio: 'A cultura pop estava na arte, agora a arte está na cultura pop',
	avatarImage: '',
};

export function readArtisanProfile(): ArtisanProfile {
	if (typeof window === 'undefined') return defaultProfile;

	try {
		const user = readSessionStorageUser();
		const profileKey = getProfileStorageKey();
		let savedProfile = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as Partial<ArtisanProfile>;
		if (!savedProfile.name && user?.email) {
			const legacyProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) ?? 'null') as Partial<ArtisanProfile> | null;
			if (legacyProfile?.email?.trim().toLowerCase() === user.email.trim().toLowerCase()) {
				savedProfile = legacyProfile;
				localStorage.setItem(profileKey, JSON.stringify(legacyProfile));
				localStorage.removeItem(PROFILE_STORAGE_KEY);
			}
		}
		return {
			...defaultProfile,
			...savedProfile,
			name: savedProfile.name || user?.name || defaultProfile.name,
			email: user?.email || savedProfile.email || defaultProfile.email,
			phone: formatPhone(savedProfile.phone ?? ''),
		};
	} catch {
		const user = readSessionStorageUser();
		return { ...defaultProfile, name: user?.name ?? '', email: user?.email ?? '' };
	}
}

export function readArtisanProfileForUser(userId: string): PublicArtisanProfile {
	if (typeof window === 'undefined') return { name: '', phone: '', city: '', state: '', bio: '', avatarImage: '' };
	const currentUser = readSessionStorageUser();
	if (currentUser?.id === userId || currentUser?.artisanId === userId) {
		const { name, phone, city, state, bio, avatarImage } = readArtisanProfile();
		return { name, phone, city, state, bio, avatarImage };
	}
	try {
		const profile = JSON.parse(localStorage.getItem(getUserStorageKeyForId(PROFILE_STORAGE_KEY, userId)) ?? '{}') as Partial<ArtisanProfile>;
		return {
			name: profile.name ?? '',
			phone: profile.phone ?? '',
			city: profile.city ?? '',
			state: profile.state ?? '',
			bio: profile.bio ?? '',
			avatarImage: profile.avatarImage ?? '',
		};
	} catch {
		return { name: '', phone: '', city: '', state: '', bio: '', avatarImage: '' };
	}
}

export function updateArtisanProfile(profile: ArtisanProfile): ArtisanProfile {
	const normalizedProfile = { ...profile, phone: formatPhone(profile.phone) };
	localStorage.setItem(getProfileStorageKey(), JSON.stringify(normalizedProfile));
	return normalizedProfile;
}
