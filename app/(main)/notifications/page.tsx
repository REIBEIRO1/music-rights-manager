"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Notificações</h1>
        <p className="text-slate-600 mt-1">
          Vê todas as tuas notificações e atualizações
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Notificações</CardTitle>
          <CardDescription>
            Mantém-te atualizado com as últimas novidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-sm text-slate-600">
              Não tens notificações no momento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
