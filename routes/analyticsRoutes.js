// routes/analyticsRoutes.js
import express from "express";
import {
  getPageViews,
  getTopEvents,
  getActiveUsers,
  getUsersByCountry,
  getKpis,
  getTopPages,
  getTrafficSources,
  getUsersByCity,
  getNewVsReturning,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/page-views", getPageViews);
router.get("/top-events", getTopEvents);
router.get("/active-users", getActiveUsers);
router.get("/users-by-country", getUsersByCountry);
router.get("/kpis", getKpis);
router.get("/top-pages", getTopPages);
router.get("/traffic-sources", getTrafficSources);
router.get("/users-by-city", getUsersByCity);
router.get("/new-vs-returning", getNewVsReturning);

export default router;
