# Generates the direction artboards from the real Sunk Cost tokens.
import textwrap, json

FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">'
SANS = "'Instrument Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
T = dict(bg='#eff2f1', panel='#ffffff', panel2='#f6f8f8', panel3='#eceff0', ink='#0e1720', ink2='#35424e', muted='#4f5e68', faint='#5e6d77',
         line='#dfe5e6', line2='#c6d0d3', w0='#dbe8f1', w1='#a8c7de', w2='#5a8fb8', w3='#1f5479', w4='#0b2941', w5='#05121e',
         accent='#d9812f', accent2='#f0a75a', accentInk='#9a5811', ok='#2c7a58', warn='#b3831a', bad='#bb4230', none='#b6c0c5',
         surface='#9cc7ee', curve='#a9d3f2', chartInk='#bcd4e6', waterText='#cfe0ee')

def helmet(extra=''):
    return f'''<helmet>
  {FONTS}
  <style>
    body {{ margin: 0; background: {T['bg']}; color: {T['ink']}; font-family: {SANS}; font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased; font-feature-settings: 'ss01', 'cv01'; }}
    a {{ color: {T['w3']}; }} a:hover {{ color: {T['ink']}; }}
    .mono {{ font-family: {MONO}; font-variant-numeric: tabular-nums; }}
    {extra}
  </style>
</helmet>'''

def shell(body, extra_css='', bg=T['bg']):
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
{helmet(extra_css)}
{body}
</x-dc>
</body>
</html>
'''

def topbar(w='100%', line='If you buy this machine to run local models, how long until it pays for itself, and what can it actually do?'):
    return f'''<div style="display: flex; align-items: center; gap: 18px; height: 58px; padding: 0 22px; border-bottom: 1px solid {T['line']}; background: {T['bg']};">
  <div style="display: flex; align-items: center; gap: 8px; flex: none;">
    <div style="width: 11px; height: 11px; border-radius: 2px; background: linear-gradient(180deg, {T['w1']} 0 42%, {T['w3']} 42%, {T['w5']} 100%); box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);"></div>
    <div style="font-weight: 700; font-size: 15px; letter-spacing: -0.02em;">Sunk Cost</div>
    <div style="font-size: 12px; color: {T['faint']};">sunkcost.ai</div>
  </div>
  <div style="flex: 1 1 auto; min-width: 0; color: {T['muted']}; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{line}</div>
  <div style="font-size: 11.5px; color: {T['faint']}; flex: none;" class="mono">Data checked 2026-09-03</div>
</div>'''

def topbar_mobile():
    return f'''<div style="display: flex; align-items: center; gap: 8px; height: 52px; padding: 0 16px; border-bottom: 1px solid {T['line']};">
  <div style="width: 11px; height: 11px; border-radius: 2px; background: linear-gradient(180deg, {T['w1']} 0 42%, {T['w3']} 42%, {T['w5']} 100%);"></div>
  <div style="font-weight: 700; font-size: 15px; letter-spacing: -0.02em;">Sunk Cost</div>
  <div style="font-size: 12px; color: {T['faint']};">sunkcost.ai</div>
</div>'''

def waterline(W, H, plotH, years='27.3 yrs', axis=('bought','10 yr','20 yr','30 yr'), depth=('−$1,000','−$2,000','−$3,000'), be_x=0.83, never=False, label_scale=1.0):
    """Static full-bleed water card: sky, surface, water gradient, rising curve. Text overlays are HTML."""
    padX = 14; padT = 16; padB = 21
    innerH = plotH - padT - padB; innerW = W - padX*2
    surfaceY = padT + innerH*0.2
    x0 = padX; y0 = padT + innerH*0.97
    if never:
        x1 = padX + innerW; y1 = padT + innerH*0.86
        beX = None
    else:
        beX = padX + innerW*be_x
        x1 = padX + innerW; y1 = surfaceY - (surfaceY - padT)*0.55 * ((x1-beX)/(beX-x0))
    fs = 10.5*label_scale
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice" style="display:block;width:100%;height:100%;font-family:{SANS};">']
    parts.append(f'''<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{T['w0']}"/><stop offset="1" stop-color="#eef4f8"/></linearGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{T['w3']}"/><stop offset="0.55" stop-color="#123f60"/><stop offset="1" stop-color="{T['w5']}"/></linearGradient>
