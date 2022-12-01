import { Notes,Ticket } from "../models/index.js";

// vyhtjmh985w3
export const addNote = async (req, res, next) => {
  try {
    const { ticketId, description } = req.body;
    const { userInfo } = req;
    const { userId, userName, userEmail } = userInfo;
    const noteObj = {
      ticketId,
      description,
      creatorInfo: {
        id:userId,
        name:userName,
        email:userEmail,
      },
    };
    const newNote = new Notes(noteObj);
    const note = await newNote.save();
    console.log(note._doc)
    await Ticket.findByIdAndUpdate(ticketId,{$push:{conversations:note._doc._id}});
    res.status(200).json({ note: note });
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
