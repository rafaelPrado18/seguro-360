import { useState, useRef, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRole } from "@/contexts/RoleContext";
import {
  Search, Send, Paperclip, Smile, MoreVertical, Phone, Download,
  Image, FileText, Mic, Check, CheckCheck, Clock, Archive, Tag, Link2,
  MessageSquare, User, Plus, Pencil, Trash2, Heart, ThumbsUp,
  Laugh, MicOff, Play, Pause, X, Target, Square, FileStack, Loader2,
} from "lucide-react";
import { LeadDetailsPanel } from "@/components/whatsapp/LeadDetailsPanel";
import { NewLeadDialog } from "@/components/leads/NewLeadDialog";
import { toast } from "@/hooks/use-toast";
import type { WhatsAppContact, WhatsAppMessage } from "@/services/whatsappService";
import { v4 as uuidv4 } from "uuid";
import {
  useWhatsAppConversations,
  useWhatsAppMessages,
  useSendWhatsAppMessage,
  useArchiveConversation,
  useMarkAsRead,
} from "@/hooks/useWhatsApp";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const TEMPLATES = [
  { id: "1", nome: "Boas-vindas Lead", categoria: "boas_vindas", conteudo: "Olá {{nome}}! 👋\n\nSou {{corretor}} da SeguraCRM. Vi que você tem interesse em seguro {{ramo}}.\n\nPosso te ajudar a encontrar a melhor cobertura com o melhor preço. Quando podemos conversar?" },
  { id: "2", nome: "Envio de Proposta", categoria: "proposta", conteudo: "Olá {{nome}}! 📋\n\nSegue a proposta do seguro {{ramo}} que conversamos:\n\n🏢 Seguradora: {{seguradora}}\n💰 Prêmio: {{valor_premio}}\n\n📎 Acesse a proposta completa: {{link_proposta}}\n\nQualquer dúvida estou à disposição!" },
  { id: "3", nome: "Lembrete de Renovação", categoria: "renovacao", conteudo: "Olá {{nome}}! 🔔\n\nSua apólice {{numero_apolice}} ({{ramo}}) vence em {{data_vencimento}}.\n\nJá estou preparando a renovação com as melhores condições. Podemos agendar uma conversa para revisar as coberturas?\n\nAbraços, {{corretor}}" },
  { id: "4", nome: "Follow-up Lead", categoria: "follow_up", conteudo: "Oi {{nome}}, tudo bem? 😊\n\nEntrei em contato recentemente sobre o seguro {{ramo}}. Gostaria de saber se ainda tem interesse?\n\nEstou com condições especiais essa semana. Posso enviar uma cotação?" },
  { id: "5", nome: "Sinistro - Abertura", categoria: "sinistro", conteudo: "Olá {{nome}}, recebi seu chamado e já estou cuidando da abertura do sinistro.\n\n📋 Apólice: {{numero_apolice}}\n🏢 Seguradora: {{seguradora}}\n\nVou te manter informado(a) sobre cada etapa. Se precisar, é só chamar!\n\n{{corretor}}" },
];

const categoriaLabels: Record<string, string> = {
  boas_vindas: "Boas-vindas", proposta: "Proposta", renovacao: "Renovação",
  follow_up: "Follow-up", sinistro: "Sinistro", cobranca: "Cobrança", geral: "Geral",
};

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}

type ExtMessage = WhatsAppMessage & { reaction?: string; edited?: boolean; deleted?: boolean };

