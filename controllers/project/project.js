import { Project } from "../../models/index.js";
import { createError } from "../../utils/error.js";

export const createProject = async (req, res, next) => {
  try {
    let { userInfo } = req;
    let respProject;
    let { name, description } = req.body;
    if (userInfo.userRole == "superAdmin") {
      let {
        userName: createrName,
        userEmail: createrEmail,
        userId: superAdminId,
      } = userInfo;
      let project = {
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
      respProject = await newProject.save();
    } else if (userInfo.userRole == "admin") {
      let {
        userName: createrName,
        userEmail: createrEmail,
        userId: createrId,
        userSuperAdminId: superAdminId,
      } = userInfo;
      let project = {
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
      respProject = await newProject.save();
    } else {
      return next(createError(403, "Forbidden"));
    }
    res.status(200).json({ ...respProject._doc });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    let { userInfo } = req;
    let { userRole, userSuperAdminId, userId } = userInfo;
    let superAdminId = userRole == "superAdmin" ? userId : userSuperAdminId;
    let projects = await Project.find({ superAdminId });
    res.status(200).json({ projects });
  } catch (err) {
    next(err);
  }
};
