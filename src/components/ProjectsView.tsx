import React, { useState } from 'react';
import { Edit3, FolderOpen, Plus, Search, Trash2, Check, X } from 'lucide-react';
import type { ProjectType, StudioProject } from '../types/studio';

interface ProjectsViewProps {
  projects: StudioProject[];
  activeProjectId: string | null;
  isSignedIn: boolean;
  onCreateProject: (title: string, type: ProjectType) => void;
  onOpenProject: (project: StudioProject) => void;
  onRenameProject: (projectId: string, newTitle: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  isSignedIn,
  onCreateProject,
  onOpenProject,
  onRenameProject,
  onDeleteProject,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | ProjectType>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ProjectType>('app');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = projects.filter((p) => {
    const matchesType = filterType === 'all' || p.type === filterType;
    const matchesSearch =
      !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateProject(newTitle.trim(), newType);
    setNewTitle('');
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-neutral-900">
            Studio Projects
          </h2>
          <p className="text-xs text-neutral-500">
            {isSignedIn
              ? 'Synced automatically with your Cloud Firestore workspace.'
              : 'Local session storage active. Sign in with Google to sync projects across sessions.'}
          </p>
        </div>
      </div>

      {/* Create New Project */}
      <form
        onSubmit={handleCreate}
        className="bg-white/95 border border-neutral-200 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs"
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New project name..."
          className="flex-1 min-w-[200px] bg-neutral-50 border border-neutral-200 focus:border-blue-500 rounded-lg px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as ProjectType)}
          className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-blue-500"
        >
          <option value="app">App Builder Project</option>
          <option value="code">Code Project</option>
          <option value="writer">Writing Project</option>
          <option value="research">Research Report</option>
          <option value="document">Document / Deck</option>
        </select>
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-medium text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Project
        </button>
      </form>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-lg overflow-x-auto shadow-xs">
          {(['all', 'app', 'code', 'research', 'writer', 'document'] as const).map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  filterType === t
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>

        <div className="relative w-64 max-w-full">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white border border-neutral-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Project List */}
      {filtered.length === 0 ? (
        <div className="bg-white/95 border border-neutral-200 rounded-xl p-10 text-center space-y-2 shadow-xs">
          <FolderOpen className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-sm text-neutral-700">No projects match your filter.</p>
          <p className="text-xs text-neutral-500">
            Create a project above or ask the AI assistant to build an application.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const isActive = p.id === activeProjectId;
            return (
              <div
                key={p.id}
                className={`bg-white/95 border rounded-xl p-4 flex flex-col justify-between gap-4 transition-colors shadow-xs ${
                  isActive ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
                    <span className="capitalize">
                      {p.type} · v{p.activeVersion}
                    </span>
                    <span className="font-mono tabular-nums">
                      {p.files.length} files
                    </span>
                  </div>

                  {renamingId === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="flex-1 bg-neutral-50 border border-blue-500 rounded px-2 py-1 text-sm text-neutral-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (renameValue.trim()) {
                            onRenameProject(p.id, renameValue.trim());
                          }
                          setRenamingId(null);
                        }}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="p-1 text-neutral-500 hover:text-neutral-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-display text-base font-semibold text-neutral-900 truncate">
                      {p.title}
                    </h3>
                  )}

                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                {confirmDeleteId === p.id ? (
                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between gap-2">
                    <span className="text-xs text-rose-700">Delete project?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteProject(p.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs text-white"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenProject(p)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
                    >
                      Open Studio
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(p.id);
                          setRenameValue(p.title);
                        }}
                        title="Rename project"
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(p.id)}
                        title="Delete project"
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
