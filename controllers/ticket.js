import axios from "axios";
import { Notes, Ticket, Twitter, User } from "../models/index.js";
import cron from "node-cron";
import { createError } from "../utils/error.js";
import { json } from "express";
import { format, getMinutes } from "date-fns";
import user from "../models/user.js";
import notes from "../models/notes.js";
import { getTime } from 'date-fns'



// cron.schedule("* */1 * * *", async () => {
//   console.log("running a task every minute");
//   let users = await User.find({
//     $and: [
//       { socialNetworkHandle: { $exists: true } },
//       { "socialNetworkHandle.0": { $exists: true } },
//     ],
//   });
//   //   console.log("users", users);
//   for (const user of users) {
//     console.log("user", user);
//     let twitterHandle = user.socialNetworkHandle[0].twitter || "";
//     let superAdminId = user._id;
//     let twitter = await Twitter.findOne({ superAdminId });
//     let lastScrapedId = twitter?.lastScrapedId || "";
//     console.log("lastScrapedId", lastScrapedId, twitterHandle);
//     if (twitterHandle) {
//       console.log(22);
//       let twitterData = await getTicketFromTwitter(
//         twitterHandle,
//         lastScrapedId
//       );
//       let { status, data, includes, meta } = twitterData;
//       console.log("twitterData29");
//       //   break;
//       if (status != 200 || data.length == 0) continue;
//       let { newest_id: newestId } = meta;
//       lastScrapedId = newestId;
//       console.log("twitterData");
//       if (data.length) {
//         // console.log("11",data.length,data,includes)
//         for (const info of data) {
//           let { text: description, id: tweetId, created_at, author_id } = info;
//           // console.log("info",info)
//           let twitterUser = includes.users.find((user) => user.id == author_id);
//           // console.log("twitterUser",twitterUser)
//           let scrapedFrom = "twitter";
//           let ticket = {
//             description,
//             superAdminId,
//             scrapedFrom,
//             creatorInfo: {
//               tweetId,
//               created_at,
//               id: author_id,
//               name: twitterUser.username,
//               // name: "Harish Balasubramanian",
//               // id: "56739",
//               type: "customer",
//               channel: "twitter",
//             },
//           };
//           // console.log("twitterUser", twitterUser);

//           const newTicket = new Ticket(ticket);
//           let responseTicket = await newTicket.save();
//           // console.log("response", responseTicket);
//         }
//         if (twitter && lastScrapedId) {
//           console.log(63);
//           await Twitter.findOneAndUpdate({ superAdminId }, { lastScrapedId });
//         } else if (!twitter && lastScrapedId) {
//           console.log(66);
//           let twitterObj = {
//             superAdminId,
//             lastScrapedId,
//           };
//           const newTwitter = new Twitter(twitterObj);
//           await newTwitter.save();
//         }
//       }
//     }
//   }
// });