<linearGradient id="mass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{T['curve']}" stop-opacity="0.34"/><stop offset="1" stop-color="{T['curve']}" stop-opacity="0.03"/></linearGradient>
<clipPath id="clip"><rect x="{padX}" y="{padT}" width="{innerW}" height="{innerH}"/></clipPath>
</defs>''')
    parts.append(f'<rect x="0" y="0" width="{W}" height="{surfaceY:.1f}" fill="url(#sky)"/>')
    parts.append(f'<rect x="0" y="{surfaceY:.1f}" width="{W}" height="{H-surfaceY:.1f}" fill="url(#water)"/>')
    for i, d in enumerate(depth):
        yy = surfaceY + (innerH*0.77)*(i+1)/(len(depth)+0.2)
        parts.append(f'<line x1="0" x2="{W}" y1="{yy:.1f}" y2="{yy:.1f}" stroke="{T['chartInk']}" stroke-opacity="0.13"/>')
        parts.append(f'<text x="{padX}" y="{yy-5:.1f}" font-size="{fs}" fill="{T['chartInk']}" opacity="0.6" class="mono">{d}</text>')
    parts.append(f'<path clip-path="url(#clip)" d="M {x0} {padT+innerH:.1f} L {x0} {y0:.1f} L {x1:.1f} {y1:.1f} L {x1:.1f} {padT+innerH:.1f} Z" fill="url(#mass)"/>')
    parts.append(f'<rect x="0" y="{surfaceY-7:.1f}" width="{W}" height="7" fill="{T['surface']}" opacity="0.16"/>')
    parts.append(f'<line x1="0" x2="{W}" y1="{surfaceY:.1f}" y2="{surfaceY:.1f}" stroke="{T['surface']}" stroke-width="1.75"/>')
    parts.append(f'<text x="{padX}" y="{surfaceY-8:.1f}" font-size="{10*label_scale}" font-weight="600" letter-spacing="0.8" fill="#2f6890" opacity="0.95">BREAK EVEN</text>')
    def seg(ax, ay, bx, by, color):
        return (f'<line clip-path="url(#clip)" x1="{ax:.1f}" y1="{ay:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{color}" stroke-opacity="0.28" stroke-width="9" stroke-linecap="round"/>'
                f'<line clip-path="url(#clip)" x1="{ax:.1f}" y1="{ay:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{color}" stroke-width="3.25" stroke-linecap="round"/>')
    if beX is not None:
        parts.append(seg(x0, y0, beX, surfaceY, T['curve']))
        parts.append(seg(beX, surfaceY, x1, y1, T['accent2']))
        parts.append(f'<circle cx="{beX:.1f}" cy="{surfaceY:.1f}" r="6" fill="{T['accent2']}" stroke="#fff" stroke-width="2"/>')
        parts.append(f'<text x="{beX-13:.1f}" y="{surfaceY-12:.1f}" text-anchor="end" font-size="{12*label_scale}" font-weight="600" fill="#2f6890">surfaces at {years}</text>')
    else:
        parts.append(seg(x0, y0, x1, y1, T['curve']))
        parts.append(f'<text x="{x1:.1f}" y="{y1-14:.1f}" text-anchor="end" font-size="{12*label_scale}" font-weight="600" fill="{T['chartInk']}" opacity="0.92">never reaches the surface</text>')
    parts.append(f'<circle cx="{x0}" cy="{y0:.1f}" r="3.5" fill="{T['curve']}"/>')
    ty = padT + innerH + 14
    for i, a in enumerate(axis):
        tx = padX + innerW*(i/(len(axis)-1))*0.93 if i else padX
        anchor = 'start' if i == 0 else 'middle'
        parts.append(f'<text x="{tx:.1f}" y="{ty:.1f}" text-anchor="{anchor}" font-size="{fs}" fill="{T['chartInk']}" opacity="0.55" class="mono">{a}</text>')
    parts.append('</svg>')
    return ''.join(parts)

def hero_card(W, H, plotH, headline, sub, config, radius=14, never=False, actions=True, years='27.3 yrs', axis=None, depth=None, be_x=0.83, hsize=40, pad=18):
    axis = axis or ('bought','10 yr','20 yr','30 yr'); depth = depth or ('−$1,000','−$2,000','−$3,000')
    color = T['accent2'] if never else '#ffffff'
    btns = ''
    if actions:
        btns = f'''<div style="display: flex; gap: 8px; margin-top: 12px;">
  <div style="font-size: 12.5px; font-weight: 500; padding: 6px 12px; border-radius: 7px; background: #fff; color: {T['w5']};">Copy link</div>
  <div style="font-size: 12.5px; font-weight: 500; padding: 6px 12px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.28); color: #eef5fb;">Download card</div>
  <div style="font-size: 12.5px; font-weight: 500; padding: 6px 12px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.28); color: #eef5fb;">Post on X</div>
</div>'''
    return f'''<div style="position: relative; isolation: isolate; overflow: hidden; width: {W}px; height: {H}px; border-radius: {radius}px; background: {T['w5']}; color: #eef5fb; display: flex; flex-direction: column; justify-content: flex-end;">
  <div style="position: absolute; inset: 0; z-index: 0;">{waterline(W, H, plotH, years=years, axis=axis, depth=depth, be_x=be_x, never=never)}</div>
  <div style="position: relative; z-index: 1; padding: 0 {pad}px {pad}px; background: linear-gradient(180deg, transparent 0, rgba(5,18,30,0.55) 38%, rgba(5,18,30,0.82) 100%);">
    <div style="font-size: {hsize}px; line-height: 1.03; letter-spacing: -0.034em; font-weight: 600; color: {color}; text-wrap: balance; padding-top: 30px;">{headline}</div>
    <div style="font-size: 14.5px; margin-top: 7px; color: {T['waterText']};">{sub}</div>
    <div style="font-size: 12px; margin-top: 4px; color: rgba(207,224,238,0.68);">{config}</div>
    {btns}
  </div>
</div>'''

def dots(vals):
    col = {'g': T['ok'], 'a': T['warn'], 'r': T['bad'], 'n': T['none']}
    return '<div style="display: flex; gap: 4px; align-items: center;">' + ''.join(f'<div style="width: 9px; height: 9px; border-radius: 50%; background: {col[v]};"></div>' for v in vals) + '</div>'

def tier_bar(n):
    return '<div style="display: inline-grid; grid-template-columns: repeat(4, 20px); gap: 2px; vertical-align: middle;">' + ''.join(f'<div style="height: 7px; border-radius: 2px; background: {T["w3"] if i < n else T["line"]};"></div>' for i in range(4)) + '</div>'

def figures(items, cols=3, size=19):
    cells = ''.join(f'''<div style="display: flex; flex-direction: column; gap: 2px;">
  <div style="font-size: 12px; color: {T['muted']};">{k}</div>
  <div class="mono" style="font-size: {size}px; font-weight: 600; letter-spacing: -0.01em;">{v}</div>
  {f'<div style="font-size: 12px; color: {T["faint"]};">{s}</div>' if s else ''}
