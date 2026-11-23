import { ImageResponse } from 'next/og';
import { loadShareFonts } from '@/lib/share/assets';
import { PosterFrame, SubtitleLine, CutLine, Shield, FitTeamName, POSTER_CONTENT_WIDTH } from '@/lib/share/components';
import { getGroupTablesData, type GroupTableRowData } from '@/lib/share/data';
import type { Movement } from '@/lib/share/types';

export const runtime = 'nodejs';

// Card: padding 24 horizontal; each row: padding 8 horizontal (same as the single-table poster).
const ROW_WIDTH_PX = POSTER_CONTENT_WIDTH - 24 * 2 - 8 * 2;

// Same hex values TableRow/MovementArrow/CutLine already use elsewhere in this poster set.
const INK = '#F3F0EA';
const MUTED = '#9E84AE';
const MUTED_2 = '#CBB8D9';
const YELLOW = '#DED002';
const DOWN = '#E0689F';

function GroupMovementArrow({ movement }: { movement: Movement | null }) {
  if (movement === 'up') {
    return (
      <svg width={16} height={14} viewBox="0 0 18 16">
        <path d="M9 1 17 15H1z" fill={YELLOW} />
      </svg>
    );
  }
  if (movement === 'down') {
    return (
      <svg width={16} height={14} viewBox="0 0 18 16">
        <path d="M9 15 1 1h16z" fill={DOWN} />
      </svg>
    );
  }
  return (
    <svg width={16} height={14} viewBox="0 0 18 16">
      <rect x={3} y={6.5} width={12} height={3} rx={1.5} fill={MUTED} />
    </svg>
  );
}

// Dense-row layout, matching components.tsx's TableRow(dense) column widths exactly, but with
// 6 stat columns (P W D L GF GA) instead of 5 (P W D L GD) — group tables drop GD for GF/GA.
const DENSE_COLS = { gap: 10, pad: '3px 8px', radius: 12, pos: 22, stat: 19, pts: 26, colW: [40, 20, 30, 48, 58] as const };
const DENSE_PLAYER_RESERVE_PX = 150;
const STAT_LABELS = ['P', 'W', 'D', 'L', 'GF', 'GA'] as const;

function GroupTableHeaderRow() {
  const c = DENSE_COLS;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: c.gap,
        padding: '6px 8px 8px',
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 2,
        color: MUTED,
        borderBottom: '1px solid rgba(243,240,234,0.12)',
        width: '100%',
      }}
    >
      <span style={{ display: 'flex', width: c.colW[0], justifyContent: 'flex-start' }}>#</span>
      <span style={{ display: 'flex', width: c.colW[1] }} />
      <span style={{ display: 'flex', width: c.colW[2] }} />
      <span style={{ display: 'flex', flex: 1 }}>TEAM &middot; PLAYER</span>
      {STAT_LABELS.map((label) => (
        <span key={label} style={{ display: 'flex', width: c.colW[3], justifyContent: 'center' }}>
          {label}
        </span>
      ))}
      <span style={{ display: 'flex', width: c.colW[4], justifyContent: 'flex-end' }}>PTS</span>
    </div>
  );
}

