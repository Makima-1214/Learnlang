"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ── Custom Bespoke SVG Icons ──────────────────────────────────────────────────

const BackIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const SaveMagicIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <path d="M7 3v5h8" />
    <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const QuestionPlusIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
    <path d="M16 4l1 1M18 2l1 1" stroke="#A855F7" />
  </svg>
);

const TrashCanIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// ── Emoji Picker Data ─────────────────────────────────────────────────────────

const EMOJI_GROUPS = [
  {
    label: "Bahasa & Belajar",
    emojis: ["🗺️", "🧭", "📜", "🔤", "🗣️", "💬", "🧠", "🪄", "🔮", "📡", "🧬", "🔭", "🪐", "⚗️", "🧪"],
  },
  {
    label: "Petualangan",
    emojis: ["⚔️", "🛡️", "🏹", "🗡️", "🧱", "🏰", "🌋", "🏔️", "🌊", "🌪️", "🌌", "🌠", "🪨", "🌿", "🍄"],
  },
  {
    label: "Teknologi & Sains",
    emojis: ["🤖", "👾", "🕹️", "💾", "🖥️", "⌨️", "🔌", "🧲", "⚙️", "🔩", "🪛", "🔋", "💡", "🔬", "🧯"],
  },
  {
    label: "Simbol & Unik",
    emojis: ["🎯", "🎲", "🎴", "🃏", "🀄", "♟️", "🧩", "🪬", "🧿", "🪤", "🎪", "🎭", "🎨", "🖼️", "🪞"],
  },
];

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-2.5 duo-input border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-2xl leading-none">{value}</span>
        <span className="text-sm font-bold text-gray-400">Pilih emoji</span>
        <svg className="w-4 h-4 ml-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 w-80 bg-white border-3 border-gray-200 rounded-2xl shadow-xl p-4 space-y-3">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{group.label}</p>
              <div className="flex flex-wrap gap-1">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onChange(emoji); setOpen(false); }}
                    className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:bg-indigo-50 border-2 ${value === emoji ? "border-indigo-400 bg-indigo-50 scale-110" : "border-transparent"}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreateQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    published: false,
    order: 0,
    timeLimit: null,
    icon: "📚",
    color: "#6366F1",
    questions: [
      {
        question: "",
        options: [
          { option: "", isCorrect: false },
          { option: "", isCorrect: false },
        ],
      },
    ],
  });

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (session?.user?.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: [
            { option: "", isCorrect: false },
            { option: "", isCorrect: false },
          ],
        },
      ],
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index].question = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push({ option: "", isCorrect: false });
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = newQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex].option = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleCorrectChange = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    // Set all to false first (only one correct answer)
    newQuestions[questionIndex].options.forEach((opt) => {
      opt.isCorrect = false;
    });
    // Set selected to true
    newQuestions[questionIndex].options[optionIndex].isCorrect = true;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Judul quiz harus diisi");
      return;
    }

    if (formData.questions.length === 0) {
      toast.error("Minimal harus ada 1 pertanyaan");
      return;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        toast.error(`Pertanyaan ${i + 1} harus diisi`);
        return;
      }
      if (q.options.length < 2) {
        toast.error(`Pertanyaan ${i + 1} harus memiliki minimal 2 opsi`);
        return;
      }
      if (!q.options.some((opt) => opt.isCorrect)) {
        toast.error(`Pertanyaan ${i + 1} harus memiliki 1 jawaban benar`);
        return;
      }
      if (q.options.some((opt) => !opt.option.trim())) {
        toast.error(`Semua opsi di pertanyaan ${i + 1} harus diisi`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Quiz berhasil dibuat");
        router.push("/admin/quizzes");
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal membuat quiz");
      }
    } catch (error) {
      console.error("Failed to create quiz:", error);
      toast.error("Gagal membuat quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-nunito)]">
      <style dangerouslySetInnerHTML={{ __html: `
        .duo-card { border-bottom-width: 6px; border-radius: 1.5rem; transition: all 0.2s; }
        .duo-btn { border-bottom-width: 4px; border-radius: 1rem; transition: all 0.1s; }
        .duo-btn:active { transform: translateY(2px); border-bottom-width: 0; margin-bottom: 4px; }
        .duo-input { border-width: 3px; border-radius: 1rem; }
        .duo-input:focus { border-color: #8B5CF6; ring: 0; }
      `}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-violet-500 p-8 rounded-[2.5rem] border-4 border-b-8 border-violet-700 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 text-center sm:text-left">
            <Link href="/admin/quizzes">
              <Button variant="ghost" className="mb-4 text-white hover:bg-white/20 font-black">
                <BackIcon /> Kembali ke Daftar
              </Button>
            </Link>
            <h1 className="text-3xl font-black tracking-tight">Buat Kuis Baru</h1>
            <p className="font-bold opacity-90 text-sm">
            Buat quiz dengan pertanyaan pilihan ganda
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="duo-card border-4 border-gray-100 shadow-none">
            <CardContent className="space-y-4">
              <div className="pt-6">
                <Label htmlFor="title" className="font-black text-gray-700 ml-1">Judul Quiz *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Misal: Petualangan Vocab Dasar"
                  className="duo-input border-gray-200 focus-visible:ring-0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="font-black text-gray-700 ml-1">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat tentang quiz ini..."
                  rows={3}
                  className="duo-input border-gray-200 focus-visible:ring-0"
                />
              </div>
              
              {/* New Fields for Learning Path */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="order">Urutan Level *</Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="duo-input border-gray-200"
                    required
                  />
                  <p className="text-[10px] text-gray-400 font-bold px-1 uppercase tracking-tighter">0 = Level pertama</p>
                </div>
                <div>
                  <Label htmlFor="timeLimit">Batas Waktu (menit)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={formData.timeLimit || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, timeLimit: e.target.value ? parseInt(e.target.value) : null })
                    }
                    placeholder="Kosongkan jika tidak ada batas"
                    className="duo-input border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="icon">Icon/Emoji</Label>
                  <EmojiPicker
                    value={formData.icon}
                    onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
                  />
                  <p className="text-[10px] text-gray-400 font-bold px-1 uppercase tracking-tighter">Emoji unik kuis</p>
                </div>
                <div>
                  <Label htmlFor="color">Warna Tema</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-14 h-10 border-2 rounded-xl p-1 bg-white cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      placeholder="#6366F1"
                      className="flex-1 duo-input border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published" className="font-black text-gray-800">Publikasikan Kuis</Label>
                  <p className="text-xs font-bold text-gray-400 mt-1">
                    Quiz yang dipublikasikan dapat dilihat oleh pengguna
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-800">
                Pertanyaan ({formData.questions.length})
              </h2>
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="duo-btn bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100 font-black px-6"
              >
                <QuestionPlusIcon />
                Tambah Pertanyaan
              </Button>
            </div>

            {formData.questions.map((question, qIndex) => (
              <Card key={qIndex} className="duo-card border-4 border-gray-100 shadow-none overflow-hidden group">
                <CardHeader className="bg-gray-50/50 border-b-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black text-gray-700">
                      <span className="bg-violet-500 text-white w-8 h-8 inline-flex items-center justify-center rounded-lg mr-3">
                        {qIndex + 1}
                      </span>
                      Detail Pertanyaan
                    </CardTitle>
                    {formData.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <TrashCanIcon />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pt-4">
                    <Label className="font-black text-sm text-gray-600 ml-1">Kata / Kalimat Soal *</Label>
                    <Input
                      value={question.question}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      placeholder="Contoh: apple"
                      className="duo-input border-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-black text-sm text-gray-600 ml-1 uppercase tracking-widest text-[10px]">Opsi Jawaban *</Label>
                      {question.options.length < 4 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(qIndex)}
                        >
                          + Opsi
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <div className="font-black text-gray-400 w-6 text-center">{String.fromCharCode(65 + oIndex)}</div>
                          <Input
                            value={option.option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Opsi ${oIndex + 1}`}
                            required
                            className="duo-input border-gray-200"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={option.isCorrect}
                              onChange={() =>
                                handleCorrectChange(qIndex, oIndex)
                              }
                              className="w-5 h-5 accent-emerald-500 cursor-pointer"
                            />
                            <Label className="text-xs font-black text-gray-500 whitespace-nowrap cursor-pointer">
                              Jawaban
                            </Label>
                          </div>
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleRemoveOption(qIndex, oIndex)}
                              className="text-red-400 hover:text-red-500 p-2"
                            >
                              <TrashCanIcon />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              onClick={() => router.push("/admin/quizzes")}
              className="duo-btn bg-white border-2 border-b-4 border-gray-100 text-gray-500 hover:bg-gray-50 font-black px-8"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="duo-btn bg-violet-600 border-violet-800 border-2 border-b-4 text-white hover:bg-violet-700 font-black px-10">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <SaveMagicIcon />}
              {loading ? "Menyimpan..." : "Simpan Kuis"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
