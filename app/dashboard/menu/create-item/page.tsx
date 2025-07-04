'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Utensils, ArrowLeft, Loader2, Save, Image, DollarSign, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/DashboardHeader';
import axios from 'axios';
import Link from 'next/link';

interface Outlet {
  _id: string;
  name: string;
  logo?: string;
}

export default function CreateItemPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantitySet: '',
    image: '',
    ingredients: '',
    allergens: [] as string[],
    dietaryInfo: [] as string[],
    isAvailable: true,
    preparationTime: '',
    calories: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data - in real app, these would come from API
  const categories = [
    { id: '1', name: 'Appetizers' },
    { id: '2', name: 'Main Courses' },
    { id: '3', name: 'Desserts' },
    { id: '4', name: 'Beverages' },
  ];

  const quantitySets = [
    { id: '1', name: 'Portion Sizes' },
    { id: '2', name: 'Drink Sizes' },
  ];

  const allergenOptions = [
    'Gluten', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Soy', 'Sesame'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'High-Protein', 'Organic'
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchOutlet();
    }
  }, [user]);

  const fetchOutlet = async () => {
    try {
      const response = await axios.get('/api/outlets');
      setOutlet(response.data.outlet);
      
      if (!response.data.outlet) {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error fetching outlet:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAllergenChange = (allergen: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allergens: checked 
        ? [...prev.allergens, allergen]
        : prev.allergens.filter(a => a !== allergen)
    }));
  };

  const handleDietaryChange = (dietary: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietaryInfo: checked 
        ? [...prev.dietaryInfo, dietary]
        : prev.dietaryInfo.filter(d => d !== dietary)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // TODO: Implement API call to create menu item
      console.log('Creating menu item:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to menu management
      router.push('/dashboard/menu');
    } catch (error: any) {
      setErrors({ general: 'Failed to create menu item. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !outlet) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <DashboardHeader outlet={outlet} onSignOut={handleSignOut} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/menu">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu Management
            </Button>
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Menu Item</h1>
              <p className="text-gray-600">Add a delicious new item to your menu</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about your menu item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Grilled Salmon with Herbs"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your dish, its ingredients, and what makes it special..."
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                      <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantitySet">Quantity Set (Optional)</Label>
                  <Select value={formData.quantitySet} onValueChange={(value) => handleSelectChange('quantitySet', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quantity options" />
                    </SelectTrigger>
                    <SelectContent>
                      {quantitySets.map(set => (
                        <SelectItem key={set.id} value={set.id}>
                          {set.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/dish-image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>
                  Extra information about your menu item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients</Label>
                  <Textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    placeholder="List the main ingredients..."
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
                    <Input
                      id="preparationTime"
                      name="preparationTime"
                      type="number"
                      value={formData.preparationTime}
                      onChange={handleInputChange}
                      placeholder="15"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories (Optional)</Label>
                    <Input
                      id="calories"
                      name="calories"
                      type="number"
                      value={formData.calories}
                      onChange={handleInputChange}
                      placeholder="350"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allergens & Dietary Info */}
            <Card>
              <CardHeader>
                <CardTitle>Allergens & Dietary Information</CardTitle>
                <CardDescription>
                  Help customers make informed choices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Allergens</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {allergenOptions.map(allergen => (
                      <div key={allergen} className="flex items-center space-x-2">
                        <Checkbox
                          id={`allergen-${allergen}`}
                          checked={formData.allergens.includes(allergen)}
                          onCheckedChange={(checked) => handleAllergenChange(allergen, checked as boolean)}
                        />
                        <Label htmlFor={`allergen-${allergen}`} className="text-sm">
                          {allergen}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Dietary Information</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {dietaryOptions.map(dietary => (
                      <div key={dietary} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dietary-${dietary}`}
                          checked={formData.dietaryInfo.includes(dietary)}
                          onCheckedChange={(checked) => handleDietaryChange(dietary, checked as boolean)}
                        />
                        <Label htmlFor={`dietary-${dietary}`} className="text-sm">
                          {dietary}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Menu Item
                  </>
                )}
              </Button>
              <Link href="/dashboard/menu">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Preview
                </CardTitle>
                <CardDescription>
                  How your menu item will appear
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  {formData.image && (
                    <img 
                      src={formData.image} 
                      alt="Item preview"
                      className="w-full h-40 object-cover rounded-md mb-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {formData.name || 'Menu Item Name'}
                      </h3>
                      <span className="text-lg font-bold text-orange-600">
                        ${formData.price || '0.00'}
                      </span>
                    </div>

                    {formData.description && (
                      <p className="text-gray-600 text-sm">
                        {formData.description}
                      </p>
                    )}

                    {(formData.allergens.length > 0 || formData.dietaryInfo.length > 0) && (
                      <div className="space-y-2">
                        {formData.dietaryInfo.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {formData.dietaryInfo.map(dietary => (
                              <Badge key={dietary} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                {dietary}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {formData.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {formData.allergens.map(allergen => (
                              <Badge key={allergen} variant="secondary" className="text-xs bg-red-100 text-red-800">
                                {allergen}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {(formData.preparationTime || formData.calories) && (
                      <div className="flex justify-between text-xs text-gray-500">
                        {formData.preparationTime && (
                          <span>⏱️ {formData.preparationTime} min</span>
                        )}
                        {formData.calories && (
                          <span>🔥 {formData.calories} cal</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}