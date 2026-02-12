import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadItem {
  file: File;
  id: string;
}

interface DocumentUploadSectionProps {
  arquivoApolice: File | null;
  setArquivoApolice: (f: File | null) => void;
  arquivoProposta: File | null;
  setArquivoProposta: (f: File | null) => void;
  required?: boolean;
}

export function DocumentUploadSection({
  arquivoApolice,
  setArquivoApolice,
  arquivoProposta,
  setArquivoProposta,
  required = false,
}: DocumentUploadSectionProps) {
  const { toast } = useToast();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 10MB", variant: "destructive" });
      return;
    }
    setter(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Documentos {required && <span className="text-destructive">*</span>}
      </h4>
      <div className="space-y-3">
        {/* Apólice */}
        <div className="space-y-1.5">
          <Label className="text-xs">Arquivo da Apólice (PDF/Imagem)</Label>
          {arquivoApolice ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm truncate flex-1">{arquivoApolice.name}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {(arquivoApolice.size / 1024).toFixed(0)} KB
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setArquivoApolice(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Clique para anexar a apólice</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => handleFileChange(e, setArquivoApolice)} />
            </label>
          )}
        </div>

        {/* Proposta */}
        <div className="space-y-1.5">
          <Label className="text-xs">Arquivo da Proposta (PDF/Imagem)</Label>
          {arquivoProposta ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
              <FileText className="h-4 w-4 text-accent shrink-0" />
              <span className="text-sm truncate flex-1">{arquivoProposta.name}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {(arquivoProposta.size / 1024).toFixed(0)} KB
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setArquivoProposta(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Clique para anexar a proposta</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => handleFileChange(e, setArquivoProposta)} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
