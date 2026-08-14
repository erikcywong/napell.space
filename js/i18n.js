/**
 * i18n.js — Tri-lingual translation system
 * Languages: English (en), Mandarin Chinese (zh), Arabic (ar)
 * Covers ALL UI strings, error messages, tooltips, dynamic content
 */

const I18N = {

  _lang: 'en',
  _listeners: [],

  translations: {
    en: {
      // ─── Meta ───
      _dir: 'ltr',
      _lang_label: 'English',
      _flag: '🇬🇧',

      // ─── Language Modal ───
      modal_title: 'Choose Your Language',
      modal_subtitle: 'Select your preferred language to continue',
      modal_en: 'English',
      modal_en_desc: 'International',
      modal_zh: '简体中文',
      modal_zh_desc: 'Mandarin',
      modal_ar: 'العربية',
      modal_ar_desc: 'Saudi Arabian',
      modal_confirm: 'Continue',
      modal_remember: 'Remember my choice',

      // ─── Nav ───
      nav_home: 'Home',
      nav_overview: 'Overview',
      nav_costs: 'Costs',
      nav_efficiency: 'Efficiency',
      nav_value_chain: 'Value Chain',
      nav_collaboration: 'Climate Response',
      nav_brand: 'napell.space',
      nav_tagline: 'Aeroponic Coffee Cultivation System',

      // ─── Landing Hero ───
      hero_eyebrow: 'Aeroponic Coffee Cultivation System',
      hero_title: 'From Cost Structure to Industrial Innovation',
      hero_subtitle: 'A data-driven commercial model for scalable, climate-resilient coffee seedling production.',
      hero_cta_explore: 'Explore the Model',
      hero_cta_data: 'View Cost Data',

      // ─── Landing KPIs ───
      kpi_investment: 'Initial Investment',
      kpi_annual_output: 'Annual Output',
      kpi_revenue: 'Projected Revenue',
      kpi_margin: 'Gross Margin',
      kpi_per_tree_cost: 'Cost per Seedling',
      kpi_sale_price: 'Sale Price per Seedling',
      kpi_growth_cycle: 'Growth Cycle',
      kpi_batches_year: 'Batches / Year',
      kpi_land_area: 'Greenhouse Area',
      kpi_systems: 'Cultivation Systems',

      // ─── Overview Page ───
      overview_title: 'System Overview & Business Model',
      overview_intro: 'The Aeroponic Coffee Cultivation System replaces traditional soil-based nurseries with a precision-engineered hydroponic pipeline. Seedlings grow on nutrient-mist panels under controlled climate, achieving higher density, faster cycles, and year-round output.',
      overview_section_system: 'System Architecture',
      overview_section_model: 'Commercial Model',
      overview_section_scale: 'Scale Options',

      sys_arch_desc: 'Each cultivation system measures 22.8m × 1.8m with a 1.4m single-layer height. Seedling panels use a 6×6cm grid (2-month early stage) expanding to 12×12cm (3–6 month late stage). High-pressure aeroponic mist delivers nutrient solution directly to root zones.',
      sys_arch_panel: 'Panel Design',
      sys_arch_panel_early: 'Early Stage (0–2 months): 6×6 cm grid — 11,400 seedlings per system per batch',
      sys_arch_panel_late: 'Late Stage (3–6 months): 12×12 cm grid — 2,850 seedlings per system per batch',
      sys_arch_infra: 'Core Infrastructure',
      sys_arch_infra_items: [
        '110KW dual-main air compressor system with cold dryer & air tank',
        'Metallic high-pressure gas pipeline (DN80–DN20) with ball valves & flanges',
        'Hydroponic nutrient solution delivery system with electromagnetic valves',
        'Automated seed germination system with robotic arm placement',
        'PLC-based system controller for climate, nutrient, and irrigation management'
      ],

      model_desc: 'The commercial model operates on a batch-rotation principle: seedling greenhouses run 2-month cycles while large-plant systems run 4-month cycles. With 81 systems across 10.8 acres, the facility achieves 3 full batches per year — yielding 615,000 marketable seedlings annually.',
      model_unit_econ: 'Unit Economics',
      model_unit_econ_desc: 'Each 50cm large seedling sells at ¥25. Total per-tree cost (including amortized equipment, seeds, nutrients, utilities, packaging, and labor) is ¥6.614 — yielding ¥18.386 gross profit per unit.',

      scale_opt1: 'Scale Option A — 45 Systems',
      scale_opt2: 'Scale Option B — 81 Systems',
      scale_opt1_desc: 'Entry-level deployment: 8.8 acres, 350,000 seeds, annual output 342,000 seedlings',
      scale_opt2_desc: 'Full-scale deployment: 10.8 acres, 620,000 seeds, annual output 615,000 seedlings',
      scale_table_header_sc: 'Metric',
      scale_table_header_a: 'Option A (45 Systems)',
      scale_table_header_b: 'Option B (81 Systems)',
      scale_row_land: 'Greenhouse Area',
      scale_row_seeds: 'Annual Seeds',
      scale_row_output: 'Annual Output (seedlings)',
      scale_row_equipment: 'Equipment Cost',
      scale_row_materials: 'Materials Cost',
      scale_row_consumables: 'Dynamic Consumables',
      scale_row_total: 'Total Startup Capital',
      scale_row_revenue: 'Projected Annual Revenue',

      // ─── Costs Page ───
      costs_title: 'Detailed Cost Analysis',
      costs_intro: 'A transparent breakdown of every cost component in the aeroponic coffee cultivation system — from equipment to per-seedling unit economics.',
      costs_section_equipment: 'Equipment & Infrastructure',
      costs_section_materials: 'Materials',
      costs_section_consumables: 'Dynamic Consumables',
      costs_section_utilities: 'Utilities',
      costs_section_per_tree: 'Per-Seedling Cost Breakdown',
      costs_section_summary: 'Investment Summary',

      tbl_item: 'Item',
      tbl_unit: 'Unit',
      tbl_unit_price: 'Unit Price (¥)',
      tbl_qty_45: '45 Systems (¥)',
      tbl_qty_81: '81 Systems (¥)',
      tbl_note: 'Notes',
      tbl_category: 'Category',
      tbl_subtotal: 'Subtotal',

      cost_item_rent: 'Greenhouse Rent',
      cost_item_deposit: 'Lease Deposit',
      cost_item_electricity_rate: 'Electricity Rate',
      cost_item_water_rate: 'Water Rate',
      cost_item_system: 'Hydroponic Cultivation System',
      cost_item_compressor: 'Air Compressor (110KW)',
      cost_item_pipeline: 'High-Pressure Gas Pipeline',
      cost_item_controller: 'System Controller',
      cost_item_seeds: 'Coffee Seeds',
      cost_item_germination: 'Seed Germination System',
      cost_item_nutrient: 'Nutrient Solution System',
      cost_item_water_drain: 'Water Supply/Drainage & Valves',
      cost_item_prepaid_util: 'Prepaid Utilities',
      cost_item_rent_deposit: 'Rent & Deposit',
      cost_item_packaging: 'Packaging',
      cost_item_shipping: 'Shipping',

      cost_note_rent: '8.8 acres greenhouse @ ¥6,800/acre + 2.4 acres open @ ¥2,500/acre',
      cost_note_deposit: 'Greenhouse & open land lease deposit',
      cost_note_system: 'Quick-connect keel, XPS board, B/W film, nozzles, PE pipes',
      cost_note_compressor: 'Dual main unit, cold dryer, air tank',
      cost_note_pipeline: 'DN80–DN20 ball valves, flanges & accessories',
      cost_note_controller: 'PLC-based climate & nutrient management',
      cost_note_seeds: 'Premium coffee seeds @ ¥1.7/seed',
      cost_note_germination: 'Germination boxes + robotic arm',
      cost_note_nutrient: '3+1+N formula nutrient solution',
      cost_note_prepaid_util: 'New site requires utility prepayment',
      cost_note_packaging: 'Per seedling packaging cost',
      cost_note_shipping: 'Per seedling shipping cost',

      // ─── Consumables ───
      cons_item_basket: 'Planting Basket',
      cons_item_rockwool: 'Agricultural Rock Wool',
      cons_item_sponge: 'Planting Sponge',
      cons_item_nutrient: 'Nutrient Solution (3+1+N)',
      cons_item_germ_arm: 'Seed Placement Robotic Arm',
      cons_item_germ_box: 'Germination Box & Trays',
      cons_item_seeds: 'Coffee Seeds (Annual)',

      cons_note_basket: '480,000 units — reusable',
      cons_note_rockwool: '620,000 units — 12-month consumption',
      cons_note_sponge: '620,000 units',
      cons_note_nutrient: 'Annual supply',
      cons_note_germ_arm: 'Automated seed placement',
      cons_note_germ_box: '4 units',
      cons_note_seeds: '620,000 seeds @ ¥1.7/seed',

      // ─── Per-tree breakdown ───
      pt_item_shipping: 'Shipping',
      pt_item_coir: 'Coir & Packaging Bag',
      pt_item_utilities: 'Water, Electricity & Nutrients',
      pt_item_seeds: 'Seeds',
      pt_item_depreciation: 'Equipment Depreciation',
      pt_item_misc: 'Miscellaneous & Labor',
      pt_total: 'Total Cost per Seedling',

      // ─── Efficiency Page ───
      eff_title: 'Production Efficiency & Output Analysis',
      eff_intro: 'Quantitative metrics on cultivation density, cycle times, batch rotation, and annual yield — demonstrating the system\'s industrial-scale productivity.',
      eff_section_density: 'Cultivation Density',
      eff_section_cycles: 'Growth Cycles & Batch Rotation',
      eff_section_yield: 'Annual Yield Projection',
      eff_section_comparison: 'Traditional vs. Aeroponic',

      density_panel_early: 'Early-Stage Panel (6×6 cm)',
      density_panel_late: 'Late-Stage Panel (12×12 cm)',
      density_per_system_early: 'Per System (Early)',
      density_per_system_late: 'Per System (Late)',
      density_total_early: 'Total Seedling Systems',
      density_total_late: 'Total Large-Plant Systems',
      density_label_seedlings: 'seedlings',
      density_label_per_batch: 'per batch',

      cycle_seedling: 'Seedling Greenhouse',
      cycle_large: 'Large-Plant System',
      cycle_seedling_duration: '2-month cycle',
      cycle_large_duration: '4-month cycle',
      cycle_batches: '3 batches per year',
      cycle_rotation: 'Staggered batch rotation ensures continuous output — new batches start every 2 months while mature batches are harvested.',

      yield_scale_a: 'Scale A (45 Systems)',
      yield_scale_b: 'Scale B (81 Systems)',
      yield_label_trees: 'seedlings/year',
      yield_label_batches: 'batches/year',
      yield_price: 'Sale Price',
      yield_revenue: 'Annual Revenue',

      comp_metric: 'Metric',
      comp_traditional: 'Traditional Nursery',
      comp_aeroponic: 'Aeroponic System',
      comp_land: 'Land Required per 100K Seedlings',
      comp_cycle: 'Growth Cycle',
      comp_density: 'Planting Density',
      comp_water: 'Water Usage',
      comp_climate: 'Climate Dependence',
      comp_year_round: 'Year-Round Production',
      comp_disease: 'Disease Risk',
      comp_scalability: 'Scalability',

      comp_trad_land: '~50 acres',
      comp_aero_land: '~1.5 acres',
      comp_trad_cycle: '8–12 months',
      comp_aero_cycle: '4 months (large plant)',
      comp_trad_density: 'Low',
      comp_aero_density: '114× higher',
      comp_trad_water: 'High (soil irrigation)',
      comp_aero_water: '95% less (mist system)',
      comp_trad_climate: 'Full exposure',
      comp_aero_climate: 'Fully controlled',
      comp_trad_year_round: 'No (seasonal)',
      comp_aero_year_round: 'Yes',
      comp_trad_disease: 'High (soil-borne)',
      comp_aero_disease: 'Minimal (soil-free)',
      comp_trad_scalability: 'Linear (land-bound)',
      comp_aero_scalability: 'Modular (system-bound)',

      // ─── Value Chain Page ───
      vc_title: 'Value to Coffee Industrial Chains',
      vc_intro: 'The aeroponic system creates value across every link of the coffee supply chain — from genetics preservation to downstream market access.',
      vc_section_upstream: 'Upstream: Genetic & Seed Supply',
      vc_section_midstream: 'Midstream: Cultivation & Processing',
      vc_section_downstream: 'Downstream: Market & Export',
      vc_section_cross: 'Cross-Chain Value',

      vc_upstream_desc: 'By producing 615,000 disease-free seedlings annually from just 10.8 acres, the system eliminates the bottleneck of traditional nursery expansion. Coffee growers can access premium varietals year-round, decoupled from seasonal constraints.',
      vc_midstream_desc: 'Controlled-environment cultivation ensures uniform seedling quality — consistent height (50cm), root development, and disease resistance. This standardization reduces field transplant mortality by an estimated 60–80% and accelerates first harvest by 12–18 months.',
      vc_downstream_desc: 'Scalable seedling supply enables downstream producers to plan capacity with certainty. The system\'s traceability (each batch digitally logged from seed to shipping) supports specialty coffee certifications and premium market positioning.',
      vc_cross_desc: 'The model transforms coffee from an agricultural commodity into an industrial-grade, data-driven supply chain — with measurable inputs, predictable outputs, and auditable sustainability metrics.',

      vc_point_title_1: 'Disease-Free Seedlings',
      vc_point_desc_1: 'Soil-free cultivation eliminates soil-borne pathogens — every seedling enters the field clean.',
      vc_point_title_2: 'Climate Resilience',
      vc_point_desc_2: 'Controlled environment decouples production from climate volatility — critical as 50% of coffee arable land becomes unsuitable by 2050.',
      vc_point_title_3: 'Traceability',
      vc_point_desc_3: 'Each batch is digitally tracked from seed to shipping — enabling specialty certification and origin verification.',
      vc_point_title_4: 'Modular Scalability',
      vc_point_desc_4: 'Add systems incrementally without acquiring new land — scale output linearly with capital, not acreage.',
      vc_point_title_5: 'Water Efficiency',
      vc_point_desc_5: 'Aeroponic mist uses 95% less water than soil irrigation — aligning with global water stewardship standards.',
      vc_point_title_6: 'Speed to Market',
      vc_point_desc_6: '4-month cycles vs. 8–12 months traditional — 3× faster time-to-field for new varietal deployment.',

      // ─── Climate Response Page ───
      ico_title: 'Climate Response',
      ico_intro: 'The aeroponic coffee cultivation system aligns directly with the global climate resilience agenda — addressing the existential threat facing 125 million livelihoods and the $200B+ global coffee economy.',
      ico_section_crisis: 'The Climate Crisis',
      ico_section_solution: 'Our Response',
      ico_section_partnership: 'Partnership Framework',
      ico_section_roadmap: 'Implementation Roadmap',

      ico_crisis_desc: 'Climate models project a 50% decline in coffee arable land by 2050 — driven by accelerating El Niño cycles and rising temperatures across the coffee belt. Arabica suitability could drop by 72% in worst-case scenarios.',
      ico_crisis_stat_1: 'Arable Land Decline by 2050',
      ico_crisis_stat_2: 'Temperature Rise in Coffee Belt',
      ico_crisis_stat_3: 'Livelihoods at Risk',
      ico_crisis_stat_4: 'Arabica Suitability Loss (Worst Case)',

      ico_solution_desc: 'Our aeroponic system directly addresses the global climate resilience mandate: it removes coffee cultivation from vulnerable outdoor environments, produces seedlings year-round in controlled conditions, and enables rapid deployment of climate-adapted varietals to replace failing traditional plantations.',
      ico_solution_alignment: 'Climate Resilience Alignment',

      ico_partner_desc: 'Our partnership framework encompasses technology transfer, data sharing, and joint field deployment across coffee-producing nations most vulnerable to climate disruption.',
      ico_partner_pillar_1: 'Technology Transfer',
      ico_partner_pillar_1_desc: 'Open-license the aeroponic system design to coffee-producing nations — enabling local fabrication and deployment.',
      ico_partner_pillar_2: 'Data Sharing',
      ico_partner_pillar_2_desc: 'Share cultivation metrics, yield data, and climate adaptation results with the global research database.',
      ico_partner_pillar_3: 'Field Deployment',
      ico_partner_pillar_3_desc: 'Joint pilot programs in Brazil, Vietnam, Ethiopia, and Yemen — the most climate-vulnerable origins.',
      ico_partner_pillar_4: 'Capacity Building',
      ico_partner_pillar_4_desc: 'Train local operators in aeroponic cultivation — creating skilled jobs in climate-resilient agriculture.',

      ico_phase_1: 'Phase 1 — Validation',
      ico_phase_1_desc: 'Operational data from Longgang facility (81 systems, 615K trees/yr) validates commercial viability.',
      ico_phase_1_status: 'In Progress',
      ico_phase_2: 'Phase 2 — Strategic Partnership',
      ico_phase_2_desc: 'Formalize technology transfer agreements with strategic partners. Begin data integration.',
      ico_phase_2_status: 'Planning',
      ico_phase_3: 'Phase 3 — Pilot Deployment',
      ico_phase_3_desc: 'Deploy 3 pilot systems in climate-vulnerable regions. 12-month field evaluation.',
      ico_phase_3_status: '2026 Q3',
      ico_phase_4: 'Phase 4 — Scale',
      ico_phase_4_desc: 'Open-license system design. Target 10 production sites across coffee belt by 2028.',
      ico_phase_4_status: '2027–2028',

      // ─── Footer ───
      footer_rights: 'All rights reserved.',
      footer_disclaimer: 'Data derived from operational cost analysis. Revenue projections are estimates based on current market conditions.',
      footer_ico: '',
      footer_made: 'Built with data. Driven by innovation.',

      // ─── Tooltips ───
      tip_investment: 'Total startup capital including equipment, materials, consumables, and prepaid utilities',
      tip_revenue: 'Based on 615,000 seedlings × ¥25/unit sale price',
      tip_margin: 'Gross margin = (Revenue - Per-Tree Cost × Output) / Revenue',
      tip_per_tree: 'All-in cost per seedling: seeds, nutrients, utilities, depreciation, packaging, shipping, labor',
      tip_density: 'Early-stage panels use 6×6cm grid; late-stage expands to 12×12cm for root development',
      tip_cycle: 'Seedling greenhouse: 2-month cycle. Large-plant system: 4-month cycle. 3 staggered batches/year.',
      tip_depreciation: 'Equipment cost amortized over estimated 5-year useful life',
      tip_water_savings: 'Aeroponic mist delivers nutrients directly to roots — 95% less water than soil irrigation',
      tip_scalability: 'Each system is modular — add capacity without acquiring new land',

      // ─── Error Messages ───
      err_generic: 'Something went wrong. Please try again.',
      err_language_not_found: 'Language not found. Defaulting to English.',
      err_data_load: 'Failed to load data. Please refresh the page.',
      err_chart_render: 'Chart rendering failed. Please check your browser compatibility.',
      err_pdf: 'PDF export is not supported on this browser.',
      err_copy: 'Failed to copy to clipboard.',
      err_form_required: 'This field is required.',
      err_form_email: 'Please enter a valid email address.',
      err_form_phone: 'Please enter a valid phone number.',

      // ─── Dynamic / Interactive ───
      dyn_loading: 'Loading...',
      dyn_calculating: 'Calculating...',
      dyn_copied: 'Copied to clipboard!',
      dyn_switching: 'Switching language...',
      dyn_scale_a: 'Scale A',
      dyn_scale_b: 'Scale B',
      dyn_select_scale: 'Select scale to view details',
      dyn_expand: 'Expand',
      dyn_collapse: 'Collapse',
      dyn_view_details: 'View Details',
      dyn_close: 'Close',
      dyn_back: 'Back',
      dyn_next: 'Next',
      dyn_previous: 'Previous',
      dyn_download: 'Download',
      dyn_print: 'Print',
      dyn_share: 'Share',

      // ─── Auth / Login ───
      auth_login_title: 'Administrator Access',
      auth_login_desc: 'This section contains confidential business data. Administrator authentication required.',
      auth_username: 'Username',
      auth_password: 'Password',
      auth_login_btn: 'Login',
      auth_login_error: 'Invalid credentials. Access denied.',
      auth_logout: 'Logout',

      // ─── Units ───
      unit_yuan: '¥',
      unit_per_year: '/year',
      unit_per_kwh: '/kWh',
      unit_per_m3: '/m³',
      unit_per_seedling: '/seedling',
      unit_per_unit: '/unit',
      unit_acres: 'acres',
      unit_months: 'months',
      unit_kw: 'KW',
      unit_percent: '%',
      unit_cm: 'cm',
      unit_m: 'm'
    },

    zh: {
      _dir: 'ltr',
      _lang_label: '简体中文',
      _flag: '🇨🇳',

      // ─── Language Modal ───
      modal_title: '选择您的语言',
      modal_subtitle: '请选择您偏好的语言以继续',
      modal_en: 'English',
      modal_en_desc: '国际通用',
      modal_zh: '简体中文',
      modal_zh_desc: '中文',
      modal_ar: 'العربية',
      modal_ar_desc: '沙特阿拉伯语',
      modal_confirm: '继续',
      modal_remember: '记住我的选择',

      // ─── Nav ───
      nav_home: '首页',
      nav_overview: '系统概览',
      nav_costs: '成本分析',
      nav_efficiency: '生产效率',
      nav_value_chain: '产业链价值',
      nav_collaboration: '气候响应',
      nav_brand: 'napell.space',
      nav_tagline: '气雾栽培咖啡育苗系统',

      // ─── Landing Hero ───
      hero_eyebrow: '气雾栽培咖啡育苗系统',
      hero_title: '从成本结构到产业创新',
      hero_subtitle: '面向规模化、气候韧性咖啡种苗生产的数据驱动商业模型。',
      hero_cta_explore: '探索模型',
      hero_cta_data: '查看成本数据',

      // ─── Landing KPIs ───
      kpi_investment: '初始投资',
      kpi_annual_output: '年产量',
      kpi_revenue: '预计年收入',
      kpi_margin: '毛利率',
      kpi_per_tree_cost: '每棵种苗成本',
      kpi_sale_price: '每棵种苗售价',
      kpi_growth_cycle: '生长周期',
      kpi_batches_year: '年批次',
      kpi_land_area: '温室面积',
      kpi_systems: '栽培系统数',

      // ─── Overview Page ───
      overview_title: '系统概览与商业模式',
      overview_intro: '气雾栽培咖啡育苗系统以精密工程化水培管道替代传统土壤苗圃。种苗在受控气候下的营养雾面板上生长，实现更高密度、更快周期和全年产出。',
      overview_section_system: '系统架构',
      overview_section_model: '商业模式',
      overview_section_scale: '规模选项',

      sys_arch_desc: '每套栽培系统尺寸为22.8米×1.8米，单层高度1.4米。育苗面板采用6×6厘米网格（前期2个月），后期扩展至12×12厘米（第3-6个月）。高压气雾系统将营养液直接送达根部。',
      sys_arch_panel: '面板设计',
      sys_arch_panel_early: '前期（0-2个月）：6×6厘米网格 — 每套系统每批11,400棵种苗',
      sys_arch_panel_late: '后期（3-6个月）：12×12厘米网格 — 每套系统每批2,850棵种苗',
      sys_arch_infra: '核心基础设施',
      sys_arch_infra_items: [
        '110KW双主机空压机系统，配冷干机和储气罐',
        '金属高压气体管道（DN80-DN20），配球阀和法兰',
        '水培营养液输送系统，配电磁阀',
        '自动化种子发芽系统，配机械臂摆盘',
        'PLC系统控制器，管理气候、营养和灌溉'
      ],

      model_desc: '商业模式基于批次轮换原则：幼苗温室运行2个月周期，大苗系统运行4个月周期。81套系统覆盖10.8亩，实现每年3个完整批次 — 年产615,000棵可销售种苗。',
      model_unit_econ: '单位经济模型',
      model_unit_econ_desc: '每棵50厘米大苗售价25元。每棵总成本（含设备摊销、种子、营养液、水电、包装和人工）为6.614元 — 每棵毛利18.386元。',

      scale_opt1: '方案A — 45套系统',
      scale_opt2: '方案B — 81套系统',
      scale_opt1_desc: '入门级部署：8.8亩，35万粒种子，年产342,000棵种苗',
      scale_opt2_desc: '全规模部署：10.8亩，62万粒种子，年产615,000棵种苗',
      scale_table_header_sc: '指标',
      scale_table_header_a: '方案A（45套系统）',
      scale_table_header_b: '方案B（81套系统）',
      scale_row_land: '温室面积',
      scale_row_seeds: '年用种量',
      scale_row_output: '年产量（棵）',
      scale_row_equipment: '设备费用',
      scale_row_materials: '物料费用',
      scale_row_consumables: '动态耗材费用',
      scale_row_total: '总启动资金',
      scale_row_revenue: '预计年收入',

      // ─── Costs Page ───
      costs_title: '详细成本分析',
      costs_intro: '气雾栽培咖啡育苗系统每一项成本构成的透明分解 — 从设备到每棵种苗的单位经济模型。',
      costs_section_equipment: '设备与基础设施',
      costs_section_materials: '物料',
      costs_section_consumables: '动态耗材',
      costs_section_utilities: '水电费',
      costs_section_per_tree: '每棵种苗成本分解',
      costs_section_summary: '投资汇总',

      tbl_item: '项目',
      tbl_unit: '单位',
      tbl_unit_price: '单价（¥）',
      tbl_qty_45: '45套系统（¥）',
      tbl_qty_81: '81套系统（¥）',
      tbl_note: '备注',
      tbl_category: '类别',
      tbl_subtotal: '小计',

      cost_item_rent: '大棚租金',
      cost_item_deposit: '租赁押金',
      cost_item_electricity_rate: '电费单价',
      cost_item_water_rate: '水费单价',
      cost_item_system: '水培育苗系统',
      cost_item_compressor: '空压机（110KW）',
      cost_item_pipeline: '高压气体管道',
      cost_item_controller: '系统控制器',
      cost_item_seeds: '咖啡种子',
      cost_item_germination: '种子发芽系统',
      cost_item_nutrient: '营养液系统',
      cost_item_water_drain: '供排水管道与电磁阀',
      cost_item_prepaid_util: '预存水电费',
      cost_item_rent_deposit: '租金与押金',
      cost_item_packaging: '包装费',
      cost_item_shipping: '运费',

      cost_note_rent: '大棚8.8亩@6800元/亩 + 空地2.4亩@2500元/亩',
      cost_note_deposit: '大棚与空地租赁押金',
      cost_note_system: '快接龙骨、XPS板、黑白膜、喷嘴、PE管',
      cost_note_compressor: '双主机、冷干机、储气罐',
      cost_note_pipeline: 'DN80-DN20球阀、法兰及配件',
      cost_note_controller: 'PLC气候与营养管理',
      cost_note_seeds: '优质咖啡种子@1.7元/粒',
      cost_note_germination: '发芽箱+机械臂',
      cost_note_nutrient: '3+1+N配方营养液',
      cost_note_prepaid_util: '新场地需预存水电费',
      cost_note_packaging: '每棵种苗包装成本',
      cost_note_shipping: '每棵种苗运输成本',

      // ─── Consumables ───
      cons_item_basket: '定植篮',
      cons_item_rockwool: '农用岩棉',
      cons_item_sponge: '定植海绵',
      cons_item_nutrient: '营养液（3+1+N）',
      cons_item_germ_arm: '种子摆盘机械臂',
      cons_item_germ_box: '发芽箱与托盘',
      cons_item_seeds: '咖啡种子（全年）',

      cons_note_basket: '48万个 — 可重复使用',
      cons_note_rockwool: '62万个 — 12个月消耗',
      cons_note_sponge: '62万个',
      cons_note_nutrient: '年度供应',
      cons_note_germ_arm: '自动化种子摆盘',
      cons_note_germ_box: '4套',
      cons_note_seeds: '62万粒@1.7元/粒',

      // ─── Per-tree breakdown ───
      pt_item_shipping: '运费',
      pt_item_coir: '椰糠与包装袋',
      pt_item_utilities: '水电费与营养液',
      pt_item_seeds: '种子',
      pt_item_depreciation: '设备成本回收',
      pt_item_misc: '杂费与人工费',
      pt_total: '每棵种苗总成本',

      // ─── Efficiency Page ───
      eff_title: '生产效率与产出分析',
      eff_intro: '种植密度、周期时间、批次轮换和年产量的量化指标 — 展示系统的工业级生产力。',
      eff_section_density: '种植密度',
      eff_section_cycles: '生长周期与批次轮换',
      eff_section_yield: '年产量预测',
      eff_section_comparison: '传统苗圃 vs. 气雾栽培',

      density_panel_early: '前期面板（6×6厘米）',
      density_panel_late: '后期面板（12×12厘米）',
      density_per_system_early: '每套系统（前期）',
      density_per_system_late: '每套系统（后期）',
      density_total_early: '幼苗系统总量',
      density_total_late: '大苗系统总量',
      density_label_seedlings: '棵种苗',
      density_label_per_batch: '每批',

      cycle_seedling: '幼苗温室',
      cycle_large: '大苗系统',
      cycle_seedling_duration: '2个月周期',
      cycle_large_duration: '4个月周期',
      cycle_batches: '每年3批次',
      cycle_rotation: '交错批次轮换确保持续产出 — 每2个月启动新批次，同时收获成熟批次。',

      yield_scale_a: '方案A（45套系统）',
      yield_scale_b: '方案B（81套系统）',
      yield_label_trees: '棵/年',
      yield_label_batches: '批次/年',
      yield_price: '销售单价',
      yield_revenue: '年收入',

      comp_metric: '指标',
      comp_traditional: '传统苗圃',
      comp_aeroponic: '气雾栽培系统',
      comp_land: '每10万棵所需土地',
      comp_cycle: '生长周期',
      comp_density: '种植密度',
      comp_water: '用水量',
      comp_climate: '气候依赖',
      comp_year_round: '全年生产',
      comp_disease: '病害风险',
      comp_scalability: '可扩展性',

      comp_trad_land: '约50亩',
      comp_aero_land: '约1.5亩',
      comp_trad_cycle: '8-12个月',
      comp_aero_cycle: '4个月（大苗）',
      comp_trad_density: '低',
      comp_aero_density: '高114倍',
      comp_trad_water: '高（土壤灌溉）',
      comp_aero_water: '减少95%（雾化系统）',
      comp_trad_climate: '完全暴露',
      comp_aero_climate: '完全受控',
      comp_trad_year_round: '否（季节性）',
      comp_aero_year_round: '是',
      comp_trad_disease: '高（土传病害）',
      comp_aero_disease: '极低（无土栽培）',
      comp_trad_scalability: '线性（依赖土地）',
      comp_aero_scalability: '模块化（依赖系统）',

      // ─── Value Chain Page ───
      vc_title: '对咖啡产业链的价值',
      vc_intro: '气雾栽培系统在咖啡供应链的每个环节创造价值 — 从基因保育到下游市场准入。',
      vc_section_upstream: '上游：基因与种苗供应',
      vc_section_midstream: '中游：种植与加工',
      vc_section_downstream: '下游：市场与出口',
      vc_section_cross: '跨链价值',

      vc_upstream_desc: '在仅10.8亩土地上年产615,000棵无病种苗，系统消除了传统苗圃扩张的瓶颈。咖啡种植者可全年获取优质品种，不受季节限制。',
      vc_midstream_desc: '受控环境栽培确保种苗品质统一 — 一致的株高（50厘米）、根系发育和抗病性。这种标准化将田间移栽死亡率降低约60-80%，并使首次收获提前12-18个月。',
      vc_downstream_desc: '可扩展的种苗供应使下游生产商能够确定性地规划产能。系统的可追溯性（每批从种子到发货的数字化记录）支持精品咖啡认证和高端市场定位。',
      vc_cross_desc: '该模型将咖啡从农产品转变为工业级、数据驱动的供应链 — 具有可量化的投入、可预测的产出和可审计的可持续性指标。',

      vc_point_title_1: '无病害种苗',
      vc_point_desc_1: '无土栽培消除土传病原体 — 每棵种苗以洁净状态进入田间。',
      vc_point_title_2: '气候韧性',
      vc_point_desc_2: '受控环境将生产与气候波动脱钩 — 在2050年前50%咖啡种植地将变得不适宜种植的背景下至关重要。',
      vc_point_title_3: '可追溯性',
      vc_point_desc_3: '每批从种子到发货的数字化追踪 — 支持精品认证和产地验证。',
      vc_point_title_4: '模块化扩展',
      vc_point_desc_4: '无需获取新土地即可增量添加系统 — 以资本而非亩数线性扩展产能。',
      vc_point_title_5: '水资源效率',
      vc_point_desc_5: '气雾系统比土壤灌溉节水95% — 符合全球水资源管理标准。',
      vc_point_title_6: '上市速度',
      vc_point_desc_6: '4个月周期 vs. 传统8-12个月 — 新品种部署速度提升3倍。',

      // ─── Climate Response Page ───
      ico_title: '气候响应',
      ico_intro: '气雾栽培咖啡育苗系统与全球气候韧性议程直接对接 — 应对威胁1.25亿人生计和2000亿美元以上全球咖啡经济的生存性危机。',
      ico_section_crisis: '气候危机',
      ico_section_solution: '我们的回应',
      ico_section_partnership: '合作框架',
      ico_section_roadmap: '实施路线图',

      ico_crisis_desc: '气候模型预测到2050年咖啡种植地将减少50% — 由加速的厄尔尼诺周期和咖啡带气温上升驱动。在最坏情况下，阿拉比卡适宜性可能下降72%。',
      ico_crisis_stat_1: '到2050年种植地减少',
      ico_crisis_stat_2: '咖啡带气温上升',
      ico_crisis_stat_3: '受威胁生计',
      ico_crisis_stat_4: '阿拉比卡适宜性损失（最坏情况）',

      ico_solution_desc: '我们的气雾栽培系统直接回应全球气候韧性使命：将咖啡种植移出脆弱的户外环境，在受控条件下全年生产种苗，并实现气候适应品种的快速部署以替代衰败的传统种植园。',
      ico_solution_alignment: '气候韧性对齐',

      ico_partner_desc: '我们的合作框架涵盖技术转让、数据共享和在最易受气候影响咖啡产区的联合田间部署。',
      ico_partner_pillar_1: '技术转让',
      ico_partner_pillar_1_desc: '向咖啡产国开放许可气雾系统设计 — 实现本地制造和部署。',
      ico_partner_pillar_2: '数据共享',
      ico_partner_pillar_2_desc: '向全球研究数据库共享栽培指标、产量数据和气候适应成果。',
      ico_partner_pillar_3: '田间部署',
      ico_partner_pillar_3_desc: '在巴西、越南、埃塞俄比亚和也门开展联合试点项目 — 最易受气候影响的产区。',
      ico_partner_pillar_4: '能力建设',
      ico_partner_pillar_4_desc: '培训当地操作员掌握气雾栽培技术 — 在气候韧性农业领域创造技能型就业。',

      ico_phase_1: '第一阶段 — 验证',
      ico_phase_1_desc: '龙岗设施（81套系统，年产61.5万棵）的运营数据验证商业可行性。',
      ico_phase_1_status: '进行中',
      ico_phase_2: '第二阶段 — 战略合作',
      ico_phase_2_desc: '与战略合作伙伴正式签署技术转让协议。开始数据整合。',
      ico_phase_2_status: '规划中',
      ico_phase_3: '第三阶段 — 试点部署',
      ico_phase_3_desc: '在气候脆弱地区部署3套试点系统。12个月田间评估。',
      ico_phase_3_status: '2026年Q3',
      ico_phase_4: '第四阶段 — 规模化',
      ico_phase_4_desc: '开放许可系统设计。目标到2028年在咖啡带建立10个生产基地。',
      ico_phase_4_status: '2027-2028年',

      // ─── Footer ───
      footer_rights: '保留所有权利。',
      footer_disclaimer: '数据来源于运营成本分析。收入预测基于当前市场条件的估算。',
      footer_ico: '',
      footer_made: '数据驱动，创新引领。',

      // ─── Tooltips ───
      tip_investment: '总启动资金，包括设备、物料、耗材和预存水电费',
      tip_revenue: '基于615,000棵种苗 × 25元/棵销售单价计算',
      tip_margin: '毛利率 =（收入 - 每棵成本 × 产量）/ 收入',
      tip_per_tree: '每棵种苗全成本：种子、营养液、水电、折旧、包装、运输、人工',
      tip_density: '前期面板使用6×6厘米网格；后期扩展至12×12厘米以促进根系发育',
      tip_cycle: '幼苗温室：2个月周期。大苗系统：4个月周期。每年3个交错批次。',
      tip_depreciation: '设备成本按估计5年使用寿命摊销',
      tip_water_savings: '气雾系统直接向根部输送营养 — 比土壤灌溉节水95%',
      tip_scalability: '每套系统均为模块化 — 无需新土地即可增加产能',

      // ─── Error Messages ───
      err_generic: '出现错误，请重试。',
      err_language_not_found: '未找到语言，默认使用英语。',
      err_data_load: '数据加载失败，请刷新页面。',
      err_chart_render: '图表渲染失败，请检查浏览器兼容性。',
      err_pdf: '此浏览器不支持PDF导出。',
      err_copy: '复制到剪贴板失败。',
      err_form_required: '此字段为必填项。',
      err_form_email: '请输入有效的电子邮箱地址。',
      err_form_phone: '请输入有效的电话号码。',

      // ─── Dynamic / Interactive ───
      dyn_loading: '加载中...',
      dyn_calculating: '计算中...',
      dyn_copied: '已复制到剪贴板！',
      dyn_switching: '正在切换语言...',
      dyn_scale_a: '方案A',
      dyn_scale_b: '方案B',
      dyn_select_scale: '选择方案查看详情',
      dyn_expand: '展开',
      dyn_collapse: '收起',
      dyn_view_details: '查看详情',
      dyn_close: '关闭',
      dyn_back: '返回',
      dyn_next: '下一个',
      dyn_previous: '上一个',
      dyn_download: '下载',
      dyn_print: '打印',
      dyn_share: '分享',

      // ─── Auth / Login ───
      auth_login_title: '管理员登录',
      auth_login_desc: '此部分包含机密商业数据，需要管理员身份验证。',
      auth_username: '用户名',
      auth_password: '密码',
      auth_login_btn: '登录',
      auth_login_error: '凭据无效，拒绝访问。',
      auth_logout: '退出登录',

      // ─── Units ───
      unit_yuan: '¥',
      unit_per_year: '/年',
      unit_per_kwh: '/千瓦时',
      unit_per_m3: '/立方',
      unit_per_seedling: '/棵',
      unit_per_unit: '/个',
      unit_acres: '亩',
      unit_months: '个月',
      unit_kw: 'KW',
      unit_percent: '%',
      unit_cm: '厘米',
      unit_m: '米'
    },

    ar: {
      _dir: 'rtl',
      _lang_label: 'العربية',
      _flag: '🇸🇦',

      // ─── Language Modal ───
      modal_title: 'اختر لغتك',
      modal_subtitle: 'حدد لغتك المفضلة للمتابعة',
      modal_en: 'English',
      modal_en_desc: 'دولي',
      modal_zh: '简体中文',
      modal_zh_desc: 'الماندرين',
      modal_ar: 'العربية',
      modal_ar_desc: 'السعودية',
      modal_confirm: 'متابعة',
      modal_remember: 'تذكر اختياري',

      // ─── Nav ───
      nav_home: 'الرئيسية',
      nav_overview: 'نظرة عامة',
      nav_costs: 'التكاليف',
      nav_efficiency: 'الكفاءة',
      nav_value_chain: 'سلسلة القيمة',
      nav_collaboration: 'الاستجابة المناخية',
      nav_brand: 'napell.space',
      nav_tagline: 'نظام زراعة البن بالرذاذ الهوائي',

      // ─── Landing Hero ───
      hero_eyebrow: 'نظام زراعة البن بالرذاذ الهوائي',
      hero_title: 'من هيكل التكلفة إلى الابتكار الصناعي',
      hero_subtitle: 'نموذج تجاري قائم على البيانات لإنتاج شتلات البن المقاوم للمناخ والقابل للتوسع.',
      hero_cta_explore: 'استكشف النموذج',
      hero_cta_data: 'عرض بيانات التكلفة',

      // ─── Landing KPIs ───
      kpi_investment: 'الاستثمار الأولي',
      kpi_annual_output: 'الإنتاج السنوي',
      kpi_revenue: 'الإيراد المتوقع',
      kpi_margin: 'هامش الربح الإجمالي',
      kpi_per_tree_cost: 'تكلفة الشتلة الواحدة',
      kpi_sale_price: 'سعر بيع الشتلة',
      kpi_growth_cycle: 'دورة النمو',
      kpi_batches_year: 'دورات سنوية',
      kpi_land_area: 'مساحة البيت الزجاجي',
      kpi_systems: 'أنظمة الزراعة',

      // ─── Overview Page ───
      overview_title: 'نظرة عامة على النظام والنموذج التجاري',
      overview_intro: 'يستبدل نظام زراعة البن بالرذاذ الهوائي دور الحضانة التقليدية المعتمدة على التربة بخط أنابيب هيدروبوني هندسي دقيق. تنمو الشتلات على ألواح رذاذ مغذية تحت مناخ محكم، محققة كثافة أعلى ودورات أسرع وإنتاج على مدار العام.',
      overview_section_system: 'هندسة النظام',
      overview_section_model: 'النموذج التجاري',
      overview_section_scale: 'خيارات الحجم',

      sys_arch_desc: 'يبلغ حجم كل نظام زراعة 22.8م × 1.8م بارتفاع طبقة واحدة 1.4م. تستخدم ألواح الشتلات شبكة 6×6 سم (مرحلة مبكرة شهرين) تتوسع إلى 12×12 سم (الأشهر 3-6). نظام الرذاذ عالي الضغط يوصل المحلول المغذي مباشرة إلى منطقة الجذور.',
      sys_arch_panel: 'تصميم الألواح',
      sys_arch_panel_early: 'المرحلة المبكرة (0-2 شهر): شبكة 6×6 سم — 11,400 شتلة لكل نظام لكل دفعة',
      sys_arch_panel_late: 'المرحلة المتأخرة (3-6 أشهر): شبكة 12×12 سم — 2,850 شتلة لكل نظام لكل دفعة',
      sys_arch_infra: 'البنية التحتية الأساسية',
      sys_arch_infra_items: [
        'نظام ضاغط هواء 110 كيلوواط ثنائي الوحدة الرئيسية مع مجفف هواء وخزان',
        'خط أنابيب معدني عالي الضغط (DN80-DN20) مع صمامات كروية وفلنجات',
        'نظام توصيل المحلول المغذي بالصمامات الكهرومغناطيسية',
        'نظام إنبات بذور آلي ذراع روبوتي للوضع',
        'وحدة تحكم PLC لإدارة المناخ والتغذية والري'
      ],

      model_desc: 'يعمل النموذج التجاري على مبدأ التناوب الدفعي: تعمل بيوت الشتلات لدورات شهرين بينما تعمل أنظمة النباتات الكبيرة لدورات 4 أشهر. مع 81 نظامًا عبر 10.8 فدان، يحقق المرفق 3 دفعات كاملة سنويًا — بإنتاج 615,000 شتلة قابلة للتسويق سنويًا.',
      model_unit_econ: 'اقتصاديات الوحدة',
      model_unit_econ_desc: 'كل شتلة كبيرة بطول 50 سم تباع بـ 25 يوان. إجمالي التكلفة لكل شتلة (بما في ذلك إهلاك المعدات والبذور والمغذيات والمرافق والتعبئة والعمالة) هو 6.614 يوان — بإجمالي ربح 18.386 يوان لكل وحدة.',

      scale_opt1: 'الخيار أ — 45 نظامًا',
      scale_opt2: 'الخيار ب — 81 نظامًا',
      scale_opt1_desc: 'نشر تمهيدي: 8.8 فدان، 350,000 بذرة، إنتاج سنوي 342,000 شتلة',
      scale_opt2_desc: 'نشر كامل: 10.8 فدان، 620,000 بذرة، إنتاج سنوي 615,000 شتلة',
      scale_table_header_sc: 'المؤشر',
      scale_table_header_a: 'الخيار أ (45 نظامًا)',
      scale_table_header_b: 'الخيار ب (81 نظامًا)',
      scale_row_land: 'مساحة البيت الزجاجي',
      scale_row_seeds: 'البذور السنوية',
      scale_row_output: 'الإنتاج السنوي (شتلة)',
      scale_row_equipment: 'تكلفة المعدات',
      scale_row_materials: 'تكلفة المواد',
      scale_row_consumables: 'المواد الاستهلاكية الديناميكية',
      scale_row_total: 'إجمالي رأس المال التأسيسي',
      scale_row_revenue: 'الإيراد السنوي المتوقع',

      // ─── Costs Page ───
      costs_title: 'تحليل التكاليف التفصيلي',
      costs_intro: 'تفصيل شفاف لكل عنصر تكلفة في نظام زراعة البن بالرذاذ الهوائي — من المعدات إلى اقتصاديات الوحدة لكل شتلة.',
      costs_section_equipment: 'المعدات والبنية التحتية',
      costs_section_materials: 'المواد',
      costs_section_consumables: 'المواد الاستهلاكية الديناميكية',
      costs_section_utilities: 'المرافق',
      costs_section_per_tree: 'تفصيل تكلفة الشتلة',
      costs_section_summary: 'ملخص الاستثمار',

      tbl_item: 'البند',
      tbl_unit: 'الوحدة',
      tbl_unit_price: 'سعر الوحدة (¥)',
      tbl_qty_45: '45 نظامًا (¥)',
      tbl_qty_81: '81 نظامًا (¥)',
      tbl_note: 'ملاحظات',
      tbl_category: 'الفئة',
      tbl_subtotal: 'المجموع الفرعي',

      cost_item_rent: 'إيجار البيت الزجاجي',
      cost_item_deposit: 'تأمين الإيجار',
      cost_item_electricity_rate: 'سعر الكهرباء',
      cost_item_water_rate: 'سعر المياه',
      cost_item_system: 'نظام الزراعة الهيدروبونية',
      cost_item_compressor: 'ضاغط الهواء (110 كيلوواط)',
      cost_item_pipeline: 'خط أنابيب الغاز عالي الضغط',
      cost_item_controller: 'وحدة تحكم النظام',
      cost_item_seeds: 'بذور البن',
      cost_item_germination: 'نظام إنبات البذور',
      cost_item_nutrient: 'نظام المحلول المغذي',
      cost_item_water_drain: 'إمداد/تصريف المياه والصمامات',
      cost_item_prepaid_util: 'مرافق مدفوعة مسبقًا',
      cost_item_rent_deposit: 'الإيجار والتأمين',
      cost_item_packaging: 'التعبئة',
      cost_item_shipping: 'الشحن',

      cost_note_rent: '8.8 فدان بيت زجاجي @ ¥6,800/فدان + 2.4 فدان مفتوح @ ¥2,500/فدان',
      cost_note_deposit: 'تأمين إيجار البيت الزجاجي والأرض المفتوحة',
      cost_note_system: 'هيكل توصيل سريع، لوح XPS، فيلم أبيض/أسود، فوهات، أنابيب PE',
      cost_note_compressor: 'وحدة مزدوجة رئيسية، مجفف هواء، خزان هواء',
      cost_note_pipeline: 'صمامات كروية DN80-DN20، فلنجات وملحقات',
      cost_note_controller: 'إدارة المناخ والتغذية بوحدة PLC',
      cost_note_seeds: 'بذور بن ممتازة @ ¥1.7/بذرة',
      cost_note_germination: 'صناديق إنبات + ذراع روبوتي',
      cost_note_nutrient: 'محلول مغذي صيغة 3+1+N',
      cost_note_prepaid_util: 'الموقع الجديد يتطلب دفع مرافق مسبق',
      cost_note_packaging: 'تكلفة تعبئة كل شتلة',
      cost_note_shipping: 'تكلفة شحن كل شتلة',

      // ─── Consumables ───
      cons_item_basket: 'سلة الزراعة',
      cons_item_rockwool: 'صوف صخري زراعي',
      cons_item_sponge: 'إسفنج الزراعة',
      cons_item_nutrient: 'محلول مغذي (3+1+N)',
      cons_item_germ_arm: 'ذراع روبوتي لوضع البذور',
      cons_item_germ_box: 'صندوق إنبات وصواني',
      cons_item_seeds: 'بذور البن (سنوي)',

      cons_note_basket: '480,000 وحدة — قابلة لإعادة الاستخدام',
      cons_note_rockwool: '620,000 وحدة — استهلاك 12 شهر',
      cons_note_sponge: '620,000 وحدة',
      cons_note_nutrient: 'توريد سنوي',
      cons_note_germ_arm: 'وضع بذور آلي',
      cons_note_germ_box: '4 وحدات',
      cons_note_seeds: '620,000 بذرة @ ¥1.7/بذرة',

      // ─── Per-tree breakdown ───
      pt_item_shipping: 'الشحن',
      pt_item_coir: 'جوز الهند وكيس التعبئة',
      pt_item_utilities: 'المياه والكهرباء والمغذيات',
      pt_item_seeds: 'البذور',
      pt_item_depreciation: 'إهلاك المعدات',
      pt_item_misc: 'متنوعة وعمالة',
      pt_total: 'إجمالي التكلفة لكل شتلة',

      // ─── Efficiency Page ───
      eff_title: 'كفاءة الإنتاج وتحليل المخرجات',
      eff_intro: 'مقاييس كمية لكثافة الزراعة وأوقات الدوران وتناوب الدفعات والإنتاج السنوي — توضح إنتاجية النظام على المستوى الصناعي.',
      eff_section_density: 'كثافة الزراعة',
      eff_section_cycles: 'دورات النمو وتناوب الدفعات',
      eff_section_yield: 'توقعات الإنتاج السنوي',
      eff_section_comparison: 'تقليدي مقابل هوائي',

      density_panel_early: 'لوح المرحلة المبكرة (6×6 سم)',
      density_panel_late: 'لوح المرحلة المتأخرة (12×12 سم)',
      density_per_system_early: 'لكل نظام (مبكر)',
      density_per_system_late: 'لكل نظام (متأخر)',
      density_total_early: 'إجمالي أنظمة الشتلات',
      density_total_late: 'إجمالي أنظمة النباتات الكبيرة',
      density_label_seedlings: 'شتلة',
      density_label_per_batch: 'لكل دفعة',

      cycle_seedling: 'بيت الشتلات',
      cycle_large: 'نظام النباتات الكبيرة',
      cycle_seedling_duration: 'دورة شهرين',
      cycle_large_duration: 'دورة 4 أشهر',
      cycle_batches: '3 دفعات سنويًا',
      cycle_rotation: 'يضمن التناوب الدفعي المتداخل إنتاجًا مستمرًا — تبدأ دفعات جديدة كل شهرين بينما تُحصد الدفعات الناضجة.',

      yield_scale_a: 'الحجم أ (45 نظامًا)',
      yield_scale_b: 'الحجم ب (81 نظامًا)',
      yield_label_trees: 'شتلة/سنة',
      yield_label_batches: 'دفعة/سنة',
      yield_price: 'سعر البيع',
      yield_revenue: 'الإيراد السنوي',

      comp_metric: 'المؤشر',
      comp_traditional: 'دور الحضانة التقليدي',
      comp_aeroponic: 'النظام الهوائي',
      comp_land: 'الأرض المطلوبة لكل 100 ألف شتلة',
      comp_cycle: 'دورة النمو',
      comp_density: 'كثافة الزراعة',
      comp_water: 'استخدام المياه',
      comp_climate: 'الاعتماد على المناخ',
      comp_year_round: 'إنتاج على مدار العام',
      comp_disease: 'خطر الأمراض',
      comp_scalability: 'قابلية التوسع',

      comp_trad_land: '~50 فدان',
      comp_aero_land: '~1.5 فدان',
      comp_trad_cycle: '8-12 شهر',
      comp_aero_cycle: '4 أشهر (نبات كبير)',
      comp_trad_density: 'منخفضة',
      comp_aero_density: 'أعلى 114 مرة',
      comp_trad_water: 'عالٍ (ري تربة)',
      comp_aero_water: 'أقل 95% (نظام رذاذ)',
      comp_trad_climate: 'تعريض كامل',
      comp_aero_climate: 'تحكم كامل',
      comp_trad_year_round: 'لا (موسمي)',
      comp_aero_year_round: 'نعم',
      comp_trad_disease: 'عالٍ (أمراض التربة)',
      comp_aero_disease: 'ضئيل (بدون تربة)',
      comp_trad_scalability: 'خطي (مرتبط بالأرض)',
      comp_aero_scalability: 'وحداتي (مرتبط بالنظام)',

      // ─── Value Chain Page ───
      vc_title: 'القيمة لسلاسل صناعة البن',
      vc_intro: 'يخلق النظام الهوائي قيمة في كل حلقة من سلسلة توريد البن — من حفظ الوراثة إلى الوصول للأسواق.',
      vc_section_upstream: 'المنبع: الوراثة وإمداد البذور',
      vc_section_midstream:'المنتصف: الزراعة والمعالجة',
      vc_section_downstream: 'المصب: السوق والتصدير',
      vc_section_cross: 'قيمة عبر السلسلة',

      vc_upstream_desc: 'بإنتاج 615,000 شتلة خالية من الأمراض سنويًا من 10.8 فدان فقط، يزيل النظام عنق زجاجة توسيع دور الحضانة التقليدية. يمكن لمزارعي البن الوصول إلى الأصناف المتميزة على مدار العام، بمعزل عن القيود الموسمية.',
      vc_midstream_desc: 'الزراعة في بيئة محمية تضمن جودة شتلات موحدة — ارتفاع متسق (50 سم)، وتطور جذري، ومقاومة للأمراض. يقلل هذا التقييس وفيات الزرع الميداني بنسبة 60-80% المقدرة ويسرع أول حصاد بـ 12-18 شهرًا.',
      vc_downstream_desc: 'إمداد الشتلات القابل للتوسع يمكّن المنتجين المصب من تخطيط الطاقة بيقين. تتبع النظام (كل دفعة مسجلة رقميًا من البذرة إلى الشحن) يدعم شهادات البن المختص وتموضع السوق المتميز.',
      vc_cross_desc: 'يحول النموذج البن من سلعة زراعية إلى سلسلة توريد صناعية مدفوعة بالبيانات — بمدخلات قابلة للقياس ومخرجات قابلة للتنبؤ ومقاييس استدامة قابلة للتدقيق.',

      vc_point_title_1: 'شتلات خالية من الأمراض',
      vc_point_desc_1: 'الزراعة بدون تربة ت eliminate أمراض التربة — كل شتلة تدخل الحقل نظيفة.',
      vc_point_title_2: 'مرونة المناخ',
      vc_point_desc_2: 'البيئة المحمية تفصل الإنتاج عن تقلبات المناخ — أمر حاسم مع فقدان 50% من أراضي البن الصالحة بحلول 2050.',
      vc_point_title_3: 'إمكانية التتبع',
      vc_point_desc_3: 'كل دفعة متتبعة رقميًا من البذرة إلى الشحن — يدعم شهادات التخصص والتحقق من المنشأ.',
      vc_point_title_4: 'توسع وحداتي',
      vc_point_desc_4: 'أضف أنظمة تدريجيًا دون الحصول على أراضٍ جديدة — وسع الإنتاج خطيًا برأس المال وليس بالمساحة.',
      vc_point_title_5: 'كفاءة المياه',
      vc_point_desc_5: 'الرذاذ الهوائي يستخدم 95% مياه أقل من ري التربة — يتوافق مع معايير الإشراف العالمي على المياه.',
      vc_point_title_6: 'سرعة الوصول للسوق',
      vc_point_desc_6: 'دورات 4 أشهر مقابل 8-12 شهر تقليدية — أسرع 3 مرات في نشر الأصناف الجديدة.',

      // ─── Climate Response Page ───
      ico_title: 'الاستجابة المناخية',
      ico_intro: 'يتماشى نظام زراعة البن بالرذاذ الهوائي مباشرة مع جدول أعمال المرونة المناخية العالمي — مواجهة التهديد الوجودي الذي يواجه 125 مليون لقمة عيش واقتصاد البن العالمي البالغ 200 مليار دولار+.',
      ico_section_crisis: 'أزمة المناخ',
      ico_section_solution: 'استجابتنا',
      ico_section_partnership: 'إطار الشراكة',
      ico_section_roadmap: 'خارطة طريق التنفيذ',

      ico_crisis_desc: 'تتوقع نماذج المناخ انخفاضًا بنسبة 50% في الأراضي الصالحة لزراعة البن بحلول 2050 — مدفوعًا بتسارع دورات النينيو وارتفاع درجات الحرارة عبر حزام البن. قد تنخفض ملاءمة أرابيكا بنسبة 72% في أسوأ السيناريوهات.',
      ico_crisis_stat_1: 'انخفاض الأراضي الصالحة بحلول 2050',
      ico_crisis_stat_2: 'ارتفاع حرارة حزام البن',
      ico_crisis_stat_3: 'لقم عيش معرضة للخطر',
      ico_crisis_stat_4: 'فقدان ملاءمة أرابيكا (أسوأ حالة)',

      ico_solution_desc: 'يوجه نظامنا الهوائي تفويض المرونة المناخية العالمي مباشرة: يزيل زراعة البن من البيئات الخارجية الهشة، ينتج الشتلات على مدار العام في ظروف محمية، ويمكّن النشر السريع لأصناف متكيفة مع المناخ لاستبدال المزارع التقليدية المتدهورة.',
      ico_solution_alignment: 'التوافق المناخي',

      ico_partner_desc: 'يشتمل إطار الشراكة لدينا على نقل التكنولوجيا ومشاركة البيانات والنشر الميداني المشترك عبر الدول المنتجة للبن الأكثر عرضة لتغير المناخ.',
      ico_partner_pillar_1: 'نقل التكنولوجيا',
      ico_partner_pillar_1_desc: 'ترخيص مفتوح لتصميم النظام الهوائي لدول إنتاج البن — تمكين التصنيع والنشر المحلي.',
      ico_partner_pillar_2: 'مشاركة البيانات',
      ico_partner_pillar_2_desc: 'مشاركة مقاييس الزراعة وبيانات الإنتاج ونتائج التكيف المناخي مع قاعدة البيانات العالمية.',
      ico_partner_pillar_3: 'النشر الميداني',
      ico_partner_pillar_3_desc: 'برامج تجريبية مشتركة في البرازيل وفيتنام وإثيوبيا واليمن — أكثر مناطق الإنتاج عرضة للمناخ.',
      ico_partner_pillar_4: 'بناء القدرات',
      ico_partner_pillar_4_desc: 'تدريب المشغلين المحليين على الزراعة الهوائية — خلق وظائف ماهرة في الزراعة المقاومة للمناخ.',

      ico_phase_1: 'المرحلة 1 — التحقق',
      ico_phase_1_desc: 'بيانات التشغيل من منشأة لونغقانغ (81 نظامًا، 615 ألف شجرة/سنة) تتحقق من الجدوى التجارية.',
      ico_phase_1_status: 'قيد التنفيذ',
      ico_phase_2: 'المرحلة 2 — شراكة استراتيجية',
      ico_phase_2_desc: 'إضفاء الطابع الرسمي على اتفاقيات نقل التكنولوجيا مع شركاء استراتيجيين. بدء تكامل البيانات.',
      ico_phase_2_status: 'تخطيط',
      ico_phase_3: 'المرحلة 3 — نشر تجريبي',
      ico_phase_3_desc: 'نشر 3 أنظمة تجريبية في مناطق هشة مناخيًا. تقييم ميداني 12 شهرًا.',
      ico_phase_3_status: 'الربع الثالث 2026',
      ico_phase_4: 'المرحلة 4 — التوسع',
      ico_phase_4_desc: 'ترخيص مفتوح لتصميم النظام. استهداف 10 مواقع إنتاج عبر حزام البن بحلول 2028.',
      ico_phase_4_status: '2027-2028',

      // ─── Footer ───
      footer_rights: 'جميع الحقوق محفوظة.',
      footer_disclaimer: 'البيانات مستمدة من تحليل تكاليف التشغيل. توقعات الإيراد مبنية على تقديرات وفق ظروف السوق الحالية.',
      footer_ico: '',
      footer_made: 'مدفوع بالبيانات. يُقاده بالابتكار.',

      // ─── Tooltips ───
      tip_investment: 'إجمالي رأس المال التأسيسي بما في ذلك المعدات والمواد والمستهلكات والمرافق المدفوعة مسبقًا',
      tip_revenue: 'بناءً على 615,000 شتلة × ¥25/وحدة سعر بيع',
      tip_margin: 'هامش الربح الإجمالي = (الإيراد - تكلفة الشتلة × الإنتاج) / الإيراد',
      tip_per_tree: 'التكلفة الشاملة لكل شتلة: بذور، مغذيات، مرافق، إهلاك، تعبئة، شحن، عمالة',
      tip_density: 'ألواح المرحلة المبكرة تستخدم شبكة 6×6 سم؛ المرحلة المتأخرة تتوسع إلى 12×12 سم لتطور الجذور',
      tip_cycle: 'بيت الشتلات: دورة شهرين. نظام النباتات الكبيرة: دورة 4 أشهر. 3 دفعات متداخلة/سنة.',
      tip_depreciation: 'تكلفة المعدات مُستهلكة على عمر افتراضي مقدر 5 سنوات',
      tip_water_savings: 'الرذاذ الهوائي يوصل المغذيات مباشرة للجذور — 95% مياه أقل من ري التربة',
      tip_scalability: 'كل نظام وحداتي — أضف طاقة دون الحصول على أراضٍ جديدة',

      // ─── Error Messages ───
      err_generic: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      err_language_not_found: 'اللغة غير موجودة. التبديل إلى الإنجليزية.',
      err_data_load: 'فشل تحميل البيانات. يرجى تحديث الصفحة.',
      err_chart_render: 'فشل عرض الرسم البياني. يرجى التحقق من توافق المتصفح.',
      err_pdf: 'تصدير PDF غير مدعوم على هذا المتصفح.',
      err_copy: 'فشل النسخ إلى الحافظة.',
      err_form_required: 'هذا الحقل مطلوب.',
      err_form_email: 'يرجى إدخال عنوان بريد إلكتروني صالح.',
      err_form_phone: 'يرجى إدخال رقم هاتف صالح.',

      // ─── Dynamic / Interactive ───
      dyn_loading: 'جاري التحميل...',
      dyn_calculating: 'جاري الحساب...',
      dyn_copied: 'تم النسخ إلى الحافظة!',
      dyn_switching: 'جاري تبديل اللغة...',
      dyn_scale_a: 'الحجم أ',
      dyn_scale_b: 'الحجم ب',
      dyn_select_scale: 'اختر الحجم لعرض التفاصيل',
      dyn_expand: 'توسيع',
      dyn_collapse: 'طي',
      dyn_view_details: 'عرض التفاصيل',
      dyn_close: 'إغلاق',
      dyn_back: 'رجوع',
      dyn_next: 'التالي',
      dyn_previous: 'السابق',
      dyn_download: 'تحميل',
      dyn_print: 'طباعة',
      dyn_share: 'مشاركة',

      // ─── Auth / Login ───
      auth_login_title: 'وصول المسؤول',
      auth_login_desc: 'يحتوي هذا القسم على بيانات أعمال سرية. مطلوب مصادقة المسؤول.',
      auth_username: 'اسم المستخدم',
      auth_password: 'كلمة المرور',
      auth_login_btn: 'تسجيل الدخول',
      auth_login_error: 'بيانات اعتماد غير صالحة. تم رفض الوصول.',
      auth_logout: 'تسجيل الخروج',

      // ─── Units ───
      unit_yuan: '¥',
      unit_per_year: '/سنة',
      unit_per_kwh: '/كيلوواط ساعة',
      unit_per_m3: '/م³',
      unit_per_seedling: '/شتلة',
      unit_per_unit: '/وحدة',
      unit_acres: 'فدان',
      unit_months: 'شهر',
      unit_kw: 'كيلوواط',
      unit_percent: '٪',
      unit_cm: 'سم',
      unit_m: 'م'
    }
  },

  /**
   * Initialize the i18n system
   * Reads stored language or defaults to browser detection
   * Always applies translations, then shows language modal on first visit
   */
  init() {
    const stored = localStorage.getItem('cti-lang');
    if (stored && this.translations[stored]) {
      this._lang = stored;
    } else {
      // Detect browser language
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang) {
        const lang = browserLang.toLowerCase();
        if (lang.startsWith('zh')) this._lang = 'zh';
        else if (lang.startsWith('ar')) this._lang = 'ar';
        else this._lang = 'en';
      }
    }

    // Apply translations first (nav/footer/modal must already be injected)
    this.apply();

    // Show language modal on first visit
    if (!sessionStorage.getItem('cti-modal-shown')) {
      this.showModal();
    }
  },

  /**
   * Get translated string by key
   * Supports dot notation: t('nav_home')
   */
  t(key) {
    const dict = this.translations[this._lang] || this.translations.en;
    const val = dict[key];
    if (val === undefined) {
      console.warn(`[i18n] Missing key: ${key} in ${this._lang}`);
      return this.translations.en[key] || key;
    }
    return val;
  },

  /**
   * Set active language
   */
  setLang(lang) {
    if (!this.translations[lang]) {
      console.warn(`[i18n] Language not found: ${lang}`);
      return;
    }
    this._lang = lang;
    localStorage.setItem('cti-lang', lang);
    sessionStorage.setItem('cti-modal-shown', '1');
    this.apply();
    this._listeners.forEach(fn => fn(lang));
  },

  /**
   * Apply translations to all DOM elements with data-i18n attributes
   * Also sets dir attribute for RTL support
   */
  apply() {
    const dict = this.translations[this._lang];
    const dir = dict._dir || 'ltr';

    document.documentElement.lang = this._lang;
    document.documentElement.dir = dir;
    document.body.classList.toggle('rtl', dir === 'rtl');

    // Apply text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (Array.isArray(val)) {
        el.innerHTML = val.map(item => `<li>${item}</li>`).join('');
      } else {
        el.textContent = val;
      }
    });

    // Apply HTML content (for items needing HTML)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = this.t(key);
    });

    // Apply attributes (title, placeholder, aria-label, etc.)
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const pairs = el.getAttribute('data-i18n-attr').split(';');
      pairs.forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) {
          el.setAttribute(attr, this.t(key));
        }
      });
    });

    // Update language toggle button label
    const toggle = document.getElementById('lang-current-label');
    if (toggle) toggle.textContent = dict._lang_label;

    // Update dropdown options
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === this._lang);
    });

    // Re-render any dynamic content
    if (typeof window.renderDynamicContent === 'function') {
      window.renderDynamicContent(this._lang);
    }
  },

  /**
   * Show the language selection modal
   */
  showModal() {
    const modal = document.getElementById('lang-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  /**
   * Hide the language selection modal
   */
  hideModal() {
    const modal = document.getElementById('lang-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    sessionStorage.setItem('cti-modal-shown', '1');
  },

  /**
   * Register a listener for language change events
   */
  onChange(fn) {
    this._listeners.push(fn);
  },

  /**
   * Get current language
   */
  getLang() {
    return this._lang;
  }
};

// NOTE: main.js calls I18N.init() after injecting nav/footer/modal components.
// Do NOT auto-init here — otherwise apply() runs before components exist.
