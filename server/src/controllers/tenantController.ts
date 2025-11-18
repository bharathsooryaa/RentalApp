import type{ Request,Response } from "express";
import {supabase} from "../utils/supabaseClient.js";



export const getTenant = async (req:Request,res:Response) => {
    try{
        const {cognitoId} = req.params;
        console.log("Looking for tenant with cognito_id:", cognitoId);
        
        const { data: tenant, error } = await supabase
                    .from("tenant")
                    .select(`
                        *,
                        tenant_favorites (*)
                    `)
                    .eq("cognito_id", cognitoId)
                    .single();
        
        
        if (error) {
            console.error("Supabase error:", error);
            if (error.code === 'PGRST116') {
                return res.status(404).json({error:"Tenant not found"});
            }
            return res.status(500).json({ error: "Database query failed", details: error.message });
        }
        
        if(tenant){
            res.json(tenant);
        }else{
            res.status(404).json({error:"Tenant not found"});
        }

    } catch (error) {
        console.error("Error fetching tenant:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const createTenant = async (req:Request,res:Response) => {
    try{
        const {cognito_id,name,email,phone_number} = req.body;
        console.log("Creating tenant with cognito_id:", cognito_id);

        const { data: existingTenant, error: fetchError } = await supabase
                    .from("tenant")
                    .select("*")
                    .eq("cognito_id", cognito_id)
                    .single();
        
        // If there's no error or the error is just "not found", continue
        if(existingTenant && !fetchError){
            return res.status(400).json({error:"Tenant with this cognito_id already exists"});
        }

        const { data: newTenant, error } = await supabase
                    .from("tenant")
                    .insert({
                        cognito_id,
                        name,
                        email,
                        phone_number
                    })
                    .select()
                    .single();
        
        console.log("Insert result:", { newTenant, error });
        
        if (error) {
            console.error("Insert error:", error);
            return res.status(400).json({error:"Failed to create tenant", details: error.message});
        }
        
        if(newTenant){
            res.status(201).json(newTenant);
        }else{
            res.status(400).json({error:"Failed to create tenant"});
        }

    } catch (error) {
        console.error("Error creating tenant:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateTenant = async (req:Request,res:Response) => {
    try{
        const {cognitoId} = req.params;
        const {name, email, phone_number} = req.body;
        console.log("Updating tenant with cognito_id:", cognitoId);

        const { data: updatedTenant, error } = await supabase
                    .from("tenant")
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
            return res.status(400).json({error:"Failed to update tenant", details: error.message});
        }
        
        if(updatedTenant){
            res.json(updatedTenant);
        }else{
            res.status(404).json({error:"Tenant not found"});
        }

    } catch (error) {
        console.error("Error updating tenant:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get all applications for a tenant
export const getTenantApplications = async (req:Request,res:Response) => {
    try{
        const {cognitoId} = req.params;
        console.log("Fetching applications for tenant:", cognitoId);

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
                        lease:lease_id (
                            id,
                            start_date,
                            end_date,
                            rent,
                            deposit
                        )
                    `)
                    .eq("tenant_cognito_id", cognitoId)
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

// Create a new application
export const createApplication = async (req:Request,res:Response) => {
    try{
        const {tenant_cognito_id, property_id, name, email, phone_number, message} = req.body;
        console.log("Creating application for property:", property_id);

        // Check if application already exists
        const { data: existingApp, error: fetchError } = await supabase
                    .from("application")
                    .select("*")
                    .eq("tenant_cognito_id", tenant_cognito_id)
                    .eq("property_id", property_id)
                    .single();
        
        if(existingApp && !fetchError){
            return res.status(400).json({error:"You have already applied to this property"});
        }

        const { data: newApplication, error } = await supabase
                    .from("application")
                    .insert({
                        tenant_cognito_id,
                        property_id,
                        name,
                        email,
                        phone_number,
                        message: message || null,
                        application_date: new Date().toISOString(),
                        status: 'Pending'
                    })
                    .select(`
                        *,
                        property:property_id (
                            id,
                            name,
                            price_per_month
                        )
                    `)
                    .single();
        
        if (error) {
            console.error("Insert error:", error);
            return res.status(400).json({error:"Failed to create application", details: error.message});
        }
        
        res.status(201).json(newApplication);

    } catch (error) {
        console.error("Error creating application:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get tenant's favorite properties
export const getTenantFavorites = async (req:Request,res:Response) => {
    try{
        const {cognitoId} = req.params;
        console.log("Fetching favorites for tenant:", cognitoId);

        const { data: favorites, error } = await supabase
                    .from("tenant_favorites")
                    .select(`
                        id,
                        created_at,
                        property:property_id (
                            id,
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
                            posted_date,
                            average_rating,
                            number_of_reviews,
                            location:location_id (
                                id,
                                address,
                                city,
                                state,
                                country,
                                postal_code
                            )
                        )
                    `)
                    .eq("tenant_cognito_id", cognitoId)
                    .order("created_at", { ascending: false });
        
        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Database query failed", details: error.message });
        }
        
        res.json(favorites || []);

    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Add a property to favorites
export const addFavorite = async (req:Request,res:Response) => {
    try{
        const {tenant_cognito_id, property_id} = req.body;
        console.log("Adding favorite for tenant:", tenant_cognito_id);

        // Check if already favorited
        const { data: existing } = await supabase
                    .from("tenant_favorites")
                    .select("*")
                    .eq("tenant_cognito_id", tenant_cognito_id)
                    .eq("property_id", property_id)
                    .single();
        
        if(existing){
            return res.status(400).json({error:"Property already in favorites"});
        }

        const { data: newFavorite, error } = await supabase
                    .from("tenant_favorites")
                    .insert({
                        tenant_cognito_id,
                        property_id
                    })
                    .select()
                    .single();
        
        if (error) {
            console.error("Insert error:", error);
            return res.status(400).json({error:"Failed to add favorite", details: error.message});
        }
        
        res.status(201).json(newFavorite);

    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Remove a property from favorites
export const removeFavorite = async (req:Request,res:Response) => {
    try{
        const {cognitoId, propertyId} = req.params;
        console.log("Removing favorite for tenant:", cognitoId);

        const { error } = await supabase
                    .from("tenant_favorites")
                    .delete()
                    .eq("tenant_cognito_id", cognitoId)
                    .eq("property_id", propertyId);
        
        if (error) {
            console.error("Delete error:", error);
            return res.status(400).json({error:"Failed to remove favorite", details: error.message});
        }
        
        res.json({message: "Favorite removed successfully"});

    } catch (error) {
        console.error("Error removing favorite:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get tenant's current residences (active leases)
export const getTenantResidences = async (req:Request,res:Response) => {
    try{
        const {cognitoId} = req.params;
        console.log("Fetching residences for tenant:", cognitoId);

        const { data: leases, error } = await supabase
                    .from("lease")
                    .select(`
                        id,
                        start_date,
                        end_date,
                        rent,
                        deposit,
                        property:property_id (
                            id,
                            name,
                            description,
                            photo_urls,
                            beds,
                            baths,
                            square_feet,
                            property_type,
                            location:location_id (
                                address,
                                city,
                                state,
                                country,
                                postal_code
                            ),
                            manager:manager_cognito_id (
                                name,
                                email,
                                phone_number
                            )
                        )
                    `)
                    .eq("tenant_cognito_id", cognitoId)
                    .order("start_date", { ascending: false });
        
        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Database query failed", details: error.message });
        }
        
        res.json(leases || []);

    } catch (error) {
        console.error("Error fetching residences:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get payments for a specific lease
export const getLeasePayments = async (req:Request,res:Response) => {
    try{
        const {leaseId} = req.params;
        console.log("Fetching payments for lease:", leaseId);

        const { data: payments, error } = await supabase
                    .from("payment")
                    .select("*")
                    .eq("lease_id", leaseId)
                    .order("due_date", { ascending: false });
        
        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Database query failed", details: error.message });
        }
        
        res.json(payments || []);

    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}