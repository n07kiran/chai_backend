import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile : {
            type : String , // cloudinary string
            required : [true,"Video UrL is required"]
        },
        thumbnail : {
            type : String , // cloudinary string
            required : [true,"Thumbnail UrL is required"]
        },
        title : {
            type : String ,
            required : true
        },
        description : {
            type : String ,
            required : true
        },
        duration : {
            type : Number , // duration from cloudinary
        },
        views : {
            type : Number,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps : true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)

