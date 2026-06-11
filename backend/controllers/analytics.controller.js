// controllers/analytics.controller.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ── Helper: last N months labels ──────────────────────────────────────────────
function lastNMonths(n) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

// ── GET /api/analytics/admin ──────────────────────────────────────────────────
async function adminAnalytics(req, res) {
  try {
    const months = lastNMonths(6);

    // ── A. Property lifecycle (requests per month by status) ─────────────────
    const allRequests = await prisma.request.findMany({
      select: { status: true, submittedAt: true },
    });

    const lifecycleMap = {};
    months.forEach(({ year, month }) => {
      lifecycleMap[monthKey(year, month)] = { month: monthKey(year, month), submitted: 0, approved: 0, declined: 0 };
    });
    allRequests.forEach((r) => {
      const d   = new Date(r.submittedAt);
      const key = monthKey(d.getFullYear(), d.getMonth() + 1);
      if (!lifecycleMap[key]) return;
      lifecycleMap[key].submitted += 1;
      if (r.status === "APPROVED") lifecycleMap[key].approved += 1;
      if (r.status === "DECLINED") lifecycleMap[key].declined += 1;
    });
    const lifecycle = Object.values(lifecycleMap);

    // ── B. Property status distribution ──────────────────────────────────────
    const [pending, minted, declined] = await Promise.all([
      prisma.property.count({ where: { status: "PENDING"  } }),
      prisma.property.count({ where: { status: "MINTED"   } }),
      prisma.property.count({ where: { status: "DECLINED" } }),
    ]);
    const statusDist = [
      { name: "Pending",  value: pending  },
      { name: "Approved", value: minted   },
      { name: "Declined", value: declined },
    ];

    // ── C. Fraud / duplicate detection (duplicate docs per month) ────────────
    const dupDocs = await prisma.document.findMany({
      where: { isDuplicate: true },
      select: { createdAt: true },
    });
    const fraudMap = {};
    months.forEach(({ year, month }) => {
      fraudMap[monthKey(year, month)] = { month: monthKey(year, month), duplicates: 0 };
    });
    dupDocs.forEach((d) => {
      const dt  = new Date(d.createdAt);
      const key = monthKey(dt.getFullYear(), dt.getMonth() + 1);
      if (fraudMap[key]) fraudMap[key].duplicates += 1;
    });
    const fraud = Object.values(fraudMap);

    // ── D. Marketplace listings for sale/rent per month ───────────────────────
    const listedProps = await prisma.property.findMany({
      where: { status: "MINTED" },
      select: { isForSale: true, isForRent: true, createdAt: true },
    });
    const marketMap = {};
    months.forEach(({ year, month }) => {
      marketMap[monthKey(year, month)] = { month: monthKey(year, month), forSale: 0, forRent: 0 };
    });
    listedProps.forEach((p) => {
      const dt  = new Date(p.createdAt);
      const key = monthKey(dt.getFullYear(), dt.getMonth() + 1);
      if (!marketMap[key]) return;
      if (p.isForSale) marketMap[key].forSale += 1;
      if (p.isForRent) marketMap[key].forRent += 1;
    });
    const marketplace = Object.values(marketMap);

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalUsers      = await prisma.user.count();
    const totalProperties = await prisma.property.count();
    const totalRequests   = await prisma.request.count();
    const totalDuplicates = await prisma.document.count({ where: { isDuplicate: true } });

    return res.json({
      success: true,
      data: {
        totals: { totalUsers, totalProperties, totalRequests, totalDuplicates },
        lifecycle,
        statusDist,
        fraud,
        marketplace,
      },
    });
  } catch (err) {
    console.error("[adminAnalytics]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/analytics/user ───────────────────────────────────────────────────
async function userAnalytics(req, res) {
  try {
    const userId = req.userId;

    // Get the user's wallet address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });

    // Build OR condition: match by wallet or by user:<id>
    const orConditions = [{ submittedBy: { startsWith: `user:${userId}` } }];
    if (user?.walletAddress) {
      orConditions.push({ submittedBy: user.walletAddress.toLowerCase() });
    }

    // ── A. Asset overview (property status pie) ───────────────────────────────
    const myProperties = await prisma.property.findMany({
      where: {
        ownerWallet: user?.walletAddress?.toLowerCase() ?? "__none__",
      },
      select: { status: true, isForSale: true, isForRent: true, price: true, createdAt: true },
    });

    const assetCounts = { Approved: 0, Pending: 0, Declined: 0 };
    myProperties.forEach((p) => {
      if (p.status === "MINTED")   assetCounts.Approved += 1;
      if (p.status === "PENDING")  assetCounts.Pending  += 1;
      if (p.status === "DECLINED") assetCounts.Declined += 1;
    });
    const assetOverview = Object.entries(assetCounts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));

    // ── B. Request activity over last 6 months ────────────────────────────────
    const months = lastNMonths(6);
    const myRequests = await prisma.request.findMany({
      where: { OR: orConditions },
      select: { status: true, submittedAt: true },
    });

    const activityMap = {};
    months.forEach(({ year, month }) => {
      activityMap[monthKey(year, month)] = { month: monthKey(year, month), submitted: 0, approved: 0 };
    });
    myRequests.forEach((r) => {
      const d   = new Date(r.submittedAt);
      const key = monthKey(d.getFullYear(), d.getMonth() + 1);
      if (!activityMap[key]) return;
      activityMap[key].submitted += 1;
      if (r.status === "APPROVED") activityMap[key].approved += 1;
    });
    const requestActivity = Object.values(activityMap);

    // ── C. Property value growth (approved properties over time) ─────────────
    const approvedProps = myProperties
      .filter((p) => p.status === "MINTED")
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const valueGrowth = [];
    let runningCount = 0;
    months.forEach(({ year, month }) => {
      const key = monthKey(year, month);
      const addedThisMonth = approvedProps.filter((p) => {
        const d = new Date(p.createdAt);
        return monthKey(d.getFullYear(), d.getMonth() + 1) === key;
      }).length;
      runningCount += addedThisMonth;
      valueGrowth.push({ month: key, properties: runningCount });
    });

    // ── D. Ownership alerts (duplicate-flagged docs among my submissions) ─────
    const myPropertyIds = myProperties.map((_, i) => i); // placeholder
    const myPropRecords = await prisma.property.findMany({
      where: { ownerWallet: user?.walletAddress?.toLowerCase() ?? "__none__" },
      select: { id: true },
    });
    const myPropIds = myPropRecords.map((p) => p.id);

    const alertMap = {};
    months.forEach(({ year, month }) => {
      alertMap[monthKey(year, month)] = { month: monthKey(year, month), duplicates: 0 };
    });

    if (myPropIds.length > 0) {
      const dupDocs = await prisma.document.findMany({
        where: { propertyId: { in: myPropIds }, isDuplicate: true },
        select: { createdAt: true },
      });
      dupDocs.forEach((d) => {
        const dt  = new Date(d.createdAt);
        const key = monthKey(dt.getFullYear(), dt.getMonth() + 1);
        if (alertMap[key]) alertMap[key].duplicates += 1;
      });
    }
    const ownershipAlerts = Object.values(alertMap);

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalMyProperties = myProperties.length;
    const totalApproved     = assetCounts.Approved;
    const totalPending      = myRequests.filter((r) => r.status === "PENDING").length;
    const totalDeclined     = myRequests.filter((r) => r.status === "DECLINED").length;

    return res.json({
      success: true,
      data: {
        totals: { totalMyProperties, totalApproved, totalPending, totalDeclined },
        assetOverview,
        requestActivity,
        valueGrowth,
        ownershipAlerts,
      },
    });
  } catch (err) {
    console.error("[userAnalytics]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { adminAnalytics, userAnalytics };
