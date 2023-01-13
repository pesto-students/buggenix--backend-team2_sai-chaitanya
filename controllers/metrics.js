import { Notes, Ticket, Twitter, User } from "../models/index.js";

const ticketMetrics = async (req, res, next) => {
  try {
    const { userInfo } = req;
    let superAdminId = userInfo.userSuperAdminId;
    if (userInfo.userRole == "superAdmin") {
      superAdminId = userInfo.userId;
    }
    const tickets = await Ticket.find({
      superAdminId,
    });
    let responseObj = {
      bugsCount: 0,
      featuresCount: 0,
      feedbacksCount: 0,
      pendingCount: 0,
      openCount: 0,
      resolvedCount: 0,
    };
    tickets.map((ticket) => {
      if (ticket.type == "bug") responseObj["bugsCount"] += 1;
      if (ticket.type == "feedback") responseObj["feedbacksCount"] += 1;
      if (ticket.type == "feature") responseObj["featuresCount"] += 1;
      if (ticket.status == "open") responseObj["openCount"] += 1;
      if (ticket.status != "done") responseObj["pendingCount"] += 1;
      if (ticket.status == "done") responseObj["resolvedCount"] += 1;
    });
    res.status(200).json({ ...responseObj });
  } catch (err) {
    next(err);
  }
};

export const metricController = {
  ticketMetrics
};
