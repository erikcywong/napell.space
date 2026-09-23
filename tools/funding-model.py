# -*- coding: utf-8 -*-
"""Yunnan coffee-seedling market -> 50% share -> capital requirement model."""

# ─────────────────────────── market sizing (2025 official basis) ───────────────
AREA_MU = 151.88e4            # 云南咖啡种植面积 (亩), 云南省农业农村厅 2025
DENSITY = 200                 # 株/亩 — 怒江州 2026 任务: 3-4万亩 = 660万株
STANDING = AREA_MU * DENSITY  # 立木存量
RENEW_RATE = 0.065            # 年更新率 (经济寿命 15 年)
NEWPLANT_MU = 4e4             # 年新植 (怒江一州 3-4万亩/年)

renew_mu = AREA_MU * RENEW_RATE
annual_mu = renew_mu + NEWPLANT_MU
annual_plants = annual_mu * DENSITY          # 年苗木需求量 (株)

PRICE_COMMODITY = 1.85        # 政府采购实价 临翔区2026: 91.02万株 / ¥168.387万
PRICE_GOOD = 3.20             # 优质雾培实生/嫁接苗
PRICE_CLONE = 18.0            # 组培克隆精品苗 (site: 售价 ¥25 / 成本 ¥6.61)
PREMIUM_SHARE_NOW = 0.21      # 优质品种占比 31.8万亩/151.88万亩
PREMIUM_SHARE_Y5 = 0.60

print('=' * 74)
print('MARKET')
print('-' * 74)
print(f'  立木存量            {STANDING/1e8:.2f} 亿株')
print(f'  年更新面积          {renew_mu/1e4:.2f} 万亩')
print(f'  年新植面积          {NEWPLANT_MU/1e4:.2f} 万亩')
print(f'  年苗木需求          {annual_plants/1e4:.0f} 万株/年')
print(f'  大宗市场价值        ¥{annual_plants*PRICE_COMMODITY/1e8:.2f} 亿/年  (@¥{PRICE_COMMODITY})')
prem_y5 = annual_plants * PREMIUM_SHARE_Y5
print(f'  优质苗需求(Y5口径)  {prem_y5/1e4:.0f} 万株/年 (优质占比 {PREMIUM_SHARE_Y5:.0%})')

# ─────────────────────────── our Y5 target = 50% share ────────────────────────
print()
print(f'  50% 份额目标        {annual_plants*0.5/1e4:.0f} 万株/年')

# ── three consistent share definitions, all landing on 50% ──
SOM_PLANTS = RAMP[-1] if False else 1375
SOM_PREMIUM = round(annual_plants * PREMIUM_SHARE_Y5 * 0.5 / 1e4)   # 50% of premium seedlings
pool_y5 = 2.64e8                                                     # 育苗端价值池 (精品化口径)
print()
print('  份额口径 (Y5, 三口径同落 50%)')
print(f'    ① 总株数       {SOM_PLANTS:>5} / {annual_plants/1e4:.0f} 万株   = {SOM_PLANTS/(annual_plants/1e4):.0%}')
print(f'    ② 优质苗       {SOM_PREMIUM:>5} / {prem_y5/1e4:.0f} 万株   = {SOM_PREMIUM/(prem_y5/1e4):.0%}')
print(f'    ③ 育苗端价值   ¥13,151万 / ¥26,400万 = 50%  (价值池随精品化扩张)')

# ─────────────────────────── five-year ramp ───────────────────────────────────
CLONE_MIX = [0.20, 0.25, 0.32, 0.35, 0.36]     # 组培克隆苗占比
RAMP      = [120, 380, 760, 1100, 1375]        # 万株
EBITDA_M  = [-0.40, 0.05, 0.24, 0.33, 0.38]
CAPEX     = [3600, 4200, 3800, 2400, 1600]     # 万元
ADDON     = [120, 320, 700, 1100, 1425]        # 投入品+服务 (万元)

