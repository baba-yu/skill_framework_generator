// scripts/collect-ieee-data.js

/**
 * IEEE技術分野から専門用語を収集
 */

// IEEE分類に基づく技術用語
const IEEE_TECHNOLOGY_TERMS = {
    // Computer Science & Engineering
    'Computer Science': [
      'algorithms', 'data structures', 'artificial intelligence', 'machine learning',
      'deep learning', 'neural networks', 'computer vision', 'natural language processing',
      'robotics', 'human-computer interaction', 'software engineering', 'programming languages',
      'compilers', 'operating systems', 'distributed systems', 'database systems',
      'cybersecurity', 'cryptography', 'blockchain', 'quantum computing'
    ],
    
    // Electrical & Electronics Engineering
    'Electrical Engineering': [
      'circuit design', 'analog circuits', 'digital circuits', 'microelectronics',
      'vlsi design', 'signal processing', 'digital signal processing', 'image processing',
      'control systems', 'power systems', 'renewable energy', 'smart grid',
      'electric vehicles', 'power electronics', 'motor control', 'sensors',
      'actuators', 'embedded systems', 'fpga', 'microcontrollers'
    ],
    
    // Communications & Networking
    'Communications': [
      'wireless communications', '5g', '6g', 'cellular networks', 'wifi', 'bluetooth',
      'satellite communications', 'optical communications', 'fiber optics',
      'network protocols', 'internet of things', 'edge computing', 'cloud computing',
      'network security', 'software defined networking', 'network function virtualization'
    ],
    
    // Automation & Control
    'Automation': [
      'industrial automation', 'process control', 'plc programming', 'scada systems',
      'hmi design', 'robotics', 'autonomous systems', 'machine vision',
      'motion control', 'servo systems', 'pid control', 'fuzzy logic',
      'adaptive control', 'predictive control', 'model predictive control'
    ],
    
    // Manufacturing & Production
    'Manufacturing': [
      'computer integrated manufacturing', 'flexible manufacturing systems',
      'lean manufacturing', 'six sigma', 'total quality management',
      'statistical process control', 'supply chain management', 'erp systems',
      'mes systems', 'digital twin', 'industry 4.0', 'smart manufacturing',
      '3d printing', 'additive manufacturing', 'cnc machining'
    ],
    
    // Data & Analytics
    'Data Science': [
      'big data', 'data mining', 'data analytics', 'business intelligence',
      'predictive analytics', 'statistical analysis', 'data visualization',
      'data warehousing', 'etl processes', 'apache spark', 'hadoop',
      'nosql databases', 'time series analysis', 'anomaly detection'
    ],
    
    // Emerging Technologies
    'Emerging Tech': [
      'augmented reality', 'virtual reality', 'mixed reality', 'digital twins',
      'edge ai', 'federated learning', 'explainable ai', 'quantum machine learning',
      'neuromorphic computing', 'bio-inspired computing', 'swarm intelligence',
      'cyber-physical systems', 'smart cities', 'connected vehicles'
    ]
  }
  
  // プログラミング言語とフレームワーク
  const PROGRAMMING_TECHNOLOGIES = {
    'Languages': [
      'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'c',
      'golang', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab',
      'sql', 'php', 'ruby', 'perl', 'shell scripting', 'powershell'
    ],
    
    'Frameworks': [
      'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'opencv', 'ros',
      'react', 'vue.js', 'angular', 'node.js', 'express.js', 'django',
      'flask', 'spring boot', 'laravel', '.net', 'xamarin', 'flutter'
    ],
    
    'Tools': [
      'git', 'docker', 'kubernetes', 'jenkins', 'ansible', 'terraform',
      'aws', 'azure', 'google cloud', 'linux', 'ubuntu', 'windows server',
      'vmware', 'virtualbox', 'vagrant', 'nginx', 'apache', 'elasticsearch'
    ]
  }
  
  // IEEE標準規格関連
  const IEEE_STANDARDS = [
    'ieee 802.11', 'ieee 802.3', 'ieee 1588', 'ieee 754', 'ieee 1149.1',
    'ieee 1500', 'ieee 1687', 'ieee 829', 'ieee 830', 'ieee 1012',
    'ieee 1471', 'ieee 1516', 'ieee 1588', 'ieee 1149', 'ieee 1394'
  ]
  
  // 収集処理
  const collectIEEEData = async () => {
    console.log('🔬 Collecting IEEE technology terms...')
    
    const technologies = []
    
    // IEEE技術分野から収集
    Object.values(IEEE_TECHNOLOGY_TERMS).forEach(terms => {
      technologies.push(...terms)
    })
    
    // プログラミング技術から収集
    Object.values(PROGRAMMING_TECHNOLOGIES).forEach(terms => {
      technologies.push(...terms)
    })
    
    // IEEE標準規格
    technologies.push(...IEEE_STANDARDS)
    
    // 重複排除とソート
    const uniqueTechnologies = [...new Set(technologies)].sort()
    
    console.log(`📡 Collected ${uniqueTechnologies.length} IEEE technology terms`)
    
    return {
      technologies: uniqueTechnologies,
      categories: IEEE_TECHNOLOGY_TERMS
    }
  }
  
  // 技術分野別の専門用語を取得
  const getTechnologiesByCategory = (category) => {
    return IEEE_TECHNOLOGY_TERMS[category] || []
  }
  
  // プログラミング関連技術を取得
  const getProgrammingTechnologies = () => {
    return PROGRAMMING_TECHNOLOGIES
  }
  
  export { 
    collectIEEEData, 
    getTechnologiesByCategory, 
    getProgrammingTechnologies,
    IEEE_TECHNOLOGY_TERMS 
  }