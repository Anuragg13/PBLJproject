const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, "Student name is required"],
    trim: true,
    minlength: [3, "Student name must be at least 3 characters"],
    maxlength: [50, "Student name cannot exceed 50 characters"]
  },
  collegeEmail: {
    type: String,
    required: [true, "College email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in)$/i,
      "Must be a valid college email ending in .edu or .ac.in"
    ]
  },
  rollNumber: {
    type: String,
    required: [true, "Roll number is required"],
    trim: true,
    uppercase: true,
    match: [
      /^[A-Z0-9]{8,10}$/,
      "Roll number must contain 8 to 10 alphanumeric characters"
    ]
  },
  eventType: {
    type: String,
    required: [true, "Event type is required"],
    enum: {
      values: ["CODING_HACKATHON", "AI_WORKSHOP", "ROBOTICS", "GAMING"],
      message: "Invalid event type"
    }
  },
  teamSize: {
    type: Number,
    required: [true, "Team size is required"],
    min: [1, "Team size must be at least 1"],
    max: [4, "Team size cannot exceed 4"],
    validate: {
      validator: Number.isInteger,
      message: "Team size must be an integer"
    }
  },
  ticketPrice: {
    type: Number,
    required: [true, "Ticket price is required"],
    min: [0, "Ticket price cannot be negative"]
  },
  discountCode: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: value => !value || ["CAMPUS50", "EARLYBIRD"].includes(value),
      message: "Invalid discount code"
    }
  },
  finalAmount: {
    type: Number,
    min: [0, "Final amount cannot be negative"]
  },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "CANCELLED"],
    default: "PENDING"
  },
  registrationDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: value => value <= new Date(),
      message: "Registration date cannot be in the future"
    }
  }
});

registrationSchema.pre("validate", function () {
  if (this.eventType === "AI_WORKSHOP" && this.teamSize !== 1) {
    this.invalidate(
      "teamSize",
      "AI Workshop only permits individual registrations"
    );
  }

  if (this.ticketPrice != null) {
    if (this.discountCode === "CAMPUS50") {
      this.finalAmount = this.ticketPrice * 0.5;
    } else if (this.discountCode === "EARLYBIRD") {
      this.finalAmount = Math.max(0, this.ticketPrice - 100);
    } else if (!this.discountCode) {
      this.finalAmount = this.ticketPrice;
    }
  }
});

module.exports = mongoose.model("Registration", registrationSchema);
