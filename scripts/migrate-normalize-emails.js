/**
 * Migration Script: Add normalized email to existing users
 * 
 * This script adds the normalizedEmail field to all existing users
 * to prevent duplicate voting via different OAuth providers.
 * 
 * Run this script once after deploying the new code:
 * node scripts/migrate-normalize-emails.js
 */

const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  normalizedEmail: String,
  image: String,
  password: String,
  linkedinProfile: String,
  hasVoted: Boolean,
  votedCandidateId: String,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  authProvider: String,
}, { timestamps: true });

// Helper to normalize email
function normalizeEmail(email) {
  const [localPart, domain] = email.toLowerCase().trim().split('@');
  // For Gmail, remove dots as they're ignored
  if (domain === 'gmail.com') {
    return localPart.replace(/\./g, '') + '@' + domain;
  }
  return localPart + '@' + domain;
}

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', UserSchema);

    // Find all users without normalizedEmail
    const users = await User.find({ 
      $or: [
        { normalizedEmail: { $exists: false } },
        { normalizedEmail: null },
        { normalizedEmail: '' }
      ]
    });

    console.log(`\n📊 Found ${users.length} users to update`);

    if (users.length === 0) {
      console.log('✅ All users already have normalized emails');
      process.exit(0);
    }

    let updated = 0;
    for (const user of users) {
      const normalizedEmail = normalizeEmail(user.email);
      
      // Check if normalized email already exists (duplicate account)
      const existingUser = await User.findOne({ 
        normalizedEmail,
        _id: { $ne: user._id }
      });

      if (existingUser) {
        console.log(`⚠️  Warning: Duplicate account detected for ${user.email}`);
        console.log(`   User 1: ${user.email} (ID: ${user._id})`);
        console.log(`   User 2: ${existingUser.email} (ID: ${existingUser._id})`);
        console.log(`   Normalized: ${normalizedEmail}`);
        console.log(`   Action: Keeping first account, marking second for review\n`);
        
        // You might want to merge these accounts or handle differently
        // For now, we'll keep the first one and update the second one with a suffix
        user.normalizedEmail = normalizedEmail + '_' + user._id;
      } else {
        user.normalizedEmail = normalizedEmail;
      }

      await user.save();
      updated++;
      console.log(`✅ Updated: ${user.email} -> ${user.normalizedEmail}`);
    }

    console.log(`\n✅ Migration complete! Updated ${updated} users`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
