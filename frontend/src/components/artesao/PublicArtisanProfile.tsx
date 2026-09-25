'use client';

import { useEffect, useState } from 'react';
import { readArtisanProfile } from '../../services/api/usuarios.service';
import { ArtisanProfile } from '../../types/usuario';

export default function PublicArtisanProfile() {
  const [profile, setProfile] = useState<ArtisanProfile>({ name: '', email: '', phone: '', address: '', city: '', state: '', bio: '', avatarImage: '' });

  useEffect(() => {
    setProfile(readArtisanProfile());
    const handleStorage = () => setProfile(readArtisanProfile());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const location = [profile.city, profile.state].filter(Boolean).join(' - ');

  return (
    <section className="public-profile" aria-labelledby="public-profile-title">
      <div className="profile-avatar">{profile.avatarImage ? <img src={profile.avatarImage} alt={`Foto de ${profile.name}`} /> : 'LG'}</div>
      <div><p className="eyebrow">ARTESÃO</p><h2 id="public-profile-title">{profile.name}</h2><p>{profile.bio}</p>{location && <span className="profile-location">{location}</span>}{profile.address && <span className="profile-location">{profile.address}</span>}{profile.phone && <span className="profile-location">{profile.phone}</span>}</div>
    </section>
  );
}