"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Music, Users, UserCog, Calendar, Bell, Heart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [viewingArtist, setViewingArtist] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUser();
  }, [pathname]); // Re-fetch when pathname changes

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        
        // Check if viewing an artist (for managers)
        const viewingResponse = await fetch("/api/context/get-artist");
        const viewingData = await viewingResponse.json();
        
        if (viewingData.artist) {
          setViewingArtist(viewingData.artist);
        } else {
          setViewingArtist(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Menu items for artists
  const artistMenuItems = [
    { href: "/songs", label: "Catálogo de Músicas", icon: Music },
    { href: "/friends", label: "Amigos", icon: Users },
    { href: "/team", label: "Equipa", icon: UserCog },
    { href: "/concerts", label: "Concertos", icon: Calendar },
    { href: "/notifications", label: "Notificações", icon: Bell },
    { href: "/support", label: "Apoios", icon: Heart },
    { href: "/profile", label: "Perfil", icon: User },
  ];

  // Menu items for managers
  const managerMenuItems = [
    { href: "/artists", label: "Os Meus Artistas", icon: Users },
    { href: "/friends", label: "Amigos", icon: Users },
    { href: "/notifications", label: "Notificações", icon: Bell },
    { href: "/profile", label: "Perfil", icon: User },
  ];

  // Determine which menu to show
  // If manager is viewing an artist, show artist menu
  // Otherwise, show menu based on user role
  const menuItems = viewingArtist 
    ? artistMenuItems 
    : (user?.role === "manager" ? managerMenuItems : artistMenuItems);

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Music className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-slate-900">Music Rights</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info and logout - ALWAYS show authenticated user */}
      <div className="p-4 border-t border-slate-200">
        {user && (
          <div className="mb-3 px-4 flex items-center gap-3">
            {user.photo_url ? (
              <Image
                src={user.photo_url}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300">
                <User className="h-5 w-5 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-600 truncate">{user.email}</p>
              <p className="text-xs text-blue-600 mt-0.5 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-700 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
}
