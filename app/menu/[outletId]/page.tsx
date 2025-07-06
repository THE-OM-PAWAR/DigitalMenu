'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { 
  Store, Search, Leaf, Beef, MapPin, Phone, 
  ChefHat, Utensils, Star, Clock, ArrowRight
} from 'lucide-react';
import ThemeProvider from '@/components/ThemeProvider';
import axios from 'axios';

interface Outlet {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
  theme?: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
}

interface Item {
  _id: string;
  name: string;
  description: string;
  image?: string;
  categoryId: {
    _id: string;
    name: string;
  };
  isVeg: boolean;
  quantityPrices: {
    quantityId: {
      _id: string;
      value: string;
      description: string;
    };
    price: number;
  }[];
}

export default function PublicMenuPage() {
  const params = useParams();
  const outletId = params.outletId as string;
  
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [highlightedItems, setHighlightedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (outletId) {
      fetchMenuData();
    }
  }, [outletId]);

  const fetchMenuData = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!outletId || outletId.length !== 24) {
        setError('Invalid outlet ID format');
        return;
      }

      const requests = [
        axios.get(`/api/public/outlets/${outletId}`),
        axios.get(`/api/public/categories?outletId=${outletId}`),
        axios.get(`/api/public/items?outletId=${outletId}`),
        axios.get(`/api/public/items/highlighted?outletId=${outletId}`)
      ];

      const [outletResponse, categoriesResponse, itemsResponse, highlightedResponse] = await Promise.all(
        requests.map(request => 
          request.catch(err => {
            console.error('API request failed:', err.response?.data || err.message);
            throw err;
          })
        )
      );

      setOutlet(outletResponse.data.outlet);
      setCategories(categoriesResponse.data.categories || []);
      setItems(itemsResponse.data.items || []);
      setHighlightedItems(highlightedResponse.data.items || []);
    } catch (error: any) {
      console.error('Error fetching menu data:', error);
      if (error.response?.status === 404) {
        setError('Menu not found');
      } else if (error.response?.status === 400) {
        setError('Invalid outlet ID');
      } else {
        setError('Failed to load menu. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.categoryId._id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const groupedItems = categories.reduce((acc, category) => {
    const categoryItems = filteredItems.filter(item => item.categoryId._id === category._id);
    if (categoryItems.length > 0) {
      acc[category._id] = {
        category,
        items: categoryItems
      };
    }
    return acc;
  }, {} as Record<string, { category: Category; items: Item[] }>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={fetchMenuData}
            className="bg-gray-900 hover:bg-gray-800"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Outlet Not Found</h1>
          <p className="text-gray-600 mb-6">The requested outlet could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider themeId={outlet.theme || 'modern'}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)', color: 'var(--theme-text)' }}>
        {/* Header */}
        <div className="sticky top-0 z-50" style={{ backgroundColor: 'var(--theme-background)', borderBottomColor: 'var(--theme-border)' }}>
          <div className="px-4 py-4 border-b">
            <div className="flex items-center justify-between">
              {/* Left - Outlet Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  {outlet.logo ? (
                    <img 
                      src={outlet.logo} 
                      alt={outlet.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <Store className="h-6 w-6" style={{ color: 'var(--theme-background)' }} />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text)' }}>
                    {outlet.name}
                  </h1>
                  <div className="flex items-center text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                    <Star className="h-3 w-3 mr-1" style={{ color: 'var(--theme-accent)' }} />
                    <span>4.8 • Open now</span>
                  </div>
                </div>
              </div>

              {/* Right - Location Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Location</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                  <SheetHeader>
                    <SheetTitle style={{ color: 'var(--theme-text)' }}>Location & Contact</SheetTitle>
                    <SheetDescription style={{ color: 'var(--theme-text-secondary)' }}>
                      Find us and get in touch
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {outlet.address && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 mt-0.5" style={{ color: 'var(--theme-accent)' }} />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Address</p>
                          <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{outlet.address}</p>
                        </div>
                      </div>
                    )}
                    {outlet.phone && (
                      <div className="flex items-start space-x-3">
                        <Phone className="h-5 w-5 mt-0.5" style={{ color: 'var(--theme-accent)' }} />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Phone</p>
                          <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{outlet.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 mt-0.5" style={{ color: 'var(--theme-accent)' }} />
                      <div>
                        <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Hours</p>
                        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Open • Closes 11:00 PM</p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8">
          {/* Popular Items Section */}
          {highlightedItems.length > 0 && (
            <div className="py-4">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="h-5 w-5" style={{ color: 'var(--theme-accent)' }} />
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text)' }}>
                  Popular Items
                </h2>
              </div>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {highlightedItems.map((item) => (
                  <Drawer key={item._id}>
                    <DrawerTrigger asChild>
                      <div className="flex-shrink-0 w-32 cursor-pointer">
                        <div className="relative">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-20 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-surface)' }}>
                              <Utensils className="h-6 w-6" style={{ color: 'var(--theme-text-secondary)' }} />
                            </div>
                          )}
                          <div className="absolute top-1 left-1">
                            <div 
                              className="w-4 h-4 rounded-full border flex items-center justify-center"
                              style={{
                                backgroundColor: item.isVeg ? 'var(--theme-veg)' : 'var(--theme-non-veg)',
                                borderColor: item.isVeg ? 'var(--theme-veg)' : 'var(--theme-non-veg)',
                              }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                          </div>
                          <div className="absolute top-1 right-1">
                            <Star className="h-3 w-3" style={{ color: 'var(--theme-accent)' }} />
                          </div>
                        </div>
                        <p className="text-xs font-medium mt-1 line-clamp-2" style={{ color: 'var(--theme-text)' }}>
                          {item.name}
                        </p>
                        <p className="text-xs font-bold" style={{ color: 'var(--theme-accent)' }}>
                          ₹{item.quantityPrices[0]?.price.toFixed(0)}
                        </p>
                      </div>
                    </DrawerTrigger>
                    <DrawerContent style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                      <DrawerHeader>
                        <DrawerTitle style={{ color: 'var(--theme-text)' }}>{item.name}</DrawerTitle>
                        <DrawerDescription style={{ color: 'var(--theme-text-secondary)' }}>
                          {item.description}
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-6">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <div className="space-y-3">
                          {item.quantityPrices.map((qp, index) => (
                            <div 
                              key={index} 
                              className="flex justify-between items-center py-3 px-4 rounded-lg"
                              style={{ backgroundColor: 'var(--theme-background)' }}
                            >
                              <div>
                                <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{qp.quantityId.value}</span>
                                <span className="text-sm ml-2" style={{ color: 'var(--theme-text-secondary)' }}>({qp.quantityId.description})</span>
                              </div>
                              <span className="text-lg font-bold" style={{ color: 'var(--theme-accent)' }}>
                                ₹{qp.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                ))}
              </div>
            </div>
          )}

          {/* Categories Section */}
          {categories.length > 0 && (
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text)' }}>
                Categories
              </h2>
              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-2">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                    className={`cursor-pointer rounded-lg p-3 transition-all ${
                      selectedCategory === category._id ? 'ring-2' : ''
                    }`}
                    style={{ 
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: selectedCategory === category._id ? 'var(--theme-primary)' : 'transparent'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-background)' }}>
                          <ChefHat className="h-6 w-6" style={{ color: 'var(--theme-text-secondary)' }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--theme-text)' }}>
                          {category.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                          {filteredItems.filter(item => item.categoryId._id === category._id).length} items
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--theme-text-secondary)' }} />
              <Input
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{ 
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-surface)',
                  color: 'var(--theme-text)'
                }}
              />
            </div>
          </div>

          {/* Menu Items by Category */}
          {Object.keys(groupedItems).length > 0 ? (
            <div className="space-y-6">
              {Object.values(groupedItems).map(({ category, items }) => (
                <section key={category._id}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text)' }}>
                      {category.name}
                    </h3>
                    <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      {items.length} items
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <Drawer key={item._id}>
                        <DrawerTrigger asChild>
                          <div className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all hover:shadow-sm" style={{ backgroundColor: 'var(--theme-surface)' }}>
                            {/* Item Image */}
                            <div className="relative flex-shrink-0">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-background)' }}>
                                  <Utensils className="h-6 w-6" style={{ color: 'var(--theme-text-secondary)' }} />
                                </div>
                              )}
                              <div className="absolute -top-1 -left-1">
                                <div 
                                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                  style={{
                                    backgroundColor: item.isVeg ? 'var(--theme-veg)' : 'var(--theme-non-veg)',
                                    borderColor: item.isVeg ? 'var(--theme-veg)' : 'var(--theme-non-veg)',
                                  }}
                                >
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                              </div>
                            </div>

                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate" style={{ color: 'var(--theme-text)' }}>
                                {item.name}
                              </h4>
                              <p className="text-xs line-clamp-2 mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
                                {item.description}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="flex-shrink-0 text-right">
                              <p className="font-bold text-sm" style={{ color: 'var(--theme-accent)' }}>
                                ₹{item.quantityPrices[0]?.price.toFixed(0)}
                              </p>
                              {item.quantityPrices.length > 1 && (
                                <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                                  +{item.quantityPrices.length - 1} more
                                </p>
                              )}
                              <ArrowRight className="h-4 w-4 mt-1 mx-auto" style={{ color: 'var(--theme-text-secondary)' }} />
                            </div>
                          </div>
                        </DrawerTrigger>
                        <DrawerContent style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                          <DrawerHeader>
                            <DrawerTitle style={{ color: 'var(--theme-text)' }}>{item.name}</DrawerTitle>
                            <DrawerDescription style={{ color: 'var(--theme-text-secondary)' }}>
                              {item.description}
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="px-4 pb-6">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                              />
                            )}
                            <div className="space-y-3">
                              <h4 className="font-medium" style={{ color: 'var(--theme-text)' }}>Available Options</h4>
                              {item.quantityPrices.map((qp, index) => (
                                <div 
                                  key={index} 
                                  className="flex justify-between items-center py-3 px-4 rounded-lg"
                                  style={{ backgroundColor: 'var(--theme-background)' }}
                                >
                                  <div>
                                    <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{qp.quantityId.value}</span>
                                    <span className="text-sm ml-2" style={{ color: 'var(--theme-text-secondary)' }}>({qp.quantityId.description})</span>
                                  </div>
                                  <span className="text-lg font-bold" style={{ color: 'var(--theme-accent)' }}>
                                    ₹{qp.price.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DrawerContent>
                      </Drawer>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'all' ? (
                  <>
                    <Search className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--theme-text-secondary)' }} />
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>No items found</h3>
                    <p className="mb-6" style={{ color: 'var(--theme-text-secondary)' }}>
                      Try adjusting your search or selecting a different category.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-background)' }}
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <Utensils className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--theme-text-secondary)' }} />
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>Menu Coming Soon</h3>
                    <p style={{ color: 'var(--theme-text-secondary)' }}>
                      We're working on adding delicious items to our menu. Please check back later!
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t mt-8" style={{ backgroundColor: 'var(--theme-surface)', borderTopColor: 'var(--theme-border)' }}>
          <div className="px-4 py-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <Store className="h-4 w-4" style={{ color: 'var(--theme-background)' }} />
                </div>
                <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{outlet.name}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                Powered by MenuMaster
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}