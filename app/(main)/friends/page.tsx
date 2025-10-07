"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Check, X, Mail, Users as UsersIcon, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  status: string;
  created_at: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      const data = await response.json();
      
      if (data.friends) {
        setFriends(data.friends.filter((f: Friend) => f.status === "accepted"));
        setPendingRequests(data.friends.filter((f: Friend) => f.status === "pending" && f.friend_id === data.currentUserId));
        setSentRequests(data.friends.filter((f: Friend) => f.status === "pending" && f.user_id === data.currentUserId));
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!searchEmail.trim()) {
      setMessage("Por favor, insere um email");
      return;
    }

    setSendingRequest(true);
    setMessage("");

    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: searchEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Pedido de amizade enviado!");
        setSearchEmail("");
        fetchFriends();
      } else {
        setMessage(data.error || "Erro ao enviar pedido");
      }
    } catch (error) {
      setMessage("Erro ao enviar pedido");
    } finally {
      setSendingRequest(false);
    }
  };

  const handleRequest = async (friendshipId: number, action: "accept" | "reject") => {
    try {
      const response = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, action }),
      });

      if (response.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error("Error handling request:", error);
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

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      artist: "bg-blue-100 text-blue-800",
      manager: "bg-purple-100 text-purple-800",
      collaborator: "bg-green-100 text-green-800",
      publisher: "bg-orange-100 text-orange-800",
    };

    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const renderAvatar = (friend: Friend) => {
    if (friend.photo_url) {
      return (
        <Image
          src={friend.photo_url}
          alt={friend.name}
          width={40}
          height={40}
          className="rounded-full object-cover border-2 border-slate-200"
        />
      );
    }
    
    return (
      <Avatar>
        <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
      </Avatar>
    );
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
        <h1 className="text-3xl font-bold text-slate-900">Amigos</h1>
        <p className="text-slate-600 mt-1">
          Gere os teus amigos e colaboradores
        </p>
      </div>

      {/* Send Friend Request */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Adicionar Amigo</CardTitle>
          <CardDescription>
            Envia um pedido de amizade através do email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="email@exemplo.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendFriendRequest()}
            />
            <Button onClick={sendFriendRequest} disabled={sendingRequest}>
              <UserPlus className="h-4 w-4 mr-2" />
              {sendingRequest ? "A enviar..." : "Enviar Pedido"}
            </Button>
          </div>
          {message && (
            <p className={`mt-3 text-sm ${message.includes("Erro") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">
            Amigos ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pedidos Recebidos ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Pedidos Enviados ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Friends List */}
        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>Os Teus Amigos</CardTitle>
              <CardDescription>
                Pessoas com quem podes colaborar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UsersIcon className="h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-sm text-slate-600">
                    Ainda não tens amigos adicionados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
                        {renderAvatar(friend)}
                        <div>
                          <p className="font-medium text-slate-900">{friend.name}</p>
                          <p className="text-sm text-slate-600">{friend.email}</p>
                        </div>
                      </div>
                      <Badge className={getRoleBadge(friend.role)}>
                        {friend.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Requests */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recebidos</CardTitle>
              <CardDescription>
                Pedidos de amizade que recebeste
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-sm text-slate-600">
                    Não tens pedidos pendentes
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {renderAvatar(request)}
                        <div>
                          <p className="font-medium text-slate-900">{request.name}</p>
                          <p className="text-sm text-slate-600">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRequest(request.id, "accept")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequest(request.id, "reject")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Requests */}
        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Enviados</CardTitle>
              <CardDescription>
                Pedidos de amizade que enviaste
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-sm text-slate-600">
                    Não enviaste nenhum pedido
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {renderAvatar(request)}
                        <div>
                          <p className="font-medium text-slate-900">{request.name}</p>
                          <p className="text-sm text-slate-600">{request.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Pendente</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
