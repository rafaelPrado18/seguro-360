import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { documentAnalysisService, type ExtractedDocumentData } from "@/services/documentAnalysisService";
import { leadsService } from "@/services/leadsService";
import { DocumentAnalysisDialog } from "./DocumentAnalysisDialog";

interface DocumentUploadSectionProps {
  arquivoApolice: File | null;
  setArquivoApolice: (f: File | null) => void;
  arquivoProposta: File | null;
  setArquivoProposta: (f: File | null) => void;
  required?: boolean;
  onDocumentAnalyzed?: (data: ExtractedDocumentData) => void;
  leadId?: string;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}

export function DocumentUploadSection({
  arquivoApolice,
  setArquivoApolice,
  arquivoProposta,
  setArquivoProposta,
  required = false,
  onDocumentAnalyzed,
  leadId,
}: DocumentUploadSectionProps) {
  const { toast } = useToast();
  const [tipoDocumento, setTipoDocumento] = useState<"apolice" | "proposta" | "">("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ExtractedDocumentData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = "";

    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 10MB", variant: "destructive" });
      return;
    }
    if (!tipoDocumento) {
      toast({ title: "Selecione o tipo do documento", description: "Escolha se é Apólice ou Proposta antes de anexar.", variant: "destructive" });
      return;
    }

    // Salvar o arquivo no estado correto
    if (tipoDocumento === "apolice") {
      setArquivoApolice(file);
    } else {
      setArquivoProposta(file);
    }

    // Enviar para análise
    try {
      setAnalyzing(true);
      const result = await documentAnalysisService.analyzeDocument(file, tipoDocumento);
      setAnalysisResult(result);
      setDialogOpen(true);
    } catch {
      toast({ title: "Erro na análise", description: "Não foi possível extrair os dados do documento.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = (data: ExtractedDocumentData) => {
    onDocumentAnalyzed?.(data);
    toast({ title: "Dados confirmados!", description: "As informações do documento foram importadas." });
  };

  const currentFile = tipoDocumento === "apolice" ? arquivoApolice : tipoDocumento === "proposta" ? arquivoProposta : null;

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Documentos {required && <span className="text-destructive">*</span>}
      </h4>

      <div className="space-y-3">
        {/* Tipo do documento */}
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo do documento</Label>
          <Select value={tipoDocumento} onValueChange={(v) => setTipoDocumento(v as "apolice" | "proposta")}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apolice">Apólice</SelectItem>
              <SelectItem value="proposta">Proposta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload unificado */}
        <div className="space-y-1.5">
          <Label className="text-xs">Arquivo (PDF/Imagem)</Label>
          {analyzing ? (
            <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-4 text-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="text-foreground font-medium text-xs">Analisando documento...</p>
                <p className="text-muted-foreground text-[11px]">Extraindo informações automaticamente</p>
              </div>
            </div>
          ) : currentFile ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm truncate flex-1">{currentFile.name}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {(currentFile.size / 1024).toFixed(0)} KB
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  if (tipoDocumento === "apolice") setArquivoApolice(null);
                  else setArquivoProposta(null);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-3 text-sm transition-colors ${
                tipoDocumento
                  ? "border-border text-muted-foreground hover:bg-muted/30"
                  : "border-muted text-muted-foreground/50 cursor-not-allowed"
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>{tipoDocumento ? "Clique para anexar o documento" : "Selecione o tipo acima primeiro"}</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                disabled={!tipoDocumento}
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {/* Arquivos já anexados (resumo) */}
        {(arquivoApolice || arquivoProposta) && (
          <div className="space-y-1 pt-1">
            {arquivoApolice && tipoDocumento !== "apolice" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3 text-primary" />
                <span>Apólice: {arquivoApolice.name}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setArquivoApolice(null)}>
                  <X className="h-2.5 w-2.5" />
                </Button>
              </div>
            )}
            {arquivoProposta && tipoDocumento !== "proposta" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3 text-accent" />
                <span>Proposta: {arquivoProposta.name}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setArquivoProposta(null)}>
                  <X className="h-2.5 w-2.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog de confirmação dos dados extraídos */}
      <DocumentAnalysisDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={analysisResult}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
