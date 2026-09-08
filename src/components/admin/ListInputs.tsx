"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export function TagListInput({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <button type="button" onClick={add} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
          <Plus size={16} />
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1 text-xs text-ink-700">
              {item}
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function SpecListInput({
  items,
  onChange,
}: {
  items: { key: string; value: string }[];
  onChange: (next: { key: string; value: string }[]) => void;
}) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  function add() {
    if (!key.trim() || !value.trim()) return;
    onChange([...items, { key: key.trim(), value: value.trim() }]);
    setKey("");
    setValue("");
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">Specifications</label>
      <div className="flex gap-2">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Attribute (e.g. Battery)"
          className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value (e.g. 2x AA required)"
          className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <button type="button" onClick={add} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
          <Plus size={16} />
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-xl border border-ink-100">
          {items.map((item, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2 text-sm ${i % 2 === 0 ? "bg-ink-50" : "bg-white"}`}>
              <span>
                <strong className="text-ink-700">{item.key}:</strong> <span className="text-ink-500">{item.value}</span>
              </span>
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-danger">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
