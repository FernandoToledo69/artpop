'use client';

import { FormEvent, useEffect, useState } from 'react';
import { readArtisanProfile, updateArtisanProfile } from '../../services/api/usuarios.service';
import { ArtisanProfile } from '../../types/usuario';

export default function ArtisanProfileForm() {
  const [profile, setProfile] = useState<ArtisanProfile>(readArtisanProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setProfile(readArtisanProfile()); }, []);

  function updateField(field: keyof ArtisanProfile, value: string) {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateArtisanProfile(profile);
    setSaved(true);
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form-heading"><div><p className="eyebrow">MEU CADASTRO</p><h2>Dados pessoais</h2><p>Atualize seus dados para manter seu perfil sempre correto.</p></div><span className="profile-initials" aria-hidden="true">LG</span></div>
      <div className="field-grid">
        <label className="field field-wide">Nome completo<input value={profile.name} onChange={(event) => updateField('name', event.target.value)} /></label>
        <label className="field">E-mail<input type="email" value={profile.email} disabled /></label>
        <label className="field">Telefone<input value={profile.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="(00) 00000-0000" /></label>
        <label className="field field-wide">Endereço<input value={profile.address} onChange={(event) => updateField('address', event.target.value)} placeholder="Rua, número e complemento" /></label>
        <label className="field">Cidade<input value={profile.city} onChange={(event) => updateField('city', event.target.value)} /></label>
        <label className="field">Estado<input maxLength={2} value={profile.state} onChange={(event) => updateField('state', event.target.value.toUpperCase())} placeholder="UF" /></label>
      </div>
      <div className="profile-form-footer"><p>As alterações aparecem no seu perfil público após salvar.</p><button type="submit">Salvar alterações</button></div>
      {saved && <p className="success-message" role="status">Cadastro atualizado com sucesso.</p>}
    </form>
  );
}