</div>''' for k, v, s in items)
    return f'<div style="display: grid; grid-template-columns: repeat({cols}, minmax(0, 1fr)); gap: 12px 16px;">{cells}</div>'

def pill(text, active=False, mono=False):
    bg = T['ink'] if active else T['panel']
    fg = '#fff' if active else T['ink']
    bd = T['ink'] if active else T['line2']
    return f'<div style="font-size: 12.5px; font-weight: 500; padding: 6px 11px; border-radius: 999px; border: 1px solid {bd}; background: {bg}; color: {fg}; white-space: nowrap;{" font-family: " + MONO + ";" if mono else ""}">{text}</div>'

def inline_select(text, w=None):
    return f'''<span style="display: inline-flex; align-items: center; gap: 7px; padding: 2px 10px 2px 12px; border-radius: 9px; background: {T['panel']}; border: 1px solid {T['line2']}; color: {T['ink']}; font-weight: 600; white-space: nowrap; box-shadow: 0 1px 2px rgba(14,23,32,0.06);{f' min-width:{w}px;' if w else ''}">{text}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="{T['muted']}" stroke-width="1.6"><path d="M3 4.5l3 3 3-3"/></svg></span>'''

FIT_MODELS = [
 ('Qwen3.8 27B', 'Q4_K_M', '25', 'Sonnet-class', 3, 'nnnnn', '27 yrs', '19 GB', '$0.32 / $2.5', 52, True),
 ('Qwen3.6 35B-A3B', 'Q4_K_M', '73', 'Haiku-class', 2, 'nnnnn', '1,048 yrs', '23 GB', '$0.05 / $0.7', 32, False),
 ('Gemma 4 31B', 'Q4_K_M', '18', 'Haiku-class', 2, 'nnnnn', '412 yrs', '26 GB', '$0.09 / $0.34', 30, False),
 ('gpt-oss-120b', 'MXFP4', '—', 'Haiku-class', 2, 'gagga', 'needs 64 GB', '65 GB', '$0.03 / $0.17', 24, False),
 ('gpt-oss-20b', 'MXFP4', '64', 'Below hosted', 1, 'gagaa', '1,048 yrs', '13 GB', '$0.02 / $0.10', 15, False),
 ('Qwen3-Coder 30B-A3B', 'Q4_K_M', '35', 'Below hosted', 1, 'aagaa', '360 yrs', '22 GB', '$0.07 / $0.27', 14, False),
 ('Qwen3 32B', 'Q4_K_M', '16', 'Below hosted', 1, 'gggaa', '412 yrs', '28 GB', '$0.08 / $0.28', 11, False),
 ('Mistral Small 3.2 24B', 'Q4_K_M', '26', 'Below hosted', 1, 'ggaaa', '520 yrs', '18 GB', '$0.075 / $0.20', 11, False),
 ('DeepSeek-R1-Distill 32B', 'Q4_K_M', '16', 'Below hosted', 1, 'aaagr', '95 yrs', '28 GB', '$0.80 / $0.80', 11, False),
 ('Gemma 3 27B', 'Q4_K_M', '22', 'Below hosted', 1, 'ggaar', '380 yrs', '21 GB', '$0.08 / $0.45', 7, False),
 ('Qwen3 14B', 'Q4_K_M', '41', 'Below hosted', 1, 'ggaar', '890 yrs', '14 GB', '$0.10 / $0.22', 10, False),
 ('Llama 3.1 8B', 'Q4_K_M', '75', 'Below hosted', 1, 'garrr', 'never', '9.2 GB', '$0.02 / $0.04', 7, False),
]

# ---------------- A · Say it in a sentence (chosen, refined) ----------------
def slider(label, readout, frac, ticks, color=None):
    color = color or T['w3']
    return f"""<div style="display: flex; flex-direction: column; gap: 6px; min-width: 0;">
  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px;"><span style="font-size: 11.5px; font-weight: 500; color: {T['muted']};">{label}</span><span style="font-size: 12.5px; color: {T['ink2']};">{readout}</span></div>
  <div style="position: relative; height: 18px;"><div style="position: absolute; left: 0; right: 0; top: 8px; height: 3px; border-radius: 2px; background: {T['line2']};"></div><div style="position: absolute; left: 0; width: {frac}%; top: 8px; height: 3px; border-radius: 2px; background: {color};"></div><div style="position: absolute; left: {frac}%; top: 1px; width: 16px; height: 16px; border-radius: 50%; background: {color}; box-shadow: 0 0 0 3px #fff, 0 1px 3px rgba(0,0,0,0.3); transform: translateX(-50%);"></div></div>
  <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: {T['faint']};">{''.join(f'<span>{t}</span>' for t in ticks)}</div>
</div>"""

def model_row(name, q, tps, smart, tier, caps, be, gb, price, sel=False, status='fits', reason=''):
    dim = status != 'fits'
    return f"""<div style="background: {T['panel']}; border: 1px solid {T['ink'] if sel else T['line']}; border-radius: 10px; padding: 11px 13px; display: flex; flex-direction: column; gap: 6px; {'box-shadow: inset 3px 0 0 ' + T['ink'] + ';' if sel else ''} {'opacity: 0.55; background: transparent;' if dim else ''}">
  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 10px;">
    <div style="display: flex; align-items: baseline; gap: 7px; min-width: 0;"><span style="font-size: 14px; font-weight: 600; letter-spacing: -0.012em; white-space: nowrap;">{name}</span><span class="mono" style="font-size: 11px; color: {T['faint']};">{q}</span></div>
    <div class="mono" style="font-size: 12.5px; white-space: nowrap;">{tps if dim else tps + ' tok/s'}</div>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; color: {T['muted']};">
    <div style="display: flex; align-items: center; gap: 7px;">{tier_bar(tier)}<span>{smart}</span></div>
    {dots(caps)}
  </div>
  <div style="display: flex; justify-content: space-between; font-size: 12px; color: {T['muted']};"><span class="mono">{gb} at 32k</span><span class="mono" style="{'color:' + T['bad'] + ';' if be == 'never' else ''}">{'pays back in ' + be if be != 'never' else 'never pays back'}</span></div>
  {f'<div style="font-size: 12px; color: {T["accentInk"]};">{reason}</div>' if reason else ''}
</div>"""

NOFIT = [
 ('Llama 3.3 70B', 'Q4_K_M', '—', 'Below hosted', 1, 'gggaa', '—', '53 GB', '', 'nearly', 'Nearly: needs 53 GB, this config has 48 GB usable'),
 ('gpt-oss-120b', 'MXFP4', '—', 'Haiku-class', 2, 'gagga', '—', '65 GB', '', 'nearly', 'Nearly: needs 65 GB, this config has 48 GB usable'),
 ('GLM-4.5-Air', 'Q4_K_M', '—', 'Below hosted', 1, 'gggag', '—', '79 GB', '', 'no', 'Needs 79 GB'),
 ('Qwen3 235B-A22B', 'Q4_K_M', '—', 'Below hosted', 1, 'ggggа', '—', '148 GB', '', 'no', 'Needs 148 GB'),
]

def sentence_desktop():
    W, H = 1440, 900
    sentence = f"""<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 24px; flex-wrap: wrap;">
  <div style="font-size: 26px; line-height: 1.5; letter-spacing: -0.02em; color: {T['ink2']}; text-wrap: pretty;">
    I'm looking at a {inline_select('Mac Studio')} with an {inline_select('M5 Max')} and {inline_select('64 GB')} of memory.
  </div>
  <div style="color: {T['faint']}; font-size: 14px; white-space: nowrap;">List price <span class="mono" style="color: {T['ink2']};">$3,499</span> · <a href="#">I paid something else</a> · 614 GB/s · 48 GB usable by the GPU</div>
</div>"""
    controls = f"""<div style="background: {T['panel']}; border: 1px solid {T['line']}; border-radius: 14px; padding: 14px 16px; display: grid; grid-template-columns: 220px minmax(0, 1fr) minmax(0, 1fr); gap: 22px; align-items: start;">
  <div style="display: flex; flex-direction: column; gap: 6px;"><span style="font-size: 11.5px; font-weight: 500; color: {T['muted']};">Mostly for</span><div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 9px; border-radius: 7px; border: 1px solid {T['line2']}; background: {T['panel2']}; font-size: 13px;">Agentic coding · 15:1<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="{T['muted']}" stroke-width="1.6"><path d="M3 4.5l3 3 3-3"/></svg></div><span style="font-size: 11.5px; color: {T['faint']};">Whole files and tool results resent every turn</span></div>
  {slider('Tokens a day', '<b class="mono" style="color:' + T['ink'] + '">500k</b> — a moderate coding-assistant day', 46, ['a few chats','light use','heavy agent use','agents all day'])}
  {slider('Context window', '<b class="mono" style="color:' + T['ink'] + '">32k</b> — 2.1 GB of KV cache for Qwen3.8 27B', 50, ['4k','16k','64k','256k'])}
</div>"""
    stats = f"""<div style="background: {T['panel']}; border: 1px solid {T['line']}; border-radius: 14px; padding: 16px 18px;">
  {figures([('Hardware','$3,499','list price'),('API cost per month','$11.51','Qwen3.8 27B on OpenRouter'),('Electricity per month','$0.84','145 W under load'),('Local speed','25 tok/s','estimated, at 32k'),('Break-even','27 years','4.99B tokens'),('After 12 months','−$3,371','still underwater')], cols=3, size=20)}
</div>"""
    rows = ''.join(model_row(*m[:9], sel=m[10]) for m in FIT_MODELS[:6])
    rows += ''.join(model_row(*m[:9], status=m[9], reason=m[10]) for m in NOFIT[:2])
    right = f"""<div style="display: flex; flex-direction: column; gap: 10px; min-height: 0;">
  <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
    <div style="font-size: 13px; font-weight: 600;">16 of 23 models fit in 48 GB</div>
    <div style="display: flex; gap: 6px;">{pill('All families')}{pill('Smartest first', True)}</div>
  </div>
  <div style="display: flex; gap: 10px; font-size: 11.5px; color: {T['faint']}; flex-wrap: wrap;">{''.join(f'<span style="display:inline-flex;align-items:center;gap:4px;"><i style="width:8px;height:8px;border-radius:50%;background:{c};display:inline-block;"></i>{l}</span>' for c, l in [(T['ok'],'good'),(T['warn'],'usable'),(T['bad'],"don't"),(T['none'],'not rated')])}<span>· summarise, translate, coding, reasoning, agentic</span></div>
  <div style="display: flex; flex-direction: column; gap: 8px; overflow: hidden; position: relative;">{rows}
    <div style="position: absolute; left: 0; right: 0; bottom: 0; height: 90px; background: linear-gradient(180deg, transparent, {T['bg']});"></div>
  </div>
</div>"""
    body = f"""<div style="width: {W}px; height: {H}px; background: {T['bg']}; display: flex; flex-direction: column; overflow: hidden;">
{topbar()}
<div style="padding: 22px 32px 0; display: flex; flex-direction: column; gap: 18px; flex: 1 1 auto; min-height: 0;">
  {sentence}
  <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 22px; align-items: start; min-height: 0;">
    <div style="display: flex; flex-direction: column; gap: 14px;">
      {hero_card(806, 380, 225, 'You’re underwater for 27.3 years.', 'Saving $0.35 a day against the API, on $3,499 of hardware.', 'Mac Studio M5 Max, 64GB · Qwen3.8 27B Q4_K_M · 500k tokens/day, 15:1 input:output', hsize=36)}
      {controls}
      {stats}
    </div>
    {right}
  </div>
</div>
</div>"""
    return shell(body)

def sentence_mobile():
    W, H = 390, 844
    rows = ''.join(model_row(*m[:9], sel=m[10]) for m in FIT_MODELS[:2])
    body = f"""<div style="width: {W}px; height: {H}px; background: {T['bg']}; display: flex; flex-direction: column; overflow: hidden;">
{topbar_mobile()}
<div style="padding: 16px 16px 0; display: flex; flex-direction: column; gap: 14px;">
  <div style="font-size: 20px; line-height: 1.6; letter-spacing: -0.02em; color: {T['ink2']}; text-wrap: pretty;">
    I'm looking at a {inline_select('Mac Studio')} with an {inline_select('M5 Max')} and {inline_select('64 GB')} of memory. <span style="font-size: 13px; color: {T['faint']}; letter-spacing: 0;">$3,499 list · <a href="#">I paid less</a></span>
  </div>
  {hero_card(358, 330, 190, 'You’re underwater for 27.3 years.', 'Saving $0.35 a day on $3,499.', 'Qwen3.8 27B · 500k tokens/day · 15:1', hsize=28, pad=16, actions=False)}
  <div style="background: {T['panel']}; border: 1px solid {T['line']}; border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 14px;">
    {slider('Tokens a day', '<b class="mono" style="color:' + T['ink'] + '">500k</b> · agentic coding', 46, ['few chats','light','heavy','all day'])}
    {slider('Context window', '<b class="mono" style="color:' + T['ink'] + '">32k</b> · 2.1 GB KV', 50, ['4k','16k','64k','256k'])}
  </div>
  <div style="background: {T['panel']}; border: 1px solid {T['line']}; border-radius: 14px; padding: 14px 16px;">{figures([('Hardware','$3,499',''),('API / month','$11.51',''),('Speed','25 tok/s',''),('Break-even','27 yrs','')], cols=2, size=17)}</div>
  <div style="display: flex; justify-content: space-between; align-items: baseline;"><div style="font-size: 13px; font-weight: 600;">16 of 23 models fit</div><div style="font-size: 12px; color: {T['muted']};">Smartest first</div></div>
  <div style="display: flex; flex-direction: column; gap: 8px;">{rows}</div>
</div>
</div>"""
    return shell(body)

# ---------------- B · Verdict first ----------------
def verdict_desktop():
    W, H = 1440, 900
    strip = f'''<div style="position: absolute; top: 18px; left: 22px; right: 22px; z-index: 2; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
  {pill('Mac Studio M5 Max · 64GB · $3,499', True)}{pill('Qwen3.8 27B Q4_K_M', True)}{pill('Agentic coding · 15:1')}{pill('500k tokens a day')}{pill('32k context')}
  <div style="flex: 1 1 auto;"></div>{pill('Paid a different price?')}
