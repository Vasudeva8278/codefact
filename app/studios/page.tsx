'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/store/store';
import { fetchStudios } from '@/app/store/features/studioSlice';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  MapPin, 
  Star, 
  Camera, 
  Clock, 
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Plus,
  Navigation
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Studio {
  _id: string;
  studioName: string;
  description: string;
  address: string;
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
  rating: number;
  reviewCount: number;
  perHourCharge: number;
  services: string[];
  equipment: Array<{
    name: string;
    brand?: string;
    model?: string;
  }>;
  images: Array<{
    url: string;
    caption?: string;
  }>;
  userId: {
    name: string;
    email: string;
  };
  featured: boolean;
  maxDistance: number;
}

interface Pagination {
  current: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalCount: number;
}

interface StudioFormData {
  studioName: string;
  description: string;
  address: string;
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
  perHourCharge: number;
  maxDistance: number;
  services: string[];
  equipment: Array<{
    name: string;
    brand?: string;
    model?: string;
  }>;
  imageUrl: string;
}

export default function StudiosPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { studios, loading, error, pagination } = useSelector((state: RootState) => state.studios);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [distanceRange, setDistanceRange] = useState<[number, number]>([0, 100]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newStudio, setNewStudio] = useState<StudioFormData>({
    studioName: '',
    description: '',
    address: '',
    location: {
      city: '',
      state: '',
      zipCode: ''
    },
    perHourCharge: 0,
    maxDistance: 50,
    services: [],
    equipment: [],
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const services = [
    'Wedding Photography',
    'Event Videography', 
    'Corporate Videos',
    'Product Photography',
    'Portrait Sessions',
    'Social Media Content',
    'Documentary',
    'Music Videos'
  ];

  useEffect(() => {
    dispatch(fetchStudios({
      search: searchQuery,
      location,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minDistance: distanceRange[0],
      maxDistance: distanceRange[1],
      page: pagination.current,
      limit: 12
    }));
  }, [dispatch, searchQuery, location, priceRange, distanceRange, pagination.current]);

  const handleServiceToggle = (service: string) => {
    // Implementation of handleServiceToggle
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setPriceRange([0, 1000]);
    setDistanceRange([0, 100]);
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchStudios({
      search: searchQuery,
      location,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minDistance: distanceRange[0],
      maxDistance: distanceRange[1],
      page: newPage,
      limit: 12
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'perHourCharge' || name === 'maxDistance') {
      setNewStudio(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    } else {
      setNewStudio(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudio(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    if (value.length === 2) {
      setPriceRange([value[0], value[1]] as [number, number]);
    }
  };

  const handleDistanceRangeChange = (value: number[]) => {
    if (value.length === 2) {
      setDistanceRange([value[0], value[1]] as [number, number]);
    }
  };

  const handleCreateStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to create a studio",
          variant: "destructive"
        });
        setShowCreateDialog(false);
        return;
      }
      const response = await fetch('/api/studios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studioName: newStudio.studioName,
          address: newStudio.address,
          perHourCharge: Number(newStudio.perHourCharge),
          maxDistance: Number(newStudio.maxDistance),
          imageUrl: newStudio.imageUrl,
          description: "Professional video studio",
          location: {
            city: "Default City",
            state: "Default State",
            zipCode: "00000"
          },
          services: ["Video Production"],
          rating: 0,
          reviewCount: 0
        }),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Studio created successfully",
        });
        setShowCreateDialog(false);
        setNewStudio({
          studioName: '',
          address: '',
          perHourCharge: 0,
          maxDistance: 50,
          imageUrl: '',
          description: '',
          location: { city: '', state: '', zipCode: '' },
          services: [],
          equipment: []
        });
        dispatch(fetchStudios({
          search: searchQuery,
          location,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          minDistance: distanceRange[0],
          maxDistance: distanceRange[1],
          page: 1,
          limit: 12
        }));
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create studio",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating studio:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header with Create Studio Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Studios</h1>
            <p className="text-gray-600">Find the perfect videographer for your next project</p>
          </div>
          
          {/* Create Studio Button - Only show for videographers */}
          {user?.role === 'videographer' && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Studio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Studio</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateStudio} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studioName">Studio Name</Label>
                    <Input
                      id="studioName"
                      value={newStudio.studioName}
                      onChange={handleInputChange}
                      name="studioName"
                      required
                      placeholder="Enter studio name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newStudio.address}
                      onChange={handleLocationChange}
                      name="address"
                      required
                      placeholder="Enter studio address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="perHourCharge">Price per Hour ($)</Label>
                    <Input
                      id="perHourCharge"
                      type="number"
                      value={newStudio.perHourCharge}
                      onChange={handleInputChange}
                      name="perHourCharge"
                      required
                      placeholder="Enter price per hour"
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
                    <Input
                      id="maxDistance"
                      type="number"
                      value={newStudio.maxDistance}
                      onChange={handleInputChange}
                      name="maxDistance"
                      placeholder="Enter maximum distance"
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={newStudio.imageUrl}
                      onChange={handleInputChange}
                      name="imageUrl"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Studio'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search studios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-purple-500"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-purple-500"
              />
            </div>
            <Button 
              size="lg" 
              className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => dispatch(fetchStudios({
                search: searchQuery,
                location,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                minDistance: distanceRange[0],
                maxDistance: distanceRange[1],
                page: 1,
                limit: 12
              }))}
            >
              <Search className="h-5 w-5 mr-2" />
              Search Studios
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-purple-600" />
                Filters
              </h3>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-purple-600 hover:text-purple-700">
                Clear All
              </Button>
            </div>

            {/* Price Range Filter */}
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-gray-900 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-purple-600" />
                Price Range (per hour)
              </h4>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={1000}
                  step={10}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <span className="font-medium">${priceRange[0]}</span>
                  <span className="text-gray-400">to</span>
                  <span className="font-medium">${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Distance Range Filter */}
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-gray-900 flex items-center">
                <Navigation className="h-4 w-4 mr-2 text-purple-600" />
                Distance Range (km)
              </h4>
              <div className="px-2">
                <Slider
                  value={distanceRange}
                  onValueChange={handleDistanceRangeChange}
                  max={100}
                  step={5}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <span className="font-medium">{distanceRange[0]} km</span>
                  <span className="text-gray-400">to</span>
                  <span className="font-medium">{distanceRange[1]} km</span>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <h5 className="font-medium text-gray-900 mb-2">Active Filters</h5>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Price: ${priceRange[0]} - ${priceRange[1]}/hr</div>
                <div>Distance: {distanceRange[0]} - {distanceRange[1]} km</div>
                {searchQuery && <div>Search: "{searchQuery}"</div>}
                {location && <div>Location: {location}</div>}
              </div>
            </div>
          </div>

          {/* Studios Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading studios...' : `${studios.length} Studios Available`}
              </h2>
              <div className="text-sm text-gray-600">
                Page {pagination.current} of {pagination.total}
              </div>
            </div>

            {/* Studios Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Error loading studios</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => dispatch(fetchStudios({
                  search: searchQuery,
                  location,
                  minPrice: priceRange[0],
                  maxPrice: priceRange[1],
                  minDistance: distanceRange[0],
                  maxDistance: distanceRange[1],
                  page: 1,
                  limit: 12
                }))} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Try Again
                </Button>
              </div>
            ) : studios.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No studios found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
                <Button onClick={clearFilters} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {studios.map((studio) => (
                  <Card key={studio._id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0 shadow-lg">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={Array.isArray(studio.images) && studio.images.length > 0 ? studio.images[0].url : '/placeholder-studio.jpg'}
                        alt={studio.studioName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {studio.featured && (
                        <Badge className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                          ⭐ Featured
                        </Badge>
                      )}
                      {studio.rating > 0 && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{studio.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-3">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                          {studio.studioName}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                          {studio.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-gray-500 mb-4">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">{studio.location.city}, {studio.location.state}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-lg font-bold text-gray-900">${studio.perHourCharge}</span>
                          <span className="text-sm text-gray-500">/hour</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Navigation className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-gray-600">{studio.maxDistance}km range</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {studio.services.slice(0, 2).map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100">
                            {service}
                          </Badge>
                        ))}
                        {studio.services.length > 2 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{studio.services.length - 2} more
                          </Badge>
                        )}
                      </div>

                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 h-11">
                        View Studio Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={!pagination.hasPrev}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, pagination.total))].map((_, i) => {
                    const pageNumber = Math.max(1, pagination.current - 2) + i;
                    if (pageNumber > pagination.total) return null;
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === pagination.current ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-10 h-10 p-0 ${
                          pageNumber === pagination.current 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0' 
                            : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={!pagination.hasNext}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}