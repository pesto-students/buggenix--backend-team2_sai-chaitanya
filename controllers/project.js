import { Project, Ticket } from "../models/index.js";
import { createError } from "../utils/error.js";
import { format } from "date-fns";

export const createProject = async (req, res, next) => {
  try {
    const { userInfo } = req;
    let projectResp;
    const { name, description } = req.body;
    let ticketCount = 0;
    let openTicketCount = 0;
    let members = [];
    if (userInfo.userRole == "superAdmin") {
      const {
        userName: createrName,
        userEmail: createrEmail,
        userId: superAdminId,
      } = userInfo;
      const project = {
        name,
        description,
        superAdminId,
        creator: {
          name: createrName,
          email: createrEmail,
          id: superAdminId,
        },
      };
      const newProject = new Project(project);
      projectResp = await newProject.save();
      members.push(project.creator);
    } else if (userInfo.userRole == "admin") {
      const {
        userName: createrName,
        userEmail: createrEmail,
        userId: createrId,
        userSuperAdminId: superAdminId,
      } = userInfo;
      const project = {
        name,
        description,
        superAdminId,
        creator: {
          name: createrName,
          email: createrEmail,
          id: createrId,
        },
      };
      const newProject = new Project(project);
      projectResp = await newProject.save();
      // add superadmin account
      members.push(project.creator);
    } else {
      return next(createError(403, "Forbidden"));
    }
    const createdAt = projectResp._doc.createdAt;
    const formattedDate = format(createdAt, "MMM dd, yyyy");
    res.status(200).json({
      ...projectResp._doc,
      ticketCount: ticketCount,
      openTicketCount,
      members,
      id: projectResp._doc._id,
      createdAt: formattedDate,
      ticketIds: [],
    });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { userInfo } = req;
    const { userRole, userSuperAdminId, userId } = userInfo;
    const superAdminId = userRole == "superAdmin" ? userId : userSuperAdminId;
    let projects = await Project.find({ superAdminId });
    let newProjects = [];
    for (let project of projects) {
      const { _id: id } = project;
      console.log(id);
      const tickets = await Ticket.find(
        { projectId: id },
        {
          _id: 0,
          type: 0,
          description: 0,
          creatorInfo: 0,
          priority: 0,
          scrapedFrom: 0,
          conversations: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          projectId: 0,
          assigneeId: 0,
          superAdminId: 0,
        }
      );
      console.log("tickets", tickets);
      let newProject = {
        ...project._doc,
      };
      const openedTickets = tickets.filter((ticket) => ticket.status == "open");
      let members = tickets.map((ticket) => ticket?.assigneeInfo);
      members.push(project.creator);
      newProject["ticketCount"] = tickets.length;
      newProject["openTicketCount"] = openedTickets.length;
      newProject["members"] = members;
      newProject["id"] = id;
      const createdAt = project._doc.createdAt;
      const formattedDate = format(createdAt, "MMM dd, yyyy");
      newProject["createdAt"] = formattedDate;
      newProject["ticketIds"] = tickets.map((ticket) => ticket._id) || [];
      console.log(newProject);
      newProjects.push(newProject);
    }
    res.status(200).json(newProjects);
  } catch (err) {
    next(err);
  }
};

export const projectController = {
  getProjects,
  createProject,
};
