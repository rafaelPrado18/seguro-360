import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Send, Upload, Loader2, Download, StickyNote, MessageSquare,
  FileText, Phone, Mail, CheckCircle2, ShieldCheck, FileUp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { leadsService } from "@/services/leadsService";
import { useLeadHistory } from "@/hooks/useLeads";

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : "";
}

interface TimelineEvent {
  date: string;
  description: string;
  icon: string;
  type: string;
  fileUrl?: string;
  historyType?: string;
}

const timelineIconMap: Record<string, React.ReactNode> = {
  create: <FileText className="h-3.5 w-3.5 text-info" />,
  contact: <MessageSquare className="h-3.5 w-3.5 text-warning" />,
  note: <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />,
  message: <MessageSquare className="h-3.5 w-3.5 text-primary" />,
  document: <FileText className="h-3.5 w-3.5 text-accent" />,
  ligacao: <Phone className="h-3.5 w-3.5 text-info" />,
  email: <Mail className="h-3.5 w-3.5 text-accent" />,
  whatsapp: <MessageSquare className="h-3.5 w-3.5 text-success" />,
  pagamento: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  apolice: <ShieldCheck className="h-3.5 w-3.5 text-primary" />,
  documento: <FileUp className="h-3.5 w-3.5 text-warning" />,
};

interface HistorySectionProps {
  /** ID used to fetch/create history entries (maps to leadId in API) */
  referenceId: string;
  /** Extra static events to merge into timeline */
  staticEvents?: TimelineEvent[];
}

export function HistorySection({ referenceId, staticEvents = [] }: HistorySectionProps) {
  const [newNote, setNewNote] = useState("");
  const [sendingNote, setSendingNote] = useState(false);
  const [fileType, setFileType] = useState<"image" | "proposta" | "apolice" | "pdf">("pdf");
  const [uploading, setUploading] = useState(false);

  const { data: historyEntries = [], refetch } = useLeadHistory(referenceId);

  const isDocType = (t: string) => ["image", "proposta", "apolice", "pdf"].includes(t);

  const apiHistoryEvents: TimelineEvent[] = historyEntries.map((entry) => ({
    date: entry.timestamp,
    type: isDocType(entry.historyType) ? "document" : "message",
    description: isDocType(entry.historyType)
      ? `${entry.historyType.toUpperCase()} — ${entry.profile}`
      : `${entry.textContent} — ${entry.profile}`,
    icon: isDocType(entry.historyType) ? "document" : "message",
    fileUrl: isDocType(entry.historyType) ? entry.textContent : undefined,
    historyType: entry.historyType,
  }));

  const parseDate = (d: string) => {
    const match = d.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (match) return new Date(+match[3], +match[2] - 1, +match[1], +match[4], +match[5], +match[6]).getTime();
    return new Date(d).getTime();
  };

  const timeline = [...staticEvents, ...apiHistoryEvents].sort(
    (a, b) => parseDate(b.date) - parseDate(a.date)
  );

  const addNote = async () => {
    if (!newNote.trim()) return;
    const profile = getCookie("userName") || "sistema";
    setSendingNote(true);
    try {
      await leadsService.createLeadHistory({
        leadId: referenceId,
        historyType: "note",
        textContent: newNote.trim(),
        profile,
      });
      setNewNote("");
      refetch();
      toast({ title: "Nota adicionada" });
    } catch {
      toast({ title: "Erro ao adicionar nota", variant: "destructive" });
    } finally {
      setSendingNote(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const profile = getCookie("userEmail") || "sistema";
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await leadsService.uploadLeadFile(file, fileType, profile, referenceId);
      }
      refetch();
      toast({ title: "Arquivo(s) enviado(s)!", description: `${files.length} arquivo(s) enviado(s) com sucesso.` });
    } catch {
      toast({ title: "Erro ao enviar arquivo", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Note input */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Adicionar Nota / Arquivo
        </h4>
        <Textarea
          placeholder="Escreva uma nota ou comentário..."
          className="text-sm min-h-[60px]"
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addNote();
            }
          }}
        />
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 flex-1"
            onClick={addNote}
            disabled={!newNote.trim() || sendingNote}
          >
            {sendingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Enviar Nota
          </Button>
          <div className="flex gap-1.5 items-center">
            <Select value={fileType} onValueChange={(v) => setFileType(v as typeof fileType)}>
              <SelectTrigger className="h-8 text-xs w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Imagem</SelectItem>
                <SelectItem value="proposta">Proposta</SelectItem>
                <SelectItem value="apolice">Apólice</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <label>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild disabled={uploading}>
                <span>
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {uploading ? "Enviando..." : "Arquivo"}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Timeline */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h4>
        {timeline.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
            Nenhum registro no histórico.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-4">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3 relative">
                  <div className={`h-6 w-6 rounded-full bg-background border flex items-center justify-center flex-shrink-0 z-10 ${
                    event.type === "nota" || event.type === "message" ? "border-accent/50" : "border-border"
                  }`}>
                    {timelineIconMap[event.icon] || timelineIconMap[event.type] || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={`text-sm ${
                      event.type === "nota" || event.type === "message"
                        ? "text-foreground bg-accent/5 rounded-md p-2 -mt-0.5"
                        : "text-foreground"
                    }`}>
                      {event.description}
                    </p>
                    {event.fileUrl && (
                      <a
                        href={event.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="mt-1 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Baixar {event.historyType || "arquivo"}
                      </a>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
