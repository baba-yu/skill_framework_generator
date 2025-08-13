// scripts/collect-onet-data.js
import fs from 'fs/promises'
import path from 'path'

/**
 * O*NET データから職業関連キーワードを収集
 */

// O*NET SOC コードの一部（実際はもっと多い）
const ONET_SOC_CODES = [
  '15-1132.00', // Software Developers, Applications
  '15-1134.00', // Web Developers
  '15-1142.00', // Network and Computer Systems Administrators
  '15-1199.02', // Computer Systems Engineers/Architects
  '17-2011.00', // Aerospace Engineers
  '17-2051.00', // Civil Engineers
  '17-2061.00', // Computer Hardware Engineers
  '17-2071.00', // Electrical Engineers
  '17-2072.00', // Electronics Engineers
  '17-2081.00', // Environmental Engineers
  '17-2112.00', // Industrial Engineers
  '17-2131.00', // Materials Engineers
  '17-2141.00', // Mechanical Engineers
  '17-2199.05', // Mechatronics Engineers
  '17-3023.01', // Electronics Engineering Technicians
  '17-3026.00', // Industrial Engineering Technicians
  '49-2011.00', // Computer, Automated Teller, and Office Machine Repairers
  '49-2094.00', // Electrical and Electronics Repairers
  '49-9041.00', // Industrial Machinery Mechanics
  '49-9044.00', // Millwrights
  '49-9051.00', // Electrical Power-Line Installers and Repairers
  '11-3051.00', // Industrial Production Managers
  '13-1081.00', // Logisticians
  '15-1211.00', // Computer Systems Analysts
  '27-1014.00'  // Multimedia Artists and Animators
]

// 職業タイトルから関連キーワードを抽出
const extractOccupationKeywords = (occupations) => {
  const keywords = new Set()
  
  occupations.forEach(occupation => {
    // タイトルを単語に分割
    const words = occupation.title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // 記号を空白に置換
      .split(/\s+/)
      .filter(word => word.length >= 3) // 3文字以上
      .filter(word => !['the', 'and', 'for', 'with', 'from'].includes(word)) // ストップワード除去
    
    words.forEach(word => keywords.add(word))
    
    // 複合語も追加
    const title = occupation.title.toLowerCase()
    if (title.includes('engineer')) keywords.add('engineering')
    if (title.includes('technician')) keywords.add('technical')
    if (title.includes('developer')) keywords.add('development')
    if (title.includes('analyst')) keywords.add('analysis')
    if (title.includes('manager')) keywords.add('management')
  })
  
  return Array.from(keywords).sort()
}

// 技術・スキル関連のキーワードを抽出
const extractTechnologyKeywords = () => {
  return [
    // プログラミング言語
    'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
    'typescript', 'kotlin', 'scala', 'perl', 'r', 'matlab', 'sql', 'html', 'css',
    
    // フレームワーク・ライブラリ
    'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask', 'spring',
    'laravel', 'rails', 'tensorflow', 'pytorch', 'opencv', 'pandas', 'numpy',
    
    // 技術分野
    'artificial intelligence', 'machine learning', 'deep learning', 'computer vision',
    'natural language processing', 'robotics', 'automation', 'iot', 'blockchain',
    'cybersecurity', 'cloud computing', 'big data', 'data science', 'analytics',
    'web development', 'mobile development', 'game development', 'devops',
    
    // ツール・プラットフォーム
    'aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'git',
    'github', 'gitlab', 'jira', 'confluence', 'slack', 'teams',
    
    // データベース
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle',
    
    // エンジニアリング
    'cad', 'autocad', 'solidworks', 'catia', 'ansys', 'labview', 'simulink',
    'plc', 'scada', 'hmi', 'cnc', '3d printing', 'lean manufacturing', 'six sigma'
  ]
}

// 業界関連のキーワードを抽出
const extractIndustryKeywords = () => {
  return [
    'aerospace', 'automotive', 'manufacturing', 'healthcare', 'pharmaceutical',
    'biotechnology', 'telecommunications', 'energy', 'renewable energy', 'oil and gas',
    'finance', 'banking', 'insurance', 'retail', 'e-commerce', 'logistics',
    'transportation', 'construction', 'real estate', 'education', 'government',
    'defense', 'entertainment', 'gaming', 'media', 'advertising', 'consulting',
    'agriculture', 'food processing', 'textiles', 'chemicals', 'mining',
    'utilities', 'waste management', 'environmental', 'maritime', 'aviation'
  ]
}

