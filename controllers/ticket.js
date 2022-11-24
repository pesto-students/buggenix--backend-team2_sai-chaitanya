import axios from "axios";
import { Notes, Ticket, Twitter, User } from "../models/index.js";
import cron from "node-cron";
import { createError } from "../utils/error.js";

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
//         console.log("twitterData");
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
//             scrapedInfo: {
//               tweetId,
//               created_at,
//               author_id,
//               twitterUserName: twitterUser.username,
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

export const getTickets = async (req, res, next) => {
  try {
    // console.log("twitterData",twitterData);
    let { userInfo } = req;
    let superAdminId = userInfo.userSuperAdminId;
    if (userInfo.userRole == "superAdmin") {
      superAdminId = userInfo.userId;
    }
    let ticket = await Ticket.find({
      superAdminId: superAdminId,
    });
    res.status(200).json({ tickets: ticket });
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

export const ticketController = {
  getTickets,
};
