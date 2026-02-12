import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Send, Paperclip, Smile, MoreVertical, Phone, Video,
  Image, FileText, Mic, Check, CheckCheck, Clock, Archive, Tag, Link2, MessageSquare, User,
} from "lucide-react";
import { LeadDetailsPanel } from "@/components/whatsapp/LeadDetailsPanel";
import type { WhatsAppContact, WhatsAppMessage } from "@/services/whatsappService";

// Placeholder - substituir por hooks reais
// import { useWhatsAppConversations, useWhatsAppMessages, useSendWhatsAppMessage, useMarkAsRead } from "@/hooks/useWhatsApp";

const PLACEHOLDER_CONTACTS: WhatsAppContact[] = [
  { id: "1", nome: "Ricardo Pereira", telefone: "(11) 99900-1234", foto_url: null, lead_id: "1", cliente_id: null, ultima_mensagem: "Boa tarde! Gostaria de cotar um seguro auto para meu Civic 2025", ultima_mensagem_at: "2026-02-12T14:30:00Z", nao_lidas: 2, status: "ativo", tags: ["lead", "auto"] },
  { id: "2", nome: "Luciana Mendes", telefone: "(21) 98800-5678", foto_url: null, lead_id: "2", cliente_id: null, ultima_mensagem: "Recebi a proposta, vou analisar e retorno", ultima_mensagem_at: "2026-02-12T13:15:00Z", nao_lidas: 0, status: "ativo", tags: ["lead", "vida"] },
  { id: "3", nome: "João Silva", telefone: "(11) 99999-1234", foto_url: null, lead_id: null, cliente_id: "1", ultima_mensagem: "Preciso acionar o seguro, tive uma colisão", ultima_mensagem_at: "2026-02-12T11:00:00Z", nao_lidas: 1, status: "ativo", tags: ["cliente", "sinistro"] },
  { id: "4", nome: "Empresa Alfa Ltda", telefone: "(11) 3300-9012", foto_url: null, lead_id: "3", cliente_id: null, ultima_mensagem: "Podem enviar a proposta do seguro empresarial?", ultima_mensagem_at: "2026-02-12T10:45:00Z", nao_lidas: 0, status: "ativo", tags: ["lead", "empresarial"] },
  { id: "5", nome: "Maria Santos", telefone: "(21) 98888-5678", foto_url: null, lead_id: null, cliente_id: "3", ultima_mensagem: "Obrigada pela ajuda com o sinistro!", ultima_mensagem_at: "2026-02-12T09:20:00Z", nao_lidas: 0, status: "ativo", tags: ["cliente"] },
  { id: "6", nome: "Patrícia Gomes", telefone: "(41) 96600-7890", foto_url: null, lead_id: "5", cliente_id: null, ultima_mensagem: "Vi o anúncio no Instagram, quero saber mais", ultima_mensagem_at: "2026-02-12T08:30:00Z", nao_lidas: 3, status: "ativo", tags: ["lead", "instagram"] },
  { id: "7", nome: "Carlos Mendes", telefone: "(31) 97777-9012", foto_url: null, lead_id: null, cliente_id: "4", ultima_mensagem: "Quando vence minha apólice?", ultima_mensagem_at: "2026-02-11T17:00:00Z", nao_lidas: 0, status: "ativo", tags: ["cliente", "renovação"] },
];

const PLACEHOLDER_MESSAGES: WhatsAppMessage[] = [
  { id: "m1", contato_id: "1", tipo: "text", conteudo: "Boa tarde! Vi o anúncio de vocês e gostaria de cotar um seguro auto", media_url: null, media_mime_type: null, direcao: "recebida", status: "lida", remetente: "Ricardo Pereira", created_at: "2026-02-12T14:00:00Z" },
  { id: "m2", contato_id: "1", tipo: "text", conteudo: "Boa tarde Ricardo! Claro, ficarei feliz em ajudar. Qual é o modelo e ano do seu veículo?", media_url: null, media_mime_type: null, direcao: "enviada", status: "lida", remetente: "Corretor", created_at: "2026-02-12T14:05:00Z" },
  { id: "m3", contato_id: "1", tipo: "text", conteudo: "É um Honda Civic EXL 2025, tenho 35 anos, garagem em casa e no trabalho", media_url: null, media_mime_type: null, direcao: "recebida", status: "lida", remetente: "Ricardo Pereira", created_at: "2026-02-12T14:10:00Z" },
  { id: "m4", contato_id: "1", tipo: "text", conteudo: "Excelente! Com esse perfil conseguimos boas condições. Vou preparar cotações com Porto Seguro, Tokio Marine e HDI. Pode me enviar a CNH e o documento do veículo?", media_url: null, media_mime_type: null, direcao: "enviada", status: "entregue", remetente: "Corretor", created_at: "2026-02-12T14:15:00Z" },
  { id: "m5", contato_id: "1", tipo: "text", conteudo: "Claro! Segue a CNH", media_url: null, media_mime_type: null, direcao: "recebida", status: "lida", remetente: "Ricardo Pereira", created_at: "2026-02-12T14:25:00Z" },
  { id: "m6", contato_id: "1", tipo: "image", conteudo: "CNH_Ricardo.jpg", media_url: "/placeholder.svg", media_mime_type: "image/jpeg", direcao: "recebida", status: "lida", remetente: "Ricardo Pereira", created_at: "2026-02-12T14:25:30Z" },
  { id: "m7", contato_id: "1", tipo: "text", conteudo: "Gostaria de cotar um seguro auto para meu Civic 2025", media_url: null, media_mime_type: null, direcao: "recebida", status: "entregue", remetente: "Ricardo Pereira", created_at: "2026-02-12T14:30:00Z" },
];

