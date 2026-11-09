import { ArtisanProfile } from '../../types/usuario';

const PROFILE_STORAGE_KEY = 'origem:artisan-profile';

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

	return `(${areaCode})${firstPart}${secondPart ? `-${secondPart}` : ''}`;
}

const defaultProfile: ArtisanProfile = {
	name: 'Stefani Germanotta',
	email: 'ana.lima@email.com',
	phone: '',
	address: '',
	city: '',
	state: '',
	bio: 'A cultura pop estava na arte, agora a arte está na cultura pop',
	avatarImage: '',
};

export function readArtisanProfile(): ArtisanProfile {
	if (typeof window === 'undefined') return defaultProfile;

	try {
		const savedProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) ?? '{}') as Partial<ArtisanProfile>;
		if (savedProfile.name === 'Ana Lima') {
			localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
			return defaultProfile;
		}
		return { ...defaultProfile, ...savedProfile } as ArtisanProfile;
	} catch {
		return defaultProfile;
	}
}

export function updateArtisanProfile(profile: ArtisanProfile): ArtisanProfile {
	localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
	return profile;
}
