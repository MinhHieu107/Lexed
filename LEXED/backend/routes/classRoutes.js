const express = require('express');
const router = express.Router();
const validateToken = require("../middleware/validateToken");
const checkRole = require("../middleware/checkRole");
const {
    createClass,
    getMyClasses,
    joinClassByCode,
    addMemberByEmail,
    getClassMembers,
    deleteClass,
    getClassSets,
    removeMember
} = require("../controllers/classController");

router.route("/classes").post(validateToken, checkRole("TEACHER"), createClass);
router.route("/classes/mine").get(validateToken, getMyClasses);
router.route("/classes/join").post(validateToken, joinClassByCode);
router.route("/classes/:classId").delete(validateToken, checkRole("TEACHER"), deleteClass);
router.route("/classes/:classId/members").get(validateToken, checkRole("TEACHER"), getClassMembers);
router.route("/classes/:classId/members").post(validateToken, checkRole("TEACHER"), addMemberByEmail);
router.route("/classes/:classId/members/:memberId").delete(validateToken, checkRole("TEACHER"), removeMember);
router.route("/classes/:classId/sets").get(validateToken, getClassSets);

module.exports = router;