const WhatsApp = () => {
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [activeAction, setActiveAction] = useState<{ msgId: string; type: "reactions" | "menu" } | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [showMobileContacts, setShowMobileContacts] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [localReactions, setLocalReactions] = useState<Record<string, string>>({});
  const [deletedMsgs, setDeletedMsgs] = useState<Set<string>>(new Set());
  const [editedMsgs, setEditedMsgs] = useState<Record<string, string>>({});
  const recordingRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAdmin, currentUser } = useRole();

  // API hooks
  const { data: conversationsData, isLoading: loadingConversations } = useWhatsAppConversations(currentUser.nome);
  const { data: messagesData, isLoading: loadingMessages } = useWhatsAppMessages(`${selectedContact?.telefone}@c.us` || null, currentUser.nome);
  const sendMessageMutation = useSendWhatsAppMessage();
  const archiveMutation = useArchiveConversation();
  const markAsReadMutation = useMarkAsRead();

  const contacts = conversationsData?.data || [];
  const filteredContacts = contacts;

  const rawMessages: WhatsAppMessage[] = messagesData?.success || [];
  const messages: ExtMessage[] = rawMessages.map(m => ({
    ...m,
    conteudo: deletedMsgs.has(m.id) ? "Mensagem apagada" : (editedMsgs[m.id] ?? m.conteudo),
    reaction: localReactions[m.id],
    deleted: deletedMsgs.has(m.id),
    edited: !!editedMsgs[m.id],
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Auto mark as read when selecting contact
  useEffect(() => {
    if (selectedContact && selectedContact.nao_lidas > 0) {
      markAsReadMutation.mutate(selectedContact.id);
    }
  }, [selectedContact?.id]);

  const userId = getCookie("userId") || "";

  // --- Send text ---
  const handleSend = () => {
    if (!messageInput.trim() || !selectedContact) return;

    // Garante o sufixo @c.us no chatId conforme formato da API
    const rawPhone = selectedContact.telefone.replace(/\D/g, "");
    const chatId = rawPhone.includes("@") ? rawPhone : `${rawPhone}@c.us`;

    sendMessageMutation.mutate(
      {
        chatId,
        tipo: "text",
        userId,
        message: messageInput,
      },
      {
        onSuccess: () => {
          setMessageInput("");
        },
        onError: () => {
          toast({ title: "Erro", description: "Falha ao enviar mensagem", variant: "destructive" });
        },
      }
    );
  };

  // --- Delete message (local only) ---
  const handleDelete = (msgId: string) => {
    setDeletedMsgs(prev => new Set(prev).add(msgId));
  };

  // --- Edit message (local only) ---
  const startEdit = (msg: ExtMessage) => {
    setEditingMsg(msg.id);
    setEditText(msg.conteudo);
  };
  const confirmEdit = () => {
    if (!editingMsg || !editText.trim()) return;
    setEditedMsgs(prev => ({ ...prev, [editingMsg]: editText }));
    setEditingMsg(null);
    setEditText("");
  };
  const cancelEdit = () => { setEditingMsg(null); setEditText(""); };

  // --- React (local only) ---
  const handleReact = (msgId: string, emoji: string) => {
    setLocalReactions(prev => {
      const copy = { ...prev };
      if (copy[msgId] === emoji) delete copy[msgId];
      else copy[msgId] = emoji;
      return copy;
    });
  };

  // --- File attach ---
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedContact) return;
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith("image/");
      sendMessageMutation.mutate({
        chatId: selectedContact.id,
        tipo: isImage ? "image" : "document",
        userId,
        message: file.name,
        media_url: URL.createObjectURL(file),
      });
    });
    e.target.value = "";
  };

  // --- Audio recording ---
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingRef.current = window.setInterval(() => setRecordingTime(t => t + 1), 1000);
  };
  const stopRecording = (send: boolean) => {
    if (recordingRef.current) clearInterval(recordingRef.current);
    setIsRecording(false);
    if (send && selectedContact) {
      sendMessageMutation.mutate({
        chatId: selectedContact.id,
        tipo: "audio",
        userId,
        message: `audio_${recordingTime}s.ogg`,
      });
      toast({ title: "Áudio enviado", description: `Duração: ${recordingTime}s` });
    }
    setRecordingTime(0);
  };

  // --- Archive ---
  const handleArchive = () => {
    if (!selectedContact) return;
    archiveMutation.mutate(selectedContact.id, {
      onSuccess: () => {
        toast({ title: "Conversa arquivada" });
        setSelectedContact(null);
      },
    });
  };

  // --- Create lead & auto-create chat ---
  const handleLeadCreated = (lead: Record<string, unknown>) => {
    const nome = String(lead.nome || "Novo Lead");
    toast({ title: "Lead criado!", description: `Lead ${nome} criado com sucesso.` });
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const formatRecTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

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
      <div className="flex h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] gap-0 rounded-lg border border-border overflow-hidden bg-card">
        {/* Contact List */}
        <div className={`${showMobileContacts ? "flex" : "hidden"} md:flex w-full md:w-80 flex-shrink-0 border-r border-border flex-col`}>
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-success" /> Conversas
              </h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Novo Lead + Chat" onClick={() => setNewLeadOpen(true)}>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Arquivadas">
                  <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar conversas..." className="pl-9 h-8 text-xs bg-muted border-0" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhuma conversa encontrada</p>
            ) : (
              filteredContacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedContact(c); setShowMobileContacts(false); }}
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
                        {c.ultima_mensagem ? c.ultima_mensagem : "lead novo"}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {c.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {selectedContact ? (
          <>
            <div className={`${showMobileContacts ? "hidden" : "flex"} md:flex flex-1 flex-col min-w-0`}>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-2 sm:px-4 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden flex-shrink-0" onClick={() => setShowMobileContacts(true)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {selectedContact.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedContact.nome}</p>
                    <p className="text-[11px] text-muted-foreground">{selectedContact.telefone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {selectedContact.lead_id && (
                    <Badge variant="outline" className="text-[10px] border-accent text-accent mr-1 sm:mr-2 hidden sm:inline-flex">Lead vinculado</Badge>
                  )}
                  {selectedContact.cliente_id && (
                    <Badge variant="outline" className="text-[10px] border-success text-success mr-1 sm:mr-2 hidden sm:inline-flex">Cliente</Badge>
                  )}
                  {!selectedContact.lead_id && (
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 mr-1 sm:mr-2 hidden sm:flex" onClick={() => setNewLeadOpen(true)}>
                      <Target className="h-3 w-3" /> Criar Lead
                    </Button>
                  )}
                  <Button
                    variant={showLeadDetails ? "default" : "ghost"} size="icon" className="h-8 w-8"
                    title="Ver detalhes do Lead" onClick={() => setShowLeadDetails(!showLeadDetails)}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" title="Vincular Lead">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" title="Arquivar" onClick={handleArchive}>
                    <Archive className="h-4 w-4 text-muted-foreground" />
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
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3 max-w-2xl mx-auto">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.direcao === "enviada" ? "justify-end" : "justify-start"} group`}>
                        <div className="relative">
                          {/* Message bubble */}
                          <div className={`max-w-[400px] rounded-lg px-3 py-2 ${
                            msg.deleted
                              ? "bg-muted/50 text-muted-foreground italic border border-border"
                              : msg.direcao === "enviada"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                          }`}>
                            {msg.deleted ? (
                              <p className="text-xs flex items-center gap-1.5"><Trash2 className="h-3 w-3" /> Mensagem apagada</p>
                            ) : editingMsg === msg.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editText} onChange={(e) => setEditText(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
                                  className="h-7 text-xs bg-background text-foreground"
                                  autoFocus
                                />
                                <div className="flex gap-1 justify-end">
                                  <Button size="sm" variant="ghost" className="h-5 text-[10px] px-2" onClick={cancelEdit}>Cancelar</Button>
                                  <Button size="sm" className="h-5 text-[10px] px-2" onClick={confirmEdit}>Salvar</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.tipo === "image" ? (
                                  <div className="space-y-1">
                                    {msg.media_url && <img src={msg.media_url} alt={msg.conteudo} className="rounded max-w-[240px] max-h-[200px] object-cover" />}
                                    <div className="flex items-center gap-2 py-0.5">
                                      <Image className="h-3 w-3 opacity-70" />
                                      <span className="text-[10px] opacity-80">{msg.conteudo}</span>
                                    </div>
                                  </div>
                                ) : msg.tipo === "document" ? (
                                  <a
                                    href={msg.media_url || "#"}
                                    download={msg.conteudo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 py-1 px-2 bg-background/10 rounded cursor-pointer hover:bg-background/20 transition-colors"
                                    onClick={(e) => {
                                      if (!msg.media_url) {
                                        e.preventDefault();
                                        toast({ title: "Download", description: `Baixando ${msg.conteudo}...` });
                                      }
                                    }}
                                  >
                                    <FileText className="h-4 w-4 opacity-70" />
                                    <span className="text-xs flex-1 underline">{msg.conteudo}</span>
                                    <Download className="h-3.5 w-3.5 opacity-50" />
                                  </a>
                                ) : msg.tipo === "audio" ? (
                                  <div className="flex items-center gap-2 py-1 min-w-[180px]">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><Play className="h-3 w-3" /></Button>
                                    <div className="flex-1 h-1 rounded-full bg-background/20">
                                      <div className="h-1 rounded-full bg-current w-1/3" />
                                    </div>
                                    <span className="text-[10px] opacity-60">0:{msg.conteudo.match(/(\d+)s/)?.[1] || "00"}</span>
                                  </div>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>
                                )}
                                {msg.edited && <span className="text-[9px] opacity-40 italic">editada</span>}
                              </>
                            )}
                            <div className={`flex items-center gap-1 mt-1 ${msg.direcao === "enviada" ? "justify-end" : ""}`}>
                              <span className="text-[10px] opacity-60">{formatTime(msg.created_at)}</span>
                              {msg.direcao === "enviada" && <StatusIcon status={msg.status} />}
                            </div>
                          </div>

                          {/* Reaction badge */}
                          {msg.reaction && !msg.deleted && (
                            <span className="absolute -bottom-2 left-2 text-sm bg-card border border-border rounded-full px-1 shadow-sm cursor-pointer"
                              onClick={() => handleReact(msg.id, msg.reaction!)}>{msg.reaction}</span>
                          )}

                          {/* Actions on hover */}
                          {!msg.deleted && !editingMsg && (
                            <div className={`absolute top-0 ${msg.direcao === "enviada" ? "-left-20" : "-right-20"} hidden group-hover:flex items-center gap-0.5`}>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveAction(prev => prev?.msgId === msg.id && prev.type === "reactions" ? null : { msgId: msg.id, type: "reactions" })}>
                                <Smile className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveAction(prev => prev?.msgId === msg.id && prev.type === "menu" ? null : { msgId: msg.id, type: "menu" })}>
                                <MoreVertical className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          )}

                          {/* Reactions panel */}
                          {activeAction?.msgId === msg.id && activeAction.type === "reactions" && (
                            <div className={`absolute -top-9 ${msg.direcao === "enviada" ? "right-0" : "left-0"} z-50 flex gap-0.5 bg-card border border-border rounded-lg shadow-lg p-1`}>
                              {REACTIONS.map(r => (
                                <button key={r} className="text-lg hover:scale-125 transition-transform px-0.5" onClick={() => { handleReact(msg.id, r); setActiveAction(null); }}>{r}</button>
                              ))}
                            </div>
                          )}

                          {/* Menu panel */}
                          {activeAction?.msgId === msg.id && activeAction.type === "menu" && (
                            <div className={`absolute -top-1 ${msg.direcao === "enviada" ? "-left-36" : "-right-36"} z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[150px]`}>
                              {msg.direcao === "enviada" && msg.tipo === "text" && (
                                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors" onClick={() => { startEdit(msg); setActiveAction(null); }}>
                                  <Pencil className="h-3 w-3" /> Editar
                                </button>
                              )}
                              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-muted transition-colors" onClick={() => { handleDelete(msg.id); setActiveAction(null); }}>
                                <Trash2 className="h-3 w-3" /> Apagar para todos
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="px-4 py-3 border-t border-border bg-card">
                {isRecording ? (
                  <div className="flex items-center gap-3 max-w-2xl mx-auto">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => stopRecording(false)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                      <span className="text-sm font-mono text-destructive font-medium">{formatRecTime(recordingTime)}</span>
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-1 bg-destructive rounded-full animate-pulse" style={{ width: `${Math.min(recordingTime * 2, 100)}%` }} />
                      </div>
                    </div>
                    <Button size="icon" className="h-9 w-9 bg-success hover:bg-success/90 text-success-foreground" onClick={() => stopRecording(true)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 max-w-2xl mx-auto">
                    <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                      <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileAttach} />
                    <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" title="Templates">
                          <FileStack className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" side="top" align="start">
                        <div className="p-2 border-b border-border">
                          <p className="text-xs font-semibold text-foreground">Templates Rápidos</p>
                        </div>
                        <ScrollArea className="max-h-64">
                          <div className="p-1">
                            {TEMPLATES.map(t => (
                              <button
                                key={t.id}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => {
                                  let content = t.conteudo;
                                  if (selectedContact) {
                                    content = content.replace(/\{\{nome\}\}/g, selectedContact.nome);
                                  }
                                  setMessageInput(content);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <FileStack className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                  <span className="text-xs font-medium text-foreground">{t.nome}</span>
                                  <Badge variant="secondary" className="text-[9px] ml-auto">{categoriaLabels[t.categoria] || t.categoria}</Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 pl-5.5">{t.conteudo}</p>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <Input
                      placeholder="Digite uma mensagem..."
                      className="flex-1 h-9 text-sm bg-muted border-0"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    />
                    {messageInput.trim() ? (
                      <Button
                        size="icon"
                        className="h-9 w-9 flex-shrink-0 bg-success hover:bg-success/90 text-success-foreground"
                        onClick={handleSend}
                        disabled={sendMessageMutation.isPending}
                      >
                        {sendMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-destructive" onClick={startRecording}>
                        <Mic className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

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

      {/* New Lead Dialog */}
      <NewLeadDialog
        open={newLeadOpen}
        onOpenChange={setNewLeadOpen}
        onLeadCreated={handleLeadCreated}
      />
    </AppLayout>
  );
};

export default WhatsApp;
