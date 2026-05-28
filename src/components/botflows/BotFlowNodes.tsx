import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageSquare, HelpCircle, GitBranch, Zap } from "lucide-react";
import type { BotFlowNodeData } from "@/services/botFlowService";

const baseClasses =
  "rounded-lg border-2 bg-card shadow-md min-w-[220px] max-w-[260px] text-sm overflow-hidden";

const headerBase = "flex items-center gap-2 px-3 py-2 text-white font-semibold text-xs uppercase tracking-wide";

export const MessageNode = memo(({ data, selected }: NodeProps) => {
  const d = data as unknown as BotFlowNodeData;
  return (
    <div className={`${baseClasses} ${selected ? "border-primary" : "border-border"}`}>
      <div className={`${headerBase} bg-blue-600`}>
        <MessageSquare className="h-3.5 w-3.5" /> Mensagem
      </div>
      <div className="p-3">
        <p className="font-medium text-foreground">{d.label || "Sem título"}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">
          {d.message || "Clique para editar a mensagem..."}
        </p>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
MessageNode.displayName = "MessageNode";

export const QuestionNode = memo(({ data, selected }: NodeProps) => {
  const d = data as unknown as BotFlowNodeData;
  const opts = d.options ?? [];
  return (
    <div className={`${baseClasses} ${selected ? "border-primary" : "border-border"}`}>
      <div className={`${headerBase} bg-purple-600`}>
        <HelpCircle className="h-3.5 w-3.5" /> Pergunta
      </div>
      <div className="p-3">
        <p className="font-medium text-foreground">{d.label || "Sem título"}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.message}</p>
        <div className="mt-2 space-y-1">
          {opts.length === 0 && (
            <span className="text-[11px] text-muted-foreground italic">Sem opções</span>
          )}
          {opts.map((o, i) => (
            <div key={i} className="relative flex items-center justify-between rounded border border-border bg-muted/40 px-2 py-1 text-xs">
              <span className="truncate">{o.label || `Opção ${i + 1}`}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={`opt-${i}`}
                style={{ position: "absolute", right: -6, top: "50%" }}
              />
            </div>
          ))}
        </div>
      </div>
      <Handle type="target" position={Position.Top} />
    </div>
  );
});
QuestionNode.displayName = "QuestionNode";

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const d = data as unknown as BotFlowNodeData;
  return (
    <div className={`${baseClasses} ${selected ? "border-primary" : "border-border"}`}>
      <div className={`${headerBase} bg-amber-600`}>
        <GitBranch className="h-3.5 w-3.5" /> Condição
      </div>
      <div className="p-3 text-xs">
        <p className="font-medium text-foreground">{d.label || "Sem título"}</p>
        <p className="text-muted-foreground mt-1">
          <code className="bg-muted px-1 rounded">{d.variable || "var"}</code>{" "}
          <span>{d.operator || "eq"}</span>{" "}
          <code className="bg-muted px-1 rounded">{d.value || "..."}</code>
        </p>
        <div className="mt-2 flex justify-between text-[11px] font-medium">
          <span className="text-emerald-600">✓ Verdadeiro</span>
          <span className="text-red-600">✗ Falso</span>
        </div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: "25%" }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: "75%" }} />
    </div>
  );
});
ConditionNode.displayName = "ConditionNode";

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const d = data as unknown as BotFlowNodeData;
  return (
    <div className={`${baseClasses} ${selected ? "border-primary" : "border-border"}`}>
      <div className={`${headerBase} bg-emerald-600`}>
        <Zap className="h-3.5 w-3.5" /> Ação
      </div>
      <div className="p-3 text-xs">
        <p className="font-medium text-foreground">{d.label || "Sem título"}</p>
        <p className="text-muted-foreground mt-1 capitalize">
          {d.actionType?.replace("_", " ") || "Selecione uma ação"}
        </p>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
ActionNode.displayName = "ActionNode";

export const nodeTypes = {
  message: MessageNode,
  question: QuestionNode,
  condition: ConditionNode,
  action: ActionNode,
};
