const express = require("express");
const PageViewHour = require("../../models/PageViewHour");
const CandidateResume = require("../../models/CandidateResume");
const Job = require("../../models/Job");
const Company = require("../../models/Company");
const Contract = require("../../models/Contract");
const router = express.Router();

router.post("/page-view", async (req, res) => {
  console.log("Tracking Page View");
  try {
    const { visitorId, pageType, pageId } = req.body || {};
    if (!visitorId || !pageType || !pageId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    let visitorType = req.body.visitorType || "unknown";

    // compute UTC hour bucket
    const now = new Date();
    const hour = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours()
      )
    );
    let ownerId = null;
    if (pageType === "candidate") {
      console.log("Tracking Candidate Page View", pageId);
      const candidate = await CandidateResume.findById(pageId)
        .select("userId") // fetch only what you need
        .lean();
      console.log("Candidate:", candidate.userId);
      ownerId = candidate.userId?.toString() ?? null;
    } else if (pageType === "job") {
      const job = await Job.findById(pageId).populate("createdBy");
      ownerId = job ? job.createdBy : null;
    } else if (pageType === "company") {
      const company = await Company.findById(pageId).populate("createdBy");
      const ownerId = company ? company.createdBy : null;
    } else if (pageType === "contract") {
      // Assuming you have a Contract model
      const contract = await Contract.findById(pageId).populate("createdBy");
      ownerId = contract ? contract.createdBy : null;
    }
    // upsert: if already exists, don't create another (tracked=false)
    const r = await PageViewHour.updateOne(
      { visitorId, pageType, pageId, hour, visitorType },
      { $setOnInsert: { firstSeen: new Date(), visits: 1 } },
      { upsert: true }
    );

    // if upserted → first time this hour; otherwise already tracked
    const tracked = !!r.upsertedCount;
    res.json({ success: true, tracked, ownerId });
  } catch (e) {
    // unique-index collision in a race → treat as already tracked

    if (e.code === 11000) return res.json({ success: true, tracked: false });
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
