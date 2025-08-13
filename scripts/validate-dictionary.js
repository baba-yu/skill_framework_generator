#!/usr/bin/env node

// scripts/validate-dictionary.js
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 辞書ファイルの品質検証
 */

const validateDictionary = async () => {
  console.log('🔍 Validating dictionary...')
  
  try {
    const dictionaryPath = path.join(__dirname, '..', 'public', 'data', 'keywords.json')
    const content = await fs.readFile(dictionaryPath, 'utf8')
    const dictionary = JSON.parse(content)
    
    const issues = []
    const warnings = []
    const stats = {
      totalKeywords: 0,
      categories: {}
    }
    
    // 基本構造チェック
    const expectedCategories = ['occupations', 'technologies', 'industries', 'skills', 'tools']
    
    expectedCategories.forEach(category => {
      if (!dictionary[category]) {
        issues.push(`Missing category: ${category}`)
        return
      }
      
      if (!Array.isArray(dictionary[category])) {
        issues.push(`Category ${category} is not an array`)
        return
      }
      
      const keywords = dictionary[category]
      stats.categories[category] = keywords.length
      stats.totalKeywords += keywords.length
      
      // カテゴリ別検証
      if (keywords.length === 0) {
        warnings.push(`Category ${category} is empty`)
      }
      
      if (keywords.length < 5) {
        warnings.push(`Category ${category} has very few keywords (${keywords.length})`)
      }
      
      // 重複チェック
      const uniqueKeywords = new Set(keywords)
      if (uniqueKeywords.size !== keywords.length) {
        issues.push(`Category ${category} has ${keywords.length - uniqueKeywords.size} duplicate keywords`)
      }
      
      // 品質チェック
      keywords.forEach((keyword, index) => {
        if (typeof keyword !== 'string') {
          issues.push(`Category ${category}[${index}] is not a string: ${typeof keyword}`)
        }
        
        if (keyword.length < 2) {
          warnings.push(`Category ${category}[${index}] is too short: "${keyword}"`)
        }
        
        if (keyword.length > 50) {
          warnings.push(`Category ${category}[${index}] is very long: "${keyword}"`)
        }
        
        if (keyword !== keyword.toLowerCase()) {
          warnings.push(`Category ${category}[${index}] is not lowercase: "${keyword}"`)
        }
        
        if (keyword.includes('  ')) {
          warnings.push(`Category ${category}[${index}] has multiple spaces: "${keyword}"`)
        }
        
        if (keyword.startsWith(' ') || keyword.endsWith(' ')) {
          warnings.push(`Category ${category}[${index}] has leading/trailing space: "${keyword}"`)
        }
      })
      
      // ソート順チェック
      const sortedKeywords = [...keywords].sort()
      const isUnsorted = keywords.some((keyword, index) => keyword !== sortedKeywords[index])
      if (isUnsorted) {
        warnings.push(`Category ${category} is not sorted alphabetically`)
      }
    })
    
    // 全体的な品質指標
    if (stats.totalKeywords < 100) {
      warnings.push(`Total keywords count is low: ${stats.totalKeywords}`)
    }
    
    if (stats.totalKeywords > 10000) {
      warnings.push(`Total keywords count is very high: ${stats.totalKeywords}`)
    }
    
    // レポート出力
    console.log('\n📊 Dictionary Statistics:')
    console.log(`   Total Keywords: ${stats.totalKeywords}`)
    Object.entries(stats.categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`)
    })
    
    if (issues.length > 0) {
      console.log('\n❌ Critical Issues Found:')
      issues.forEach(issue => console.log(`   • ${issue}`))
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      warnings.forEach(warning => console.log(`   • ${warning}`))
    }
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('\n✅ Dictionary validation passed! No issues found.')
    } else if (issues.length === 0) {
      console.log('\n✅ Dictionary validation passed with warnings.')
    } else {
      console.log('\n❌ Dictionary validation failed.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Validation failed:')
    console.error(error.message)
    process.exit(1)
  }
}

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
  validateDictionary()
}

export { validateDictionary }