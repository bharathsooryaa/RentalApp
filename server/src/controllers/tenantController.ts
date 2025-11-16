import type{ Request,Response } from "express";
import {supabase} from "../utils/supabaseClient.js";



export const getTenant = async (req:Request,res:Response) => {
    try{
        const {cognitoId} = req.params;
        const { data: tenant, error } = await supabase
                    .from("tenant")
                    .select(`
                        *,
                        favorites (*)
                    `)
                    .eq("cognito_id", cognitoId)
                    .single();
        
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

        const { data: existingTenant, error: fetchError } = await supabase
                    .from("tenant")
                    .select("*")
                    .eq("cognito_id", cognito_id)
                    .single();
        
        if(existingTenant){
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