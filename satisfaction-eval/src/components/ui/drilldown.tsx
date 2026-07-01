import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, MapPin, Building2, Grid3X3, Radio, Users } from 'lucide-react';

type DrillLevel = 'province' | 'city' | 'county' | 'grid' | 'cell' | 'user';

interface LevelOption {
  key: DrillLevel;
  label: string;
  icon: React.ElementType;
}

const LEVELS: LevelOption[] = [
  { key: 'province', label: '全省', icon: MapPin },
  { key: 'city', label: '地市', icon: Building2 },
  { key: 'county', label: '区县', icon: MapPin },
  { key: 'grid', label: '网格', icon: Grid3X3 },
  { key: 'cell', label: '基站', icon: Radio },
  { key: 'user', label: '用户', icon: Users },
];

const MOCK_DATA: Record<DrillLevel, { name: string; count: number; children?: string[] }[]> = {
  province: [{ name: '广东省', count: 12853 }],
  city: [
    { name: '深圳市', count: 4520 },
    { name: '广州市', count: 3820 },
    { name: '佛山市', count: 1950 },
    { name: '珠海市', count: 1320 },
    { name: '东莞市', count: 1243 },
  ],
  county: [
    { name: '南山区', count: 1850 },
    { name: '福田区', count: 1120 },
    { name: '宝安区', count: 980 },
    { name: '龙华区', count: 570 },
  ],
  grid: [
    { name: '南山-科技园网格', count: 520 },
    { name: '南山-南头网格', count: 380 },
    { name: '南山-蛇口网格', count: 350 },
    { name: '南山-西丽网格', count: 310 },
    { name: '南山-后海网格', count: 290 },
  ],
  cell: [
    { name: 'SZ-NS-001 (科技园南)', count: 85 },
    { name: 'SZ-NS-002 (科技园北)', count: 72 },
    { name: 'SZ-NS-003 (软件园)', count: 65 },
    { name: 'SZ-NS-004 (深圳湾)', count: 58 },
  ],
  user: [
    { name: 'U10001', count: 1 },
    { name: 'U10002', count: 1 },
    { name: 'U10004', count: 1 },
    { name: 'U10007', count: 1 },
  ],
};

interface DrillDownProps {
  className?: string;
  onDrill?: (level: DrillLevel, name: string) => void;
}

export function DrillDown({ className, onDrill }: DrillDownProps) {
  const [activeLevel, setActiveLevel] = useState<number>(0);
  const [selectedPath, setSelectedPath] = useState<string[]>(['广东省']);

  const currentLevel = LEVELS[activeLevel];
  const data = MOCK_DATA[currentLevel.key] || [];

  const handleSelect = (name: string) => {
    const newPath = [...selectedPath.slice(0, activeLevel), name];
    setSelectedPath(newPath);
    if (activeLevel < LEVELS.length - 1) {
      setActiveLevel(activeLevel + 1);
    }
    onDrill?.(currentLevel.key, name);
  };

  const handleBreadcrumb = (idx: number) => {
    setActiveLevel(idx);
    setSelectedPath(selectedPath.slice(0, idx + 1));
  };

  return (
    <div className={cn('bg-white rounded-xl border', className)}>
      {/* Level tabs */}
      <div className="flex border-b overflow-x-auto">
        {LEVELS.map((level, idx) => (
          <button
            key={level.key}
            onClick={() => handleBreadcrumb(idx)}
            disabled={idx > activeLevel}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
              idx === activeLevel
                ? 'text-primary border-primary'
                : idx < activeLevel
                  ? 'text-muted-foreground border-transparent hover:text-foreground'
                  : 'text-muted-foreground/40 border-transparent cursor-not-allowed',
            )}
          >
            <level.icon className="size-4" />
            {level.label}
          </button>
        ))}
      </div>

      {/* Data list */}
      <div className="p-2 max-h-80 overflow-y-auto">
        {data.map((item) => (
          <button
            key={item.name}
            onClick={() => handleSelect(item.name)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors',
              'hover:bg-muted/50',
              selectedPath[activeLevel] === item.name && 'bg-primary/5 text-primary font-medium',
            )}
          >
            <span>{item.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.count} 用户</span>
              {activeLevel < LEVELS.length - 1 && (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Breadcrumb trail */}
      <div className="px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
        <MapPin className="size-3.5" />
        {selectedPath.map((name, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="size-3" />}
            <button
              onClick={() => handleBreadcrumb(idx)}
              className={cn('hover:text-foreground hover:underline', idx === activeLevel && 'text-foreground font-medium')}
            >
              {name}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
