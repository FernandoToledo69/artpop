import { ArtisanProfile } from '../../types/usuario';

const PROFILE_STORAGE_KEY = 'origem:artisan-profile';

const defaultProfile: ArtisanProfile = {
	name: 'Ana Lima',
	email: 'ana.lima@email.com',
	phone: '',
	address: '',
	city: '',
	state: '',
	bio: 'Peças feitas à mão com materiais escolhidos com cuidado e histórias para morar com você.',
};

export function readArtisanProfile(): ArtisanProfile {
	if (typeof window === 'undefined') return defaultProfile;

	try {
		return { ...defaultProfile, ...JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) ?? '{}') } as ArtisanProfile;
	} catch {
		return defaultProfile;
	}
}

export function updateArtisanProfile(profile: ArtisanProfile): ArtisanProfile {
	localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
	return profile;
}
