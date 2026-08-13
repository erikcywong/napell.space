/**
 * data.js — All data extracted from the operational cost analysis spreadsheet
 * Source: 副本育苗系统 费用和产出计划 0812.xlsx
 * Facility: Longgang Greenhouse 5 & 6 (龙岗5号6号棚)
 */

const APP_DATA = {

  // ─── Facility Constants ───
  facility: {
    name_en: 'Longgang Aeroponic Cultivation Facility',
    name_zh: '龙岗气雾栽培育苗基地',
    name_ar: 'منشأة لونغقانغ للزراعة الهوائية',
    greenhouse_acres: 8.8,
    open_acres: 2.4,
    total_acres_scale_a: 8.8,
    total_acres_scale_b: 10.8,
    rent_per_acre_greenhouse: 6800,
    rent_per_acre_open: 2500,
    rent_annual: 65840,
    deposit: 50000,
    electricity_rate: 0.629,
    water_rate: 7
  },

  // ─── System Specifications ───
  system: {
    length_m: 22.8,
    width_m: 1.8,
    layer_height_m: 1.4,
    panel_early_grid: '6×6',
    panel_late_grid: '12×12',
    panel_size_cm: '2280×60',
    early_seedlings_per_system: 11400,
    late_seedlings_per_system: 2850,
    early_cycle_months: 2,
    late_cycle_months: 4,
    batches_per_year: 3,
    sale_price_per_seedling: 25,
    seedling_target_size_cm: 50
  },

  // ─── Scale Options ───
  scales: {
    a: {
      id: 'a',
      systems: 45,
      seeds: 350000,
      annual_output: 342000,
      equipment_cost: 665339.04,
      materials_cost: 578929.50,
      consumables_cost: 942800,
      total_startup: 2187068.54,
      annual_revenue: 8550000
    },
    b: {
      id: 'b',
      systems: 81,
      seeds: 620000,
      annual_output: 615000,
      equipment_cost: 665339.04,
      materials_cost: 737073.10,
      consumables_cost: 1415400,
      total_startup: 2817812.14,
      annual_revenue: 15375000
    }
  },

  // ─── Equipment & Infrastructure Costs ───
  equipment: [
    { i18n_key: 'cost_item_system', unit_key: 'unit_per_unit', unit_price: 5200, qty_45: 234000, qty_81: 421200, note_key: 'cost_note_system' },
    { i18n_key: 'cost_item_compressor', unit_key: 'unit_per_unit', unit_price: 220000, qty_45: 220000, qty_81: 220000, note_key: 'cost_note_compressor' },
    { i18n_key: 'cost_item_pipeline', unit_key: '', unit_price: 40000, qty_45: 40000, qty_81: 40000, note_key: 'cost_note_pipeline' },
    { i18n_key: 'cost_item_controller', unit_key: 'unit_per_unit', unit_price: 60000, qty_45: 60000, qty_81: 60000, note_key: 'cost_note_controller' },
    { i18n_key: 'cost_item_germination', unit_key: 'unit_per_unit', unit_price: 30000, qty_45: 30000, qty_81: 30000, note_key: 'cost_note_germination' },
    { i18n_key: 'cost_item_nutrient', unit_key: 'unit_per_unit', unit_price: 100000, qty_45: 100000, qty_81: 100000, note_key: 'cost_note_nutrient' },
    { i18n_key: 'cost_item_water_drain', unit_key: 'unit_per_unit', unit_price: 20000, qty_45: 20000, qty_81: 20000, note_key: 'cost_note_system' }
  ],

  // ─── Materials Costs ───
  materials: [
    { i18n_key: 'cons_item_basket_note', label_en: 'Quick-connect keel', label_zh: '快接龙骨', label_ar: 'هيكل التوصيل السريع', unit_price: null, qty_45: 95418, qty_81: 171752.40 },
    { i18n_key: '', label_en: 'XPS board', label_zh: 'XPS板', label_ar: 'لوح XPS', unit_price: null, qty_45: 31824, qty_81: 57283.20 },
    { i18n_key: '', label_en: 'B/W film', label_zh: '黑白膜', label_ar: 'فيلم أبيض/أسود', unit_price: null, qty_45: 1687.50, qty_81: 3037.50 },
    { i18n_key: '', label_en: 'Air compressor set', label_zh: '空压机套装', label_ar: 'مجموعة ضاغط الهواء', unit_price: null, qty_45: 220000, qty_81: 220000 },
    { i18n_key: '', label_en: 'Gas pipeline installation', label_zh: '高压管道架设', label_ar: 'تركيب خط الأنابيب', unit_price: null, qty_45: 100000, qty_81: 100000 },
    { i18n_key: '', label_en: 'Main controller', label_zh: '系统主控', label_ar: 'التحكم الرئيسي', unit_price: null, qty_45: 100000, qty_81: 140000 },
    { i18n_key: '', label_en: 'Hydroponic pipes', label_zh: '水培管道', label_ar: 'أنابيب هيدروبونية', unit_price: null, qty_45: 30000, qty_81: 45000 }
  ],
  materials_subtotal_45: 578929.50,
  materials_subtotal_81: 737073.10,

  // ─── Dynamic Consumables ───
  consumables: [
    // Part 1: Cultivation consumables
    { i18n_key: 'cons_item_basket', label_en: 'Planting basket', qty: 480000, unit_price: 0.30, total: 144000, note_key: 'cons_note_basket' },
    { i18n_key: 'cons_item_rockwool', label_en: 'Agricultural rock wool', qty: 620000, unit_price: 0.07, total: 43400, note_key: 'cons_note_rockwool' },
    { i18n_key: 'cons_item_sponge', label_en: 'Planting sponge', qty: 620000, unit_price: 0.20, total: 124000, note_key: 'cons_note_sponge' },
    { i18n_key: 'cons_item_nutrient', label_en: 'Nutrient solution (3+1+N)', qty: null, unit_price: 100000, total: 10000, note_key: 'cons_note_nutrient' }
  ],
  consumables_subtotal_1: 321400,

  // Part 2: Germination & seeds
  germination: [
    { i18n_key: 'cons_item_germ_arm', label_en: 'Seed placement robotic arm', qty: 1, unit_price: 20000, total: 20000, note_key: 'cons_note_germ_arm' },
    { i18n_key: 'cons_item_germ_box', label_en: 'Germination box & trays', qty: 4, unit_price: 5000, total: 20000, note_key: 'cons_note_germ_box' },
    { i18n_key: 'cons_item_seeds', label_en: 'Coffee seeds (annual)', qty: 620000, unit_price: 1.70, total: 1054000, note_key: 'cons_note_seeds' }
  ],
  germination_subtotal_2: 1094000,
  consumables_total: 1415400,

  // ─── Utilities ───
  utilities: {
    electricity: {
      compressor_kw: 110,
      cold_dryer_kw: 5,
      solenoid_valves_kw: 5,
      nutrient_pump_seedling_kw: 1.5,
      nutrient_pump_large_kw: 7.5,
      solenoid_nutrient_seedling_kw: 0.5,
      solenoid_nutrient_large_kw: 2,
      fertilizer_machine_kw: 3,
      total_compressor_electricity: 565194.24,
      nutrient_electricity_seedling: 27172.80,
      nutrient_electricity_large: 67932,
      total_electricity: 660299.04
    },
    water: {
      annual_budget: 5040,
      rate_per_m3: 7
    },
    total_utilities: 665339.04,
    per_seedling_cost: 1.065
  },

  // ─── Per-Seedling Cost Breakdown ───
  per_seedling: [
    { i18n_key: 'pt_item_shipping', label_en: 'Shipping', label_zh: '运费', label_ar: 'الشحن', cost: 2.00 },
    { i18n_key: 'pt_item_coir', label_en: 'Coir & packaging bag', label_zh: '椰糠与包装袋', label_ar: 'جوز الهند والتعبئة', cost: 0.50 },
    { i18n_key: 'pt_item_utilities', label_en: 'Water, electricity & nutrients', label_zh: '水电费与营养液', label_ar: 'المرافق والمغذيات', cost: 1.00 },
    { i18n_key: 'pt_item_seeds', label_en: 'Seeds', label_zh: '种子', label_ar: 'البذور', cost: 1.70 },
    { i18n_key: 'pt_item_depreciation', label_en: 'Equipment depreciation', label_zh: '设备成本回收', label_ar: 'إهلاك المعدات', cost: 1.064 },
    { i18n_key: 'pt_item_misc', label_en: 'Miscellaneous & labor', label_zh: '杂费与人工费', label_ar: 'متنوعة وعمالة', cost: 0.35 }
  ],
  per_seedling_total: 6.614,
  per_seedling_sale_price: 25,
  per_seedling_gross_profit: 18.386,
  gross_margin_pct: 73.54,

  // ─── ICO Climate Data ───
  ico_climate: {
    arable_land_decline_pct: 50,
    temp_rise_celsius: 2.4,
    livelihoods_at_risk_million: 125,
    arabica_loss_worst_case_pct: 72,
    arable_land_2020_mha: 12.4,
    arable_land_2035_mha: 8.9,
    arable_land_2050_mha: 6.2,
    net_loss_mha: 6.2,
    coffee_economy_billion_usd: 200
  },

  // ─── Comparison: Traditional vs Aeroponic ───
  comparison: [
    { metric_key: 'comp_land', trad_key: 'comp_trad_land', aero_key: 'comp_aero_land' },
    { metric_key: 'comp_cycle', trad_key: 'comp_trad_cycle', aero_key: 'comp_aero_cycle' },
    { metric_key: 'comp_density', trad_key: 'comp_trad_density', aero_key: 'comp_aero_density' },
    { metric_key: 'comp_water', trad_key: 'comp_trad_water', aero_key: 'comp_aero_water' },
    { metric_key: 'comp_climate', trad_key: 'comp_trad_climate', aero_key: 'comp_aero_climate' },
    { metric_key: 'comp_year_round', trad_key: 'comp_trad_year_round', aero_key: 'comp_aero_year_round' },
    { metric_key: 'comp_disease', trad_key: 'comp_trad_disease', aero_key: 'comp_aero_disease' },
    { metric_key: 'comp_scalability', trad_key: 'comp_trad_scalability', aero_key: 'comp_aero_scalability' }
  ],

  // ─── ICO Partnership Pillars ───
  ico_pillars: [
    { title_key: 'ico_partner_pillar_1', desc_key: 'ico_partner_pillar_1_desc', icon: '🔧' },
    { title_key: 'ico_partner_pillar_2', desc_key: 'ico_partner_pillar_2_desc', icon: '📊' },
    { title_key: 'ico_partner_pillar_3', desc_key: 'ico_partner_pillar_3_desc', icon: '🌱' },
    { title_key: 'ico_partner_pillar_4', desc_key: 'ico_partner_pillar_4_desc', icon: '🎓' }
  ],

  // ─── Implementation Roadmap ───
  roadmap: [
    { phase_key: 'ico_phase_1', desc_key: 'ico_phase_1_desc', status_key: 'ico_phase_1_status', status_type: 'active' },
    { phase_key: 'ico_phase_2', desc_key: 'ico_phase_2_desc', status_key: 'ico_phase_2_status', status_type: 'planning' },
    { phase_key: 'ico_phase_3', desc_key: 'ico_phase_3_desc', status_key: 'ico_phase_3_status', status_type: 'future' },
    { phase_key: 'ico_phase_4', desc_key: 'ico_phase_4_desc', status_key: 'ico_phase_4_status', status_type: 'future' }
  ],

  // ─── Value Chain Points ───
  value_points: [
    { title_key: 'vc_point_title_1', desc_key: 'vc_point_desc_1', icon: '🛡️' },
    { title_key: 'vc_point_title_2', desc_key: 'vc_point_desc_2', icon: '🌡️' },
    { title_key: 'vc_point_title_3', desc_key: 'vc_point_desc_3', icon: '🔗' },
    { title_key: 'vc_point_title_4', desc_key: 'vc_point_desc_4', icon: '🧩' },
    { title_key: 'vc_point_title_5', desc_key: 'vc_point_desc_5', icon: '💧' },
    { title_key: 'vc_point_title_6', desc_key: 'vc_point_desc_6', icon: '⚡' }
  ]
};
