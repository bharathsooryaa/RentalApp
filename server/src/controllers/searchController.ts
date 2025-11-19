import type { Request, Response } from "express";
import { supabase } from "../utils/supabaseClient.js";
import { parseWKBPoint, toGeoJSON } from "../utils/wkbParser.js";

export const searchProperties = async (req: Request, res: Response) => {
    try {
        const {
            city,
            state,
            minPrice,
            maxPrice,
            beds,
            baths,
            propertyType,
            isPetsAllowed,
            isParkingIncluded,
            minSquareFeet,
            maxSquareFeet,
            latitude,
            longitude,
            radiusKm = 10,
            sortBy = 'posted_date',
            sortOrder = 'desc'
        } = req.query;

        console.log("Searching properties with filters:", req.query);

        // Start building the query
        let query = supabase
            .from("property")
            .select(`
                *,
                location:location_id (
                    id,
                    address,
                    city,
                    state,
                    country,
                    postal_code,
                    coordinates
                )
            `);

        // Apply filters
        if (city) {
            query = query.ilike('location.city', `%${city}%`);
        }

        if (state) {
            query = query.ilike('location.state', `%${state}%`);
        }

        if (minPrice) {
            query = query.gte('price_per_month', parseFloat(minPrice as string));
        }

        if (maxPrice) {
            query = query.lte('price_per_month', parseFloat(maxPrice as string));
        }

        if (beds) {
            query = query.gte('beds', parseInt(beds as string));
        }

        if (baths) {
            query = query.gte('baths', parseFloat(baths as string));
        }

        if (propertyType) {
            query = query.eq('property_type', propertyType);
        }

        if (isPetsAllowed !== undefined) {
            query = query.eq('is_pets_allowed', isPetsAllowed === 'true');
        }

        if (isParkingIncluded !== undefined) {
            query = query.eq('is_parking_included', isParkingIncluded === 'true');
        }

        if (minSquareFeet) {
            query = query.gte('square_feet', parseInt(minSquareFeet as string));
        }

        if (maxSquareFeet) {
            query = query.lte('square_feet', parseInt(maxSquareFeet as string));
        }

        // Apply sorting
        const ascending = sortOrder === 'asc';
        query = query.order(sortBy as string, { ascending });

        const { data: properties, error } = await query;

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Database query failed", details: error.message });
        }

        let results = properties || [];

        // If location-based search is requested, filter and sort by distance
        if (latitude && longitude && results.length > 0) {
            const lat = parseFloat(latitude as string);
            const lng = parseFloat(longitude as string);
            const radius = parseFloat(radiusKm as string);

            // Filter properties with coordinates and calculate distance
            results = results
                .map(property => {
                    if (!property.location?.coordinates) {
                        return null;
                    }

                    // Parse coordinates from various formats
                    let propLat: number, propLng: number;
                    
                    if (typeof property.location.coordinates === 'string') {
                        // Try WKB format first (hex string)
                        if (property.location.coordinates.match(/^[0-9A-Fa-f]+$/)) {
                            const parsed = parseWKBPoint(property.location.coordinates);
                            if (parsed) {
                                propLng = parsed.longitude;
                                propLat = parsed.latitude;
                                // Update property with parsed GeoJSON format
                                property.location.coordinates = toGeoJSON(parsed);
                            } else {
                                return null;
                            }
                        }
                        // Try POINT string format
                        else {
                            const match = property.location.coordinates.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
                            if (match) {
                                propLng = parseFloat(match[1]);
                                propLat = parseFloat(match[2]);
                            } else {
                                return null;
                            }
                        }
                    } else if (property.location.coordinates.coordinates) {
                        // GeoJSON format
                        [propLng, propLat] = property.location.coordinates.coordinates;
                    } else {
                        return null;
                    }

                    // Calculate distance using Haversine formula
                    const distance = calculateDistance(lat, lng, propLat, propLng);

                    if (distance <= radius) {
                        return {
                            ...property,
                            distance: distance,
                            distanceText: distance < 1 
                                ? `${Math.round(distance * 1000)}m away`
                                : `${distance.toFixed(1)}km away`
                        };
                    }
                    return null;
                })
                .filter(Boolean)
                .sort((a, b) => (a?.distance || 0) - (b?.distance || 0));
        }

        // For each property, check if it has an active lease
        const propertiesWithLeaseInfo = await Promise.all(
            results.map(async (property) => {
                const { data: activeLease } = await supabase
                    .from("lease")
                    .select("id, start_date, end_date, tenant_cognito_id")
                    .eq("property_id", property.id)
                    .gte("end_date", new Date().toISOString())
                    .lte("start_date", new Date().toISOString())
                    .single();
                
                return {
                    ...property,
                    has_active_lease: !!activeLease,
                    active_lease: activeLease || null
                };
            })
        );

        res.json(propertiesWithLeaseInfo);

    } catch (error) {
        console.error("Error searching properties:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}
