const mongoose = require('mongoose');

const coldListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  clientsPerDay: {
    type: Number,
    required: true,
    min: 1
  },
  clientsPerVendor: {
    type: Number,
    required: true,
    min: 1
  },
  selectedVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  }],
  totalClients: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  tasksGenerated: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Usuário específico para quem a lista é destinada (pode ser diferente do owner)
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // Clientes importados da planilha
  importedClients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    assignedVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null
    },
    assignedDate: {
      type: Date,
      default: null
    },
    // Controle de contato diário
    contacted: {
      type: Boolean,
      default: false
    },
    contactDate: {
      type: Date,
      default: null
    },
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }]
}, {
  timestamps: true
});

// Índices para busca rápida
coldListSchema.index({ owner: 1, status: 1 });
coldListSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model('ColdList', coldListSchema);
