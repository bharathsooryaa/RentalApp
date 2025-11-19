import type { Request, Response } from "express";
import { supabase } from "../utils/supabaseClient.js";
import { parseWKBPoint, toGeoJSON } from "../utils/wkbParser.js";

export const getPublicPropertyById = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;
        console.log("Fetching public property:", propertyId);

        const { data: property, error } = await supabase
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
            `)
            .eq("id", propertyId)
            .single();
        
        if (error) {
            console.error("Supabase error:", error);
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Property not found" });
            }
            return res.status(500).json({ error: "Database query failed", details: error.message });
        }
        
        // Check if property has an active lease
        const { data: activeLease } = await supabase
            .from("lease")
            .select("id, start_date, end_date, tenant_cognito_id")
            .eq("property_id", property.id)
            .gte("end_date", new Date().toISOString())
            .lte("start_date", new Date().toISOString())
            .single();
        
        // Parse WKB coordinates if they exist
        let parsedCoordinates = null;
        if (property.location?.coordinates) {
            console.log("Raw coordinates from DB:", property.location.coordinates);
            
            // If coordinates is a hex string (WKB format)
            if (typeof property.location.coordinates === 'string') {
                const parsed = parseWKBPoint(property.location.coordinates);
                if (parsed) {
                    parsedCoordinates = toGeoJSON(parsed);
                }
            }
            // If already in GeoJSON or other format, use as-is
            else {
                parsedCoordinates = property.location.coordinates;
            }
        }
        
        const propertyWithLeaseInfo = {
            ...property,
            location: property.location ? {
                ...property.location,
                coordinates: parsedCoordinates
            } : null,
            has_active_lease: !!activeLease,
            active_lease: activeLease || null
        };
        
        console.log("Returning property with parsed coordinates:", parsedCoordinates);
        res.json(propertyWithLeaseInfo);

    } catch (error) {
        console.error("Error fetching property:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
