const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Registration = require("./models/Registration");

const app = express();
app.use(express.json());

function handleError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This email is already registered for the event"
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      errors: Object.values(error.errors).map(err => err.message)
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid registration ID format"
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

app.post("/api/registrations", async (req, res) => {
  try {
    const registration = await Registration.create(req.body);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: registration
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.get("/api/registrations", async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventType) filter.eventType = req.query.eventType;
    if (req.query.status) filter.status = req.query.status;

    const registrations = await Registration.find(filter);
    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.get("/api/registrations/:id", async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID format"
      });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    handleError(res, error);
  }
});

app.put("/api/registrations/:id", async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID format"
      });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    const allowedFields = [
      "studentName",
      "collegeEmail",
      "rollNumber",
      "eventType",
      "teamSize",
      "ticketPrice",
      "discountCode",
      "status",
      "registrationDate"
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        registration.set(field, req.body[field]);
      }
    }

    await registration.save();
    res.status(200).json({
      success: true,
      message: "Registration updated successfully",
      data: registration
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.delete("/api/registrations/:id", async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID format"
      });
    }

    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration deleted successfully",
      data: registration
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body"
    });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(error => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
