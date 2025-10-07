"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface TeamMember {
  id: string;
  member_id: string;
  name: string;
  email: string;
  permissions: string[];
  photo_url?: string;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "view_catalog", label: "Ver Catálogo" },
  { id: "edit_catalog", label: "Editar Catálogo" },
  { id: "view_profile", label: "Ver Perfil" },
  { id: "edit_profile", label: "Editar Perfil" },
  { id: "view_concerts", label: "Ver Concertos" },
  { id: "edit_concerts", label: "Editar Concertos" },
  { id: "view_team", label: "Ver Equipa" },
];

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
    fetchFriends();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team");
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      if (response.ok) {
        const data = await response.json();
        // Filter only friends with role "manager"
        const managers = data.friends?.filter((f: Friend) => f.role === "manager") || [];
        setFriends(managers);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleAddManager = async () => {
    if (!selectedFriend) {
      toast({
        title: "Erro",
        description: "Por favor seleciona um manager",
        variant: "destructive",
      });
      return;
    }

    if (selectedPermissions.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor seleciona pelo menos uma permissão",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/team/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedFriend,
          permissions: selectedPermissions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Manager adicionado com sucesso",
        });
        setDialogOpen(false);
        setSelectedFriend("");
        setSelectedPermissions([]);
        fetchTeamMembers();
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao adicionar manager",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar manager",
        variant: "destructive",
      });
    }
  };

  const handleRemoveManager = async (memberId: string) => {
    try {
      const response = await fetch("/api/team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Manager removido com sucesso",
        });
        fetchTeamMembers();
      } else {
        const data = await response.json();
        toast({
          title: "Erro",
          description: data.error || "Erro ao remover manager",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover manager",
        variant: "destructive",
      });
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const renderAvatar = (member: TeamMember) => {
    if (member.photo_url) {
      return (
        <Image
          src={member.photo_url}
          alt={member.name}
          width={48}
          height={48}
          className="rounded-full object-cover border-2 border-slate-200"
        />
      );
    }
    
    return (
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="h-6 w-6 text-primary" />
      </div>
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Equipa</h1>
          <p className="text-slate-600 mt-1">
            Gere os membros da tua equipa e as suas permissões
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Manager
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Manager à Equipa</DialogTitle>
              <DialogDescription>
                Seleciona um manager dos teus amigos e define as suas permissões
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Manager</Label>
                {friends.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Não tens managers nos teus amigos. Adiciona managers primeiro na página de Amigos.
                  </p>
                ) : (
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedFriend}
                    onChange={(e) => setSelectedFriend(e.target.value)}
                  >
                    <option value="">Seleciona um manager</option>
                    {friends.map((friend) => (
                      <option key={friend.id} value={friend.id}>
                        {friend.name} ({friend.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedFriend && (
                <div className="space-y-2">
                  <Label>Permissões</Label>
                  <div className="space-y-2">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <Label
                          htmlFor={permission.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {permission.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddManager} disabled={!selectedFriend || selectedPermissions.length === 0}>
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teamMembers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Ainda não tens nenhum manager</p>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Adiciona managers à tua equipa para te ajudarem a gerir o teu catálogo,
                perfil e concertos.
              </p>
            </CardContent>
          </Card>
        ) : (
          teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {renderAvatar(member)}
                    <div>
                      <CardTitle>{member.name}</CardTitle>
                      <CardDescription>{member.email}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveManager(member.member_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium mb-2">Permissões:</p>
                  <div className="flex flex-wrap gap-2">
                    {member.permissions.map((permission) => {
                      const permLabel = AVAILABLE_PERMISSIONS.find(
                        (p) => p.id === permission
                      )?.label;
                      return (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {permLabel || permission}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
