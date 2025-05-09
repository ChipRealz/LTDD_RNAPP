import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ProductSlideShow from '../components/ProductSlideShow';
import api from '../utils/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function HomeScreen() {
  // States
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loadingTop, setLoadingTop] = useState(true);
  // Lazy loading states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;
  const tabListRef = useRef<FlatList>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [applyingFilter, setApplyingFilter] = useState(false);
  const [lastFilter, setLastFilter] = useState({ minPrice: '', maxPrice: '', sortOrder: 'asc' });
  const [cartCount, setCartCount] = useState(0);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/category');
        setCategories(res.data);
        setActiveCategory(null);
      } catch (e) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products for selected category
  useEffect(() => {
    if (!activeCategory) {
      setProducts([]);
      return;
    }
    setLoadingProducts(true);
    const fetchProducts = async () => {
      try {
        const params: any = { category: activeCategory };
        if (searchQuery.trim()) params.search = searchQuery.trim();
        const res = await api.get('/product', { params });
        setProducts(res.data);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [activeCategory, searchQuery]);

  // Fetch top selling products
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoadingTop(true);
        const res = await api.get('/product/top-selling?limit=10');
        setTopProducts(res.data);
      } catch (e) {
        setTopProducts([]);
      } finally {
        setLoadingTop(false);
      }
    };
    fetchTopProducts();
  }, []);

  // Fetch all products with lazy loading and search
  const fetchAllProducts = useCallback(
    async (
      pageNum: number,
      searchText: string = '',
      min: string = minPrice,
      max: string = maxPrice,
      order: 'asc' | 'desc' = sortOrder
    ) => {
      try {
        setLoadingAll(true);
        const params: any = {
          page: pageNum,
          limit: ITEMS_PER_PAGE,
          sort: 'price',
          order,
          search: searchText.trim(),
        };
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
        const res = await api.get('/product', { params });
        const newProducts = res.data;
        let sortedProducts = [...newProducts];
        sortedProducts.sort((a, b) => {
          if (order === 'asc') return a.price - b.price;
          return b.price - a.price;
        });
        if (pageNum === 1) {
          setAllProducts(sortedProducts);
        } else {
          setAllProducts(prev => {
            const existingIds = new Set(prev.map((p: Product) => p._id));
            const uniqueNewProducts = sortedProducts.filter((p: Product) => !existingIds.has(p._id));
            return [...prev, ...uniqueNewProducts];
          });
        }
        setHasMore(newProducts.length === ITEMS_PER_PAGE);
      } catch (e) {
        console.error('Error fetching products:', e);
      } finally {
        setLoadingAll(false);
      }
    },
    [minPrice, maxPrice, sortOrder]
  );

  // Update useEffect to use min/max price and sort order
  useEffect(() => {
    if (!activeCategory) {
      fetchAllProducts(1, searchQuery, minPrice, maxPrice, sortOrder);
    }
  }, [searchQuery, activeCategory, fetchAllProducts, minPrice, maxPrice, sortOrder]);

  // Initial load of all products
  useEffect(() => {
    if (!activeCategory) {
      fetchAllProducts(1, searchQuery);
    }
  }, [searchQuery, activeCategory, fetchAllProducts]);

  // Load more products
  const loadMore = useCallback(() => {
    if (!loadingAll && hasMore && !activeCategory) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllProducts(nextPage, searchQuery, minPrice, maxPrice, sortOrder);
    }
  }, [loadingAll, hasMore, activeCategory, page, fetchAllProducts, searchQuery, minPrice, maxPrice, sortOrder]);

  // Helper to check if filter changed
  const filterChanged = minPrice !== lastFilter.minPrice || maxPrice !== lastFilter.maxPrice || sortOrder !== lastFilter.sortOrder;

  // Numeric input only for price fields
  const handleMinPrice = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setMinPrice(cleaned);
  };
  const handleMaxPrice = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setMaxPrice(cleaned);
  };

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await api.get('/cart');
        setCartCount(res.data?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0);
      } catch {}
    };
    fetchCartCount();
  }, []);

  // Debounced search handler
  const searchTimeout = useRef<number | null>(null);
  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(text);
      setPage(1);
      if (!activeCategory) {
        setAllProducts([]);
      }
    }, 800);
  };

  // Header
  const renderHeader = () => (
    <>
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="search"
            placeholderTextColor="#888"
            value={search}
            onChangeText={handleSearch}
            textAlign="left"
            multiline={false}
            maxLength={200}
            textAlignVertical="center"
            blurOnSubmit={false}
            returnKeyType="search"
            onSubmitEditing={() => {
              setSearchQuery(search);
              setPage(1);
              if (!activeCategory) {
                setAllProducts([]);
              }
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={26} color="#333" />
          {typeof cartCount === 'number' && cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarButton}>
          <View style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: '#e6f2ff' }}>
        <FlatList
          ref={tabListRef}
          data={categories}
          keyExtractor={item => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.tab, activeCategory === item._id && styles.activeTab]}
              onPress={() => {
                if (activeCategory === item._id) {
                  setActiveCategory(null);
                  setPage(1);
                  fetchAllProducts(1, searchQuery);
                } else {
                  setActiveCategory(item._id);
                }
                if (tabListRef.current) {
                  tabListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
                }
              }}
            >
              <Text style={[styles.tabText, activeCategory === item._id && styles.activeTabText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.tabFlatList}
          getItemLayout={(_, index) => ({ length: 90, offset: 90 * index, index })}
        />
      </View>

      <View style={styles.slideShow}>
        <ProductSlideShow />
      </View>

      <View style={styles.top10}>
        <Text style={styles.sectionText}>10 sản phẩm bán chạy</Text>
        {loadingTop ? (
          <ActivityIndicator size="small" style={{ marginTop: 8 }} />
        ) : (
          <FlatList
            data={topProducts}
            keyExtractor={item => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => (
              <View style={styles.topProductCard}>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.topProductImage} />
                )}
                <Text style={styles.topProductName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.topProductPrice}>${item.price}</Text>
              </View>
            )}
          />
        )}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Products</Text>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Min Price:</Text>
              <TextInput
                style={styles.filterInput}
                value={minPrice}
                onChangeText={handleMinPrice}
                placeholder="0"
                keyboardType="numeric"
                maxLength={8}
              />
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Max Price:</Text>
              <TextInput
                style={styles.filterInput}
                value={maxPrice}
                onChangeText={handleMaxPrice}
                placeholder="1000"
                keyboardType="numeric"
                maxLength={8}
              />
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Sort by Price:</Text>
              <TouchableOpacity
                style={[styles.sortButton, sortOrder === 'asc' && styles.sortButtonActive]}
                onPress={() => setSortOrder('asc')}
              >
                <Text style={styles.sortButtonText}>Low to High</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortOrder === 'desc' && styles.sortButtonActive]}
                onPress={() => setSortOrder('desc')}
              >
                <Text style={styles.sortButtonText}>High to Low</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterActions}>
              <Pressable
                style={[styles.applyButton, !filterChanged && { opacity: 0.5 }]}
                onPress={async () => {
                  if (!filterChanged) return;
                  setApplyingFilter(true);
                  Keyboard.dismiss();
                  setPage(1);
                  setAllProducts([]);
                  await fetchAllProducts(1, searchQuery, minPrice, maxPrice, sortOrder);
                  setLastFilter({ minPrice, maxPrice, sortOrder });
                  setApplyingFilter(false);
                  setFilterVisible(false);
                }}
                disabled={!filterChanged || applyingFilter}
              >
                {applyingFilter ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.applyButtonText}>Apply Filter</Text>
                )}
              </Pressable>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setFilterVisible(false)}
                disabled={applyingFilter}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
            <Pressable
              style={styles.clearButton}
              onPress={() => {
                setMinPrice('');
                setMaxPrice('');
                setSortOrder('asc');
              }}
              disabled={applyingFilter}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* End Filter Modal */}
      <FlatList
        data={activeCategory ? products : allProducts}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/product-detail/[productId]', params: { productId: item._id } })}>
            <View style={styles.productCard}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.productImage} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          ((loadingAll || loadingProducts) && (activeCategory ? products.length === 0 : allProducts.length === 0)) ? (
            <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
          ) : null
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="filter" size={22} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.filterButtonText}>Filter Products</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchRow: {
    flex: 0,
    maxWidth: 260,
    width: '70%',
    marginHorizontal: 10,
    marginVertical: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#6fcf97',
    justifyContent: 'center',
    height: 48,
    alignSelf: 'center',
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 0,
    color: '#222',
    textAlign: 'left',
    paddingVertical: 0,
  },
  iconButton: {
    marginHorizontal: 4,
  },
  avatarButton: {
    marginLeft: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4a90e2',
    borderWidth: 2,
    borderColor: '#fff',
  },
  tabFlatList: {
    marginBottom: 1.2,
    backgroundColor: '#fff',
  },
  tabList: {
    paddingVertical: 0,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  tab: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginRight: 10,
    height: 38,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTab: {
    backgroundColor: '#4a90e2',
    shadowOpacity: 0.12,
    elevation: 3,
    transform: [{ scale: 1.08 }],
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  activeTabText: {
    color: '#fff',
  },
  slideShow: {
    height: 350,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  top10: {
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 100,
    borderTopWidth: 1,
    borderTopColor: '#f90',
    borderBottomWidth: 1,
    borderBottomColor: '#f90',
    marginBottom: 8,
    paddingLeft: 8,
  },
  sectionText: {
    color: '#f90',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f3f3f3',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#222',
  },
  productPrice: {
    color: '#4a90e2',
    fontWeight: 'bold',
    fontSize: 15,
  },
  topProductCard: {
    width: 100,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topProductImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#e0e0e0',
  },
  topProductName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  topProductPrice: {
    color: '#4a90e2',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  filterButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 20,
    bottom: 24,
    backgroundColor: '#4a90e2',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#4a90e2',
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  filterLabel: {
    width: 90,
    fontSize: 16,
    color: '#333',
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 16,
    backgroundColor: '#f7f7f7',
  },
  sortButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  sortButtonActive: {
    backgroundColor: '#4a90e2',
  },
  sortButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  applyButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#4a90e2',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f90',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 2,
  },
  cartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});