const createTicket = async (req, res, next) => {
  try {
    const { userInfo } = req;
    const { status, assigneeId, type, priority, projectId, description } =
      req.body;
    let ticket = {
      description,
      superAdminId:
        userInfo.userRole == "superAdmin"
          ? userInfo.userId
          : userInfo.userSuperAdminId,
      creatorInfo: {
        id: userInfo.userId,
        name: userInfo.userName,
        type: "member",
        channel: null,
      },
    };
    if (status) ticket["status"] = status;
    if (assigneeId) ticket["assigneeId"] = assigneeId;
    if (type) ticket["type"] = type;
    if (priority) ticket["priority"] = priority;
    if (projectId) ticket["projectId"] = projectId;
    const newTicket = new Ticket(ticket);
    let responseTicket = await newTicket.save();
    const createdAt = responseTicket._doc.createdAt;
    const formattedDate = format(createdAt, "MMM dd, yyyy");
    res.status(200).json({
      ...responseTicket._doc,
      id: responseTicket._doc._id,
      conversations: [],
      conversationCount: 0,
      timestamp: formattedDate,
    });
  } catch (err) {
    next(err);
  }
};
export const getTickets = async (req, res, next) => {
  try {
    // console.log("twitterData",twitterData);
    const { userInfo } = req;
    let { userRole, userSuperAdminId, userId,userName,userEmail } = userInfo;
    let superAdminId = userInfo.userSuperAdminId;
    if (userInfo.userRole == "superAdmin") {
      superAdminId = userInfo.userId;
    }
    let tickets = await Ticket.find({
      superAdminId: superAdminId,
    }).populate({
      path: "conversations",
    });
    let ticketResponse = [];
    for (let ticket of tickets) {
      let ticketObj = {};
      const createdAt = ticket._doc.createdAt;
      const formattedDate = format(createdAt, "MMM dd, yyyy");
      ticketObj = {
        ...ticket._doc,
        id: ticket._id,
        timestamp: formattedDate,
        conversationCount: ticket._doc.conversations.length,
      };

      ticketResponse.push(ticketObj);
    }
    if (!ticketResponse.length) {
      if(userRole!='superAdmin'){
        const superAdmin = await User.findById(userSuperAdminId);
        let { username,email } = superAdmin;
        userName = username;
        userId = userSuperAdminId;
        userEmail = email
      }
      const defaultTicket = {
        creatorInfo: {
          name: userName,
          id: userId,
          type: "customer",
          channel: "twitter",
        },
        status: "progress",
        superAdminId,
        type: "feature",
        // conversationCount: "3",
        assigneeId: null,
        label: null,
        description: "We would love to see new and improved features",
        projectId: null,
        default:1
      };
      const newTicket = new Ticket(defaultTicket);
      let responseTicket = await newTicket.save();
      const {_id:ticketId} = responseTicket._doc;
      let newNotes = [
        {
          type: "note",
          description:
            "Ryan, could you get onto this? Perhaps, you could talk to your manager, get your team acting on it ASAP?",
        },
        {
          type: "note",
          description:
            "I will look into it. In the while, it'll be great if we could also focus on the Acme team's issue",
          timestamp: "20 minutes ago",
          creatorInfo: {
            name: "Aditya Vinayak",
            id: "3256",
          },
        },
        {
          type: "note",
          description:
            "I will look into it. In the while, it'll be great if we could also focus on the Acme team's issue",
          timestamp: "20 minutes ago",
          creatorInfo: {
            name: "Aditya Vinayak",
            id: "3256",
          },
        },
      ]
      for(let note of newNotes){
        let {description} = note;
        let date= new Date()
        let hours = date.getHours()
        let mins = date.getMinutes()
        const noteObj = {
          ticketId,
          description,
          creatorInfo: {
            id:userId,
            name:userName,
            email:userEmail,
          },
          timestamp:`${hours}:${mins} ${hours>12?'PM':'AM'}`
        };
        const newNote = new Notes(noteObj);
        const noteResp = await newNote.save();
        await Ticket.findByIdAndUpdate(ticketId,{$push:{conversations:noteResp._doc._id}});
      }
      let updatedTickets = await Ticket.findById({
        ticketId
      }).populate({
        path: "conversations",
      });
      const createdAt = responseTicket._doc.createdAt;
      const formattedDate = format(createdAt, "MMM dd, yyyy");
      let ticketObj = {
        ...updatedTickets._doc,
        id: ticketId,
        timestamp: formattedDate,
        conversationCount: updatedTickets._doc.conversations.length,
      };
      ticketResponse.push(ticketObj);
    }
    res.status(200).json(ticketResponse);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getTicketFromTwitter = async (twitterHandle, sinceId = "") => {
  // AdnanSamiLive
  console.log(103);
  let url = `https://api.twitter.com/2/tweets/search/recent?query=to:${twitterHandle}&user.fields=username&expansions=author_id`;
  if (sinceId) {
    url += `&since_id=${sinceId}`;
  }
  let config = {
    method: "get",
    url: url,
    headers: {
      Authorization:
        "Bearer AAAAAAAAAAAAAAAAAAAAAEKyigEAAAAA5UVSJKFCe6yyAPIfRvLpfYaNCBA%3DQfKwnAioKvewjalvbFkHoxuBLA35c7AdeVVn6lUiVNdRzhJeL8",
    },
  };
  console.log(116);
  try {
    let response = await axios(config);
    console.log(111, response.data.meta, response.status);
    if (response.status == 200) {
      console.log(123);
      if (response.data.meta.result_count) {
        console.log(47);
        return { status: response.status, ...response.data };
      }
      let returnObj = {
        status: 200,
        data: [],
        includes: [],
      };
      return returnObj;
    } else {
      console.log(112);
      let returnObj = {
        status: response.status,
      };
      return returnObj;
    }
  } catch (err) {
    console.log(err.response.data.errors[0].parameters);
    console.log(112);

    let returnObj = {
      status: err.response.status,
    };
    return returnObj;
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { userInfo } = req;
    const { ticketId, status, assigneeId, type, priority, projectId } =
      req.body;
    console.log(req.body);
    if (userInfo.userRole == "superAdmin" || userInfo.userRole == "admin") {
      if (!ticketId)
        return res
          .status(400)
          .json({ message: "Ticket Id is not present in body payload" });
      let updateObj = {};
      if (assigneeId) {
        const user = await User.findById(assigneeId);
        if (user) {
          updateObj["assigneeId"] = assigneeId;
          updateObj["assigneeInfo"] = {
            name: user.username,
            id: user._id,
          };
        } else {
          res.status(404).json({
            message: "Assignee Id is invalid",
          });
          return;
        }
      } else if (status) updateObj["status"] = status;
      else if (type) updateObj["type"] = type;
      else if (priority) updateObj["priority"] = priority;
      else if (projectId) {
        updateObj["projectId"] = projectId;
      } else
        return res.status(400).json({
          message: "Something is missing in body's payload",
        });
      console.log(updateObj);
      const ticketResp = await Ticket.findByIdAndUpdate(ticketId, updateObj);
      if (ticketResp)
        return res.status(200).json({ message: "Updated successfully!" });
      return res.status(404).json({ message: "Ticket not found!" });
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {
    next(err);
  }
};

const moveTicketToProject = async (req, res, next) => {
  try {
    const { userInfo } = req;
    const { ticketId, projectId } = req.body;
    if (userInfo.userRole == "superAdmin" || userInfo.userRole == "admin") {
      if (!ticketId)
        return res
          .status(400)
          .json({ message: "Ticket Id is neccesary in body's payload" });
      if (!projectId)
        return res
          .status(400)
          .json({ message: "Project Id is neccesary in body's payload" });
      const ticket = await Ticket.findByIdAndUpdate(ticketId, { projectId });
      ticket && res.status(200).json({ message: "Ticket moved sucessfully!" });
      !ticket && res.status(404).json({ message: "Ticket not found!" });
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {}
};

const deleteTicket = async (req, res, next) => {
  try {
    const { userInfo } = req;
    const { id } = req.params;
    const objId = mongoose.Types.ObjectId(id);
    if (userInfo.userRole == "superAdmin" || userInfo.userRole == "admin") {
      const ticket = await findByIdAndDelete(objId);
      ticket && res.status(200).json({ message: "Deleted successfully!" });
      !ticket && res.status(404).json({ message: "Ticket not found!" });
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {
    next(err);
  }
};

export const ticketController = {
  getTickets,
  updateTicket,
  deleteTicket,
  moveTicketToProject,
  createTicket,
};


