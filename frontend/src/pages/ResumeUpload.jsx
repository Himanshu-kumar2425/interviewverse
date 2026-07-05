import { useEffect, useRef, useState } from "react";
import { uploadResume, getActiveResume, deleteResume } from "../api/resume.api.js";
import PageLayout from "../components/common/PageLayout.jsx";
import Spinner from "../components/common/Spinner.jsx";
import { toast } from "../components/common/Toast.jsx";
import ToastContainer from "../components/common/Toast.jsx";

export default function ResumeUpload() {
  const inputRef = useRef(null);
  const [resume, setResume] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    getActiveResume()
      .then(({ data }) => setResume(data.resume))
      .catch(() => {}) // 404 is fine — no resume yet
      .finally(() => setLoadingPage(false));
  }, []);

  const handleFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB.");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("resume", file);

    try {
      const { data } = await uploadResume(fd);
      toast.success("Resume uploaded! Parsing in progress…");
      // Poll for parsed data
      pollParsed(data.resumeId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Poll every 3 s until parsing completes (max 30 s)
  const pollParsed = (resumeId) => {
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      try {
        const { data } = await getActiveResume();
        if (data.resume.isParsed) {
          setResume(data.resume);
          toast.success("Resume parsed successfully!");
          clearInterval(timer);
        }
      } catch {
        clearInterval(timer);
      }
      if (attempts >= 10) clearInterval(timer);
    }, 3000);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your current resume?")) return;
    setDeleting(true);
    try {
      await deleteResume(resume._id);
      setResume(null);
      toast.success("Resume deleted.");
    } catch {
      toast.error("Failed to delete resume.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout>
      <ToastContainer />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Resume</h1>
        <p className="text-gray-400 mb-8">
          Upload your PDF resume. Gemini will extract your skills, projects, and
          experience to personalise your interview questions.
        </p>

        {loadingPage ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : resume ? (
          <ActiveResume
            resume={resume}
            onDelete={handleDelete}
            deleting={deleting}
            onReplace={() => inputRef.current?.click()}
          />
        ) : (
          <DropZone
            inputRef={inputRef}
            dragOver={dragOver}
            uploading={uploading}
            setDragOver={setDragOver}
            onFile={handleFile}
          />
        )}
      </div>
    </PageLayout>
  );
}

function DropZone({ inputRef, dragOver, uploading, setDragOver, onFile }) {
  return (
    <div
      className={`card border-2 border-dashed flex flex-col items-center justify-center py-16 cursor-pointer transition-colors ${
        dragOver
          ? "border-brand-500 bg-brand-600/5"
          : "border-surface-600 hover:border-brand-600/50"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFile(e.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => onFile(e.target.files[0])}
      />
      {uploading ? (
        <>
          <Spinner size="lg" />
          <p className="mt-4 text-gray-400">Uploading…</p>
        </>
      ) : (
        <>
          <span className="text-5xl mb-4">📄</span>
          <p className="text-lg font-medium text-gray-200">
            Drop your PDF here or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-2">Max 5 MB · PDF only</p>
        </>
      )}
    </div>
  );
}

function ActiveResume({ resume, onDelete, deleting, onReplace }) {
  const { parsedData, isParsed, originalName, fileUrl, createdAt } = resume;

  return (
    <div className="space-y-6">
      {/* File info */}
      <div className="card flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl">📄</span>
          <div>
            <p className="font-medium text-white">{originalName}</p>
            <p className="text-xs text-gray-500">
              Uploaded {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-1.5 px-3"
          >
            View
          </a>
          <button
            onClick={onReplace}
            className="btn-secondary text-sm py-1.5 px-3"
          >
            Replace
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="text-sm py-1.5 px-3 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {/* Parsed data */}
      {!isParsed ? (
        <div className="card flex items-center gap-3 text-gray-400">
          <Spinner size="sm" />
          <span>Parsing your resume with Gemini…</span>
        </div>
      ) : (
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold text-white">Parsed content</h2>

          {parsedData?.summary && (
            <Section title="Summary">
              <p className="text-gray-300 text-sm leading-relaxed">{parsedData.summary}</p>
            </Section>
          )}

          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {(parsedData?.skills || []).map((s) => (
                <span key={s} className="badge bg-brand-900/50 text-brand-300">{s}</span>
              ))}
            </div>
          </Section>

          {(parsedData?.projects || []).length > 0 && (
            <Section title="Projects">
              {parsedData.projects.map((p) => (
                <div key={p.name} className="mb-3">
                  <p className="text-sm font-medium text-gray-200">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(p.techStack || []).map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-surface-700 text-gray-400">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {(parsedData?.experience || []).length > 0 && (
            <Section title="Experience">
              {parsedData.experience.map((ex) => (
                <div key={ex.company} className="mb-3">
                  <p className="text-sm font-medium text-gray-200">
                    {ex.role} — {ex.company}
                  </p>
                  <p className="text-xs text-gray-500">{ex.duration}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ex.description}</p>
                </div>
              ))}
            </Section>
          )}

          {(parsedData?.education || []).length > 0 && (
            <Section title="Education">
              {parsedData.education.map((ed) => (
                <div key={ed.institution} className="mb-2">
                  <p className="text-sm font-medium text-gray-200">
                    {ed.degree} in {ed.field}
                  </p>
                  <p className="text-xs text-gray-400">
                    {ed.institution} · {ed.year}
                    {ed.cgpa ? ` · CGPA ${ed.cgpa}` : ""}
                  </p>
                </div>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