</div>'''
    hero = f'''<div style="position: relative; width: {W}px; height: 560px; overflow: hidden; background: {T['w5']}; color: #eef5fb;">
  <div style="position: absolute; inset: 0;">{waterline(W, 560, 560-190, label_scale=1.15)}</div>
  {strip}
  <div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 0 40px 34px; background: linear-gradient(180deg, transparent 0, rgba(5,18,30,0.5) 40%, rgba(5,18,30,0.85) 100%); display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 40px; align-items: end;">
    <div>
      <div style="font-size: 62px; line-height: 1; letter-spacing: -0.04em; font-weight: 600; color: #fff; text-wrap: balance; padding-top: 60px;">You’re underwater for 27.3 years.</div>
      <div style="font-size: 17px; margin-top: 12px; color: {T['waterText']};">Saving $0.35 a day against the API, on $3,499 of hardware. Roughly Claude Sonnet 5 smarts at 25 tokens a second.</div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px 22px; color: #eef5fb;">
      {''.join(f'<div><div style="font-size: 12px; color: rgba(207,224,238,0.7);">{k}</div><div class="mono" style="font-size: 22px; font-weight: 600;">{v}</div></div>' for k, v in [('Hardware','$3,499'),('API per month','$11.51'),('Local speed','25 tok/s'),('After 12 months','−$3,371')])}
    </div>
  </div>
