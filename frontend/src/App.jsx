import React, { useState, useEffect, useMemo, useCallback } from 'react'
import data from './dramas.json'
import { saveAs } from 'file-saver'

// ==================== 常量 ====================
const SORT_OPTIONS = [
  { value: 'heat-desc', label: '热度 ↓' },
  { value: 'heat-asc', label: '热度 ↑' },
  { value: 'price-desc', label: '价格 ↓' },
  { value: 'price-asc', label: '价格 ↑' },
  { value: 'episodes-desc', label: '集数 ↓' },
  { value: 'episodes-asc', label: '集数 ↑' },
]

const PRICE_OPTIONS = [
  { value: '4000', label: '¥4,000', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: '20000', label: '¥20,000', color: 'bg-orange-100 text-orange-700 border-orange-200' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: '全部' },
  { value: '男频', label: '男频' },
  { value: '女频', label: '女频' },
]

// ==================== 图标组件 ====================
const FlameIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11zm0-2.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17z" opacity=".3"/>
    <path d="M12 3.5c.5 2.5 2 4.5 4 6.5 2 2 3 4.5 3 7.5 0 .5-.1 1-.2 1.5-.3-3-1.5-5.5-3.8-7.5-2.3-2-3.5-4.5-3.5-7.5V3.5z"/>
  </svg>
)

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const CartIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 004 0z" />
  </svg>
)

const FilterIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
)

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const ChevronUpIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const MinusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

// ==================== 子组件 ====================

