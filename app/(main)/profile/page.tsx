"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Save, Camera, Upload } from "lucide-react";
import Image from "next/image";

interface Manager {
  id: number;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    artist_name: "",
    real_name: "",
    age: "",
    spa_member_number: "",
    spa_coop_number: "",
    ipi_number: "",
    alias_ipi_number: "",
    label: "",
    distributor: "",
    email: "",
    email_alt: "",
    phone_number: "",
    spotify_artist_id: "",
    id_card_number: "",
    nif: "",
    id_card_expiry: "",
    address: "",
    postal_code: "",
    birthday: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchManagers();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      
      if (data.profile) {
        setProfile({
          artist_name: data.profile.artist_name || "",
          real_name: data.profile.real_name || "",
          age: data.profile.age || "",
          spa_member_number: data.profile.spa_member_number || "",
          spa_coop_number: data.profile.spa_coop_number || "",
          ipi_number: data.profile.ipi_number || "",
          alias_ipi_number: data.profile.alias_ipi_number || "",
          label: data.profile.label || "",
          distributor: data.profile.distributor || "",
          email: data.profile.email || "",
          email_alt: data.profile.email_alt || "",
          phone_number: data.profile.phone_number || "",
          spotify_artist_id: data.profile.spotify_artist_id || "",
          id_card_number: data.profile.id_card_number || "",
          nif: data.profile.nif || "",
          id_card_expiry: data.profile.id_card_expiry || "",
          address: data.profile.address || "",
          postal_code: data.profile.postal_code || "",
          birthday: data.profile.birthday || "",
        });
        setPhotoUrl(data.profile.photo_url || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch("/api/team");
      const data = await response.json();
      
      if (data.members) {
        setManagers(data.members.map((m: any) => ({
          id: m.member_id,
          name: m.name,
          email: m.email,
        })));
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, 'image/jpeg', 0.8);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress image before upload
      const compressedBlob = await compressImage(file);
      
      const formData = new FormData();
      formData.append("file", compressedBlob, file.name);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPhotoUrl(data.photoUrl);
        toast({
          title: "Sucesso",
          description: "Foto atualizada com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao fazer upload da foto",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>A carregar...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Perfil</h1>
          <p className="text-slate-600 mt-1">
            Gere as tuas informações pessoais e profissionais
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "A guardar..." : "Guardar"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Foto de Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>A tua foto aparecerá no perfil, lista de amigos e equipa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt="Foto de perfil"
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-slate-200"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-300">
                    <User className="h-12 w-12 text-slate-400" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "A carregar..." : "Carregar Foto"}
                </Button>
                <p className="text-sm text-slate-600 mt-2">
                  JPG, PNG ou GIF. A imagem será redimensionada automaticamente.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Nome artístico e informações pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="artist_name">Nome Artístico</Label>
                <Input
                  id="artist_name"
                  value={profile.artist_name}
                  onChange={(e) => handleChange("artist_name", e.target.value)}
                  placeholder="Nome artístico"
                />
              </div>
              <div>
                <Label htmlFor="real_name">Nome Real</Label>
                <Input
                  id="real_name"
                  value={profile.real_name}
                  onChange={(e) => handleChange("real_name", e.target.value)}
                  placeholder="Nome real"
                />
              </div>
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="Idade"
                />
              </div>
              <div>
                <Label htmlFor="birthday">Data de Nascimento</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => handleChange("birthday", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Números de Membro */}
        <Card>
          <CardHeader>
            <CardTitle>Números de Membro</CardTitle>
            <CardDescription>SPA, IPI e outros números de identificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spa_member_number">SPA Member N.º</Label>
                <Input
                  id="spa_member_number"
                  value={profile.spa_member_number}
                  onChange={(e) => handleChange("spa_member_number", e.target.value)}
                  placeholder="Número de membro SPA"
                />
              </div>
              <div>
                <Label htmlFor="spa_coop_number">SPA Coop. N.º</Label>
                <Input
                  id="spa_coop_number"
                  value={profile.spa_coop_number}
                  onChange={(e) => handleChange("spa_coop_number", e.target.value)}
                  placeholder="Número cooperativa SPA"
                />
              </div>
              <div>
                <Label htmlFor="ipi_number">IPI N.º</Label>
                <Input
                  id="ipi_number"
                  value={profile.ipi_number}
                  onChange={(e) => handleChange("ipi_number", e.target.value)}
                  placeholder="Número IPI"
                />
              </div>
              <div>
                <Label htmlFor="alias_ipi_number">Alias IPI N.º</Label>
                <Input
                  id="alias_ipi_number"
                  value={profile.alias_ipi_number}
                  onChange={(e) => handleChange("alias_ipi_number", e.target.value)}
                  placeholder="Número IPI alternativo"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managers */}
        <Card>
          <CardHeader>
            <CardTitle>Managers</CardTitle>
            <CardDescription>Os teus managers atuais</CardDescription>
          </CardHeader>
          <CardContent>
            {managers.length === 0 ? (
              <p className="text-sm text-slate-600">Ainda não tens managers</p>
            ) : (
              <div className="space-y-2">
                {managers.map((manager) => (
                  <div key={manager.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <User className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-900">{manager.name}</p>
                      <p className="text-sm text-slate-600">{manager.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Profissionais</CardTitle>
            <CardDescription>Label, distribuidora e Spotify</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={profile.label}
                  onChange={(e) => handleChange("label", e.target.value)}
                  placeholder="Nome da label"
                />
              </div>
              <div>
                <Label htmlFor="distributor">Distribuidora</Label>
                <Input
                  id="distributor"
                  value={profile.distributor}
                  onChange={(e) => handleChange("distributor", e.target.value)}
                  placeholder="Nome da distribuidora"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="spotify_artist_id">Spotify Artist ID</Label>
                <Input
                  id="spotify_artist_id"
                  value={profile.spotify_artist_id}
                  onChange={(e) => handleChange("spotify_artist_id", e.target.value)}
                  placeholder="ID do artista no Spotify"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contactos */}
        <Card>
          <CardHeader>
            <CardTitle>Contactos</CardTitle>
            <CardDescription>Email e telefone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Principal</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="email_alt">Email Alternativo</Label>
                <Input
                  id="email_alt"
                  type="email"
                  value={profile.email_alt}
                  onChange={(e) => handleChange("email_alt", e.target.value)}
                  placeholder="email.alt@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Número de Telefone</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={profile.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>Cartão de cidadão e NIF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id_card_number">Cartão de Cidadão</Label>
                <Input
                  id="id_card_number"
                  value={profile.id_card_number}
                  onChange={(e) => handleChange("id_card_number", e.target.value)}
                  placeholder="Número do CC"
                />
              </div>
              <div>
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  value={profile.nif}
                  onChange={(e) => handleChange("nif", e.target.value)}
                  placeholder="Número de contribuinte"
                />
              </div>
              <div>
                <Label htmlFor="id_card_expiry">Validade CC</Label>
                <Input
                  id="id_card_expiry"
                  type="date"
                  value={profile.id_card_expiry}
                  onChange={(e) => handleChange("id_card_expiry", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Morada */}
        <Card>
          <CardHeader>
            <CardTitle>Morada</CardTitle>
            <CardDescription>Endereço completo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Morada</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Rua, número, andar"
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Código Postal</Label>
              <Input
                id="postal_code"
                value={profile.postal_code}
                onChange={(e) => handleChange("postal_code", e.target.value)}
                placeholder="0000-000"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
