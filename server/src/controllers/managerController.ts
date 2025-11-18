import type{ Request,Response } from "express";
import {supabase} from "../utils/supabaseClient.js";

export const getManager=async(req:Request,res:Response)=>{
    try{
        const {cognitoId} = req.params;
        const { data: manager, error } = await supabase
                    .from("manager")
                    .select("*")
                    .eq("cognito_id", cognitoId)
                    .single();
        
        if(manager){
            res.json(manager);
        }else{
            res.status(404).json({error:"Manager not found"});
        }

    } catch (error) {
        console.error("Error fetching manager:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const createManager=async(req:Request,res:Response)=>{
    try{
        const {cognito_id,name,email,phone_number} = req.body;

        const { data: existingManager, error: fetchError } = await supabase
                    .from("manager")
                    .select("*")
                    .eq("cognito_id", cognito_id)
                    .single();
        
        if(existingManager){
            return res.status(400).json({error:"Manager with this cognito_id already exists"});
        }

        const { data: newManager, error } = await supabase
                    .from("manager")
                    .insert({
                        cognito_id,
                        name,
                        email,
                        phone_number
                    })
                    .select()
                    .single();
        
        if(newManager){
            res.status(201).json(newManager);
        }else{
            res.status(400).json({error:"Failed to create manager"});
        }

    } catch (error) {
        console.error("Error creating manager:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateManager = async (req:Request,res:Response) => {
    try{
        const {cognitoId} = req.params;
        const {name, email, phone_number} = req.body;
        console.log("Updating manager with cognito_id:", cognitoId);

        const { data: updatedManager, error } = await supabase
                    .from("manager")
                    .update({
                        name,
                        email,
                        phone_number
                    })
                    .eq("cognito_id", cognitoId)
                    .select()
                    .single();
        
        if (error) {
            console.error("Update error:", error);
            return res.status(400).json({error:"Failed to update manager", details: error.message});
        }
        
        if(updatedManager){
            res.json(updatedManager);
        }else{
            res.status(404).json({error:"Manager not found"});
        }

    } catch (error) {
        console.error("Error updating manager:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get all properties for a manager
export const getManagerProperties = async (req:Request,res:Response) => {
    try{
        const {cognitoId} = req.params;
        console.log("Fetching properties for manager:", cognitoId);

        const { data: properties, error } = await supabase
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
                    .eq("manager_cognito_id", cognitoId)
                    .order("posted_date", { ascending: false });
        
        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Database query failed", details: error.message });
        }
        
        res.json(properties || []);

    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get a single property by ID
export const getPropertyById = async (req:Request,res:Response) => {
    try{
        const {propertyId} = req.params;
        console.log("Fetching property:", propertyId);

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
                return res.status(404).json({error:"Property not found"});
            }
            return res.status(500).json({ error: "Database query failed", details: error.message });
        }
        
        res.json(property);

    } catch (error) {
        console.error("Error fetching property:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Create a new property
export const createProperty = async (req:Request,res:Response) => {
    try{
        const {
            manager_cognito_id,
            name,
            description,
            price_per_month,
            security_deposit,
            application_fee,
            photo_urls,
            amenities,
            highlights,
            is_pets_allowed,
            is_parking_included,
            beds,
            baths,
            square_feet,
            property_type,
            location
        } = req.body;

        console.log("Creating property for manager:", manager_cognito_id);
        console.log("is_pets_allowed:", is_pets_allowed, typeof is_pets_allowed);
        console.log("is_parking_included:", is_parking_included, typeof is_parking_included);

        // First, create the location
        const { data: newLocation, error: locationError } = await supabase
                    .from("location")
                    .insert({
                        address: location.address,
                        city: location.city,
                        state: location.state,
                        country: location.country,
                        postal_code: location.postal_code,
                        coordinates: location.coordinates || null
                    })
                    .select()
                    .single();
        
        if (locationError) {
            console.error("Location insert error:", locationError);
            return res.status(400).json({error:"Failed to create location", details: locationError.message});
        }

        // Then create the property
        const { data: newProperty, error: propertyError } = await supabase
                    .from("property")
                    .insert({
                        manager_cognito_id,
                        name,
                        description,
                        price_per_month,
                        security_deposit,
                        application_fee,
                        photo_urls: photo_urls || [],
                        amenities: amenities || [],
                        highlights: highlights || [],
                        is_pets_allowed: is_pets_allowed === true,
                        is_parking_included: is_parking_included === true,
                        beds,
                        baths,
                        square_feet,
                        property_type,
                        location_id: newLocation.id,
                        posted_date: new Date().toISOString(),
                        average_rating: 0,
                        number_of_reviews: 0
                    })
                    .select(`
                        *,
                        location:location_id (*)
                    `)
                    .single();
        
        if (propertyError) {
            console.error("Property insert error:", propertyError);
            return res.status(400).json({error:"Failed to create property", details: propertyError.message});
        }
        
        res.status(201).json(newProperty);

    } catch (error) {
        console.error("Error creating property:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Update a property
export const updateProperty = async (req:Request,res:Response) => {
    try{
        const {propertyId} = req.params;
        const updateData = req.body;
        console.log("Updating property:", propertyId);

        // If location data is provided, update location separately
        if (updateData.location) {
            const { data: property } = await supabase
                        .from("property")
                        .select("location_id")
                        .eq("id", propertyId)
                        .single();
            
            if (property) {
                await supabase
                    .from("location")
                    .update(updateData.location)
                    .eq("id", property.location_id);
            }
            
            delete updateData.location;
        }

        const { data: updatedProperty, error } = await supabase
                    .from("property")
                    .update(updateData)
                    .eq("id", propertyId)
                    .select(`
                        *,
                        location:location_id (*)
                    `)
                    .single();
        
        if (error) {
            console.error("Update error:", error);
            return res.status(400).json({error:"Failed to update property", details: error.message});
        }
        
        res.json(updatedProperty);

    } catch (error) {
        console.error("Error updating property:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Delete a property
export const deleteProperty = async (req:Request,res:Response) => {
    try{
        const {propertyId} = req.params;
        console.log("Deleting property:", propertyId);

        // Get the location_id first
        const { data: property } = await supabase
                    .from("property")
                    .select("location_id")
                    .eq("id", propertyId)
                    .single();

        // Delete the property
        const { error: propertyError } = await supabase
                    .from("property")
                    .delete()
                    .eq("id", propertyId);
        
        if (propertyError) {
            console.error("Delete error:", propertyError);
            return res.status(400).json({error:"Failed to delete property", details: propertyError.message});
        }

        // Delete the location
        if (property?.location_id) {
            await supabase
                .from("location")
                .delete()
                .eq("id", property.location_id);
        }
        
        res.json({message: "Property deleted successfully"});

    } catch (error) {
        console.error("Error deleting property:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get all applications for a manager's properties
export const getManagerApplications = async (req:Request,res:Response) => {
    try{
        const {cognitoId} = req.params;
        console.log("Fetching applications for manager:", cognitoId);

        // First get all properties for this manager
        const { data: properties } = await supabase
                    .from("property")
                    .select("id")
                    .eq("manager_cognito_id", cognitoId);
        
        if (!properties || properties.length === 0) {
            return res.json([]);
        }

        const propertyIds = properties.map(p => p.id);

        // Get all applications for these properties
        const { data: applications, error } = await supabase
                    .from("application")
                    .select(`
                        *,
                        property:property_id (
                            id,
                            name,
                            description,
                            price_per_month,
                            photo_urls,
                            beds,
                            baths,
                            square_feet,
                            property_type,
                            location:location_id (
                                address,
                                city,
                                state
                            )
                        ),
                        tenant:tenant_cognito_id (
                            id,
                            name,
                            email,
                            phone_number
                        )
                    `)
                    .in("property_id", propertyIds)
                    .order("application_date", { ascending: false });
        
        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Database query failed", details: error.message });
        }
        
        res.json(applications || []);

    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Update application status (approve/deny)
export const updateApplicationStatus = async (req:Request,res:Response) => {
    try{
        const {applicationId} = req.params;
        const {status} = req.body;
        console.log("Updating application status:", applicationId, status);

        if (!['Approved', 'Denied', 'Pending'].includes(status)) {
            return res.status(400).json({error:"Invalid status. Must be Approved, Denied, or Pending"});
        }

        const { data: updatedApplication, error } = await supabase
                    .from("application")
                    .update({ status })
                    .eq("id", applicationId)
                    .select(`
                        *,
                        property:property_id (
                            id,
                            name,
                            price_per_month
                        ),
                        tenant:tenant_cognito_id (
                            id,
                            name,
                            email
                        )
                    `)
                    .single();
        
        if (error) {
            console.error("Update error:", error);
            return res.status(400).json({error:"Failed to update application status", details: error.message});
        }
        
        res.json(updatedApplication);

    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Create a lease for an approved application
export const createLeaseForApplication = async (req:Request,res:Response) => {
    try{
        const {applicationId} = req.params;
        const {start_date, end_date, rent, deposit} = req.body;
        console.log("Creating lease for application:", applicationId);

        // Get the application details
        const { data: application } = await supabase
                    .from("application")
                    .select("property_id, tenant_cognito_id, status")
                    .eq("id", applicationId)
                    .single();
        
        if (!application) {
            return res.status(404).json({error:"Application not found"});
        }

        if (application.status !== 'Approved') {
            return res.status(400).json({error:"Application must be approved before creating a lease"});
        }

        // Create the lease
        const { data: newLease, error: leaseError } = await supabase
                    .from("lease")
                    .insert({
                        property_id: application.property_id,
                        tenant_cognito_id: application.tenant_cognito_id,
                        start_date,
                        end_date,
                        rent,
                        deposit
                    })
                    .select()
                    .single();
        
        if (leaseError) {
            console.error("Lease insert error:", leaseError);
            return res.status(400).json({error:"Failed to create lease", details: leaseError.message});
        }

        // Update the application with the lease_id
        await supabase
            .from("application")
            .update({ lease_id: newLease.id })
            .eq("id", applicationId);
        
        res.status(201).json(newLease);

    } catch (error) {
        console.error("Error creating lease:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}