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
        const {cognito_id,name,email,phone} = req.body;

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
                        phone
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