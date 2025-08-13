import { ref, computed } from 'vue'

interface KeywordDictionary {
  occupations: string[]
  technologies: string[]
  industries: string[]
  skills: string[]
  tools: string[]
}

export const useKeywordSuggestions = () => {
  const keywords = ref<KeywordDictionary>({
    occupations: [],
    technologies: [],
    industries: [],
    skills: [],
    tools: []
  })
  
  const isLoaded = ref(false)
  const isLoading = ref(false)

  // 辞書を読み込み
  const loadKeywords = async () => {
    if (isLoaded.value || isLoading.value) return
    
    isLoading.value = true
    try {
      const response = await fetch('/data/keywords.json')
      if (response.ok) {
        keywords.value = await response.json()
        isLoaded.value = true
      }
    } catch (error) {
      console.warn('Failed to load keyword dictionary:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 全キーワードをフラットな配列に
  const allKeywords = computed(() => {
    if (!isLoaded.value) return []
    
    return [
      ...keywords.value.occupations,
      ...keywords.value.technologies,
      ...keywords.value.industries,
      ...keywords.value.skills,
      ...keywords.value.tools
    ]
  })

  // 入力に基づいて候補を取得
  const getSuggestions = (input: string, maxResults = 8) => {
    if (!input.trim() || !isLoaded.value) return []
    
    const query = input.toLowerCase().trim()
    const suggestions = new Set<string>()

    // 前方一致を優先
    allKeywords.value.forEach(keyword => {
      if (keyword.toLowerCase().startsWith(query)) {
        suggestions.add(keyword)
      }
    })

    // 部分一致を追加（前方一致で埋まらない場合）
    if (suggestions.size < maxResults) {
      allKeywords.value.forEach(keyword => {
        if (!keyword.toLowerCase().startsWith(query) && 
            keyword.toLowerCase().includes(query)) {
          suggestions.add(keyword)
        }
      })
    }

    return Array.from(suggestions).slice(0, maxResults)
  }

  // カテゴリ別の候補取得
  const getSuggestionsByCategory = (input: string, maxPerCategory = 3) => {
    if (!input.trim() || !isLoaded.value) return {}
    
    const query = input.toLowerCase().trim()
    const result: Record<string, string[]> = {}

    Object.entries(keywords.value).forEach(([category, words]) => {
      const matches = words
        .filter(word => word.toLowerCase().includes(query))
        .slice(0, maxPerCategory)
      
      if (matches.length > 0) {
        result[category] = matches
      }
    })

    return result
  }

  return {
    keywords: keywords.value,
    isLoaded,
    isLoading,
    loadKeywords,
    getSuggestions,
    getSuggestionsByCategory
  }
}