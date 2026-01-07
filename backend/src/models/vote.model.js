import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
    {
        pollId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Poll',
            required: true
        },

        optionId: {type: String, required: true},
        sessionId: {type: String, required: true}
    }, 
    {timestamps: true}
);

// ensuring a user can vote onlyonce per poll
voteSchema.index({pollId: 1, sessionId: 1}, {unique: true});

export const Vote = mongoose.model('Vote', voteSchema);