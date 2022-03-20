import { Schema, model } from "mongoose";

//SCHEMA SETUP
let campgroundSchema = new Schema({name: String,price: Number,image: String,description: String,location: String,lat: Number, lng: Number,
	createdAt: {type: Date, default: Date.now},
	author: {
		id: {
			type: Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
      {
         type: Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

export default model("Campground", campgroundSchema);