import { useState } from 'react'
import { TIPOS, TIPO_COLORS, EFF_TABLE } from './data'

const darkText = ['electric','ice','flying','rock','steel','fairy','normal']

function getLabel(val) {
  if (val === 0) return '0'
  if (val === 0.25) return '¼'
  if (val === 0.5) return '½'
  if (val === 2) return '2'
  if (val === 4) return '4'
  return '1'
}

function getBg(val, highlighted, selected) {
  const base =
    val === 0   ? '#1a1a2e' :
    val <= 0.25 ? '#1a3a1a' :
    val <= 0.5  ? '#1a3a1a' :
    val >= 4    ? '#5a0000' :
    val >= 2    ? '#3a1a00' :
    '#111820'

  if (highlighted) return val === 1 ? '#1c2830' : base
  if (selected && val !== 1) return base
  if (selected) return '#0c1015'
  return base
}

function getTextColor(val) {
  if (val === 0)    return '#3355aa'
  if (val <= 0.25)  return '#33aa33'
  if (val <= 0.5)   return '#66cc66'
  if (val >= 4)     return '#ff4422'
  if (val >= 2)     return '#ff8844'
  return '#4a6070'
}

const SIZE = 36

export default function TypeChart() {
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredCol, setHoveredCol] = useState(null)
  const [selectedAtk, setSelectedAtk] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  function handleCellEnter(rowIdx, colIdx, val) {
    setHoveredRow(rowIdx)
    setHoveredCol(colIdx)
    setTooltip({
      atk: TIPOS[rowIdx],
      def: TIPOS[colIdx],
      val,
    })
  }

  function handleCellLeave() {
    setHoveredRow(null)
    setHoveredCol(null)
    setTooltip(null)
  }

  function handleAtkClick(type) {
    setSelectedAtk(prev => prev === type ? null : type)
  }

  const selectedAtkIdx = selectedAtk ? TIPOS.indexOf(selectedAtk) : null

  return (
    <div>

      {/* Header */}
      <div className="mb-4 bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest">
          TYPE EFFECTIVENESS · Rows = Attacking · Columns = Defending
        </p>
        {selectedAtk && (
          <button
            onClick={() => setSelectedAtk(null)}
            className="font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors border border-[#1c2830] px-3 py-1.5 rounded-lg"
          >
            × Clear filter
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: '×4 Super Effective', bg: '#5a0000', color: '#ff4422' },
          { label: '×2 Super Effective', bg: '#3a1a00', color: '#ff8844' },
          { label: '×1 Normal',          bg: '#111820', color: '#4a6070' },
          { label: '×½ Not Very',        bg: '#1a3a1a', color: '#66cc66' },
          { label: '×0 Immune',          bg: '#1a1a2e', color: '#3355aa' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: l.bg }}>
            <span className="font-mono-tech text-xs font-bold" style={{ color: l.color }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Attacking type filter buttons */}
      <div className="mb-4">
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest mb-2 uppercase">
          Filter by attacking type:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TIPOS.map(t => (
            <button
              key={t}
              onClick={() => handleAtkClick(t)}
              className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wide transition-all duration-200"
              style={{
                background: selectedAtk === t ? TIPO_COLORS[t] : `${TIPO_COLORS[t]}44`,
                color: selectedAtk === t
                  ? (darkText.includes(t) ? '#111' : '#fff')
                  : TIPO_COLORS[t],
                outline: selectedAtk === t ? `2px solid ${TIPO_COLORS[t]}` : 'none',
                outlineOffset: 2,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <div className={`mb-3 h-7 transition-opacity duration-150 ${tooltip ? 'opacity-100' : 'opacity-0'}`}>
        {tooltip && (
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-xs px-2 py-0.5 rounded font-bold"
              style={{ background: TIPO_COLORS[tooltip.atk], color: darkText.includes(tooltip.atk) ? '#111' : '#fff' }}>
              {tooltip.atk}
            </span>
            <span className="font-mono-tech text-xs text-[#4a6070]">→</span>
            <span className="font-mono-tech text-xs px-2 py-0.5 rounded font-bold"
              style={{ background: TIPO_COLORS[tooltip.def], color: darkText.includes(tooltip.def) ? '#111' : '#fff' }}>
              {tooltip.def}
            </span>
            <span className="font-mono-tech text-xs font-bold" style={{ color: getTextColor(tooltip.val) }}>
              ×{tooltip.val}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1c2830]">
        <table className="border-collapse" style={{ minWidth: `${SIZE * (TIPOS.length + 1)}px` }}>
          <thead>
            <tr>
              <th style={{ width: SIZE, minWidth: SIZE }} className="bg-[#0c1015]" />
              {TIPOS.map((t, colIdx) => (
                <th key={t} style={{ width: SIZE, minWidth: SIZE, padding: 0 }} className="bg-[#0c1015]">
                  <div
                    style={{
                      background: TIPO_COLORS[t],
                      width: SIZE,
                      height: SIZE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: darkText.includes(t) ? '#111' : '#fff',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      opacity: hoveredCol === colIdx || selectedAtkIdx !== null ? 1 : 1,
                      outline: hoveredCol === colIdx ? '2px solid rgba(255,255,255,0.3)' : 'none',
                    }}
                  >
                    {t.slice(0, 3)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIPOS.map((atkType, rowIdx) => {
              const isSelectedRow = selectedAtkIdx === rowIdx
              const isFilteredOut = selectedAtk !== null && !isSelectedRow

              if (isFilteredOut) return null

              return (
                <tr key={atkType}>
                  <td style={{ padding: 0 }} className="bg-[#0c1015] sticky left-0 z-10">
                    <div
                      onClick={() => handleAtkClick(atkType)}
                      style={{
                        background: TIPO_COLORS[atkType],
                        width: SIZE,
                        height: SIZE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 'bold',
                        color: darkText.includes(atkType) ? '#111' : '#fff',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        outline: isSelectedRow || hoveredRow === rowIdx ? '2px solid rgba(255,255,255,0.3)' : 'none',
                      }}
                    >
                      {atkType.slice(0, 3)}
                    </div>
                  </td>
                  {TIPOS.map((defType, colIdx) => {
                    const val = EFF_TABLE[rowIdx][colIdx]
                    const isHighlighted = hoveredRow === rowIdx || hoveredCol === colIdx

                    return (
                      <td key={defType} style={{ padding: 0 }}>
                        <div
                          onMouseEnter={() => handleCellEnter(rowIdx, colIdx, val)}
                          onMouseLeave={handleCellLeave}
                          style={{
                            width: SIZE,
                            height: SIZE,
                            background: getBg(val, isHighlighted, isSelectedRow),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 'bold',
                            color: getTextColor(val),
                            borderRight: '1px solid #0c1015',
                            borderBottom: '1px solid #0c1015',
                            cursor: 'default',
                            transition: 'background 0.1s',
                            opacity: isFilteredOut ? 0.3 : 1,
                          }}
                        >
                          {val !== 1 ? getLabel(val) : (isHighlighted ? '·' : '')}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="font-mono-tech text-xs text-[#2a3840] text-center mt-4">
        Click any type label to filter · Hover cells for details
      </p>
    </div>
  )
}