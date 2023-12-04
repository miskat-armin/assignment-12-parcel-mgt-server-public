import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import VerifyToken from "../middlewares/jwt_verify.mjs";
import VerifyAdmin from "../middlewares/verifyAdmin.mjs";

const Bookings = express.Router();

const bookingsCollection = db.collection("bookings");

Bookings.get("/get-all-parcels", async (req, res) => {
  try {
    const allBookings = await bookingsCollection.find({}).toArray();

    res.status(200).json({ success: true, bookings: allBookings });
  } catch (error) {
    console.error("Error retrieving all parcels:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

Bookings.post("/book-parcel", async (req, res) => {
  try {
    const { requestedDeliveryDate, ...otherBookingData } = req.body;
    const parsedDate = new Date(requestedDeliveryDate);
    const newBooking = {
      ...otherBookingData,
      requestedDeliveryDate: parsedDate,
      status: "pending",
      bookingDate: Date.now(),
    };

    const result = await bookingsCollection.insertOne(newBooking);

    res.status(201).json({ success: true, booking: result });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

Bookings.get("/get-all-parcels/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const allBookings = await bookingsCollection
      .find({ email: email })
      .toArray();
    res.status(200).json({ success: true, bookings: allBookings });
  } catch (error) {
    console.error("Error retrieving parcels:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

Bookings.get("/get-parcels-by-status/:email/:status", async (req, res) => {
  try {
    const email = req.params.email;
    const status = req.params.status;
    const parcelsByStatus = await bookingsCollection
      .find({ email: email, status: status })
      .toArray();
    res.status(200).json({ success: true, bookings: parcelsByStatus });
  } catch (error) {
    console.error("Error retrieving parcels by status:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

Bookings.get("/get-parcel/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const parcel = await bookingsCollection.findOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, parcel: parcel });
  } catch (error) {
    console.error("Error retrieving parcels:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

Bookings.put("/assign-delivery/:id", async (req, res) => {
  try {
    const parcelId = req.params.id;
    const { deliverymanId, approximateDeliveryDate } = req.body;

    const filter = { _id: new ObjectId(parcelId) };
    const update = {
      $set: {
        status: "On The Way",
        deliverymenId: deliverymanId,
        approximateDeliveryDate: new Date(approximateDeliveryDate),
      },
    };

    const result = await bookingsCollection.updateOne(filter, update);

    if (result.modifiedCount === 1) {
      return res
        .status(200)
        .json({ success: true, message: "Delivery assigned successfully." });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Parcel not found." });
    }
  } catch (error) {
    console.error("Error assigning delivery:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

Bookings.put("/update-parcel/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { requestedDeliveryDate, ...otherBookingData } = req.body;
    const parsedDate = new Date(requestedDeliveryDate);
    const newBooking = {
      ...otherBookingData,
      requestedDeliveryDate: parsedDate,
    };

    const parcel = await bookingsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      { $set: newBooking }
    );
    res.status(200).json({ success: true, parcel: parcel });
  } catch (error) {
    console.error("Error retrieving parcels:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

Bookings.put("/cancel-parcel/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await bookingsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      { $set: { status: "cancelled" } }
    );

    console.log(result);

    if (result.matchedCount === 1) {
      res
        .status(200)
        .json({ success: true, message: "Parcel cancelled successfully" });
    } else {
      res.status(404).json({ success: false, message: "Parcel not found" });
    }
  } catch (error) {
    console.error("Error deleting parcel:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

export default Bookings;
