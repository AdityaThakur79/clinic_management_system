import { User } from "../models/user.js";
import Patient from "../models/patient.js";

export const getBirthdaysToday = async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const [users, patients] = await Promise.all([
      User.aggregate([
        { $match: { dateOfBirth: { $ne: null } } },
        { $addFields: { m: { $month: "$dateOfBirth" }, d: { $dayOfMonth: "$dateOfBirth" } } },
        { $match: { m: month, d: day } },
        { $project: { name: 1, email: 1, phone: 1, role: 1, branch: 1 } }
      ]),
      Patient.aggregate([
        { $match: { dateOfBirth: { $ne: null } } },
        { $addFields: { m: { $month: "$dateOfBirth" }, d: { $dayOfMonth: "$dateOfBirth" } } },
        { $match: { m: month, d: day } },
        { $project: { name: 1, email: 1, contact: 1, branchId: 1 } }
      ])
    ]);

    return res.json({ success: true, data: { users, patients } });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


