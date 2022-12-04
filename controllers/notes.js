import { Notes, Ticket } from "../models/index.js";
import mongoose from "mongoose";


// vyhtjmh985w3
export const addNote = async (req, res, next) => {
  try {
    const { ticketId, description } = req.body;
    const { userInfo } = req;
    const { userId, userName, userEmail } = userInfo;
    let date = new Date();
    let hours = date.getHours();
    let mins = date.getMinutes();
    const noteObj = {
      ticketId,
      description,
      creatorInfo: {
        id: userId,
        name: userName,
        email: userEmail,
      },
      timestamp: `${hours}:${mins} ${hours > 12 ? "PM" : "AM"}`,
    };
    const newNote = new Notes(noteObj);
    const note = await newNote.save();
    // console.log(note._doc);
    // console.log(typeof ticketId)
    const objId = mongoose.Types.ObjectId(ticketId);
    await Ticket.findByIdAndUpdate(objId, {
      $push: { conversations: note._doc._id },
    });
    let updatedTickets = await Ticket.findById(
      objId,
    ).populate({
      path: "conversations",
    });
    let conversations = updatedTickets?.conversations
    conversations.reverse();
    // console.log(conversations)
    res.status(200).json(conversations);
  } catch (err) {
    next(err);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const { ticketId } = req.body;
    const notes = await Notes.find({ ticketId });
    console.log(notes);
    res.status(200).json({ notes: notes });
  } catch (err) {
    next(err);
  }
};

export const notesController = {
  getNotes,
  addNote,
};
