'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddStudioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [studioData, setStudioData] = useState({
    studioName: '',
    description: '',
    address: '',
    location: {
      city: '',
      state: '',
      zipCode: ''
    },
    perHourCharge: '',
    maxDistance: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert perHourCharge and maxDistance to numbers
    const dataToSend = {
      ...studioData,
      perHourCharge: Number(studioData.perHourCharge),
      maxDistance: Number(studioData.maxDistance),
    };

    try {
      const response = await fetch('/api/studios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Studio added successfully",
        });
        router.push('/studios');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add studio",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New Studio</CardTitle>
            <CardDescription>Fill in the details to add your studio</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studioName">Studio Name</Label>
                    <Input
                      id="studioName"
                      value={studioData.studioName}
                      onChange={(e) => setStudioData(prev => ({ ...prev, studioName: e.target.value }))}
                      required
                      placeholder="Enter studio name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={studioData.description}
                    onChange={(e) => setStudioData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="Describe your studio"
                    rows={3}
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={studioData.address}
                    onChange={(e) => setStudioData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    placeholder="Enter full address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={studioData.location.city}
                      onChange={(e) => setStudioData(prev => ({
                        ...prev,
                        location: { ...prev.location, city: e.target.value }
                      }))}
                      required
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={studioData.location.state}
                      onChange={(e) => setStudioData(prev => ({
                        ...prev,
                        location: { ...prev.location, state: e.target.value }
                      }))}
                      required
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={studioData.location.zipCode}
                      onChange={(e) => setStudioData(prev => ({
                        ...prev,
                        location: { ...prev.location, zipCode: e.target.value }
                      }))}
                      required
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing and Distance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing & Distance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perHourCharge">Price per Hour ($)</Label>
                    <Input
                      id="perHourCharge"
                      type="number"
                      value={studioData.perHourCharge}
                      onChange={(e) => setStudioData(prev => ({ ...prev, perHourCharge: e.target.value }))}
                      required
                      min="0"
                      placeholder="Enter price per hour"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
                    <Input
                      id="maxDistance"
                      type="number"
                      value={studioData.maxDistance}
                      onChange={(e) => setStudioData(prev => ({ ...prev, maxDistance: e.target.value }))}
                      required
                      min="0"
                      placeholder="Enter maximum distance"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={loading}
              >
                {loading ? 'Adding Studio...' : 'Add Studio'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
