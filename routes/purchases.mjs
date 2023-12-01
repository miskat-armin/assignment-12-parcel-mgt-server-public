// purchases.js (Express route)
import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const Purchases = express.Router();

Purchases.post("/", async (req, res) => {
  try {
    const { foodItemId, quantity, userEmail, purchaseDate } = req.body;

    // Save purchase details to MongoDB or perform other necessary actions
    const purchaseData = {
      foodItemId,
      quantity,
      userEmail,
      purchaseDate,
    };

    // Save purchase data to your database (MongoDB or other)
    const collection = db.collection("purchases");
    await collection.insertOne(purchaseData);

    const foodCollection = db.collection("foods");
    const purchasedFood = await foodCollection.findOne({
      _id: new ObjectId(foodItemId),
    });

    if (purchasedFood) {
      const updatedQuantity = purchasedFood.quantity - quantity;

      await foodCollection.updateOne(
        { _id: new ObjectId(foodItemId) },
        { $set: { quantity: updatedQuantity } }
      );
    }

    res.status(201).json({ message: "Purchase successful" });
  } catch (error) {
    console.error("Error making purchase:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Purchases.get("/top-most-items", async (req, res) => {
  try {
    // Aggregate to find the top 6 most ordered items
    const topOrderedItems = await db
      .collection("purchases")
      .aggregate([
        {
          $group: {
            _id: "$foodItemId",
            totalQuantity: { $sum: "$quantity" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 6 },
      ])
      .toArray();

    // Extract food item ids from the top ordered items
    const foodItemIds = topOrderedItems.map((order) => new ObjectId(order._id));

    // Fetch details of the top ordered items from the foods collection
    const topOrderedItemsDetails = await db
      .collection("foods")
      .find({ _id: { $in: foodItemIds } })
      .toArray();

    res.status(200).json(topOrderedItemsDetails);
  } catch (error) {
    console.error("Error fetching top ordered items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Purchases.get("/ordered-items-by-user/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;

    // Fetch all items ordered by the user
    const orderedItems = await db
      .collection("purchases")
      .aggregate([
        { $match: { userEmail } },
        {
          $lookup: {
            from: "foods",
            let: { foodItemId: { $toObjectId: "$foodItemId" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$foodItemId"],
                  },
                },
              },
            ],
            as: "foodDetails",
          },
        },
        { $unwind: "$foodDetails" },
        {
          $project: {
            foodName: "$foodDetails.foodName",
            foodImage: "$foodDetails.foodImage",
            foodCategory: "$foodDetails.foodCategory",
            price: "$foodDetails.price",
            quantity: "$quantity",
            purchaseDate: "$purchaseDate",
            foodOwner: {
              $cond: {
                if: { $eq: ["$foodDetails.addBy.name", ""] },
                then: "$foodDetails.addBy.email",
                else: "$foodDetails.addBy.name",
              },
            },
          },
        },
      ])
      .toArray();

    res.status(200).json(orderedItems);
  } catch (error) {
    console.error("Error fetching ordered items by user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


Purchases.delete('/delete-item/:itemId', async (req, res) => {
  const itemId = req.params.itemId;

  try {
    const result = await db.collection('purchases').deleteOne({ _id: new ObjectId(itemId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default Purchases;
