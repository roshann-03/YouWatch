import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId, //*One who subscribing
        ref: "User"
    },
    channel: {
        type:mongoose.Schema.Types.ObjectId, // *One whome is subscriber is subscribing
        ref: "User"
    }

}, {timestamps:true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