</div>'''
    rows = ''
    for name, q, tps, smart, tier, caps, be, gb, price, score, sel in FIT_MODELS[:7]:
        rows += f'''<div style="display: grid; grid-template-columns: minmax(0, 2fr) 90px 150px 120px 110px; gap: 16px; align-items: center; padding: 12px 0; border-bottom: 1px solid {T['line']}; {'font-weight: 600;' if sel else ''}">
  <div style="display: flex; align-items: baseline; gap: 8px;"><span>{name}</span><span class="mono" style="font-size: 11.5px; color: {T['faint']}; font-weight: 400;">{q}</span></div>
  <div class="mono" style="font-size: 13px;">{tps} tok/s</div>
  <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: {T['muted']}; font-weight: 400;">{tier_bar(tier)}{smart}</div>
  <div>{dots(caps)}</div>
  <div class="mono" style="font-size: 13px; color: {T['ink2']};">{be}</div>
</div>'''
    below = f'''<div style="padding: 34px 40px 0; display: grid; grid-template-columns: minmax(0, 1fr); max-width: 1100px;">
  <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px;">
    <div style="font-size: 15px; font-weight: 600;">What else fits in 48 GB</div>
    <div style="display: flex; gap: 14px; font-size: 12.5px; color: {T['muted']};"><span>Sorted by smartest</span><span>All families</span><span>16 fit · 7 shown</span></div>
  </div>
  <div style="display: grid; grid-template-columns: minmax(0, 2fr) 90px 150px 120px 110px; gap: 16px; padding: 8px 0; font-size: 11.5px; color: {T['faint']}; border-bottom: 1px solid {T['line2']};"><div>Model</div><div>Speed at 32k</div><div>How smart</div><div>Good at</div><div>Pays back in</div></div>
  {rows}
</div>'''
    body = f'''<div style="width: {W}px; height: {H}px; background: {T['bg']}; display: flex; flex-direction: column; overflow: hidden;">
{topbar()}
{hero}
{below}
</div>'''
    return shell(body)

def verdict_mobile():
    W, H = 390, 844
    hero = f'''<div style="position: relative; width: {W}px; height: 560px; overflow: hidden; background: {T['w5']}; color: #eef5fb;">
  <div style="position: absolute; inset: 0;">{waterline(W, 560, 330)}</div>
  <div style="position: absolute; top: 14px; left: 14px; right: 14px; display: flex; gap: 6px; flex-wrap: wrap;">{pill('Mac Studio M5 Max 64GB', True)}{pill('Qwen3.8 27B', True)}{pill('Agentic · 500k/day')}</div>
  <div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 0 16px 20px; background: linear-gradient(180deg, transparent 0, rgba(5,18,30,0.55) 40%, rgba(5,18,30,0.85) 100%);">
    <div style="font-size: 38px; line-height: 1.02; letter-spacing: -0.036em; font-weight: 600; color: #fff; text-wrap: balance; padding-top: 50px;">You’re underwater for 27.3 years.</div>
    <div style="font-size: 14px; margin-top: 8px; color: {T['waterText']};">Saving $0.35 a day on $3,499 of hardware. Sonnet-class smarts at 25 tok/s.</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin-top: 16px;">
      {''.join(f'<div><div style="font-size: 11.5px; color: rgba(207,224,238,0.7);">{k}</div><div class="mono" style="font-size: 18px; font-weight: 600;">{v}</div></div>' for k, v in [('API per month','$11.51'),('Local speed','25 tok/s'),('Electricity','$0.84'),('After 12 months','−$3,371')])}
    </div>
  </div>
</div>'''
    rows = ''
    for name, q, tps, smart, tier, caps, be, gb, price, score, sel in FIT_MODELS[:4]:
        rows += f'''<div style="display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid {T['line']};">
  <div><div style="font-size: 14px; {'font-weight: 600;' if sel else ''}">{name}</div><div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: {T['muted']};">{tier_bar(tier)}{smart}</div></div>
  <div style="text-align: right;"><div class="mono" style="font-size: 13px;">{tps} tok/s</div><div class="mono" style="font-size: 12px; color: {T['faint']};">{be}</div></div>
</div>'''
    body = f'''<div style="width: {W}px; height: {H}px; background: {T['bg']}; display: flex; flex-direction: column; overflow: hidden;">
{topbar_mobile()}
{hero}
<div style="padding: 18px 16px 0;">
  <div style="display: flex; justify-content: space-between; align-items: baseline;"><div style="font-size: 14px; font-weight: 600;">What else fits</div><div style="font-size: 12px; color: {T['muted']};">Smartest first</div></div>
  {rows}
