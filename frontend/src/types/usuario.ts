export interface PublicArtisanProfile {
	name: string;
	phone: string;
	city: string;
	state: string;
	bio: string;
	avatarImage: string;
}

export interface ArtisanProfile extends PublicArtisanProfile {
	email: string;
	address: string;
	addressNumber: string;
	addressComplement: string;
}
