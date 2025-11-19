import express from "express";
import { searchProperties } from "../controllers/searchController.js";
import { getPublicPropertyById } from "../controllers/publicPropertyController.js";

const router = express.Router();

// Search properties with filters
router.get("/", searchProperties);

// Get single property by ID (public)
router.get("/:propertyId", getPublicPropertyById);

export default router;
