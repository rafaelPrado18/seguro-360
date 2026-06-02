import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  label?: string;
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
}

export function KeyValueEditor({
  label,
  value,
  onChange,
  keyPlaceholder = "Parâmetro",
  valuePlaceholder = "Valor",
  addLabel = "Adicionar parâmetro",
}: Props) {
  const entries = Object.entries(value || {});

  const update = (idx: number, k: string, v: string) => {
    const next = [...entries];
    next[idx] = [k, v];
    onChange(Object.fromEntries(next.filter(([key]) => key !== "" || next.indexOf([key, v]) === idx)));
  };

  const setKey = (idx: number, k: string) => {
    const next = [...entries];
    next[idx] = [k, next[idx]?.[1] ?? ""];
    onChange(Object.fromEntries(next));
  };

  const setVal = (idx: number, v: string) => {
    const next = [...entries];
    next[idx] = [next[idx]?.[0] ?? "", v];
    onChange(Object.fromEntries(next));
  };

  const add = () => {
    const next = [...entries, ["", ""]];
    onChange(Object.fromEntries(next));
  };

  const remove = (idx: number) => {
    const next = [...entries];
    next.splice(idx, 1);
    onChange(Object.fromEntries(next));
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-xs">{label}</Label>
          <Button type="button" size="sm" variant="outline" onClick={add}>
            <Plus className="h-3 w-3 mr-1" /> {addLabel}
          </Button>
        </div>
      )}
      {entries.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Nenhum parâmetro adicionado.</p>
      )}
      {entries.map(([k, v], i) => (
        <div key={i} className="flex gap-1.5">
          <Input placeholder={keyPlaceholder} value={k} onChange={(e) => setKey(i, e.target.value)} />
          <Input placeholder={valuePlaceholder} value={v} onChange={(e) => setVal(i, e.target.value)} />
          <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {!label && (
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3 w-3 mr-1" /> {addLabel}
        </Button>
      )}
    </div>
  );
}