</div>
</div>'''
    return shell(body)

# ---------------- C · The ledger ----------------
def ledger_desktop():
    W, H = 1440, 900
    controls = f'''<div style="display: flex; gap: 10px; align-items: center; padding: 14px 22px; border-bottom: 1px solid {T['line']}; background: {T['bg']};">
  <div style="display: flex; gap: 6px; align-items: center;">
    <div style="font-size: 11.5px; color: {T['muted']}; margin-right: 4px;">Machine</div>
    {inline_select('Mac Studio')}{inline_select('M5 Max · 614 GB/s')}
    <div style="display: flex; gap: 3px; padding: 3px; background: {T['panel3']}; border-radius: 10px;">{''.join(f'<div style="display: flex; flex-direction: column; padding: 4px 9px; border-radius: 7px; {"background:#fff;border:1px solid " + T["line2"] + ";" if m=="64" else "border:1px solid transparent;"}"><span class="mono" style="font-size: 12.5px; font-weight: 600;">{m} GB</span><span class="mono" style="font-size: 11px; color: {T["muted"]};">{p}</span></div>' for m, p in [('36','$2,499'),('48','$3,099'),('64','$3,499'),('128','$5,099')])}</div>
  </div>
  <div style="width: 1px; height: 28px; background: {T['line2']};"></div>
  <div style="display: flex; gap: 6px; align-items: center;"><div style="font-size: 11.5px; color: {T['muted']}; margin-right: 4px;">Use</div>{inline_select('Agentic coding · 15:1')}{inline_select('500k tokens a day')}{inline_select('32k context')}</div>
  <div style="flex: 1 1 auto;"></div>
  <div style="font-size: 12.5px; color: {T['muted']};">Paid a different price? <a href="#">Enter it</a></div>
</div>'''
    head = f'<div style="display: grid; grid-template-columns: 28px minmax(0, 2.2fr) 100px 170px 130px 120px 110px; gap: 14px; padding: 8px 14px; font-size: 11.5px; color: {T["faint"]}; border-bottom: 1px solid {T["line2"]};"><div></div><div>Model · quant</div><div>Speed at 32k</div><div>How smart</div><div>Good at</div><div>API price /1M</div><div>Pays back in</div></div>'
    rows = ''
    for name, q, tps, smart, tier, caps, be, gb, price, score, sel in FIT_MODELS:
        dis = tps == '—'
        rows += f'''<div style="display: grid; grid-template-columns: 28px minmax(0, 2.2fr) 100px 170px 130px 120px 110px; gap: 14px; align-items: center; padding: 9px 14px; border-bottom: 1px solid {T['line']}; {'background: ' + T['panel2'] + '; box-shadow: inset 3px 0 0 ' + T['ink'] + ';' if sel else ''} {'opacity: 0.5;' if dis else ''}">
  <div style="width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid {T['ink'] if sel else T['line2']}; display: grid; place-items: center;">{'<div style="width: 7px; height: 7px; border-radius: 50%; background: ' + T['ink'] + ';"></div>' if sel else ''}</div>
  <div style="display: flex; align-items: baseline; gap: 8px; min-width: 0;"><span style="font-size: 13.5px; {'font-weight: 600;' if sel else ''}">{name}</span><span class="mono" style="font-size: 11px; color: {T['faint']};">{q} · {gb}</span></div>
  <div class="mono" style="font-size: 13px;">{tps if dis else tps + ' tok/s'}</div>
  <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: {T['muted']};">{tier_bar(tier)}<span>{smart}</span></div>
  <div>{dots(caps)}</div>
  <div class="mono" style="font-size: 12.5px; color: {T['ink2']};">{price}</div>
  <div class="mono" style="font-size: 13px; {'color: ' + T['bad'] + ';' if be == 'never' else ''}">{be}</div>
</div>'''
    table = f'''<div style="background: {T['panel']}; border: 1px solid {T['line']}; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 2px rgba(14,23,32,0.05), 0 10px 26px -20px rgba(14,23,32,0.5);">
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid {T['line']};">
    <div style="font-size: 13px; font-weight: 600;">16 models fit in 48 GB usable · 7 more don’t</div>
    <div style="display: flex; gap: 8px;">{pill('All families')}{pill('Smartest first', True)}</div>
  </div>
  {head}{rows}
</div>'''
    right = f'''<div style="display: flex; flex-direction: column; gap: 14px;">
  {hero_card(456, 400, 232, 'You’re underwater for 27.3 years.', 'Saving $0.35 a day against the API, on $3,499 of hardware.', 'Qwen3.8 27B Q4_K_M · 500k tokens/day, 15:1', hsize=30, pad=16, actions=True)}
  <div style="background: {T['panel']}; border: 1px solid {T['line']}; border-radius: 14px; padding: 16px;">{figures([('Hardware','$3,499',''),('API per month','$11.51',''),('Electricity','$0.84',''),('Local speed','25 tok/s','estimated'),('Break-even','27 years','4.99B tokens'),('After 12 months','−$3,371','')], cols=3, size=17)}</div>
  <div style="font-size: 12.5px; color: {T['muted']}; padding: 0 4px;">How this is calculated · The small print that isn’t small</div>
</div>'''
    body = f'''<div style="width: {W}px; height: {H}px; background: {T['bg']}; display: flex; flex-direction: column; overflow: hidden;">
{topbar()}
{controls}
<div style="padding: 18px 22px 0; display: grid; grid-template-columns: minmax(0, 1fr) 456px; gap: 22px; align-items: start;">
  {table}
  {right}
</div>
</div>'''
    return shell(body)

def ledger_mobile():
    W, H = 390, 844
    rows = ''
    for name, q, tps, smart, tier, caps, be, gb, price, score, sel in FIT_MODELS[:9]:
        dis = tps == '—'
        rows += f'''<div style="display: grid; grid-template-columns: minmax(0, 1fr) 62px 70px; gap: 10px; align-items: center; padding: 10px 14px; border-bottom: 1px solid {T['line']}; {'background: ' + T['panel2'] + '; box-shadow: inset 3px 0 0 ' + T['ink'] + ';' if sel else ''} {'opacity: 0.5;' if dis else ''}">
  <div style="min-width: 0;"><div style="font-size: 13.5px; {'font-weight: 600;' if sel else ''} overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{name}</div><div style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: {T['muted']};">{tier_bar(tier)}{smart}</div></div>
  <div class="mono" style="font-size: 12.5px; text-align: right;">{tps if dis else tps + ' t/s'}</div>
  <div class="mono" style="font-size: 12.5px; text-align: right; {'color: ' + T['bad'] + ';' if be == 'never' else ''}">{be}</div>
