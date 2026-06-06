import mongoose from 'mongoose';


const querySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Индекс для быстрых поисков по пользователю
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true, // Поиск по email в истории запросов
    },
    
    userType: {
      type: String,
      required: true,
      enum: ['company', 'individual', 'admin'],
    },
    
    companyName: {
      type: String,
      trim: true,
      // Необязательно: может быть пустым для userType !== 'company'
    },

    query: {
      type: String,
      required: [true, 'Query text is required'],
      trim: true,
      maxlength: [500, 'Query cannot exceed 500 characters'],
      index: true, // Полнотекстовый поиск по запросам
    },

    querysDate: {
      type: Date,
      default: Date.now,
      index: true, // Сортировка по времени
    },
  },
  {
    timestamps: true, // Добавляет createdAt и updatedAt автоматически
    collection: 'querys', // Явное указание имени коллекции
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

querySchema.index({ userId: 1, querysDate: -1 });

querySchema.index({ query: 'text' });

querySchema.virtual('formattedDate').get(function () {
  return this.querysDate?.toISOString().split('T')[0];
});


querySchema.methods.getPublicData = function () {
  return {
    _id: this._id,
    userId: this.userId,
    name: this.name,
    email: this.email,
    userType: this.userType,
    companyName: this.companyName,
    query: this.query,
    querysDate: this.querysDate,
    formattedDate: this.formattedDate,
    createdAt: this.createdAt,
  };
};

const Query = mongoose.models.Query || mongoose.model('Query', querySchema);

export default Query;