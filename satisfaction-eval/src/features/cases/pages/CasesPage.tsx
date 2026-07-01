import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { SectionCard } from '@/components/ui/card';
import { Tag } from '@/components/ui/badge';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import type { CaseItem } from '@/types/domain';
import { formatDate } from '@/lib/utils';

const allTags = ['全部', '覆盖优化', '容量扩容', '干扰排查', '切换优化', '城中村', '高校', '海岸', '高铁'];

export function CasesPage() {
  const [activeTag, setActiveTag] = useState('全部');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: cases } = useQuery({ queryKey: ['cases'], queryFn: api.getCases });

  const filtered = cases?.filter((c) => {
    const matchTag = activeTag === '全部' || c.category === activeTag || c.tags.includes(activeTag);
    const matchSearch = !search || c.title.includes(search) || c.problem.includes(search);
    return matchTag && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">案例库</h1>
        <p className="text-sm text-muted-foreground mt-1">沉淀500+典型案例，支持标签检索与复盘学习</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '总案例数', value: '512', icon: BookOpen },
          { label: '覆盖优化', value: '186', icon: BookOpen },
          { label: '容量扩容', value: '124', icon: BookOpen },
          { label: '干扰排查', value: '89', icon: BookOpen },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50"><s.icon className="size-5 text-blue-500" /></div>
            <div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-xl font-bold">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Tags */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder="搜索案例标题、问题描述..."
            className="text-sm outline-none flex-1 bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {allTags.map((t) => (
            <Tag key={t} label={t} active={activeTag === t} onClick={() => setActiveTag(t)} />
          ))}
        </div>
      </div>

      {/* Case List */}
      <div className="space-y-4">
        {filtered?.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border hover:shadow-md transition-shadow">
            <button
              className="w-full text-left p-5"
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{c.category}</span>
                    {c.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  <h3 className="font-semibold mb-1">{c.title}</h3>
                  <div className="text-sm text-muted-foreground">{c.problem}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{c.region}</span>
                    <span>{formatDate(c.createTime)}</span>
                  </div>
                </div>
                <ChevronRight className={`size-5 text-muted-foreground shrink-0 transition-transform ${expanded === c.id ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {expanded === c.id && (
              <div className="px-5 pb-5 border-t pt-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-green-700 mb-1">解决方案</div>
                  <div className="text-sm text-muted-foreground">{c.solution}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-700 mb-1">处置效果</div>
                  <div className="text-sm text-muted-foreground">{c.effect}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
