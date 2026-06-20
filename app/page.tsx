"use client";

import { useMemo, useState } from "react";
import { AlertCircle, BookmarkCheck, CheckCircle2, Clapperboard, Loader2, Save, Sparkles } from "lucide-react";
import { defaultDialogueInput } from "@/lib/defaults";
import type { DialogueGeneration, DialogueInput, DialogueVersion } from "@/types/dialogue";

type SaveState = "idle" | "saving" | "saved" | "error";

const localeLabels: Record<DialogueInput["targetLocale"], string> = {
  US: "美式英语",
  UK: "英式英语",
  AU: "澳式英语",
  CA: "加拿大英语"
};

const versionLabels: Record<string, string> = {
  best: "最佳版",
  raw: "直接版",
  sarcastic: "讽刺版",
  concise: "精简版",
  cinematic: "影视感"
};

function updateNested<T extends object>(value: T, path: string[], nextValue: string | number): Record<string, unknown> {
  const [head, ...rest] = path;
  return {
    ...value,
    [head]: rest.length
      ? updateNested((value as Record<string, unknown>)[head] as object, rest, nextValue)
      : nextValue
  };
}

function Field({ label, value, onChange, rows = 1 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <label className="field">
      <span>{label}</span>
      {rows > 1 ? (
        <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="sliderField">
      <span>{label}</span>
      <input min={0} max={5} type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <strong>{value}</strong>
    </label>
  );
}

function VersionCard({ version, selected, onSelect }: { version: DialogueVersion; selected: boolean; onSelect: () => void }) {
  const qa = version.qa;
  return (
    <button className={selected ? "versionCard selected" : "versionCard"} onClick={onSelect} type="button">
      <div className="versionMeta">
        <span>{versionLabels[version.label] || version.label}</span>
        {qa ? <small>{qa.score}/100</small> : null}
      </div>
      <p className="lineText">{version.line}</p>
      <p className="toneText">{version.tone}</p>
      <p className="whyText">{version.whyItWorks}</p>
      {qa ? (
        <div className="qaRow">
          <span>自然度 {qa.naturalnessScore}/5</span>
          <span>情绪匹配 {qa.emotionMatchScore}/5</span>
          <span>剧情准确 {qa.plotAccuracyScore}/5</span>
        </div>
      ) : null}
    </button>
  );
}

export default function Home() {
  const [input, setInput] = useState<DialogueInput>(defaultDialogueInput);
  const [output, setOutput] = useState<DialogueGeneration | null>(null);
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [editedLine, setEditedLine] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  const versions = useMemo(() => (output ? [output.best, ...output.alternatives] : []), [output]);

  function setTop<K extends keyof DialogueInput>(key: K, value: DialogueInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function setNested(path: string[], value: string | number) {
    setInput((current) => updateNested(current, path, value) as DialogueInput);
  }

  async function generate() {
    setLoading(true);
    setError("");
    setSaveState("idle");
    try {
      const response = await fetch("/api/dialogue/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败，请稍后再试。");
      setOutput(data);
      setSelectedLine(data.best.line);
      setEditedLine(data.best.line);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "生成失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  async function saveFeedback() {
    if (!output || !selectedLine) return;
    setSaveState("saving");
    try {
      const response = await fetch("/api/dialogue/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: output.id,
          chosenLine: selectedLine,
          editedLine,
          rating,
          note
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败，请稍后再试。");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <div className="eyebrow"><Clapperboard size={16} /> 本地化台词改写引擎</div>
          <h1>从中文潜台词生成母语级英语口语</h1>
        </div>
        <button className="primaryButton" disabled={loading} onClick={generate} type="button">
          {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
          {loading ? "生成中" : "生成台词"}
        </button>
      </section>

      <section className="workspace">
        <form className="inputPanel" onSubmit={(event) => { event.preventDefault(); generate(); }}>
          <div className="panelHeader">
            <h2>场景输入</h2>
            <select value={input.targetLocale} onChange={(event) => setTop("targetLocale", event.target.value as DialogueInput["targetLocale"])}>
              <option value="US">{localeLabels.US}</option>
              <option value="UK">{localeLabels.UK}</option>
              <option value="AU">{localeLabels.AU}</option>
              <option value="CA">{localeLabels.CA}</option>
            </select>
          </div>

          <Field label="中文台词" rows={4} value={input.sourceText} onChange={(value) => setTop("sourceText", value)} />
          <Field label="目标题材" value={input.genre} onChange={(value) => setTop("genre", value)} />

          <div className="gridTwo">
            <Field label="角色名" value={input.character.name} onChange={(value) => setNested(["character", "name"], value)} />
            <Field label="年龄" value={input.character.age} onChange={(value) => setNested(["character", "age"], value)} />
          </div>
          <Field label="角色身份" value={input.character.identity} onChange={(value) => setNested(["character", "identity"], value)} />
          <Field label="性格" rows={2} value={input.character.personality} onChange={(value) => setNested(["character", "personality"], value)} />
          <Field label="说话方式" rows={2} value={input.character.speechStyle} onChange={(value) => setNested(["character", "speechStyle"], value)} />

          <Field label="上下文" rows={4} value={input.scene.context} onChange={(value) => setNested(["scene", "context"], value)} />
          <div className="gridTwo">
            <Field label="关系" value={input.scene.relationship} onChange={(value) => setNested(["scene", "relationship"], value)} />
            <Field label="权力关系" value={input.scene.powerDynamic} onChange={(value) => setNested(["scene", "powerDynamic"], value)} />
          </div>
          <Field label="场景利害关系" rows={2} value={input.scene.stakes} onChange={(value) => setNested(["scene", "stakes"], value)} />

          <div className="gridTwo">
            <Field label="主情绪" value={input.emotion.primary} onChange={(value) => setNested(["emotion", "primary"], value)} />
            <Field label="副情绪" value={input.emotion.secondary} onChange={(value) => setNested(["emotion", "secondary"], value)} />
          </div>

          <Slider label="情绪强度" value={input.emotion.intensity} onChange={(value) => setNested(["emotion", "intensity"], value)} />
          <Slider label="脏话级别" value={input.outputPreferences.profanityLevel} onChange={(value) => setNested(["outputPreferences", "profanityLevel"], value)} />
          <Slider label="俚语级别" value={input.outputPreferences.slangLevel} onChange={(value) => setNested(["outputPreferences", "slangLevel"], value)} />
          <Slider label="字面忠实度" value={input.outputPreferences.literalness} onChange={(value) => setNested(["outputPreferences", "literalness"], value)} />
        </form>

        <section className="outputPanel">
          {error ? (
            <div className="errorBox"><AlertCircle size={18} /> {error}</div>
          ) : null}

          {!output ? (
            <div className="emptyState">
              <Sparkles size={30} />
              <h2>准备生成影视化台词改写</h2>
              <p>左侧结构化信息会被打包为场景、人物、情绪和口语风格，再结合本地 RAG 例句完成台词改写与质量检查。</p>
            </div>
          ) : (
            <>
              <div className="resultHeader">
                <div>
                  <h2>生成结果</h2>
                  <p>模型：{output.provider} · {output.model}</p>
                </div>
                <span>编号：{output.id}</span>
              </div>

              <div className="versionList">
                {versions.map((version) => (
                  <VersionCard
                    key={`${version.label}-${version.line}`}
                    version={version}
                    selected={selectedLine === version.line}
                    onSelect={() => {
                      setSelectedLine(version.line);
                      setEditedLine(version.line);
                      setSaveState("idle");
                    }}
                  />
                ))}
              </div>

              <div className="feedbackPanel">
                <div className="panelHeader">
                  <h2>选择与反馈</h2>
                  <button className="secondaryButton" onClick={saveFeedback} disabled={saveState === "saving"} type="button">
                    {saveState === "saving" ? <Loader2 className="spin" size={16} /> : saveState === "saved" ? <BookmarkCheck size={16} /> : <Save size={16} />}
                    {saveState === "saved" ? "已保存" : "保存反馈"}
                  </button>
                </div>
                <textarea value={editedLine} rows={3} onChange={(event) => setEditedLine(event.target.value)} />
                <Slider label="评分" value={rating} onChange={setRating} />
                <Field label="备注" value={note} onChange={setNote} />
                {saveState === "error" ? <p className="saveError">保存失败，请稍后再试。</p> : null}
              </div>

              <div className="detailsGrid">
                <div>
                  <h3><CheckCircle2 size={16} /> 保留的信息</h3>
                  <ul>{output.meaningPreserved.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h3>RAG 参考例句</h3>
                  <ul>{output.references.map((item) => <li key={item.id}>{item.text}（{item.meaning}）</li>)}</ul>
                </div>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