</div>'''
    body = f'''<div style="width: {W}px; height: {H}px; background: {T['bg']}; display: flex; flex-direction: column; overflow: hidden;">
{topbar_mobile()}
<div style="display: flex; gap: 6px; padding: 12px 16px; overflow: hidden; white-space: nowrap;">{pill('Mac Studio M5 Max 64GB', True)}{pill('Agentic · 500k/day')}{pill('32k')}</div>
{hero_card(390, 270, 150, 'Underwater for 27.3 years.', 'Qwen3.8 27B · saving $0.35 a day on $3,499.', '', radius=0, hsize=26, pad=16, actions=False)}
<div style="background: {T['panel']}; border-top: 1px solid {T['line']}; flex: 1 1 auto; min-height: 0; overflow: hidden;">
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid {T['line']};"><div style="font-size: 12.5px; font-weight: 600;">16 fit · smartest first</div><div style="font-size: 12px; color: {T['muted']};">Filter</div></div>
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) 62px 70px; gap: 10px; padding: 6px 14px; font-size: 11px; color: {T['faint']}; border-bottom: 1px solid {T['line2']};"><div>Model</div><div style="text-align: right;">Speed</div><div style="text-align: right;">Pays back</div></div>
  {rows}
</div>
</div>'''
    return shell(body)

# ---------------- D · Guided ----------------
def stepper(active):
    steps = [('1','Your machine'),('2','How you’d use it'),('3','What it can run'),('4','The answer')]
    out = '<div style="display: flex; align-items: center; gap: 10px;">'
    for i, (n, label) in enumerate(steps):
        done = i < active; cur = i == active
        bg = T['ink'] if cur else (T['w3'] if done else T['panel3'])
        fg = '#fff' if (cur or done) else T['muted']
        out += f'<div style="display: flex; align-items: center; gap: 8px;"><div class="mono" style="width: 22px; height: 22px; border-radius: 6px; display: grid; place-items: center; font-size: 11.5px; font-weight: 600; background: {bg}; color: {fg};">{n}</div><div style="font-size: 13px; color: {T["ink"] if cur else T["muted"]}; font-weight: {600 if cur else 400};">{label}</div></div>'
        if i < len(steps)-1: out += f'<div style="width: 34px; height: 1px; background: {T["line2"]};"></div>'
    return out + '</div>'

def guided_desktop():
    W, H = 1440, 900
    # Step 2 screen: one focused question
    options = [('Chatting and questions','Short questions, medium answers','2:1'),('Writing and drafting','A short brief in, long text out','1:2'),('Summarising documents','Whole documents in, a paragraph out','10:1'),('Coding assistant','Code in, small edits out','4:1'),('Agentic coding','Whole files and tool results resent every turn','15:1'),('Search over your documents','Retrieved passages in, short answers out','20:1')]
    cards = ''
    for i, (t, d, r) in enumerate(options):
        sel = t == 'Agentic coding'
        cards += f'''<div style="background: {T['panel']}; border: 1.5px solid {T['ink'] if sel else T['line']}; border-radius: 14px; padding: 18px 20px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 2px rgba(14,23,32,0.05), 0 10px 26px -20px rgba(14,23,32,0.5);">
  <div style="display: flex; justify-content: space-between; align-items: baseline;"><div style="font-size: 16px; font-weight: 600; letter-spacing: -0.014em;">{t}</div><div class="mono" style="font-size: 12px; color: {T['muted']};">{r}</div></div>
  <div style="font-size: 13px; color: {T['muted']};">{d}</div>
</div>'''
    body = f'''<div style="width: {W}px; height: {H}px; background: {T['bg']}; display: flex; flex-direction: column; overflow: hidden;">
{topbar(line='')}
<div style="padding: 28px 40px 0; display: flex; flex-direction: column; gap: 28px; flex: 1 1 auto;">
  <div style="display: flex; justify-content: space-between; align-items: center;">{stepper(1)}<div style="font-size: 12.5px; color: {T['muted']};">Mac Studio M5 Max, 64GB · $3,499 <a href="#">change</a></div></div>
  <div style="max-width: 760px;">
    <div style="font-size: 34px; line-height: 1.1; letter-spacing: -0.03em; font-weight: 600; text-wrap: balance;">What would you mostly use it for?</div>
    <div style="font-size: 15px; color: {T['muted']}; margin-top: 10px;">This sets how much of your usage is reading versus writing. Agents resend whole files every turn, so they read far more than they write.</div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; max-width: 1100px;">{cards}</div>
  <div style="max-width: 1100px; display: flex; flex-direction: column; gap: 8px;">
    <div style="display: flex; justify-content: space-between; font-size: 13px;"><span style="font-weight: 600;">Roughly how much, on a normal day?</span><span class="mono" style="color: {T['ink2']};">500k tokens — a moderate coding-assistant day</span></div>
    <div style="position: relative; height: 22px;"><div style="position: absolute; left: 0; right: 0; top: 10px; height: 3px; border-radius: 2px; background: {T['line2']};"></div><div style="position: absolute; left: 0; width: 46%; top: 10px; height: 3px; border-radius: 2px; background: {T['w3']};"></div><div style="position: absolute; left: 46%; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: {T['w3']}; box-shadow: 0 0 0 4px #fff, 0 1px 3px rgba(0,0,0,0.3); transform: translateX(-50%);"></div></div>
    <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: {T['faint']};"><span>a few chats</span><span>light assistant use</span><span>heavy coding with an agent</span><span>agents all day</span></div>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1100px; margin-top: auto; padding-bottom: 32px;">
    <div style="font-size: 13.5px; color: {T['muted']};">← Your machine</div>
    <div style="font-size: 14px; font-weight: 600; padding: 12px 22px; border-radius: 10px; background: {T['ink']}; color: #fff;">See what it can run</div>
  </div>
