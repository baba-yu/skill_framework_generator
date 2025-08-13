#!/usr/bin/env node

// scripts/build-dictionary.js
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { collectONETData } from './collect-onet-data.js'
import { collectIEEEData } from './collect-ieee-data.js'
import { collectBLSData } from './collect-bls-data.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 複数のソースから辞書を統合生成
 */

// 重複排除とマージ
const mergeAndDedupe = (arrays) => {
  const combined = arrays.flat()
  return [...new Set(combined.map(item => item.toLowerCase()))]
    .sort()
    .filter(item => item.length >= 2) // 2文字以上
}

// ストップワードの除去
const removeStopWords = (words) => {
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
  ])
  
  return words.filter(word => !stopWords.has(word.toLowerCase()))
}

// 品質チェック
const validateKeywords = (keywords) => {
  const issues = []
  
  Object.entries(keywords).forEach(([category, words]) => {
    if (!Array.isArray(words)) {
      issues.push(`${category} is not an array`)
      return
    }
    
    if (words.length === 0) {
      issues.push(`${category} is empty`)
    }
    
    // 重複チェック
    const uniqueWords = new Set(words)
    if (uniqueWords.size !== words.length) {
      issues.push(`${category} has ${words.length - uniqueWords.size} duplicates`)
    }
    
    // 長さチェック
    const shortWords = words.filter(word => word.length < 2)
    if (shortWords.length > 0) {
      issues.push(`${category} has ${shortWords.length} words shorter than 2 characters`)
    }
  })
  
  return issues
}

// 統計情報の生成
const generateStats = (keywords) => {
  const stats = {
    totalKeywords: 0,
    categories: {},
    topKeywords: {},
    timestamp: new Date().toISOString()
  }
  
  Object.entries(keywords).forEach(([category, words]) => {
    stats.categories[category] = words.length
    stats.totalKeywords += words.length
    
    // 各カテゴリのトップ10
    stats.topKeywords[category] = words.slice(0, 10)
  })
  
  return stats
}

// メイン処理
const buildDictionary = async () => {
  console.log('🚀 Starting dictionary build process...')
  console.log('=' .repeat(50))
  
  try {
    // 各ソースからデータを収集
    console.log('📡 Collecting data from multiple sources...\n')
    
    const [onetData, ieeeData, blsData] = await Promise.all([
      collectONETData(),
      collectIEEEData(), 
      collectBLSData()
    ])
    
    console.log('\n🔄 Merging and processing data...')
    
    // データを統合
    const mergedKeywords = {
      occupations: mergeAndDedupe([
        onetData.occupations,
        blsData.occupations,
        blsData.workTerms
      ]),
      
      technologies: mergeAndDedupe([
        onetData.technologies,
        ieeeData.technologies
      ]),
      
      industries: mergeAndDedupe([
        onetData.industries,
        blsData.industries
      ]),
      
      skills: removeStopWords(mergeAndDedupe([
        onetData.skills
      ])),
      
      tools: mergeAndDedupe([
        onetData.tools,
        // 追加のツール用語
        ['git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'google cloud',
         'linux', 'windows', 'macos', 'visual studio', 'intellij', 'eclipse',
         'photoshop', 'illustrator', 'figma', 'sketch', 'autocad', 'solidworks',
         'matlab', 'labview', 'simulink', 'excel', 'powerpoint', 'word', 'outlook',
         'slack', 'teams', 'zoom', 'jira', 'confluence', 'trello', 'asana']
      ])
    }
    
    // 品質チェック
    console.log('🔍 Validating keyword quality...')
    const validationIssues = validateKeywords(mergedKeywords)
    if (validationIssues.length > 0) {
      console.warn('⚠️  Validation issues found:')
      validationIssues.forEach(issue => console.warn(`   - ${issue}`))
    }
    
    // 統計情報の生成
    const stats = generateStats(mergedKeywords)
    
    // 出力ディレクトリを確保
    const outputDir = path.join(__dirname, '..', 'public', 'data')
    await fs.mkdir(outputDir, { recursive: true })
    
    // 辞書ファイルを出力
    const dictionaryPath = path.join(outputDir, 'keywords.json')
    await fs.writeFile(
      dictionaryPath, 
      JSON.stringify(mergedKeywords, null, 2),
      'utf8'
    )
    
    // 統計ファイルを出力
    const statsPath = path.join(outputDir, 'dictionary-stats.json')
    await fs.writeFile(
      statsPath,
      JSON.stringify(stats, null, 2),
      'utf8'
    )
    
    // メタデータファイルを出力
    const metadata = {
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      sources: ['O*NET', 'IEEE', 'BLS'],
      totalKeywords: stats.totalKeywords,
      categories: Object.keys(mergedKeywords),
      buildInfo: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }
    
    const metadataPath = path.join(outputDir, 'dictionary-metadata.json')
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf8'
    )
    
    // 結果報告
    console.log('\n✅ Dictionary build completed successfully!')
    console.log('=' .repeat(50))
    console.log('📊 Final Statistics:')
    console.log(`   Total Keywords: ${stats.totalKeywords}`)
    Object.entries(stats.categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} keywords`)
    })
    
    console.log('\n📁 Generated Files:')
    console.log(`   📄 ${path.relative(process.cwd(), dictionaryPath)}`)
    console.log(`   📈 ${path.relative(process.cwd(), statsPath)}`)
    console.log(`   📋 ${path.relative(process.cwd(), metadataPath)}`)
    
    console.log('\n🎉 Dictionary is ready for use!')
    
  } catch (error) {
    console.error('❌ Dictionary build failed:')
    console.error(error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
  buildDictionary()
}

export { buildDictionary }