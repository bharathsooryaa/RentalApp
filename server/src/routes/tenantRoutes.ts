import express from 'express';
import {
    getTenant,
    createTenant,
    updateTenant,
    getTenantApplications,
    createApplication,
    getTenantFavorites,
    addFavorite,
    removeFavorite,
    getTenantResidences,
    getLeasePayments
} from '../controllers/tenantController.js';


const router = express.Router();

// Tenant profile routes
router.get("/:cognitoId", getTenant);
router.post("/", createTenant);
router.put("/:cognitoId", updateTenant);

// Application routes
router.get("/:cognitoId/applications", getTenantApplications);
router.post("/applications", createApplication);

// Favorites routes
router.get("/:cognitoId/favorites", getTenantFavorites);
router.post("/favorites", addFavorite);
router.delete("/:cognitoId/favorites/:propertyId", removeFavorite);

// Residences routes
router.get("/:cognitoId/residences", getTenantResidences);
router.get("/leases/:leaseId/payments", getLeasePayments);


export default router;