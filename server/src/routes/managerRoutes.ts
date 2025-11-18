import express from "express";
import {
    getManager,
    createManager,
    updateManager,
    getManagerProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    getManagerApplications,
    updateApplicationStatus,
    createLeaseForApplication
} from '../controllers/managerController.js';


const router = express.Router();

// Manager profile routes
router.get("/:cognitoId", getManager);
router.post("/", createManager);
router.put("/:cognitoId", updateManager);

// Property routes
router.get("/:cognitoId/properties", getManagerProperties);
router.get("/properties/:propertyId", getPropertyById);
router.post("/properties", createProperty);
router.put("/properties/:propertyId", updateProperty);
router.delete("/properties/:propertyId", deleteProperty);

// Application routes
router.get("/:cognitoId/applications", getManagerApplications);
router.put("/applications/:applicationId/status", updateApplicationStatus);
router.post("/applications/:applicationId/lease", createLeaseForApplication);

export default router;
