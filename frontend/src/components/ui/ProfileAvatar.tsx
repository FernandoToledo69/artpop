'use client';

import { useEffect, useState } from 'react';
import { readArtisanProfile } from '../../services/api/usuarios.service';

interface ProfileAvatarProps {
	className?: string;
	label?: string;
	withMenu?: boolean;
}

export default function ProfileAvatar({ className = 'avatar', label = 'Abrir perfil', withMenu = true }: ProfileAvatarProps) {
	const [image, setImage] = useState('');
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const updateImage = () => setImage(readArtisanProfile().avatarImage);
		updateImage();
		window.addEventListener('profile-updated', updateImage);
		return () => window.removeEventListener('profile-updated', updateImage);
	}, []);

	if (!withMenu) return <span className={`${className}${image ? ' has-profile-image' : ''}`} aria-label={label}>{image ? <img src={image} alt="Foto do perfil" /> : 'LG'}</span>;

	return <div className="profile-menu"><button className={`${className}${image ? ' has-profile-image' : ''}`} type="button" onClick={() => setIsOpen((current) => !current)} aria-label={label} aria-expanded={isOpen}>{image ? <img src={image} alt="Foto do perfil" /> : 'LG'}</button>{isOpen && <div className="profile-menu-dropdown"><a href="/pedidos">Meus pedidos</a><a href="/perfil">Editar perfil</a><a href="/login">Sair</a></div>}</div>;
}