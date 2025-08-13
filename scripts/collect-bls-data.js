// scripts/collect-bls-data.js

/**
 * Bureau of Labor Statistics (BLS) から職業データを収集
 */

// BLS Standard Occupational Classification (SOC) の主要職業群
const BLS_OCCUPATION_GROUPS = {
    'Computer and Mathematical': [
      'computer systems analyst', 'information security analyst', 'computer programmer',
      'software developer', 'web developer', 'database administrator', 'network administrator',
      'computer support specialist', 'computer user support specialist',
      'data scientist', 'statistician', 'mathematician', 'operations research analyst'
    ],
    
    'Engineering': [
      'aerospace engineer', 'agricultural engineer', 'biomedical engineer',
      'chemical engineer', 'civil engineer', 'computer hardware engineer',
      'electrical engineer', 'electronics engineer', 'environmental engineer',
      'industrial engineer', 'marine engineer', 'materials engineer',
      'mechanical engineer', 'mining engineer', 'nuclear engineer',
      'petroleum engineer', 'mechatronics engineer'
    ],
    
    'Engineering Technicians': [
      'aerospace engineering technician', 'civil engineering technician',
      'electrical engineering technician', 'electronics engineering technician',
      'environmental engineering technician', 'industrial engineering technician',
      'mechanical engineering technician', 'surveying technician'
    ],
    
    'Life, Physical, and Social Science': [
      'biochemist', 'biophysicist', 'chemist', 'materials scientist',
      'physicist', 'astronomer', 'atmospheric scientist', 'geoscientist',
      'hydrologist', 'psychologist', 'economist', 'market research analyst'
    ],
    
    'Management': [
      'chief executive', 'general manager', 'operations manager',
      'project manager', 'engineering manager', 'it manager',
      'construction manager', 'industrial production manager',
      'quality control manager', 'research and development manager'
    ],
    
    'Sales and Related': [
      'sales engineer', 'technical sales representative',
      'software sales specialist', 'equipment sales representative'
    ],
    
    'Installation, Maintenance, and Repair': [
      'computer repair technician', 'telecommunications technician',
      'electrical technician', 'electronics technician', 'mechanic',
      'industrial machinery mechanic', 'maintenance technician',
      'instrumentation technician', 'automation technician'
    ]
  }
  
  // 業界別分類 (NAICS準拠)
  const INDUSTRY_SECTORS = {
    'Manufacturing': [
      'automotive manufacturing', 'aerospace manufacturing', 'electronics manufacturing',
      'semiconductor manufacturing', 'chemical manufacturing', 'pharmaceutical manufacturing',
      'food manufacturing', 'textile manufacturing', 'machinery manufacturing',
      'computer and electronic product manufacturing'
    ],
    
    'Information Technology': [
      'software publishing', 'computer systems design', 'data processing services',
      'web hosting', 'telecommunications', 'internet service providers',
      'computer training', 'it consulting'
    ],
    
    'Professional Services': [
      'engineering services', 'architectural services', 'scientific research',
      'testing laboratories', 'management consulting', 'technical consulting'
    ],
    
    'Healthcare': [
      'medical device manufacturing', 'pharmaceutical research',
      'biotechnology', 'medical equipment repair', 'health information technology'
    ],
    
    'Energy': [
      'oil and gas extraction', 'renewable energy', 'electric power generation',
      'nuclear power', 'solar energy', 'wind energy', 'energy storage'
    ],
    
    'Transportation': [
      'aerospace', 'automotive', 'railway', 'maritime', 'logistics',
      'supply chain management', 'freight transportation'
    ]
  }
  
  // 職業レベル/教育要件
  const OCCUPATION_LEVELS = {
    'Entry Level': [
      'technician', 'operator', 'assistant', 'apprentice', 'trainee'
    ],
    
    'Mid Level': [
      'specialist', 'analyst', 'coordinator', 'supervisor', 'lead'
    ],
    
    'Senior Level': [
      'engineer', 'scientist', 'manager', 'director', 'principal',
      'senior', 'chief', 'architect', 'consultant'
    ],
    
    'Executive Level': [
      'vice president', 'president', 'ceo', 'cto', 'cio', 'executive'
    ]
  }
  
  // 職場環境・働き方
  const WORK_ENVIRONMENTS = [
    'office', 'laboratory', 'manufacturing plant', 'field work', 'remote work',
    'hybrid work', 'construction site', 'research facility', 'clean room',
    'server room', 'control room', 'workshop', 'studio'
  ]
  
  // 収集処理
  const collectBLSData = async () => {
    console.log('📊 Collecting BLS occupation data...')
    
    const occupations = []
    const industries = []
    const workTerms = []
    
    // 職業データを収集
    Object.values(BLS_OCCUPATION_GROUPS).forEach(jobs => {
      occupations.push(...jobs)
    })
    
    // 業界データを収集
    Object.values(INDUSTRY_SECTORS).forEach(sectors => {
      industries.push(...sectors)
    })
    
    // 職業レベル用語を収集
    Object.values(OCCUPATION_LEVELS).forEach(levels => {
      workTerms.push(...levels)
    })
    
    // 職場環境用語を追加
    workTerms.push(...WORK_ENVIRONMENTS)
    
    console.log(`👔 Collected ${occupations.length} occupation titles`)
    console.log(`🏭 Collected ${industries.length} industry terms`)
    console.log(`💼 Collected ${workTerms.length} work-related terms`)
    
    return {
      occupations: [...new Set(occupations)].sort(),
      industries: [...new Set(industries)].sort(),
      workTerms: [...new Set(workTerms)].sort(),
      categories: {
        occupationGroups: BLS_OCCUPATION_GROUPS,
        industrySectors: INDUSTRY_SECTORS,
        occupationLevels: OCCUPATION_LEVELS
      }
    }
  }
  
  // 特定の職業群から用語を取得
  const getOccupationsByGroup = (group) => {
    return BLS_OCCUPATION_GROUPS[group] || []
  }
  
  // 特定の業界から用語を取得
  const getIndustriesBySector = (sector) => {
    return INDUSTRY_SECTORS[sector] || []
  }
  
  // 職業レベル別用語を取得
  const getTermsByLevel = (level) => {
    return OCCUPATION_LEVELS[level] || []
  }
  
  export { 
    collectBLSData, 
    getOccupationsByGroup, 
    getIndustriesBySector, 
    getTermsByLevel,
    BLS_OCCUPATION_GROUPS,
    INDUSTRY_SECTORS 
  }