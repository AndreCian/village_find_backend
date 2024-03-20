import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId

const StripeAccountSchema = new Schema({
    vendorId: ObjectId,
    accId: ObjectId,
    status: String
})

export default mongoose.model('stripeAcc', StripeAccountSchema)