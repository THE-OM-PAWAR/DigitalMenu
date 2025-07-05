'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Store, Search, Leaf, Beef, Clock, MapPin, Phone, 
  ChefHat, Utensils, Filter, X, Star
} from 'lucide-react';
import axios from 'axios';

interface Outlet {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
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

      const [outletResponse, categoriesResponse, itemsResponse] = await Promise.all([
        axios.get(`/api/public/outlets/${outletId}`),
        axios.get(`/api/public/categories?outletId=${outletId}`),
        axios.get(`/api/public/items?outletId=${outletId}`)
      ]);

      setOutlet(outletResponse.data.outlet);
      setCategories(categoriesResponse.data.categories || []);
      setItems(itemsResponse.data.items || []);
    } catch (error: any) {
      console.error('Error fetching menu data:', error);
      if (error.response?.status === 404) {
        setError('Menu not found');
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
    
    const matchesDietary = dietaryFilter === 'all' || 
                          (dietaryFilter === 'veg' && item.isVeg) ||
                          (dietaryFilter === 'non-veg' && !item.isVeg);

    return matchesSearch && matchesCategory && matchesDietary;
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading delicious menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={fetchMenuData}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!outlet) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Outlet Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                {outlet.logo ? (
                  <img 
                    src={outlet.logo} 
                    alt={outlet.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <Store className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{outlet.name}</h1>
                {outlet.description && (
                  <p className="text-gray-600 mt-1">{outlet.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                  {outlet.address && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{outlet.address}</span>
                    </div>
                  )}
                  {outlet.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{outlet.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-6 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
                <div className="text-xs text-gray-500">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{items.length}</div>
                <div className="text-xs text-gray-500">Items</div>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="text-lg font-semibold">4.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-orange-200 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'border-orange-200 text-orange-700 hover:bg-orange-50'
                }
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category._id}
                  variant={selectedCategory === category._id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category._id)}
                  className={selectedCategory === category._id 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'border-orange-200 text-orange-700 hover:bg-orange-50'
                  }
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Dietary Filter */}
            <div className="flex gap-2 ml-auto">
              <Button
                variant={dietaryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDietaryFilter('all')}
                className={dietaryFilter === 'all' 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }
              >
                All
              </Button>
              <Button
                variant={dietaryFilter === 'veg' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDietaryFilter('veg')}
                className={dietaryFilter === 'veg' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'border-green-200 text-green-700 hover:bg-green-50'
                }
              >
                <Leaf className="h-4 w-4 mr-1" />
                Veg
              </Button>
              <Button
                variant={dietaryFilter === 'non-veg' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDietaryFilter('non-veg')}
                className={dietaryFilter === 'non-veg' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'border-red-200 text-red-700 hover:bg-red-50'
                }
              >
                <Beef className="h-4 w-4 mr-1" />
                Non-Veg
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== 'all' || dietaryFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Search: "{searchQuery}"
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Category: {categories.find(c => c._id === selectedCategory)?.name}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSelectedCategory('all')}
                  />
                </Badge>
              )}
              {dietaryFilter !== 'all' && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {dietaryFilter === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setDietaryFilter('all')}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setDietaryFilter('all');
                }}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        {Object.keys(groupedItems).length > 0 ? (
          <div className="space-y-12">
            {Object.values(groupedItems).map(({ category, items }) => (
              <section key={category._id} className="scroll-mt-24" id={category._id}>
                {/* Category Header */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center shadow-md">
                        <ChefHat className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                      {category.description && (
                        <p className="text-gray-600 mt-1">{category.description}</p>
                      )}
                      <p className="text-sm text-orange-600 mt-1">{items.length} items</p>
                    </div>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Card key={item._id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm overflow-hidden">
                      <div className="relative">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-colors duration-300">
                            <Utensils className="h-12 w-12 text-orange-400" />
                          </div>
                        )}
                        
                        {/* Veg/Non-Veg Indicator */}
                        <div className="absolute top-3 left-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            item.isVeg 
                              ? 'bg-green-100 border-green-600' 
                              : 'bg-red-100 border-red-600'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              item.isVeg ? 'bg-green-600' : 'bg-red-600'
                            }`} />
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/90 text-gray-700 border-0 shadow-sm">
                            {item.categoryId.name}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-2">
                          {item.quantityPrices.map((qp, index) => (
                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-900">{qp.quantityId.value}</span>
                                <span className="text-sm text-gray-500 ml-2">({qp.quantityId.description})</span>
                              </div>
                              <span className="text-lg font-bold text-orange-600">
                                ₹{qp.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'all' || dietaryFilter !== 'all' ? (
                <>
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setDietaryFilter('all');
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Menu Coming Soon</h3>
                  <p className="text-gray-600">
                    We're working on adding delicious items to our menu. Please check back later!
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Store className="h-6 w-6 text-orange-600" />
              <span className="text-lg font-semibold text-gray-900">{outlet.name}</span>
            </div>
            <p className="text-gray-600 text-sm">
              Powered by MenuMaster • Digital Menu Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}