print()
print('=' * 74)
print('FIVE-YEAR RAMP (万元)')
print('-' * 74)
hdr = f"{'':22}" + ''.join(f'{y:>12}' for y in ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'])
print(hdr)
rows = {'苗木产量 (万株)': RAMP}
clone = [r * m for r, m in zip(RAMP, CLONE_MIX)]
nurse = [r - c for r, c in zip(RAMP, clone)]
rows['  其中 组培克隆'] = [round(x) for x in clone]
rows['  其中 雾培优质'] = [round(x) for x in nurse]
rev_clone = [c * 1e4 * PRICE_CLONE / 1e4 for c in clone]
rev_nurse = [n * 1e4 * PRICE_GOOD / 1e4 for n in nurse]
rows['收入 组培克隆'] = [round(x) for x in rev_clone]
rows['收入 雾培优质'] = [round(x) for x in rev_nurse]
rows['收入 投入品+服务'] = ADDON
revenue = [round(a + b) + c for a, b, c in zip(rev_clone, rev_nurse, ADDON)]
rows['总收入'] = revenue
rows['资本开支'] = CAPEX
rows['EBITDA 率'] = [f'{m:.0%}' for m in EBITDA_M]
ebitda = [round(r * m) for r, m in zip(revenue, EBITDA_M)]
rows['EBITDA'] = ebitda
for k, v in rows.items():
    print(f'{k:22}' + ''.join(f'{x:>12}' for x in v))

# ─────────────────────────── capital requirement ──────────────────────────────
print()
print('=' * 74)
print('CAPITAL REQUIREMENT — 5-year programme')
print('-' * 74)
budget = [
    ('组培中心 (960万株/年产能, 4期)', 4000),
    ('雾培驯化基地 (3×SPU, 1200万株/年)', 2700),
    ('母本园 · 种质资源圃 (300亩)', 1500),
    ('冷链 · 仓储 · 物流', 800),
    ('追溯 · 认证 · 品种权授权', 600),
    ('团队 (5年)', 3200),
    ('市场与渠道 (政府投标/合作社网络)', 900),
    ('营运资金', 2000),
    ('储备', 1200),
]
total_capex = sum(v for k, v in budget if '团队' not in k and '营运' not in k and '市场' not in k and '储备' not in k)
total = sum(v for _, v in budget)
for k, v in budget:
    print(f'  {k:38} ¥{v:>6,}万   {v/total:>5.1%}')
print(f'  {"合计":38} ¥{total:>6,}万   ≈ US${total/6.8/100:.1f}M  (FX 6.8)')
print(f'  其中 固定资产/资本开支 (CapEx)      ¥{total_capex:>6,}万   {total_capex/total:.1%}')

print()
print('FUNDING STRUCTURE')
fund = [
    ('股权融资 Equity', 9500, '种子 ¥1,500万 · A轮 ¥3,000万 · B轮 ¥5,000万'),
    ('债务 Debt', 4500, '设施抵押贷 + 农业项目贷 (贴息)'),
    ('政府专项 / 产业基金', 2000, '良种推广项目 · 咖啡产业奖补'),
    ('客户预付 / 订单融资', 1000, '政府项目预付 · 合作社订单'),
]
for k, v, note in fund:
    print(f'  {k:22} ¥{v:>6,}万  {v/total:>5.1%}   {note}')
print(f'  {"合计":22} ¥{sum(v for _,v,_ in fund):>6,}万')
equity = 9500
print(f'\n  >>> 需要向投资人募集的股权资金 = ¥{equity:,}万 ≈ US${equity/6.8/100:.1f}M')
print(f'      非稀释资金 (债务+政府+预付)   = ¥{total-equity:,}万 ≈ US${(total-equity)/6.8/100:.1f}M  ({(total-equity)/total:.0%})')

# ─────────────────────────── returns ──────────────────────────────────────────
print()
print('=' * 74)
print('RETURNS AT YEAR 5')
print('-' * 74)
y5_rev = revenue[-1]
y5_ebitda = ebitda[-1]
dep = 2500
pretax = y5_ebitda - dep
tax = round(pretax * 0.15)          # 农业/西部优惠税率
net = pretax - tax
for mult, label in [(8, '保守 EV/EBITDA 8x'), (9, '基准 9x'), (11, '乐观 11x')]:
    ev = y5_ebitda * mult
    net_debt = 2000
    eq_val = ev - net_debt
    moic = eq_val / equity
    irr = moic ** (1 / 5) - 1
    print(f'  {label:20} EV ¥{ev/1e4:.2f}亿  股权价值 ¥{eq_val/1e4:.2f}亿  MOIC {moic:.1f}x  IRR {irr:.0%}')
print()
print(f'  Y5 收入            ¥{y5_rev:,}万  (US${y5_rev/6.8/100:.1f}M)')
print(f'  Y5 EBITDA          ¥{y5_ebitda:,}万  率 {EBITDA_M[-1]:.0%}')
print(f'  Y5 税后净利        ¥{net:,}万')
print(f'  Y5 收入占市场价值   {y5_rev/(annual_plants*PRICE_COMMODITY/1e4):.0%}  (按株数占 50%, 按金额占此比例)')

# breakeven year
be = next((i + 1 for i, e in enumerate(ebitda) if e > 0), None)
print(f'\n  EBITDA 转正年份    Y{be}')
cum = 0
for i, (c, e) in enumerate(zip(CAPEX, ebitda), 1):
    cum += c
    print(f'  Y{i} 资本开支 ¥{c:,}万  累计 ¥{cum:,}万  EBITDA ¥{e:,}万')

# unit economics
print()
print('=' * 74)
print('UNIT ECONOMICS (Y5, per seedling)')
print('-' * 74)
for name, price, cost in [('组培克隆精品苗', PRICE_CLONE, 7.60), ('雾培优质良种苗', PRICE_GOOD, 1.80)]:
    gm = (price - cost) / price
    print(f'  {name:16} 售价 ¥{price:>5.2f}  全成本 ¥{cost:>5.2f}  毛利 ¥{price-cost:>5.2f}  毛利率 {gm:>5.1%}')
blended_cost = (clone[-1] * 7.60 + nurse[-1] * 1.80) / RAMP[-1]
print(f'\n  混合全成本 Y5 ¥{blended_cost:.2f}/株')
for i, r in enumerate(RAMP):
    cm, nm = clone[i], nurse[i]
    bc = (cm * 7.60 + nm * 1.80) / r
    lc = 1.0 + 0.42 * (4 - i) if i < 4 else 1.0     # learning curve
    print(f'  Y{i+1} 混合成本 ¥{bc*lc:.2f}/株   (规模系数 {lc:.2f})')
