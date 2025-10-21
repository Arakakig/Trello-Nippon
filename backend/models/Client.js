const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  contract: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  adhesionDate: {
    type: Date,
    required: false
  },
  contractDate: {
    type: Date,
    required: false
  },
  dueDate: {
    type: Date,
    required: false
  },
  plan: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  observation: {
    type: String,
    default: '',
    trim: true
  },
  adhesionValue: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  paymentMethod: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  confirmation: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  homeVisit: {
    type: Boolean,
    default: false
  },
  origin: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  paid: {
    type: Boolean,
    default: false
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  listMonth: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  listYear: {
    type: Number,
    required: false,
    default: new Date().getFullYear()
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
}, {
  timestamps: true
});

// Índices para busca rápida
clientSchema.index({ owner: 1, project: 1 });
clientSchema.index({ name: 1 });
clientSchema.index({ phone: 1 });
clientSchema.index({ contract: 1 });
clientSchema.index({ listMonth: 1, listYear: 1 });
clientSchema.index({ owner: 1, listMonth: 1, listYear: 1 });
clientSchema.index({ vendor: 1 });

module.exports = mongoose.model('Client', clientSchema);
