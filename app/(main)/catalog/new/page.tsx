"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function NewSongPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    isrc: "",
    iswc: "",
    upc: "",
    genre: "",
    subgenre: "",
    duration: "",
    creation_date: "",
    release_date: "",
    status: "demo",
    lyrics: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create song");
      }

      const data = await response.json();
      router.push(`/catalog/${data.song.id}`);
    } catch (error) {
      setError("Erro ao criar música");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>A carregar...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Nova Música</h1>
              <p className="text-sm text-slate-600 mt-1">
                Adiciona uma nova música ao teu catálogo
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/catalog">Cancelar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informação Básica</CardTitle>
              <CardDescription>
                Preenche os detalhes principais da música
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  placeholder="Nome da música"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Género</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => handleChange("genre", e.target.value)}
                    placeholder="Ex: Hip-Hop, Pop, Rock"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subgenre">Subgénero</Label>
                  <Input
                    id="subgenre"
                    value={formData.subgenre}
                    onChange={(e) => handleChange("subgenre", e.target.value)}
                    placeholder="Ex: Trap, R&B"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="registered">Registada</SelectItem>
                    <SelectItem value="released">Lançada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lyrics">Letra</Label>
                <Textarea
                  id="lyrics"
                  value={formData.lyrics}
                  onChange={(e) => handleChange("lyrics", e.target.value)}
                  placeholder="Letra da música..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Metadados</CardTitle>
              <CardDescription>
                Códigos e identificadores oficiais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isrc">ISRC</Label>
                  <Input
                    id="isrc"
                    value={formData.isrc}
                    onChange={(e) => handleChange("isrc", e.target.value)}
                    placeholder="Ex: USRC17607839"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iswc">ISWC</Label>
                  <Input
                    id="iswc"
                    value={formData.iswc}
                    onChange={(e) => handleChange("iswc", e.target.value)}
                    placeholder="Ex: T-345246800-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upc">UPC</Label>
                  <Input
                    id="upc"
                    value={formData.upc}
                    onChange={(e) => handleChange("upc", e.target.value)}
                    placeholder="Ex: 123456789012"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (segundos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    placeholder="Ex: 180"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creation_date">Data de Criação</Label>
                  <Input
                    id="creation_date"
                    type="date"
                    value={formData.creation_date}
                    onChange={(e) => handleChange("creation_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release_date">Data de Lançamento</Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => handleChange("release_date", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/catalog">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "A criar..." : "Criar Música"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
