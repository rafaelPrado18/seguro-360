import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  MessageSquare,
  HelpCircle,
  GitBranch,
  Zap,
  Plus,
  Save,
  FolderOpen,
  Trash2,
  FileText,
} from "lucide-react";

import { nodeTypes } from "@/components/botflows/BotFlowNodes";
import { NodeInspector } from "@/components/botflows/NodeInspector";
import {
  botFlowService,
  type BotFlow,
  type BotFlowNodeData,
  type BotNodeType,
} from "@/services/botFlowService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PALETTE: { type: BotNodeType; label: string; icon: typeof MessageSquare; color: string }[] = [
  { type: "message", label: "Mensagem", icon: MessageSquare, color: "text-blue-600" },
  { type: "question", label: "Pergunta", icon: HelpCircle, color: "text-purple-600" },
  { type: "condition", label: "Condição", icon: GitBranch, color: "text-amber-600" },
  { type: "action", label: "Ação", icon: Zap, color: "text-emerald-600" },
];

function defaultDataFor(type: BotNodeType): BotFlowNodeData {
  switch (type) {
    case "message":
      return { label: "Nova mensagem", message: "" };
    case "question":
      return { label: "Nova pergunta", message: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }] };
    case "condition":
      return { label: "Nova condição", variable: "", operator: "eq", value: "" };
    case "action":
      return { label: "Nova ação", actionType: "create_lead", actionPayload: {} };
  }
}

function BotFlowsInner() {
  const [nodes, setNodes] = useState<Node<BotFlowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flowMeta, setFlowMeta] = useState<{ id?: string; nome: string; descricao: string; ativo: boolean; trigger: string }>({
    nome: "Novo fluxo",
    descricao: "",
    ativo: false,
    trigger: "",
  });
  const [savedFlows, setSavedFlows] = useState<BotFlow[]>([]);
  const [openLoad, setOpenLoad] = useState(false);
  const [saving, setSaving] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds) as Node<BotFlowNodeData>[]),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  const addNode = (type: BotNodeType) => {
    const id = `n${idRef.current++}_${Date.now()}`;
    const newNode: Node<BotFlowNodeData> = {
      id,
      type,
      position: { x: 250 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: defaultDataFor(type),
    };
    setNodes((n) => [...n, newNode]);
    setSelectedId(id);
  };

  const updateNodeData = (id: string, patch: Partial<BotFlowNodeData>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedId(null);
  };

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedId) || null, [nodes, selectedId]);

  const handleSave = async () => {
    if (!flowMeta.nome.trim()) {
      toast.error("Informe um nome para o fluxo");
      return;
    }
    setSaving(true);
    try {
      const payload: BotFlow = {
        id: flowMeta.id,
        nome: flowMeta.nome,
        descricao: flowMeta.descricao,
        ativo: flowMeta.ativo,
        trigger: flowMeta.trigger,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type as BotNodeType,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          label: typeof e.label === "string" ? e.label : undefined,
        })),
      };
      const saved = flowMeta.id ? await botFlowService.update(payload) : await botFlowService.create(payload);
      setFlowMeta((m) => ({ ...m, id: saved.id || m.id }));
      toast.success("Fluxo salvo com sucesso");
    } catch (e) {
      toast.error("Erro ao salvar fluxo. Verifique a conexão com a API.");
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
    setFlowMeta({ nome: "Novo fluxo", descricao: "", ativo: false, trigger: "" });
  };

  const loadList = async () => {
    try {
      const list = await botFlowService.list();
      setSavedFlows(list);
    } catch {
      setSavedFlows([]);
      toast.error("Não foi possível carregar fluxos salvos");
    }
  };

  const loadFlow = (f: BotFlow) => {
    setNodes(
      (f.nodes || []).map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })) as Node<BotFlowNodeData>[]
    );
    setEdges(
      (f.edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
        label: e.label,
        animated: true,
      }))
    );
    setFlowMeta({
      id: f.id,
      nome: f.nome,
      descricao: f.descricao || "",
      ativo: !!f.ativo,
      trigger: f.trigger || "",
    });
    setOpenLoad(false);
    toast.success(`Fluxo "${f.nome}" carregado`);
  };

  const removeFlow = async (id?: string) => {
    if (!id) return;
    try {
      await botFlowService.remove(id);
      toast.success("Fluxo excluído");
      loadList();
    } catch {
      toast.error("Erro ao excluir fluxo");
    }
  };

  useEffect(() => {
    if (openLoad) loadList();
  }, [openLoad]);

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Toolbar */}
        <header className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <Input
              className="font-semibold w-56"
              value={flowMeta.nome}
              onChange={(e) => setFlowMeta((m) => ({ ...m, nome: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Gatilho</Label>
            <Input
              className="w-44"
              placeholder="ex: palavra-chave"
              value={flowMeta.trigger}
              onChange={(e) => setFlowMeta((m) => ({ ...m, trigger: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={flowMeta.ativo}
              onCheckedChange={(v) => setFlowMeta((m) => ({ ...m, ativo: v }))}
            />
            <Label className="text-sm">{flowMeta.ativo ? "Ativo" : "Inativo"}</Label>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNew}>
              Novo
            </Button>
            <Dialog open={openLoad} onOpenChange={setOpenLoad}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderOpen className="h-4 w-4 mr-1" /> Carregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fluxos salvos</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {savedFlows.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">Nenhum fluxo encontrado</p>
                  )}
                  {savedFlows.map((f) => (
                    <Card key={f.id} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{f.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.nodes?.length || 0} nós · {f.ativo ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => loadFlow(f)}>Abrir</Button>
                        <Button size="icon" variant="ghost" onClick={() => removeFlow(f.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          {/* Palette */}
          <aside className="w-56 border-r border-border bg-card p-3 space-y-2 overflow-y-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Adicionar nó
            </h3>
            {PALETTE.map((p) => {
              const Icon = p.icon;
              return (
                <Button
                  key={p.type}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addNode(p.type)}
                >
                  <Icon className={`h-4 w-4 mr-2 ${p.color}`} />
                  {p.label}
                  <Plus className="h-3.5 w-3.5 ml-auto" />
                </Button>
              );
            })}

            <div className="pt-4 mt-4 border-t text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground">Como usar</p>
              <p>• Clique em um tipo para adicionar ao canvas.</p>
              <p>• Arraste para reorganizar.</p>
              <p>• Conecte os nós arrastando das bolinhas.</p>
              <p>• Clique em um nó para editar à direita.</p>
            </div>
          </aside>

          {/* Canvas */}
          <div ref={wrapperRef} className="flex-1 bg-muted/30 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, n) => setSelectedId(n.id)}
              onPaneClick={() => setSelectedId(null)}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={16} />
              <Controls />
              <MiniMap pannable zoomable />
            </ReactFlow>

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Comece adicionando um nó pela barra lateral</p>
                </div>
              </div>
            )}
          </div>

          {/* Inspector */}
          {selectedNode && (
            <NodeInspector
              node={selectedNode}
              onChange={updateNodeData}
              onDelete={deleteNode}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function BotFlows() {
  return (
    <ReactFlowProvider>
      <BotFlowsInner />
    </ReactFlowProvider>
  );
}
