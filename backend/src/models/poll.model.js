import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
    optionId: {type: String, required: true},
    text: {type: String, required: true}
});

const pollSchema = new mongoose.Schema(
    {
        question: {type: String, required: true},
        options: {type: [optionSchema], required: true},
        durationSeconds: {type: Number, required: true},
        startTime: {type: Date},
        status: {
            type: String,
            enum: ['IDLE', 'ACTIVE', 'COMPLETED'],
            default: 'ACTIVE'
        }
    }, 
    {timestamps: true}
);

export const Poll = mongoose.model('Poll', pollSchema);