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