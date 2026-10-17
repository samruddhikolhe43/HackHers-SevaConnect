/**
 * Safe In-Browser EXIF GPS Coordinate Extractor & Haversine Distance Utility
 * Reads standard JPEG APP1/Exif metadata without heavy native dependencies.
 */

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export type LocationEvidenceStatus = 
  | 'Location Evidence Consistent'
  | 'Location Evidence Incomplete'
  | 'Location Mismatch — Review Required'
  | 'Location Not Available';

export interface LocationEvidenceResult {
  status: LocationEvidenceStatus;
  notes: string;
  deviceDistanceKm: number | null;
  photoDistanceKm: number | null;
  consistent: boolean | null;
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Safely extracts GPS Latitude and Longitude from a JPEG File object
 */
export async function extractExifGps(file: File): Promise<GpsCoordinates | null> {
  try {
    // Only JPEG/TIFF standard contains standard EXIF APP1
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      return null;
    }

    const arrayBuffer = await file.slice(0, 128 * 1024).arrayBuffer(); // read first 128KB
    const view = new DataView(arrayBuffer);

    // Verify SOI (Start of Image) marker: 0xFFD8
    if (view.getUint16(0, false) !== 0xffd8) {
      return null;
    }

    let offset = 2;
    const length = view.byteLength;

    // Scan for APP1 marker (0xFFE1)
    while (offset < length - 4) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xffe1) {
        // Found APP1
        const app1Length = view.getUint16(offset, false);
        offset += 2;

        // Check for 'Exif\0\0' (0x45786966 0x0000)
        if (
          view.getUint32(offset, false) === 0x45786966 &&
          view.getUint16(offset + 4, false) === 0x0000
        ) {
          const tiffStart = offset + 6;
          return parseTiffGps(view, tiffStart);
        }
        offset += app1Length - 2;
      } else if ((marker & 0xff00) === 0xff00) {
        // Skip other markers
        const markerLength = view.getUint16(offset, false);
        offset += markerLength;
      } else {
        break;
      }
    }

    return null;
  } catch (err) {
    console.debug('EXIF GPS extraction caught (no GPS or non-standard format):', err);
    return null;
  }
}

function parseTiffGps(view: DataView, tiffStart: number): GpsCoordinates | null {
  // Check endianness
  const byteOrder = view.getUint16(tiffStart, false);
  let littleEndian = false;
  if (byteOrder === 0x4949) {
    littleEndian = true; // Intel
  } else if (byteOrder === 0x4d4d) {
    littleEndian = false; // Motorola
  } else {
    return null;
  }

  // Check 0x002A fixed marker
  if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) {
    return null;
  }

  const ifd0Offset = view.getUint32(tiffStart + 4, littleEndian);
  let ifdOffset = tiffStart + ifd0Offset;

  const numEntries = view.getUint16(ifdOffset, littleEndian);
  ifdOffset += 2;

  let gpsInfoOffset = 0;

  for (let i = 0; i < numEntries; i++) {
    const entryOffset = ifdOffset + i * 12;
    if (entryOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOffset, littleEndian);
    if (tag === 0x8825) {
      // GPSInfo tag
      gpsInfoOffset = view.getUint32(entryOffset + 8, littleEndian);
      break;
    }
  }

  if (!gpsInfoOffset) {
    return null;
  }

  // Parse GPS IFD
  const gpsIfdStart = tiffStart + gpsInfoOffset;
  if (gpsIfdStart + 2 > view.byteLength) return null;

  const gpsEntries = view.getUint16(gpsIfdStart, littleEndian);
  let latRef = 'N';
  let lngRef = 'E';
  let latDeg: number[] | null = null;
  let lngDeg: number[] | null = null;

  for (let i = 0; i < gpsEntries; i++) {
    const entryOffset = gpsIfdStart + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOffset, littleEndian);

    if (tag === 0x0001) {
      // GPSLatitudeRef
      latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    } else if (tag === 0x0002) {
      // GPSLatitude
      const offsetToVals = tiffStart + view.getUint32(entryOffset + 8, littleEndian);
      latDeg = readRational3(view, offsetToVals, littleEndian);
    } else if (tag === 0x0003) {
      // GPSLongitudeRef
      lngRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    } else if (tag === 0x0004) {
      // GPSLongitude
      const offsetToVals = tiffStart + view.getUint32(entryOffset + 8, littleEndian);
      lngDeg = readRational3(view, offsetToVals, littleEndian);
    }
  }

  if (latDeg && lngDeg) {
    let lat = latDeg[0] + latDeg[1] / 60 + latDeg[2] / 3600;
    if (latRef === 'S') lat = -lat;
    let lng = lngDeg[0] + lngDeg[1] / 60 + lngDeg[2] / 3600;
    if (lngRef === 'W') lng = -lng;

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return null;
}

