import { Project } from "../models/index.js";
import { createError } from "../utils/error.js";

export const createProject = async (req, res, next) => {
  try {
    const { userInfo } = req;
    let projectResp;
    const { name, description } = req.body;
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
        createrInfo: {
          createrName,
          createrEmail,
          createrId: superAdminId,
        },
      };
      const newProject = new Project(project);
      projectResp = await newProject.save();
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
        createrInfo: {
          createrName,
          createrEmail,
          createrId,
        },
      };
      const newProject = new Project(project);
      projectResp = await newProject.save();
    } else {
      return next(createError(403, "Forbidden"));
    }
    res.status(200).json({ ...projectResp._doc });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { userInfo } = req;
    const { userRole, userSuperAdminId, userId } = userInfo;
    const superAdminId = userRole == "superAdmin" ? userId : userSuperAdminId;
    const projects = await Project.find({ superAdminId });
    res.status(200).json({ projects });
  } catch (err) {
    next(err);
  }
};

export const projectController = {
  getProjects,
  createProject,
};
