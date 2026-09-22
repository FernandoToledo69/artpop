import { ArtisanProfile } from '../../types/usuario';

const PROFILE_STORAGE_KEY = 'origem:artisan-profile';

const defaultProfile: ArtisanProfile = {
	name: 'Stefani Germanotta',
	email: 'ana.lima@email.com',
	phone: '',
	address: '',
	city: '',
	state: '',
	bio: 'A cultura pop estava na arte, agora a arte está na cultura pop',
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
