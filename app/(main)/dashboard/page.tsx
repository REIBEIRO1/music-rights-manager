"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, Calendar, DollarSign, Bell, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [viewingArtist, setViewingArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSongs: 0,
    pendingSplits: 0,
    upcomingReleases: 0,
    recentConcerts: 0,
    monthlyRoyalties: 0,
    notifications: 0,
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        
        if (!data.user) {
          router.push("/login");
        } else {
          setUser(data.user);
          
          // Check if viewing an artist (for managers)
          const viewingResponse = await fetch("/api/context/get-artist");
          const viewingData = await viewingResponse.json();
          
          if (viewingData.artist) {
            setViewingArtist(viewingData.artist);
          }
          
          fetchStats();
        }
      } catch (error) {
        console.error("Session error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/songs");
      const data = await response.json();
      
      if (data.songs) {
        setStats(prev => ({
          ...prev,
          totalSongs: data.songs.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const exitViewMode = async () => {
    try {
      await fetch("/api/context/clear", { method: "POST" });
      router.push("/artists");
      router.refresh();
    } catch (error) {
      console.error("Error exiting view mode:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>A carregar...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Manager viewing artist banner */}
      {viewingArtist && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-900">
              <strong>A ver como manager:</strong> Estás a visualizar o dashboard de {viewingArtist.name}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={exitViewMode}
              className="text-blue-900 hover:text-blue-700"
            >
              <X className="h-4 w-4 mr-1" />
              Sair
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-600">
          Bem-vindo ao teu painel de gestão musical
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Músicas
            </CardTitle>
            <Music className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSongs}</div>
            <p className="text-xs text-slate-600 mt-1">
              No teu catálogo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Splits Pendentes
            </CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSplits}</div>
            <p className="text-xs text-slate-600 mt-1">
              A aguardar confirmação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos Lançamentos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingReleases}</div>
            <p className="text-xs text-slate-600 mt-1">
              Nos próximos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Concertos Recentes
            </CardTitle>
            <Calendar className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentConcerts}</div>
            <p className="text-xs text-slate-600 mt-1">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Royalties do Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.monthlyRoyalties}</div>
            <p className="text-xs text-slate-600 mt-1">
              Mês atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notificações
            </CardTitle>
            <Bell className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notifications}</div>
            <p className="text-xs text-slate-600 mt-1">
              Não lidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas atualizações na tua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            Nenhuma atividade recente
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
