"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, User, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Artist {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await fetch("/api/artists");
      const data = await response.json();
      
      if (data.artists) {
        setArtists(data.artists);
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const viewArtist = async (artistId: number) => {
    try {
      const response = await fetch("/api/context/set-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId }),
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await response.json();
        toast({
          title: "Erro",
          description: data.error || "Erro ao mudar de contexto",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao mudar de contexto",
        variant: "destructive",
      });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Os Meus Artistas</h1>
        <p className="text-slate-600 mt-1">
          Artistas que geres como manager
        </p>
      </div>

      {artists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-sm text-slate-600">
              Ainda não geres nenhum artista
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(artist.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{artist.name}</CardTitle>
                    <CardDescription>{artist.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Permissions */}
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">
                      As tuas permissões:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {artist.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <Button 
                    className="w-full" 
                    onClick={() => viewArtist(artist.id)}
                  >
                    Ver Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
