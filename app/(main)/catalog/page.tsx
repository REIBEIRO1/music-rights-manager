"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Music, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Song {
  id: number;
  title: string;
  status: string;
  cover_url?: string;
  genre?: string;
  release_date?: string;
}

export default function CatalogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSongs();
    }
  }, [session]);

  const fetchSongs = async () => {
    try {
      const response = await fetch("/api/songs");
      if (response.ok) {
        const data = await response.json();
        setSongs(data.songs || []);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || song.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

  if (status === "loading" || loading) {
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
              <h1 className="text-2xl font-bold text-slate-900">Catálogo de Músicas</h1>
              <p className="text-sm text-slate-600 mt-1">
                Gere todas as tuas músicas num só lugar
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Voltar</Link>
              </Button>
              <Button asChild>
                <Link href="/catalog/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Música
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Pesquisar músicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="demo">Demo</SelectItem>
              <SelectItem value="registered">Registadas</SelectItem>
              <SelectItem value="released">Lançadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Songs Grid */}
        {filteredSongs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Music className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nenhuma música encontrada
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Começa por adicionar a tua primeira música ao catálogo
              </p>
              <Button asChild>
                <Link href="/catalog/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Música
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => (
              <Link key={song.id} href={`/catalog/${song.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-lg flex items-center justify-center">
                      {song.cover_url ? (
                        <img
                          src={song.cover_url}
                          alt={song.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <Music className="h-16 w-16 text-slate-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 truncate flex-1">
                        {song.title}
                      </h3>
                      <Badge className={getStatusColor(song.status)}>
                        {song.status}
                      </Badge>
                    </div>
                    {song.genre && (
                      <p className="text-sm text-slate-600">{song.genre}</p>
                    )}
                    {song.release_date && (
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(song.release_date).toLocaleDateString("pt-PT")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
