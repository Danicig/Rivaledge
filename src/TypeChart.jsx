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

function getBg(val) {
  if (val === 0) return '#1a1a2e'
  if (val <= 0.25) return '#1a3a1a'
  if (val <= 0.5) return '#1a3a1a'
  if (val >= 4) return '#5a0000'
  if (val >= 2) return '#3a1a00'
  return '#111820'
}

function getTextColor(val) {
  if (val === 0) return '#3355aa'
  if (val <= 0.25) return '#33aa33'
  if (val <= 0.5) return '#66cc66'
  if (val >= 4) return '#ff4422'
  if (val >= 2) return '#ff8844'
  return '#4a6070'
}

export default function TypeChart() {
  const SIZE = 28

  return (
    <div className="animate-fade-in">
      <div className="mb-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-3 sm:p-4">
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest">
          TYPE EFFECTIVENESS · Rows = Attacking type · Columns = Defending type
        </p>
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: '×4', bg: '#5a0000', color: '#ff4422' },
          { label: '×2', bg: '#3a1a00', color: '#ff8844' },
          { label: '×1', bg: '#111820', color: '#4a6070' },
          { label: '×½', bg: '#1a3a1a', color: '#66cc66' },
          { label: '×0', bg: '#1a1a2e', color: '#3355aa' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: l.bg }}>
            <span className="font-mono-tech text-xs font-bold" style={{ color: l.color }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* TABLE — horizontally scrollable on mobile */}
      <div className="overflow-x-auto rounded-xl border border-[#1c2830]">
        <table className="border-collapse" style={{ minWidth: `${SIZE * (TIPOS.length + 1)}px` }}>
          <thead>
            <tr>
              <th style={{ width: SIZE, minWidth: SIZE }} className="bg-[#0c1015]" />
              {TIPOS.map(t => (
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
                      fontSize: 8,
                      fontWeight: 'bold',
                      color: darkText.includes(t) ? '#111' : '#fff',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}>
                    {t.slice(0, 3)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIPOS.map((atkType, i) => (
              <tr key={atkType}>
                <td style={{ padding: 0 }} className="bg-[#0c1015] sticky left-0 z-10">
                  <div style={{
                    background: TIPO_COLORS[atkType],
                    width: SIZE,
                    height: SIZE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 8,
                    fontWeight: 'bold',
                    color: darkText.includes(atkType) ? '#111' : '#fff',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}>
                    {atkType.slice(0, 3)}
                  </div>
                </td>
                {TIPOS.map((defType, j) => {
                  const val = EFF_TABLE[i][j]
                  return (
                    <td key={defType} style={{ padding: 0 }}>
                      <div style={{
                        width: SIZE,
                        height: SIZE,
                        background: getBg(val),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 'bold',
                        color: getTextColor(val),
                        borderRight: '1px solid #0c1015',
                        borderBottom: '1px solid #0c1015',
                      }}>
                        {val !== 1 ? getLabel(val) : ''}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}