// スキル関連のキーワードを抽出
const extractSkillKeywords = () => {
  return [
    // 技術スキル
    'programming', 'coding', 'software development', 'web development', 'database design',
    'system administration', 'network administration', 'cybersecurity', 'data analysis',
    'machine learning', 'artificial intelligence', 'robotics', 'automation',
    
    // エンジニアリングスキル
    'design', 'modeling', 'simulation', 'testing', 'validation', 'troubleshooting',
    'debugging', 'optimization', 'integration', 'installation', 'maintenance',
    'repair', 'calibration', 'inspection', 'quality control', 'quality assurance',
    
    // ソフトスキル
    'project management', 'team leadership', 'communication', 'problem solving',
    'critical thinking', 'analytical thinking', 'creativity', 'innovation',
    'collaboration', 'teamwork', 'mentoring', 'training', 'documentation',
    'presentation', 'negotiation', 'customer service', 'sales', 'marketing',
    
    // 業務スキル
    'planning', 'scheduling', 'budgeting', 'cost estimation', 'risk management',
    'compliance', 'regulatory', 'safety', 'environmental', 'sustainability',
    'continuous improvement', 'process optimization', 'lean', 'agile', 'scrum'
  ]
}

// メイン処理
const collectONETData = async () => {
  console.log('🔍 Collecting O*NET occupation data...')
  
  // 実際のAPIアクセスの代わりに、サンプルデータを生成
  // 本番では O*NET API を呼び出す
  const occupations = ONET_SOC_CODES.map(code => ({
    code,
    title: getOccupationTitle(code),
    description: `Description for ${getOccupationTitle(code)}`
  }))
  
  console.log(`📊 Found ${occupations.length} occupations`)
  
  const keywords = {
    occupations: extractOccupationKeywords(occupations),
    technologies: extractTechnologyKeywords(),
    industries: extractIndustryKeywords(),
    skills: extractSkillKeywords(),
    tools: [] // 後で他のソースから追加
  }
  
  console.log('📈 Keyword counts:')
  Object.entries(keywords).forEach(([category, words]) => {
    console.log(`  ${category}: ${words.length} keywords`)
  })
  
  return keywords
}

// O*NET SOCコードから職業名を取得（簡易版）
const getOccupationTitle = (code) => {
  const titles = {
    '15-1132.00': 'Software Developers, Applications',
    '15-1134.00': 'Web Developers',
    '15-1142.00': 'Network and Computer Systems Administrators',
    '15-1199.02': 'Computer Systems Engineers/Architects',
    '17-2011.00': 'Aerospace Engineers',
    '17-2051.00': 'Civil Engineers',
    '17-2061.00': 'Computer Hardware Engineers',
    '17-2071.00': 'Electrical Engineers',
    '17-2072.00': 'Electronics Engineers',
    '17-2081.00': 'Environmental Engineers',
    '17-2112.00': 'Industrial Engineers',
    '17-2131.00': 'Materials Engineers',
    '17-2141.00': 'Mechanical Engineers',
    '17-2199.05': 'Mechatronics Engineers',
    '17-3023.01': 'Electronics Engineering Technicians',
    '17-3026.00': 'Industrial Engineering Technicians',
    '49-2011.00': 'Computer, Automated Teller, and Office Machine Repairers',
    '49-2094.00': 'Electrical and Electronics Repairers',
    '49-9041.00': 'Industrial Machinery Mechanics',
    '49-9044.00': 'Millwrights',
    '49-9051.00': 'Electrical Power-Line Installers and Repairers',
    '11-3051.00': 'Industrial Production Managers',
    '13-1081.00': 'Logisticians',
    '15-1211.00': 'Computer Systems Analysts',
    '27-1014.00': 'Multimedia Artists and Animators'
  }
  return titles[code] || 'Unknown Occupation'
}

export { collectONETData }