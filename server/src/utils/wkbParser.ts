/**
 * Parse WKB (Well-Known Binary) format coordinates from PostGIS
 * Format: 0101000020E6100000[longitude bytes][latitude bytes]
 */
export function parseWKBPoint(hexString: string): { longitude: number; latitude: number } | null {
  try {
    // Handle null or undefined
    if (!hexString) return null;
    
    // Remove '0x' prefix if present
    const hex = hexString.replace(/^0x/, '');
    
    // Convert hex string to buffer
    const buffer = Buffer.from(hex, 'hex');
    
    // WKB format for Point with SRID:
    // Byte 0: Byte order (01 = little endian, 00 = big endian)
    // Bytes 1-4: Geometry type (01000020 = Point with SRID)
    // Bytes 5-8: SRID (E6100000 = 4326 WGS84 in little endian)
    // Bytes 9-16: X coordinate (longitude) as 8-byte double
    // Bytes 17-24: Y coordinate (latitude) as 8-byte double
    
    // Check if we have enough bytes
    if (buffer.length < 25) {
      console.error('WKB buffer too short:', buffer.length);
      return null;
    }
    
    // Read byte order
    const byteOrder = buffer.readUInt8(0);
    const isLittleEndian = byteOrder === 1;
    
    // Read coordinates based on endianness
    const longitude = isLittleEndian 
      ? buffer.readDoubleLE(9)
      : buffer.readDoubleBE(9);
      
    const latitude = isLittleEndian
      ? buffer.readDoubleLE(17)
      : buffer.readDoubleBE(17);
    
    console.log(`Parsed WKB: lng=${longitude}, lat=${latitude}`);
    
    return { longitude, latitude };
  } catch (error) {
    console.error('Error parsing WKB point:', error);
    return null;
  }
}

/**
 * Convert parsed coordinates to GeoJSON Point format
 */
export function toGeoJSON(coords: { longitude: number; latitude: number } | null) {
  if (!coords) return null;
  
  return {
    type: 'Point',
    coordinates: [coords.longitude, coords.latitude]
  };
}

/**
 * Convert parsed coordinates to PostGIS POINT string format
 */
export function toPointString(coords: { longitude: number; latitude: number } | null) {
  if (!coords) return null;
  
  return `POINT(${coords.longitude} ${coords.latitude})`;
}
