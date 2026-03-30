import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock } from "lucide-react";
import { DocumentUploadSection } from "@/components/shared/DocumentUploadSection";
import { HistorySection } from "@/components/shared/HistorySection";
import type { ApoliceFormatted } from "@/services/apolicesService";

interface ApoliceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apolice: ApoliceFormatted | null;
}

export function ApoliceDetailSheet({ open, onOpenChange, apolice }: ApoliceDetailSheetProps) {
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);

  if (!apolice) return null;

  const referenceId = (apolice as any).leadId || apolice.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div>
            <SheetTitle className="text-lg">Apólice {apolice.id}</SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={`text-[10px] ${
                apolice.status === "Vigente" ? "border-success text-success" : "border-destructive text-destructive"
              }`}>{apolice.status}</Badge>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="px-6 pb-6">
            <Tabs defaultValue="info">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="info" className="text-xs gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Detalhes
                </TabsTrigger>
                <TabsTrigger value="documentos" className="text-xs gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Documentos
                </TabsTrigger>
                <TabsTrigger value="historico" className="text-xs gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <div className="space-y-5 mt-2">
                  {/* Informações Gerais */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Informações Gerais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente</span>
                        <span className="font-medium">{apolice.cliente}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seguradora</span>
                        <span>{apolice.seguradora}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nº Proposta</span>
                        <span className="font-mono text-xs">{apolice.numeroProposta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">C.I.</span>
                        <span className="font-mono text-xs">{apolice.ci}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Classe Bônus</span>
                        <span>{apolice.classeBonus}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Vigência */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Vigência</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Início</span>
                        <span>{apolice.inicio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fim</span>
                        <span>{apolice.fim}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Valores */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Valores</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border p-3 text-center">
                        <p className="text-lg font-bold text-foreground">{apolice.premio}</p>
                        <p className="text-xs text-muted-foreground">Prêmio Total</p>
                      </div>
                      <div className="rounded-lg border border-border p-3 text-center">
                        <p className="text-lg font-bold text-foreground">{apolice.premioLiquido}</p>
                        <p className="text-xs text-muted-foreground">Prêmio Líquido</p>
                      </div>
                      <div className="rounded-lg border border-border p-3 text-center">
                        <p className="text-lg font-bold text-success">{apolice.comissao || "—"}</p>
                        <p className="text-xs text-muted-foreground">Comissão</p>
                      </div>
                      <div className="rounded-lg border border-border p-3 text-center">
                        <p className="text-lg font-bold text-foreground">{apolice.iof}</p>
                        <p className="text-xs text-muted-foreground">IOF</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mt-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parcelas</span>
                        <span>{apolice.parcelas}x de {apolice.valorParcela}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Forma de Pagamento</span>
                        <span>{apolice.formaPagamento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Franquia</span>
                        <span>{apolice.franquia}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Veículo */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Veículo</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fabricante</span>
                        <span>{apolice.veiculo.fabricante}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modelo</span>
                        <span className="text-right max-w-[200px]">{apolice.veiculo.modelo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ano</span>
                        <span>{apolice.veiculo.ano}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Placa</span>
                        <span className="font-mono">{apolice.veiculo.placa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chassi</span>
                        <span className="font-mono text-xs">{apolice.veiculo.chassi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Combustível</span>
                        <span>{apolice.veiculo.combustivel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">FIPE</span>
                        <span className="font-mono text-xs">{apolice.veiculo.codigoFipe}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Utilização</span>
                        <span className="text-right max-w-[200px]">{apolice.veiculo.utilizacao}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Coberturas */}
                  {apolice.coberturas.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Coberturas</h4>
                      <div className="space-y-2">
                        {apolice.coberturas.map((c, idx) => (
                          <div key={idx} className="rounded-lg border border-border p-3 text-xs">
                            <p className="font-medium text-foreground">{c.descricao}</p>
                            <div className="flex justify-between mt-1 text-muted-foreground">
                              <span>Limite: {c.limite}</span>
                              <span className="font-semibold text-foreground">R$ {c.premio}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documentos">
                <div className="mt-2">
                  <DocumentUploadSection
                    arquivoApolice={arquivoApolice}
                    setArquivoApolice={setArquivoApolice}
                    arquivoProposta={arquivoProposta}
                    setArquivoProposta={setArquivoProposta}
                    leadId={referenceId}
                  />
                </div>
              </TabsContent>

              <TabsContent value="historico">
                <div className="mt-2">
                  <HistorySection referenceId={referenceId} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