function readRational3(view: DataView, offset: number, littleEndian: boolean): number[] | null {
  if (offset + 24 > view.byteLength) return null;
  const values: number[] = [];
  for (let i = 0; i < 3; i++) {
    const num = view.getUint32(offset + i * 8, littleEndian);
    const den = view.getUint32(offset + i * 8 + 4, littleEndian);
    values.push(den === 0 ? 0 : num / den);
  }
  return values;
}

/**
 * Compares selected incident position with device GPS & photo geotag
 */
export function evaluateLocationEvidence(
  selectedLat: number | null,
  selectedLng: number | null,
  deviceLat: number | null,
  deviceLng: number | null,
  photoLat: number | null,
  photoLng: number | null
): LocationEvidenceResult {
  const THRESHOLD_KM = 2.5;

  const hasDeviceGps = deviceLat != null && deviceLng != null && !isNaN(deviceLat) && !isNaN(deviceLng);
  const hasPhotoGps = photoLat != null && photoLng != null && !isNaN(photoLat) && !isNaN(photoLng);

  if (!hasDeviceGps && !hasPhotoGps) {
    return {
      status: 'Location Not Available',
      notes: 'No automated GPS telemetry provided. Address verification relies on manual pin and landmark.',
      deviceDistanceKm: null,
      photoDistanceKm: null,
      consistent: null
    };
  }

  let deviceDist: number | null = null;
  let photoDist: number | null = null;
  let hasMismatch = false;
  const mismatchNotes: string[] = [];

  if (hasDeviceGps && selectedLat != null && selectedLng != null) {
    deviceDist = calculateDistanceKm(selectedLat, selectedLng, deviceLat, deviceLng);
    if (deviceDist != null && deviceDist > THRESHOLD_KM) {
      hasMismatch = true;
      mismatchNotes.push(`Device is ${deviceDist.toFixed(1)} km from chosen incident pin.`);
    }
  }

  if (hasPhotoGps && selectedLat != null && selectedLng != null) {
    photoDist = calculateDistanceKm(selectedLat, selectedLng, photoLat, photoLng);
    if (photoDist != null && photoDist > THRESHOLD_KM) {
      hasMismatch = true;
      mismatchNotes.push(`Photo GPS geotag was taken ${photoDist.toFixed(1)} km from incident pin.`);
    }
  }

  if (hasMismatch) {
    return {
      status: 'Location Mismatch — Review Required',
      notes: `${mismatchNotes.join(' ')} (Note: Reporter may be filing remotely on behalf of a witnessed event; marked for coordinator review).`,
      deviceDistanceKm: deviceDist ? parseFloat(deviceDist.toFixed(2)) : null,
      photoDistanceKm: photoDist ? parseFloat(photoDist.toFixed(2)) : null,
      consistent: false
    };
  }

  if (!hasPhotoGps || !hasDeviceGps) {
    const available = hasDeviceGps ? 'Device GPS' : 'Photo Geotag';
    const dist = hasDeviceGps ? deviceDist : photoDist;
    return {
      status: 'Location Evidence Incomplete',
      notes: `${available} aligns with pin (${dist != null ? dist.toFixed(1) + ' km' : 'matched'}), but ${!hasPhotoGps ? 'photo EXIF GPS was omitted or stripped by camera/messaging settings' : 'device GPS was not permitted'}.`,
      deviceDistanceKm: deviceDist ? parseFloat(deviceDist.toFixed(2)) : null,
      photoDistanceKm: photoDist ? parseFloat(photoDist.toFixed(2)) : null,
      consistent: true
    };
  }

  return {
    status: 'Location Evidence Consistent',
    notes: `Device GPS (${deviceDist?.toFixed(1)} km) and Photo Geotag (${photoDist?.toFixed(1)} km) align within the ${THRESHOLD_KM} km tolerance.`,
    deviceDistanceKm: deviceDist ? parseFloat(deviceDist.toFixed(2)) : null,
    photoDistanceKm: photoDist ? parseFloat(photoDist.toFixed(2)) : null,
    consistent: true
  };
}
