const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
  color: {
    type: String,
    default: '#0ea5e9', // Primary blue
    trim: true
  },
  icon: {
    type: String,
    default: '📋',
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índice para busca rápida
projectSchema.index({ owner: 1, archived: 1 });
projectSchema.index({ 'members.user': 1, archived: 1 });

// Método para verificar se um usuário é membro do projeto
projectSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString()) || 
         this.owner.toString() === userId.toString();
};

// Método para verificar se um usuário pode editar
projectSchema.methods.canEdit = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return this.owner.toString() === userId.toString() || 
         (member && ['admin', 'member'].includes(member.role));
};

// Método para verificar se um usuário é admin
projectSchema.methods.isAdmin = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return this.owner.toString() === userId.toString() || 
         (member && member.role === 'admin');
};

module.exports = mongoose.model('Project', projectSchema);

