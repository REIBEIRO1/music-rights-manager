"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Mail, MessageCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Apoios</h1>
        <p className="text-slate-600 mt-1">
          Precisa de ajuda? Estamos aqui para ti
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Chat ao Vivo</CardTitle>
                <CardDescription>
                  Fala connosco em tempo real
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Iniciar Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Email</CardTitle>
                <CardDescription>
                  Envia-nos um email
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              support@musicrights.com
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Documentação</CardTitle>
                <CardDescription>
                  Consulta os nossos guias
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Ver Documentação</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Perguntas frequentes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Ver FAQ</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
