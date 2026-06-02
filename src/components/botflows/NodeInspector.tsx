import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { BotFlowNodeData, BotNodeType } from "@/services/botFlowService";
import { botFunctionService, type BotFunction } from "@/services/botFunctionService";
import { KeyValueEditor } from "@/components/shared/KeyValueEditor";

interface Props {
  node: Node<BotFlowNodeData> | null;
  onChange: (id: string, patch: Partial<BotFlowNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function NodeInspector({ node, onChange, onDelete, onClose }: Props) {
  const [functions, setFunctions] = useState<BotFunction[]>([]);

  useEffect(() => {
    if (node?.type === "action") {
      botFunctionService.list().then(setFunctions).catch(() => setFunctions([]));
    }
  }, [node?.id, node?.type]);

  if (!node) return null;
  const type = node.type as BotNodeType;
  const data = node.data;

  const update = (patch: Partial<BotFlowNodeData>) => onChange(node.id, patch);

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold capitalize">{type}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1.5">
          <Label>Título</Label>
          <Input value={data.label || ""} onChange={(e) => update({ label: e.target.value })} />
        </div>

        {type === "message" && (
          <div className="space-y-1.5">
            <Label>Mensagem</Label>
            <Textarea
              rows={6}
              value={data.message || ""}
              onChange={(e) => update({ message: e.target.value })}
              placeholder="Texto que será enviado ao usuário..."
            />
          </div>
        )}

        {type === "question" && (
          <>
            <div className="space-y-1.5">
              <Label>Pergunta</Label>
              <Textarea
                rows={3}
                value={data.message || ""}
                onChange={(e) => update({ message: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opções</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    update({
                      options: [...(data.options || []), { label: "", value: "" }],
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                </Button>
              </div>
              {(data.options || []).map((opt, i) => (
                <div key={i} className="flex gap-1.5">
                  <Input
                    placeholder={`Opção ${i + 1}`}
                    value={opt.label}
                    onChange={(e) => {
                      const next = [...(data.options || [])];
                      next[i] = { ...next[i], label: e.target.value, value: e.target.value };
                      update({ options: next });
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const next = [...(data.options || [])];
                      next.splice(i, 1);
                      update({ options: next });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {type === "condition" && (
          <>
            <div className="space-y-1.5">
              <Label>Variável</Label>
              <Input
                placeholder="ex: ultima_resposta"
                value={data.variable || ""}
                onChange={(e) => update({ variable: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Operador</Label>
              <Select value={data.operator || "eq"} onValueChange={(v) => update({ operator: v as BotFlowNodeData["operator"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eq">Igual</SelectItem>
                  <SelectItem value="neq">Diferente</SelectItem>
                  <SelectItem value="contains">Contém</SelectItem>
                  <SelectItem value="gt">Maior que</SelectItem>
                  <SelectItem value="lt">Menor que</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor</Label>
              <Input value={data.value || ""} onChange={(e) => update({ value: e.target.value })} />
            </div>
          </>
        )}

        {type === "action" && (
          <>
            <div className="space-y-1.5">
              <Label>Função cadastrada</Label>
              <Select
                value={data.functionId || "__none__"}
                onValueChange={(v) => {
                  if (v === "__none__") {
                    update({ functionId: undefined, functionName: undefined });
                  } else {
                    const fn = functions.find((f) => f.id === v);
                    update({
                      functionId: v,
                      functionName: fn?.nome,
                      actionType: fn?.tipo === "internal"
                        ? (fn.internalAction as BotFlowNodeData["actionType"])
                        : "call_api",
                      actionPayload: fn?.defaultPayload || {},
                    });
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Sem função (ação manual) —</SelectItem>
                  {functions.filter((f) => f.ativo !== false).map((f) => (
                    <SelectItem key={f.id} value={f.id!}>
                      {f.nome} <span className="text-muted-foreground text-xs">({f.tipo})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Cadastre novas funções em Configurações → Funções do Bot.
              </p>
            </div>

            {!data.functionId && (
              <div className="space-y-1.5">
                <Label>Tipo de ação</Label>
                <Select
                  value={data.actionType || "create_lead"}
                  onValueChange={(v) => update({ actionType: v as BotFlowNodeData["actionType"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create_lead">Criar lead</SelectItem>
                    <SelectItem value="transfer">Transferir para atendente</SelectItem>
                    <SelectItem value="call_api">Chamar API</SelectItem>
                    <SelectItem value="tag">Adicionar tag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <KeyValueEditor
              label="Parâmetros"
              value={data.actionPayload || {}}
              onChange={(next) => update({ actionPayload: next })}
            />
          </>
        )}
      </div>

      <div className="border-t p-3">
        <Button variant="destructive" className="w-full" onClick={() => onDelete(node.id)}>
          <Trash2 className="h-4 w-4 mr-2" /> Excluir nó
        </Button>
      </div>
    </aside>
  );
}