function GroupTableRow({ row, rowWidthPx }: { row: GroupTableRowData; rowWidthPx: number }) {
  const c = DENSE_COLS;
  const posStr = String(row.pos).padStart(2, '0');
  const posColor = row.posTier === 'top' ? YELLOW : row.posTier === 'mid' ? DOWN : MUTED;
  const rowOpacity = row.posTier === 'out' ? 0.55 : 1;
  const ptsColor = row.isLeader ? YELLOW : INK;

  // 11 children (pos, movement, crest, text, 6 stat columns, pts) → 10 gaps.
  const fixedColsWidth = c.colW[0] + c.colW[1] + c.colW[2] + c.colW[3] * 6 + c.colW[4];
  const gapsWidth = c.gap * 10;
  const textAreaWidth = rowWidthPx - fixedColsWidth - gapsWidth;
  const textWidthPx = textAreaWidth - 8 - DENSE_PLAYER_RESERVE_PX;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: c.gap,
        padding: c.pad,
        borderRadius: c.radius,
        width: '100%',
        opacity: rowOpacity,
        ...(row.isLeader
          ? { background: 'rgba(222,208,2,0.1)', boxShadow: 'inset 0 0 0 1px rgba(222,208,2,0.35)' }
          : {}),
      }}
    >
      <span style={{ display: 'flex', width: c.colW[0], fontFamily: 'Furore', fontSize: c.pos, color: posColor }}>{posStr}</span>
      <div style={{ display: 'flex', flexDirection: 'row', width: c.colW[1], alignItems: 'center', justifyContent: 'center' }}>
        <GroupMovementArrow movement={row.movement} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', width: c.colW[2] }}>
        <Shield size={30} height={35} teamName={row.teamName} crestUrl={row.crestUrl} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 8, minWidth: 0, flex: 1 }}>
        <FitTeamName text={row.teamName} maxWidthPx={textWidthPx} max={18} min={14} />
        <span style={{ fontSize: 15, fontWeight: 500, color: MUTED_2, flexShrink: 0 }}>&middot; {row.player}</span>
      </div>
      <span style={{ display: 'flex', width: c.colW[3], justifyContent: 'center', fontSize: c.stat, fontWeight: 600, color: MUTED_2 }}>{row.played}</span>
      <span style={{ display: 'flex', width: c.colW[3], justifyContent: 'center', fontSize: c.stat, fontWeight: 600, color: MUTED_2 }}>{row.won}</span>
      <span style={{ display: 'flex', width: c.colW[3], justifyContent: 'center', fontSize: c.stat, fontWeight: 600, color: MUTED_2 }}>{row.drawn}</span>
      <span style={{ display: 'flex', width: c.colW[3], justifyContent: 'center', fontSize: c.stat, fontWeight: 600, color: MUTED_2 }}>{row.lost}</span>
      <span style={{ display: 'flex', width: c.colW[3], justifyContent: 'center', fontSize: c.stat, fontWeight: 600, color: MUTED_2 }}>{row.goalsFor}</span>
      <span style={{ display: 'flex', width: c.colW[3], justifyContent: 'center', fontSize: c.stat, fontWeight: 600, color: MUTED_2 }}>{row.goalsAgainst}</span>
      <span style={{ display: 'flex', width: c.colW[4], justifyContent: 'flex-end', fontFamily: 'Furore', fontSize: c.pts, color: ptsColor }}>{row.points}</span>
    </div>
  );
}

function GroupCard({ letter, rows }: { letter: 'A' | 'B'; rows: GroupTableRowData[] }) {
  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4,
        background: '#27092F',
        border: '1px solid rgba(243,240,234,0.12)',
        borderRadius: 24,
        padding: '8px 24px 10px',
      }}
    >
      <span style={{ fontFamily: 'Furore', fontSize: 24, padding: '4px 8px 0' }}>
        GROUP <span style={{ color: '#DED002' }}>{letter}</span>
      </span>
      <GroupTableHeaderRow />
      {rows.map((row) => (
        <div key={row.pos} style={{ display: 'flex', flexDirection: 'column' }}>
          {row.pos === 4 ? <CutLine label="QUARTER-FINALS" small solid /> : null}
          {row.pos === 6 ? <CutLine label="QUALIFIERS" small color="#E0689F" /> : null}
          <GroupTableRow row={row} rowWidthPx={ROW_WIDTH_PX} />
        </div>
      ))}
    </div>
  );
}

export async function GET(req: Request, { params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const matchday = Number(n);
  const { searchParams } = new URL(req.url);
  const useSample = searchParams.get('sample') === '1';
  if (!Number.isFinite(matchday) || matchday < 1) {
    return new Response('Not found', { status: 404 });
  }

  const data = await getGroupTablesData(matchday, useSample);
  if (!data) return new Response('Not found', { status: 404 });

  const fonts = await loadShareFonts();
  const mdStr = String(data.matchday).padStart(2, '0');

  return new ImageResponse(
    (
      // No trophy watermark here — it collides with this poster's single-line title, unlike
      // every other poster's two-line title where PosterFrame's trophy position was tuned to sit.
      <PosterFrame tag={`MATCHDAY ${mdStr} · DONE`}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 20, fontFamily: 'Furore', fontSize: 96, lineHeight: 0.9 }}>
            <span>THE</span>
            <span style={{ color: '#DED002' }}>TABLES</span>
          </div>
          <SubtitleLine>After matchday {mdStr} &middot; Group A &amp; Group B</SubtitleLine>
        </div>

        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GroupCard letter="A" rows={data.groupA} />
          <GroupCard letter="B" rows={data.groupB} />
          <span style={{ display: 'flex', fontSize: 14, color: MUTED, padding: '0 8px' }}>
            Ties: points &rarr; goals scored &rarr; goals conceded &rarr; head-to-head
          </span>
        </div>
      </PosterFrame>
    ),
    {
      width: 1080,
      height: 1350,
      fonts,
      headers: {
        'Cache-Control': searchParams.has('v') ? 'public, s-maxage=31536000, immutable' : 'public, s-maxage=60',
      },
    },
  );
}