const WhatsApp = () => {
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(PLACEHOLDER_CONTACTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks prontos para integração:
  // const { data: conversations } = useWhatsAppConversations({ search: searchQuery });
  // const { data: messages } = useWhatsAppMessages(selectedContact?.id ?? null);
  // const sendMessage = useSendWhatsAppMessage();
  // const markAsRead = useMarkAsRead();

  const contacts = PLACEHOLDER_CONTACTS.filter(c =>
    c.nome.toLowerCase().includes(searchQuery.toLowerCase()) || c.telefone.includes(searchQuery)
  );

  const messages = selectedContact ? PLACEHOLDER_MESSAGES.filter(m => m.contato_id === selectedContact.id) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedContact) return;
    // sendMessage.mutate({ contato_id: selectedContact.id, tipo: "text", conteudo: messageInput });
    console.log("Enviar:", { contato_id: selectedContact.id, tipo: "text", conteudo: messageInput });
    setMessageInput("");
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const StatusIcon = ({ status }: { status: WhatsAppMessage["status"] }) => {
    switch (status) {
      case "enviada": return <Check className="h-3 w-3 text-muted-foreground" />;
      case "entregue": return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "lida": return <CheckCheck className="h-3 w-3 text-info" />;
      case "erro": return <Clock className="h-3 w-3 text-destructive" />;
      default: return null;
    }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-7rem)] gap-0 rounded-lg border border-border overflow-hidden bg-card">
        {/* Lista de Conversas */}
        <div className="w-80 flex-shrink-0 border-r border-border flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-success" /> Conversas
              </h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Arquivadas">
                  <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-9 h-8 text-xs bg-muted border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Contact List */}
          <ScrollArea className="flex-1">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedContact(c)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 ${
                  selectedContact?.id === c.id ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  {c.nao_lidas > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success text-[9px] font-bold text-success-foreground flex items-center justify-center">
                      {c.nao_lidas}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={`text-sm truncate ${c.nao_lidas > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{c.nome}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{formatTime(c.ultima_mensagem_at)}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${c.nao_lidas > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {c.ultima_mensagem}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {c.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Área de Chat */}
        {selectedContact ? (
          <>
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {selectedContact.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedContact.nome}</p>
                    <p className="text-[11px] text-muted-foreground">{selectedContact.telefone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {selectedContact.lead_id && (
                    <Badge variant="outline" className="text-[10px] border-accent text-accent mr-2">Lead vinculado</Badge>
                  )}
                  {selectedContact.cliente_id && (
                    <Badge variant="outline" className="text-[10px] border-success text-success mr-2">Cliente</Badge>
                  )}
                  <Button
                    variant={showLeadDetails ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    title="Ver detalhes do Lead"
                    onClick={() => setShowLeadDetails(!showLeadDetails)}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Vincular Lead">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Tags">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-3 max-w-2xl mx-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.direcao === "enviada" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        msg.direcao === "enviada"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        {msg.tipo === "image" ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 py-1">
                              <Image className="h-4 w-4 opacity-70" />
                              <span className="text-xs opacity-80">{msg.conteudo}</span>
                            </div>
                          </div>
                        ) : msg.tipo === "document" ? (
                          <div className="flex items-center gap-2 py-1">
                            <FileText className="h-4 w-4 opacity-70" />
                            <span className="text-xs">{msg.conteudo}</span>
                          </div>
                        ) : msg.tipo === "audio" ? (
                          <div className="flex items-center gap-2 py-1">
                            <Mic className="h-4 w-4 opacity-70" />
                            <span className="text-xs">Mensagem de áudio</span>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>
                        )}
                        <div className={`flex items-center gap-1 mt-1 ${msg.direcao === "enviada" ? "justify-end" : ""}`}>
                          <span className="text-[10px] opacity-60">{formatTime(msg.created_at)}</span>
                          {msg.direcao === "enviada" && <StatusIcon status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="px-4 py-3 border-t border-border bg-card">
                <div className="flex items-center gap-2 max-w-2xl mx-auto">
                  <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Input
                    placeholder="Digite uma mensagem..."
                    className="flex-1 h-9 text-sm bg-muted border-0"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 flex-shrink-0 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={handleSend}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lead Details Panel */}
            {showLeadDetails && (
              <LeadDetailsPanel contact={selectedContact} onClose={() => setShowLeadDetails(false)} />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WhatsApp;
