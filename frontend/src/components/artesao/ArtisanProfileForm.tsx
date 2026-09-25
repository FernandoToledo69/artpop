'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { readArtisanProfile, updateArtisanProfile } from '../../services/api/usuarios.service';
import { ArtisanProfile } from '../../types/usuario';
import { getCurrentUser } from '../../services/api/auth.service';

export default function ArtisanProfileForm() {
  const [profile, setProfile] = useState<ArtisanProfile>(readArtisanProfile);
  const [saved, setSaved] = useState(false);
  const [cropSource, setCropSource] = useState('');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragStartOffsetX, setDragStartOffsetX] = useState(0);

  useEffect(() => {
    const savedProfile = readArtisanProfile();
    const user = getCurrentUser();
    setProfile(user ? { ...savedProfile, name: user.name, email: user.email } : savedProfile);
  }, []);

  function updateField(field: keyof ArtisanProfile, value: string) {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateArtisanProfile(profile);
    window.dispatchEvent(new Event('profile-updated'));
    setSaved(true);
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { setCropSource(String(reader.result)); setCropZoom(1); setCropOffsetX(0); };
    reader.readAsDataURL(file);
    setSaved(false);
  }

  function confirmCrop() {
    const image = new Image();
    image.onload = () => {
      const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / cropZoom;
      const sourceOffsetX = (cropOffsetX / 360) * cropSize;
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const sourceX = Math.max(0, Math.min(image.naturalWidth - cropSize, (image.naturalWidth - cropSize) / 2 - sourceOffsetX));
      canvas.getContext('2d')?.drawImage(image, sourceX, (image.naturalHeight - cropSize) / 2, cropSize, cropSize, 0, 0, 600, 600);
      setProfile((currentProfile) => ({ ...currentProfile, avatarImage: canvas.toDataURL('image/jpeg', .9) }));
      setCropSource('');
    };
    image.src = cropSource;
  }

  function startDragging(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStartX(event.clientX);
    setDragStartOffsetX(cropOffsetX);
  }

  function dragImage(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStartX === null) return;
    setCropOffsetX(Math.max(-160, Math.min(160, dragStartOffsetX + event.clientX - dragStartX)));
  }

  function stopDragging() {
    setDragStartX(null);
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form-heading"><div><p className="eyebrow">MEU CADASTRO</p><h2>Dados pessoais</h2><p>Atualize seus dados para manter seu perfil sempre correto.</p></div><label className="profile-upload">{profile.avatarImage ? <img src={profile.avatarImage} alt="Prévia da foto do perfil" /> : <span className="profile-initials" aria-hidden="true">LG</span>}<span>Adicionar foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} /></span></label></div>
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
      {cropSource && <div className="crop-modal-backdrop" role="presentation"><section className="crop-modal" role="dialog" aria-modal="true" aria-labelledby="crop-title"><div className="crop-modal-heading"><div><p className="eyebrow">FOTO DO PERFIL</p><h2 id="crop-title">Ajuste sua imagem</h2><p>Arraste a imagem para os lados e recorte no formato quadrado.</p></div><button className="crop-close" type="button" onClick={() => setCropSource('')} aria-label="Cancelar recorte">×</button></div><div className="crop-preview" onPointerDown={startDragging} onPointerMove={dragImage} onPointerUp={stopDragging} onPointerCancel={stopDragging}><img src={cropSource} alt="Prévia para recorte" style={{ transform: `translateX(${cropOffsetX}px) scale(${cropZoom})` }} /></div><label className="crop-zoom">Zoom<input type="range" min="1" max="2.5" step=".1" value={cropZoom} onChange={(event) => setCropZoom(Number(event.target.value))} /></label><div className="crop-modal-actions"><button type="button" className="crop-cancel" onClick={() => setCropSource('')}>Cancelar</button><button type="button" onClick={confirmCrop}>Usar esta foto</button></div></section></div>}
    </form>
  );
}