"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Calendar, Users, FileText, Award, BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Song {
  id: number;
  title: string;
  status: string;
  isrc?: string;
  iswc?: string;
  upc?: string;
  genre?: string;
  subgenre?: string;
  duration?: number;
  creation_date?: string;
  release_date?: string;
  lyrics?: string;
  cover_url?: string;
}

export default function SongDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (params.id) {
      fetchSong();
    }
  }, [params.id]);

  const fetchSong = async () => {
    try {
      const response = await fetch(`/api/songs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSong(data.song);
      }
    } catch (error) {
      console.error("Error fetching song:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "released":
        return "bg-green-100 text-green-800";
      case "registered":
        return "bg-blue-100 text-blue-800";
      case "demo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>A carregar...</p>
      </div>
    );
  }

  if (!session || !song) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/catalog">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{song.title}</h1>
                <p className="text-sm text-slate-600 mt-1">
                  {song.genre && `${song.genre}${song.subgenre ? ` • ${song.subgenre}` : ""}`}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(song.status)}>
              {song.status}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cover & Quick Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center mb-4">
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Music className="h-24 w-24 text-slate-400" />
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600">Duração</p>
                    <p className="text-sm font-medium">{formatDuration(song.duration)}</p>
                  </div>
                  {song.creation_date && (
                    <div>
                      <p className="text-xs text-slate-600">Data de Criação</p>
                      <p className="text-sm font-medium">
                        {new Date(song.creation_date).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  )}
                  {song.release_date && (
                    <div>
                      <p className="text-xs text-slate-600">Data de Lançamento</p>
                      <p className="text-sm font-medium">
                        {new Date(song.release_date).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metadados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {song.isrc && (
                  <div>
                    <p className="text-xs text-slate-600">ISRC</p>
                    <p className="text-sm font-mono">{song.isrc}</p>
                  </div>
                )}
                {song.iswc && (
                  <div>
                    <p className="text-xs text-slate-600">ISWC</p>
                    <p className="text-sm font-mono">{song.iswc}</p>
                  </div>
                )}
                {song.upc && (
                  <div>
                    <p className="text-xs text-slate-600">UPC</p>
                    <p className="text-sm font-mono">{song.upc}</p>
                  </div>
                )}
                {!song.isrc && !song.iswc && !song.upc && (
                  <p className="text-sm text-slate-500">Nenhum metadado disponível</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="lyrics" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="lyrics">
                  <FileText className="h-4 w-4 mr-2" />
                  Letra
                </TabsTrigger>
                <TabsTrigger value="credits">
                  <Users className="h-4 w-4 mr-2" />
                  Créditos
                </TabsTrigger>
                <TabsTrigger value="files">
                  <Music className="h-4 w-4 mr-2" />
                  Ficheiros
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  <Award className="h-4 w-4 mr-2" />
                  Conquistas
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Stats
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lyrics" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Letra</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {song.lyrics ? (
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                        {song.lyrics}
                      </pre>
                    ) : (
                      <p className="text-sm text-slate-500">Nenhuma letra disponível</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="credits" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Créditos & Splits</CardTitle>
                    <CardDescription>
                      Colaboradores e percentagens de direitos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500">
                      Nenhum crédito adicionado ainda
                    </p>
                    <Button className="mt-4" variant="outline">
                      Adicionar Colaborador
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ficheiros</CardTitle>
                    <CardDescription>
                      Áudio, artwork, stems e documentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500">
                      Nenhum ficheiro carregado ainda
                    </p>
                    <Button className="mt-4" variant="outline">
                      Carregar Ficheiro
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conquistas</CardTitle>
                    <CardDescription>
                      Certificações, playlists e marcos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500">
                      Nenhuma conquista registada ainda
                    </p>
                    <Button className="mt-4" variant="outline">
                      Adicionar Conquista
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas</CardTitle>
                    <CardDescription>
                      Streams, ouvintes e performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500">
                      Nenhuma estatística disponível ainda
                    </p>
                    <Button className="mt-4" variant="outline">
                      Adicionar Estatísticas
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
