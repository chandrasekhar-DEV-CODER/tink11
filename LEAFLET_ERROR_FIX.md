# Leaflet Map Error Fix

## Error Description
```
Uncaught TypeError: Cannot read properties of undefined (reading '_leaflet_pos')
    at getPosition (/node_modules/.vite/deps/leaflet.js?v=1fc7b239:1570:19)
    at _getMapPanePos (/node_modules/.vite/deps/leaflet.js?v=1fc7b239:2989:18)
    at containerPointToLayerPoint (/node_modules/.vite/deps/leaflet.js?v=1fc7b239:2696:47)
    at containerPointToLatLng (/node_modules/.vite/deps/leaflet.js?v=1fc7b239:2708:33)
    at setZoomAround (/node_modules/.vite/deps/leaflet.js?v=1fc7b239:2103:272)
    at Math.log (/node_modules/.vite/deps/leaflet.js?v=1fc7b239:9295:17)
```

## Root Cause
The error occurred because the Leaflet map was being re-initialized when the component remounted or when dependencies (center, zoom) changed. This caused Leaflet to try to access internal properties (`_leaflet_pos`) on DOM elements that were already removed or not properly initialized.

## Solution Implemented

### 1. Prevent Re-initialization
- Changed the initialization effect to run only once (empty dependency array)
- Added checks to prevent creating a new map if one already exists
- Check for existing `_leaflet_id` on the container before initialization

### 2. Improved Cleanup
- Wrapped map removal in try-catch to handle errors gracefully
- Reset `mapLoaded` state on cleanup
- Properly null out the map reference

### 3. Separate Center/Zoom Updates
- Created a dedicated effect to handle center and zoom changes
- Only updates the view if the map is already loaded
- Uses `setView()` instead of re-initializing the entire map

## Code Changes

### Before
```typescript
useEffect(() => {
  const initMap = async () => {
    // ...
    if (!mapRef.current) {
      const map = L.map('live-map').setView(center, zoom);
      // ...
    }
  };
  
  initMap();
  
  return () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };
}, [center, zoom]); // ❌ Re-runs when center/zoom changes
```

### After
```typescript
// Initialize map once
useEffect(() => {
  const initMap = async () => {
    // ...
    const container = document.getElementById('live-map');
    if (!container) return;
    
    if (mapRef.current) return;
    
    if ((container as any)._leaflet_id) {
      return;
    }
    
    const map = L.map('live-map').setView(center, zoom);
    // ...
  };
  
  initMap();
  
  return () => {
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (err) {
        console.error('Error removing map:', err);
      }
      mapRef.current = null;
      setMapLoaded(false);
    }
  };
}, []); // ✅ Runs only once

// Handle center and zoom changes separately
useEffect(() => {
  if (mapRef.current && mapLoaded) {
    mapRef.current.setView(center, zoom);
  }
}, [center, zoom, mapLoaded]); // ✅ Updates view without re-initialization
```

## Benefits
1. **No More Re-initialization**: Map is created once and reused
2. **Proper Cleanup**: Errors during cleanup are caught and logged
3. **Better Performance**: Avoids destroying and recreating the map
4. **Stable References**: Map instance remains stable across renders
5. **Smooth Updates**: Center and zoom changes are applied smoothly

## Testing
- ✅ Map initializes correctly on first render
- ✅ No errors when component remounts
- ✅ Center and zoom updates work smoothly
- ✅ Cleanup happens without errors
- ✅ No memory leaks

## Files Modified
- `src/components/map/LiveMap.tsx`

## Status
✅ **FIXED** - Error resolved and committed to version control
