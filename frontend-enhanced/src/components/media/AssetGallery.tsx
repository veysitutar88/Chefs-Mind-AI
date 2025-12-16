'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageIcon, Video, Download, Trash2, Search, Filter, Grid, List, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  provider: string;
  prompt: string;
  url: string;
  thumbnailUrl?: string;
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // для видео в секундах
  createdAt: string;
  tags?: string[];
}

interface AssetGalleryProps {
  className?: string;
}

export function AssetGallery({ className }: AssetGalleryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAssets();
  }, [filter, searchQuery]);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/media/assets', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке медиафайлов');
      }

      const data = await response.json();
      let filteredAssets = data.assets || [];

      // Применяем фильтры
      if (filter !== 'all') {
        filteredAssets = filteredAssets.filter((asset: MediaAsset) => asset.type === filter);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredAssets = filteredAssets.filter((asset: MediaAsset) =>
          asset.prompt.toLowerCase().includes(query) ||
          asset.provider.toLowerCase().includes(query) ||
          (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }

      setAssets(filteredAssets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadAsset = async (asset: MediaAsset) => {
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${asset.type}_${asset.id}.${asset.type === 'image' ? 'png' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка при скачивании:', error);
    }
  };

  const deleteAsset = async (assetId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/media/assets/${assetId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении файла');
      }

      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const AssetCard = ({ asset }: { asset: MediaAsset }) => (
    <Card className={`group hover:shadow-md transition-shadow ${selectedAssets.has(asset.id) ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
            {asset.type === 'image' ? (
              <img
                src={asset.thumbnailUrl || asset.url}
                alt={asset.prompt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <video
                  src={asset.thumbnailUrl || asset.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {asset.type === 'image' ? 'Image' : 'Video'}
              </Badge>
              <span className="text-xs text-muted-foreground">{asset.provider}</span>
            </div>

            <p className="text-sm font-medium line-clamp-2">{asset.prompt}</p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(asset.fileSize)}</span>
              <span>{formatDate(asset.createdAt)}</span>
            </div>

            {asset.dimensions && (
              <p className="text-xs text-muted-foreground">
                {asset.dimensions.width} × {asset.dimensions.height}
              </p>
            )}

            {asset.duration && (
              <p className="text-xs text-muted-foreground">
                Duration: {formatDuration(asset.duration)}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAssetSelection(asset.id)}
                className="flex-1 mr-1"
              >
                <input
                  type="checkbox"
                  checked={selectedAssets.has(asset.id)}
                  onChange={() => toggleAssetSelection(asset.id)}
                  className="mr-2"
                />
                Select
              </Button>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadAsset(asset)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAsset(asset.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Галерея медиафайлов</CardTitle>
          <CardDescription>Загрузка...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} bg-surface border-borderSoft`}>
        <CardHeader>
          <CardTitle className="text-textPrimary">Media Library</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-textSecondary">
          <div className="p-4 rounded-full bg-red-500/10 mb-4 text-red-500 ring-1 ring-red-500/20 shadow-glow">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-textPrimary mb-2">
            Media assets are temporarily unavailable
          </h3>
          <p className="text-sm max-w-[250px] mx-auto mb-6 opacity-80">
            {error || 'Please check your connection and try again.'}
          </p>
          <Button
            onClick={loadAssets}
            className="bg-accent hover:bg-accentSoft text-white shadow-glow hover:shadow-glow-active transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Media Library ({assets.length})</CardTitle>
            <CardDescription>
              Manage your generated images and videos
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by prompt, provider or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filter} onValueChange={(value: 'all' | 'image' | 'video') => setFilter(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedAssets.size > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">
              Selected: {selectedAssets.size}
            </span>
            <Button variant="outline" size="sm">
              Download Selected
            </Button>
            <Button variant="outline" size="sm" className="text-red-600">
              Delete Selected
            </Button>
          </div>
        )}

        {/* Asset Grid */}
        {assets.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No media files
            </h3>
            <p className="text-gray-500 mb-4">
              Start generating images and videos using the studio
            </p>
            <Button onClick={loadAssets}>
              Refresh
            </Button>
          </div>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
            }`}>
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}