</div>
</div>'''
    return shell(body)

def guided_mobile():
    W, H = 390, 844
    # Step 4 result screen with a horizontal model carousel
    chips = ''
    for name, q, tps, smart, tier, caps, be, gb, price, score, sel in FIT_MODELS[:4]:
        chips += f'''<div style="flex: none; width: 200px; background: {T['panel']}; border: 1.5px solid {T['ink'] if sel else T['line']}; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
  <div style="font-size: 14px; font-weight: 600; letter-spacing: -0.014em;">{name}</div>
  <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: {T['muted']};">{tier_bar(tier)}{smart}</div>
  <div style="display: flex; justify-content: space-between;" class="mono"><span style="font-size: 12.5px;">{tps} tok/s</span><span style="font-size: 12.5px; color: {T['faint']};">{be}</span></div>
</div>'''
    body = f'''<div style="width: {W}px; height: {H}px; background: {T['bg']}; display: flex; flex-direction: column; overflow: hidden;">
{topbar_mobile()}
<div style="padding: 14px 16px 0; display: flex; flex-direction: column; gap: 14px;">
  <div style="display: flex; align-items: center; gap: 6px;">{''.join(f'<div style="flex: 1 1 0; height: 3px; border-radius: 2px; background: {T["w3"] if i < 4 else T["line2"]};"></div>' for i in range(4))}</div>
  <div style="display: flex; justify-content: space-between; font-size: 12px; color: {T['muted']};"><span>Step 4 of 4 · The answer</span><span><a href="#">Start over</a></span></div>
  {hero_card(358, 380, 220, 'You’re underwater for 27.3 years.', 'Saving $0.35 a day on $3,499 of hardware.', 'Mac Studio M5 Max 64GB · Qwen3.8 27B · 500k/day', hsize=30, pad=16, actions=False)}
  <div style="display: flex; gap: 8px;"><div style="flex: 1; text-align: center; font-size: 13px; font-weight: 600; padding: 11px; border-radius: 9px; background: {T['ink']}; color: #fff;">Copy link</div><div style="flex: 1; text-align: center; font-size: 13px; font-weight: 500; padding: 11px; border-radius: 9px; border: 1px solid {T['line2']}; background: {T['panel']};">Post on X</div></div>
  <div style="display: flex; justify-content: space-between; align-items: baseline;"><div style="font-size: 13px; font-weight: 600;">Try a different model</div><div style="font-size: 12px; color: {T['muted']};">16 fit</div></div>
  <div style="display: flex; gap: 10px; overflow: hidden; margin: 0 -16px; padding: 0 16px;">{chips}</div>
</div>
</div>'''
    return shell(body)

files = {
 'Main.dc.html': sentence_desktop(),
 'SentenceMobile.dc.html': sentence_mobile(),
 'VerdictFirstDesktop.dc.html': verdict_desktop(),
 'VerdictFirstMobile.dc.html': verdict_mobile(),
 'LedgerDesktop.dc.html': ledger_desktop(),
 'LedgerMobile.dc.html': ledger_mobile(),
 'GuidedDesktop.dc.html': guided_desktop(),
 'GuidedMobile.dc.html': guided_mobile(),
}
for k, v in files.items(): open(k, 'w').write(v)

X = [0, 1560, 3120, 4680]
canvas = {
 "pages": [{"id": "chosen", "name": "A · Sentence (chosen)"}, {"id": "explore", "name": "Explorations B–D"}],
 "artboards": [
  {"file": "Main.dc.html", "title": "A · Say it in a sentence — desktop", "x": 0, "y": 0, "w": 1440, "h": 900, "page": "chosen"},
  {"file": "SentenceMobile.dc.html", "title": "A · Say it in a sentence — mobile", "x": 1560, "y": 0, "w": 390, "h": 844, "page": "chosen"},
  {"file": "VerdictFirstDesktop.dc.html", "title": "B · Verdict first — desktop", "x": X[1], "y": 0, "w": 1440, "h": 900, "page": "explore"},
  {"file": "VerdictFirstMobile.dc.html", "title": "B · Verdict first — mobile", "x": X[1], "y": 1040, "w": 390, "h": 844, "page": "explore"},
  {"file": "LedgerDesktop.dc.html", "title": "C · The ledger — desktop", "x": X[2], "y": 0, "w": 1440, "h": 900, "page": "explore"},
  {"file": "LedgerMobile.dc.html", "title": "C · The ledger — mobile", "x": X[2], "y": 1040, "w": 390, "h": 844, "page": "explore"},
  {"file": "GuidedDesktop.dc.html", "title": "D · Guided — desktop (step 2 of 4)", "x": X[3], "y": 0, "w": 1440, "h": 900, "page": "explore"},
  {"file": "GuidedMobile.dc.html", "title": "D · Guided — mobile (step 4 of 4)", "x": X[3], "y": 1040, "w": 390, "h": 844, "page": "explore"},
 ],
 "annotations": [
  {"id": "a-note", "x": 0, "y": -170, "w": 560, "page": "chosen", "text": "A · Say it in a sentence — refined after review\nThe sentence is only about the machine: device, chip, memory, and what you paid. Tokens a day and the context window stay as sliders, beside the water, so you can drag and watch the curve move. The figures sit under the water on the left. The right column is every model, fits first, then the ones that nearly fit or don’t, greyed with the reason — it scrolls on its own."},
  {"id": "brief", "x": 0, "y": -300, "w": 520, "page": "explore", "text": "The three directions not chosen, kept for reference. Each attacked the overwhelm along a different axis; the sticky note above each says which and what it costs."},
  {"id": "b-note", "x": X[1], "y": -150, "w": 460, "page": "explore", "text": "B · Verdict first\nAxis: hierarchy. The water fills the first screen and the configuration lives inside it as pills. Everything else is one quiet reading column below, no cards.\nTradeoff: comparing models means scrolling away from the answer and back."},
  {"id": "c-note", "x": X[2], "y": -150, "w": 460, "page": "explore", "text": "C · The ledger\nAxis: density done calmly. One row per model, five columns, every model that fits on one screen without reading six lines per card. Verdict stays pinned on the right.\nTradeoff: least friendly for someone new to the topic; the sources and notes move behind a click."},
  {"id": "d-note", "x": X[3], "y": -150, "w": 460, "page": "explore", "text": "D · Guided\nAxis: progressive disclosure. Four steps, one question per screen, big targets. The answer is the last screen with a small carousel to try other models.\nTradeoff: more taps, and tweak-and-compare is slower than the live page."},
 ],
 "launch": {"view": "canvas", "page": "chosen"}
}
json.dump(canvas, open('canvas.json', 'w'), indent=2)
print('wrote', len(files), 'artboards')
