'use client';

import { useEffect, useState } from 'react';
import { readArtisanProfile } from '../../services/api/usuarios.service';
import { getCurrentUser, logout } from '../../services/api/auth.service';

interface ProfileAvatarProps {
	className?: string;
	label?: string;
	withMenu?: boolean;
}

export default function ProfileAvatar({ className = 'avatar', label = 'Abrir perfil', withMenu = true }: ProfileAvatarProps) {
	const [image, setImage] = useState('');
	const [userName, setUserName] = useState('');
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const updateImage = () => setImage(readArtisanProfile().avatarImage);
		const updateUser = () => setUserName(getCurrentUser()?.name ?? '');
		updateImage();
		updateUser();
		window.addEventListener('profile-updated', updateImage);
		window.addEventListener('auth-updated', updateUser);
		return () => { window.removeEventListener('profile-updated', updateImage); window.removeEventListener('auth-updated', updateUser); };
	}, []);

	const initials = userName ? userName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() : 'LG';
	const avatarLabel = userName ? `Abrir perfil de ${userName}` : 'Entrar ou abrir perfil';

	if (!withMenu) return <span className={`${className}${image ? ' has-profile-image' : ''}`} aria-label={label}>{image && userName ? <img src={image} alt="Foto do perfil" /> : initials}</span>;

	return <div className="profile-menu"><button className={`${className}${image && userName ? ' has-profile-image' : ''}`} type="button" onClick={() => setIsOpen((current) => !current)} aria-label={label || avatarLabel} aria-expanded={isOpen}>{image && userName ? <img src={image} alt="Foto do perfil" /> : initials}</button>{isOpen && <div className="profile-menu-dropdown">{userName ? <><a href="/pedidos">Meus pedidos</a><a href="/perfil">Editar perfil</a><button type="button" onClick={() => { logout(); window.location.href = '/login'; }}>Sair</button></> : <a href="/login">Entrar</a>}</div>}</div>;
}