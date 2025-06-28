// controllers/analyticsController.js
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const credentials = JSON.parse(
  fs.readFileSync("service-account.json", "utf-8")
);

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials,
});

const propertyId = `properties/${process.env.GA_PROPERTY_ID}`;

// 📊 1. Page Views by Page Path
export const getPageViews = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
    });

    const data = response.rows?.map((row) => ({
      path: row.dimensionValues[0].value,
      views: row.metricValues[0].value,
    }));

    res.json({ data });
  } catch (error) {
    console.error("getPageViews error:", error);
    res.status(500).json({ error: "Failed to fetch page views" });
  }
};

// 📈 2. Top Events
export const getTopEvents = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    });

    const data = response.rows?.map((row) => ({
      event: row.dimensionValues[0].value,
      count: row.metricValues[0].value,
    }));

    res.json({ data });
  } catch (error) {
    console.error("getTopEvents error:", error);
    res.status(500).json({ error: "Failed to fetch top events" });
  }
};

// 👥 3. Active Users
export const getActiveUsers = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "today", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
    });

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value;
    res.json({ activeUsers });
  } catch (error) {
    console.error("getActiveUsers error:", error);
    res.status(500).json({ error: "Failed to fetch active users" });
  }
};

// 📍 4. Country-wise Users
export const getUsersByCountry = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 5,
    });

    const data = response.rows?.map((row) => ({
      country: row.dimensionValues[0].value,
      users: row.metricValues[0].value,
    }));

    res.json({ data });
  } catch (error) {
    console.error("getUsersByCountry error:", error);
    res.status(500).json({ error: "Failed to fetch users by country" });
  }
};

export const getKpis = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "eventCount" },
        { name: "averageSessionDuration" },
      ],
    });

    const values = response.rows[0].metricValues;
    res.json({
      activeUsers: values[0].value,
      newUsers: values[1].value,
      eventCount: values[2].value,
      avgSessionDuration: values[3].value,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get KPIs" });
  }
};

export const getTopPages = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "pageTitle" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "eventCount" },
        { name: "bounceRate" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });

    const data = response.rows.map((row) => ({
      title: row.dimensionValues[0].value,
      views: row.metricValues[0].value,
      activeUsers: row.metricValues[1].value,
      eventCount: row.metricValues[2].value,
      bounceRate: row.metricValues[3].value,
    }));

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get top pages" });
  }
};
export const getTrafficSources = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "firstUserSourceMedium" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    const data = response.rows.map((row) => ({
      source: row.dimensionValues[0].value,
      users: row.metricValues[0].value,
    }));

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get traffic sources" });
  }
};

export const getUsersByCity = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "city" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    const data = response.rows.map((row) => ({
      city: row.dimensionValues[0].value,
      users: row.metricValues[0].value,
    }));

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get users by city" });
  }
};

export const getNewVsReturning = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "newVsReturning" }],
      metrics: [{ name: "totalUsers" }],
    });

    const data = response.rows.map((row) => ({
      type: row.dimensionValues[0].value, // 'new' or 'returning'
      users: row.metricValues[0].value,
    }));

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get new vs returning" });
  }
};