// 剧卡片
function DramaCard({ drama, inCart, onToggleCart, onShowDetail }) {
  const is4000 = drama.priceTier === '4000'
  const priceLabel = is4000 ? '¥4,000' : '¥20,000'
  const priceColor = is4000 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'

  const heatColor = (heat) => {
    if (heat >= 1000) return 'bg-red-50 text-red-700 border-red-100'
    if (heat >= 500) return 'bg-orange-50 text-orange-700 border-orange-100'
    if (heat > 0) return 'bg-yellow-50 text-yellow-700 border-yellow-100'
    return 'bg-gray-50 text-gray-400 border-gray-100'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        {/* 顶部信息 */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">{drama.name}</h3>
          </div>
        </div>

        {/* 标签行 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priceColor}`}>
            {priceLabel}
          </span>
          {drama.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
              {drama.category}
            </span>
          )}
          {drama.heat > 0 && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${heatColor(drama.heat)}`}>
              <FlameIcon className="w-3 h-3 mr-1" />
              {drama.heat}万
            </span>
          )}
        </div>

        {/* 元信息 */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {drama.episodes && <span>{drama.episodes}集</span>}
          {drama.duration && <span>{drama.duration}</span>}
          {drama.launchDate && <span>{drama.launchDate}</span>}
        </div>

        {/* 标签 */}
        {drama.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {drama.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                {tag}
              </span>
            ))}
            {drama.tags.length > 4 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">+{drama.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* 简介 */}
        <div className="text-sm text-gray-600 mb-4 flex-1">
          <p className="line-clamp-3">{drama.intro || '暂无简介'}</p>
          {drama.intro && drama.intro.length > 60 && (
            <button
              onClick={() => onShowDetail(drama)}
              className="text-blue-600 text-xs mt-1 hover:underline"
            >
              展开
            </button>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50">
          <button
            onClick={() => onToggleCart(drama.id)}
            title={inCart ? '从购物车移除' : '加入购物车'}
            className={`p-2.5 rounded-lg transition-colors ${
              inCart
                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {inCart ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
          </button>
          {drama.link ? (
            <a
              href={drama.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors"
            >
              看样片
            </a>
          ) : (
            <span className="px-3 py-2 text-sm text-gray-300 border border-gray-100 rounded-lg select-none">
              暂无样片
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// 购物车列表项
function CartItem({ drama, onRemove }) {
  const is4000 = drama.priceTier === '4000'
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{drama.name}</p>
        <p className={`text-xs font-medium ${is4000 ? 'text-blue-600' : 'text-orange-600'}`}>
          {is4000 ? '¥4,000' : '¥20,000'}
        </p>
      </div>
      <button
        onClick={() => onRemove(drama.id)}
        className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors shrink-0"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

// ==================== 主应用 ====================
export default function App() {
  // 数据
  const { dramas, meta } = data

  // 状态
  const [selectedTiers, setSelectedTiers] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [heatMin, setHeatMin] = useState('')
  const [heatMax, setHeatMax] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('heat-desc')
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('drama-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [detailDrama, setDetailDrama] = useState(null)

  // 持久化购物车
  useEffect(() => {
    localStorage.setItem('drama-cart', JSON.stringify(cart))
  }, [cart])

  // 购物车操作
  const toggleCart = (id) => {
    setCart(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      }
      return [...prev, id]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  // 筛选逻辑
  const filteredDramas = useMemo(() => {
    let result = [...dramas]

    // 价格档位筛选
    if (selectedTiers.length > 0) {
      result = result.filter(d => selectedTiers.includes(d.priceTier))
    }

    // 男频/女频筛选
    if (selectedCategory) {
      result = result.filter(d => d.category === selectedCategory)
    }

    // 标签筛选
    if (selectedTags.length > 0) {
      result = result.filter(d => selectedTags.some(tag => d.tags.includes(tag)))
    }

    // 热度区间筛选（开区间）
    const min = heatMin !== '' ? parseFloat(heatMin) : null
    const max = heatMax !== '' ? parseFloat(heatMax) : null
    if (min !== null || max !== null) {
      result = result.filter(d => {
        const heat = d.heat
        if (min !== null && heat < min) return false
        if (max !== null && heat > max) return false
        return true
      })
    }

    // 搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(d => d.name.toLowerCase().includes(query))
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'heat-desc':
          return b.heat - a.heat
        case 'heat-asc':
          return a.heat - b.heat
        case 'price-desc':
          return b.price - a.price
        case 'price-asc':
          return a.price - b.price
        case 'episodes-desc': {
          const ea = parseInt(a.episodes) || 0
          const eb = parseInt(b.episodes) || 0
          return eb - ea
        }
        case 'episodes-asc': {
          const ea = parseInt(a.episodes) || 0
          const eb = parseInt(b.episodes) || 0
          return ea - eb
        }
        default:
          return 0
      }
    })

    return result
  }, [dramas, selectedTiers, selectedCategory, selectedTags, heatMin, heatMax, searchQuery, sortBy])

  // 购物车数据
  const cartItems = useMemo(() => {
    return cart.map(id => dramas.find(d => d.id === id)).filter(Boolean)
  }, [cart, dramas])

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const cartCount = cartItems.length

  // 导出 CSV
  const exportCSV = useCallback(() => {
    if (cartItems.length === 0) return

    const BOM = '\uFEFF'
    const headers = ['序号', '剧名', '集数', '分类', '标签', '价格档位', '热度', '简介']
    const rows = cartItems.map((d, i) => [
      i + 1,
      `"${d.name.replace(/"/g, '""')}"`,
      d.episodes || '',
      d.category || '',
      `"${d.tags.join('、')}"`,
      d.price === 4000 ? '¥4,000' : '¥20,000',
      d.heat > 0 ? `${d.heat}万` : '',
      `"${(d.intro || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`,
    ])

    const csv = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const date = new Date().toISOString().slice(0, 10)
    saveAs(blob, `短剧选购清单_${date}.csv`)
  }, [cartItems])

  // 标签操作
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // 清空筛选
  const clearFilters = () => {
    setSelectedTiers([])
    setSelectedCategory('')
    setSelectedTags([])
    setHeatMin('')
    setHeatMax('')
    setSearchQuery('')
  }

  const hasFilters = selectedTiers.length > 0 || selectedCategory || selectedTags.length > 0 || heatMin !== '' || heatMax !== '' || searchQuery !== ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-gray-900">短剧选购平台</h1>

            {/* 搜索栏 - 桌面端 */}
            <div className="hidden sm:flex items-center flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索剧名..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 右侧操作 */}
            <div className="flex items-center gap-2">
              {/* 排序下拉 - 桌面端 */}
              <div className="hidden sm:block relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* 移动端筛选按钮 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <FilterIcon className="w-5 h-5" />
                {hasFilters && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </button>

              {/* 购物车按钮 - 桌面端 */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CartIcon className="w-4 h-4" />
                <span>购物车</span>
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 搜索栏 - 移动端 */}
          <div className="sm:hidden pb-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索剧名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 移动端筛选面板 */}
      {showFilters && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">筛选</h2>
                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              <FilterContent
                selectedTiers={selectedTiers}
                setSelectedTiers={setSelectedTiers}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                heatMin={heatMin}
                setHeatMin={setHeatMin}
                heatMax={heatMax}
                setHeatMax={setHeatMax}
                tags={meta.tags}
                onClear={clearFilters}
              />
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* 左侧筛选 - 桌面端 */}
          <aside className="hidden sm:block w-64 shrink-0">
            <div className="sticky top-20">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">筛选条件</h2>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                      清空
                    </button>
                  )}
                </div>
                <FilterContent
                  selectedTiers={selectedTiers}
                  setSelectedTiers={setSelectedTiers}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                  heatMin={heatMin}
                  setHeatMin={setHeatMin}
                  heatMax={heatMax}
                  setHeatMax={setHeatMax}
                  tags={meta.tags}
                />
              </div>
            </div>
          </aside>

          {/* 剧列表 */}
          <main className="flex-1 min-w-0">
            {/* 结果统计 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                共 <span className="font-medium text-gray-900">{filteredDramas.length}</span> 部剧
                {cartCount > 0 && (
                  <span className="ml-2">
                    · 购物车 <span className="font-medium text-blue-600">{cartCount}</span> 部
                  </span>
                )}
              </p>
            </div>

            {/* 排序 - 移动端 */}
            <div className="sm:hidden mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      sortBy === opt.value
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 列表 */}
            {filteredDramas.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-2">没有找到符合条件的剧</p>
                <button onClick={clearFilters} className="text-blue-600 hover:underline text-sm">
                  清空筛选条件
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDramas.map(drama => (
                  <DramaCard
                    key={drama.id}
                    drama={drama}
                    inCart={cart.includes(drama.id)}
                    onToggleCart={toggleCart}
                    onShowDetail={setDetailDrama}
                  />
                ))}
              </div>
            )}
          </main>

          {/* 右侧购物车 - 桌面端 */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">购物车</h2>
                    {cartCount > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <TrashIcon className="w-3 h-3" />
                        清空
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {cartCount === 0 ? (
                    <div className="text-center py-8">
                      <CartIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">购物车是空的</p>
                      <p className="text-xs text-gray-300 mt-1">点击"加入购物车"添加剧集</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-96 overflow-y-auto">
                        {cartItems.map(item => (
                          <CartItem key={item.id} drama={item} onRemove={removeFromCart} />
                        ))}
                      </div>
                      <div className="pt-4 mt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">共 {cartCount} 部</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-base font-semibold text-gray-900">总报价</span>
                          <span className="text-xl font-bold text-red-600">
                            ¥{cartTotal.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={exportCSV}
                          className="w-full py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          导出选购清单
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 移动端底部购物车按钮 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex items-center px-4 py-3 gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-gray-400">选中 {cartCount} 部</span>
              <span className="text-lg font-bold text-red-600">
                ¥{cartTotal.toLocaleString()}
              </span>
            </div>
          </div>
          {cartCount > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出
            </button>
          )}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            <CartIcon className="w-4 h-4" />
            购物车
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-red-500 text-white rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 移动端购物车抽屉 */}
      {isCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setIsCartOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">购物车 ({cartCount})</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cartCount === 0 ? (
                <div className="text-center py-12">
                  <CartIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400">购物车是空的</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <CartItem key={item.id} drama={item} onRemove={removeFromCart} />
                ))
              )}
            </div>
            {cartCount > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-semibold">总报价</span>
                  <span className="text-2xl font-bold text-red-600">
                    ¥{cartTotal.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={exportCSV}
                  className="w-full py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  导出选购清单
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-3 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  清空购物车
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {detailDrama && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDetailDrama(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 pr-8">{detailDrama.name}</h3>
              <button
                onClick={() => setDetailDrama(null)}
                className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{detailDrama.intro || '暂无简介'}</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setDetailDrama(null)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== 筛选内容组件 ====================
function FilterContent({
  selectedTiers,
  setSelectedTiers,
  selectedCategory,
  setSelectedCategory,
  selectedTags,
  setSelectedTags,
  heatMin,
  setHeatMin,
  heatMax,
  setHeatMax,
  tags,
  onClear,
}) {
  const toggleTier = (tier) => {
    setSelectedTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    )
  }

  return (
    <div className="space-y-6">
      {/* 价格档位 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">价格档位</h3>
        <div className="flex flex-wrap gap-2">
          {PRICE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleTier(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                selectedTiers.includes(opt.value)
                  ? opt.color
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 男频/女频 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">分类</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedCategory(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                selectedCategory === opt.value
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 热度区间 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">热度区间</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="最小值"
            value={heatMin}
            onChange={(e) => setHeatMin(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 shrink-0">-</span>
          <input
            type="number"
            placeholder="最大值"
            value={heatMax}
            onChange={(e) => setHeatMax(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 标签 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">标签</h3>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )
              }}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 清空按钮 */}
      {onClear && (
        <button
          onClick={onClear}
          className="w-full py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          清空所有筛选
        </button>
      )}
    </div>
  )
}
