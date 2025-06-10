'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Search, 
  MapPin, 
  Star, 
  Camera, 
  Clock, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Plus
} from 'lucide-react';

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
  maxDistance: number;
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
}

interface Pagination {
  current: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalCount?: number;
}

export default function Home() {
  const { user } = useAuth();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [distanceRange, setDistanceRange] = useState([0, 100]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    fetchStudios();
  }, [searchQuery, location, priceRange, distanceRange]);

  const fetchStudios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        location: location,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        minDistance: distanceRange[0].toString(),
        maxDistance: distanceRange[1].toString(),
        page: '1',
        limit: '12',
      });

      const response = await fetch(`/api/studios?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStudios(data.data.studios);
          setPagination(data.data.pagination);
        } else {
          throw new Error(data.error || 'Failed to fetch studios');
        }
      } else {
        throw new Error('Failed to fetch studios');
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
      setStudios([]);
      setPagination({
        current: 1,
        total: 1,
        hasNext: false,
        hasPrev: false,
        totalCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setPriceRange([0, 1000]);
    setDistanceRange([0, 100]);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, current: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
              Video Studios
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover amazing videographers and studios for your next project. 
            Filter by location, price, and distance to find the perfect match.
          </p>
          
          {/* Add Studio Button - Only show for videographers */}
          {user && user.role === 'videographer' && (
            <div className="mb-8">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/addstudio">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Studio
                </Link>
              </Button>
            </div>
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
              onClick={fetchStudios}
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
                  onValueChange={setPriceRange}
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
                  onValueChange={setDistanceRange}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studios.map((studio) => (
                  <Card key={studio._id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0 shadow-lg">
                    <div className="relative h-48 overflow-hidden">
                      <img
                       
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
                        {(studio.services || []).slice(0, 2).map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100">
                            {service}
                          </Badge>
                        ))}
                        {studio.services && studio.services.length > 2 && (
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