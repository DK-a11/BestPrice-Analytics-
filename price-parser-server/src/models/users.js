import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    
    userType: {
      type: String,
      required: [true, 'User type is required'],
      enum: ['company', 'individual', 'admin'],
    },
    
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Исключаем из запросов по умолчанию
    },
    
    companyName: {
      type: String,
      trim: true,
      // Не required: true — необязательно для individual
    },
    
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.virtual('queryHistory', {
  ref: 'Query',
  localField: '_id',
  foreignField: 'userId',
  options: { sort: { querysDate: -1 }, limit: 50 },
});

userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    userType: this.userType,
    companyName: this.companyName,
    createdAt: this.createdAt,
  };
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;